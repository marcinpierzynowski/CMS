import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import swal from 'sweetalert2';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin } from 'src/app/models/model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-my-settings',
  templateUrl: './app-my-settings.component.html',
  styleUrls: ['./app-my-settings.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppMySettingsComponent implements OnInit {
  public changePassword: FormGroup;
  public profileForm: FormGroup;
  public activeCard = 1;

  private user: Admin;
  private refStorage;
  private indexUser: string;

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.refStorage = this.firebaseService.firebase.storage();
    const email = this.layoutManageService.emailData.getValue();
    this.layoutManageService.adminsData.subscribe(a => {
      if (!a) { return; }
      this.user = a.find((ad, index) => {
        this.indexUser = index.toString();
        return ad.email === email;
      });
      this.initFormProfile();
    });

    this.initFormPassword();
  }

  public initFormProfile(): void {
    const { detail, media } = this.user;
    this.profileForm = new FormGroup({
      name: new FormControl(detail ? detail.name : ''),
      surname: new FormControl(detail ? detail.surname : ''),
      email: new FormControl(this.user.email),
      country: new FormControl(detail ? detail.country : ''),
      city: new FormControl(detail ? detail.city : ''),
      facebook: new FormControl(media ? media.facebook : ''),
      twitter: new FormControl(media ? media.twitter : ''),
      linkedIn: new FormControl(media ? media.linkedIn : '')
    });
  }

  public initFormPassword(): void {
    const oldPassword = new FormControl('', [
      Validators.required
    ]);

    const password = new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(
        '^(?=.*[A-Za-zęóąśłżźćńĘÓĄŚŁŻŹĆŃ])(?=.*\\d)(?=.*[$@$!%*#?&.,_-])[A-Za-zęóąśłżźćńĘÓĄŚŁŻŹĆŃ\\d$@$!%*#?&.,_-]{8,}$'
      )
    ]);
    const repeatPassword = new FormControl('', [
      Validators.required,
      CustomValidators.equalTo(password)
    ]);

    this.changePassword = new FormGroup({
      oldPassword,
      password,
      repeatPassword
    });
  }

  public submitChangePassword(): void {
    this.activeInputs();
    if (this.changePassword.value.oldPassword !== this.user.password) {
      swal.fire('Zmiana Hasła', 'Stare hasło jest błędne', 'error');
      return null;
    }

    if (this.changePassword.valid) {
      this.generateSwalWaitingFromRequest('warning', 'Zmiana hasła', 'Czekaj na zmianę hasła');
      this.firebaseService.firebase.auth().currentUser.updatePassword(this.changePassword.value.password)
        .then(() => { this.changePasswordInAdmins(this.changePassword.value.password); })
        .catch(err => {
          swal.close();
          swal.fire({ type: 'error', title: 'Zmiana hasła', text: err });
        });
    }
  }

  public changePasswordInAdmins(password): void {
    this.firebaseService.getDataBaseRef('admins').child(this.indexUser).child('password').set(password)
      .then(() => {
        this.initFormPassword();
        this.setLocalStorage(this.user.email, password);
        swal.close();
        swal.fire('Zmiana hasła', 'Hasło zostało zmienione!', 'success');
      })
      .catch(err => {
        swal.close();
        swal.fire('Zmiana hasła', err, 'error');
      });
  }

  public setLocalStorage(email, password): void {
    const dataStorage = localStorage.getItem('shop-admin');
    if (dataStorage) {
      localStorage.setItem(
        'shop-admin',
        JSON.stringify({ email, password })
      );
    }
  }

  public setCard(index: number) {
    if (index === this.activeCard) { return; }
    this.initFormProfile();
    this.initFormPassword();
    this.activeCard = index;
  }

  public getFile(refInputFile) {
    refInputFile.value = null;
    refInputFile.click();
  }

  public uploadImage(event): void {
    this.uploadToStorageImage(event.files[0]);
  }

  public uploadToStorageImage(value): void {
    const name = this.user.detail.imageName;
    const storageRef = this.refStorage.ref(name);
    this.generateSwalWaitingFromRequest('warning', 'Dodanie zdjęcia do slajdera', 'Czekaj na dodanie zdjęcia!');

    const task = storageRef.put(value);
    task.on('state_changed', snapshot => {
        const percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (percentage === 100) {
          this.updateUrl(name);
        }
      }
    );
  }

  public updateUrl(name): void {
    this.refStorage.ref().child(name).getDownloadURL().then(imageUrl => {
        this.user.detail.imageUrl = imageUrl;
        this.firebaseService.getDataBaseRef('admins').child(this.indexUser)
          .child('detail').child('imageUrl').set(imageUrl).then(() => {
          swal.close();
          swal.fire({
            type: 'success',
            title: 'Aktualizacja zdjęcia profilowego',
            text: 'Zdjęcie zaaktualizowano pomyślnie.'
          });
        });
      })
      .catch(() => {
        this.updateUrl(name);
      });
  }

  public generateSwalWaitingFromRequest(type, title, text): void {
    swal.fire({
      type,
      title,
      text,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        const content = swal.getContent();
        const $ = content.querySelector.bind(content);
        swal.showLoading();
      }
    });
  }

  public updateProfile(): void {
    const { name, surname, country, city } = this.profileForm.value;
    const { facebook, twitter, linkedIn } = this.profileForm.value;

    this.user.detail = { ...this.user.detail, name, surname, country, city };
    this.user.media = { facebook, twitter, linkedIn };
    this.firebaseService.getDataBaseRef('admins').child(this.indexUser).set(this.user)
      .then(() => swal.fire('Aktualizacja Danych', 'Dane zostały zaaktualizowane', 'success'));
  }

  public deleteAccount(): void {

    swal.fire({
      title: 'Usuwanie Konta Podaj Hasło',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      confirmButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'Usuń',
      cancelButtonText: 'Anuluj',
    }).then((response) => {
      if (response.dismiss) {
        return;
      }
      if (response.value && response.value === this.user.password) {
        this.generateSwalWaitingFromRequest(
          'warning',
          'Usuwanie użytkownika',
          'Czekaj na usunięcie użytkownika!'
        );
        this.refStorage.ref(this.user.email).delete();
        this.deleteUser();
      } else {
        swal.fire('Usuwanie Konta', 'Podane hasło jest błędne!', 'error');
      }
    });
  }

  public deleteUser(): void {
    this.firebaseService.firebase.auth().currentUser.delete()
      .then(() => {
        let admins = this.layoutManageService.adminsData.getValue();
        admins = admins.filter(a => a.email !== this.user.email);
        this.firebaseService.getDataBaseRef('admins').set(admins)
          .then(() => this.check());
       });
  }

  public check() {
    let timerInterval;

    swal.fire({
      title: 'Usunięcie konta!',
      html: 'Twoje konto zostało usunięte, zostaniesz przeniesiony na stronę logowania za <strong></strong> sekund.',
      timer: 5000,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        swal.showLoading();
        timerInterval = setInterval(() => {
          swal.getContent().querySelector('strong')
            .textContent = swal.getTimerLeft().toString();
        }, 100);
      },
      onClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (
        result.dismiss === swal.DismissReason.timer
      ) {
        localStorage.clear();
        swal.close();
        this.router.navigate(['/auth/sign-in']);
      }
    });
  }

  public showNotification() {
    this.layoutManageService.showNotification();
  }

  public checkValisSuccess(name: string) {
    const control = this.changePassword.controls[name];
    if (!control.errors && control.touched) {
        return true;
    } else {
      return false;
    }
  }

  public checkValidError(name: string) {
    const control = this.changePassword.controls[name];
    if (control.errors && control.touched) {
        return true;
    } else {
      return false;
    }
  }

  public checkValidate(inputControl: string, nameControl: string): boolean {
    const control = this.changePassword.controls[inputControl];
    if (control.errors) {
      if (control.errors[nameControl] && control.touched) {
        return true;
    } else {
        return false;
      }
    }
    return false;
  }

  public activeInputs(): void {
    // tslint:disable-next-line:forin
    for (const inner in this.changePassword.controls) {
      this.changePassword.get(inner).markAsTouched();
      this.changePassword.get(inner).updateValueAndValidity();
    }
  }
}
