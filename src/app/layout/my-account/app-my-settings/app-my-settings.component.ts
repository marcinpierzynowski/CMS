import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import swal from 'sweetalert2';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin } from 'src/app/models/model';

@Component({
  selector: 'app-app-my-settings',
  templateUrl: './app-my-settings.component.html',
  styleUrls: ['./app-my-settings.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppMySettingsComponent implements OnInit {
  public changePassword: FormGroup;
  public oldPassword = '';
  public activeNotificationSecurity = true;

  private user: Admin;
  private indexUser: string;

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService
    ) {}

  ngOnInit(): void {
    const admins = this.layoutManageService.adminsData.getValue();
    this.layoutManageService.readyData.subscribe((data) => {
      if (data === true) {
        const email = this.layoutManageService.emailData.getValue();
        this.user = admins.find((ad, index) => {
          this.indexUser = index.toString();
          return ad.email === email;
        });
        this.activeNotificationSecurity = this.user.security;
      }
    });
    this.initForm();
  }

  public initForm(): void {
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
      password: password,
      repeatPassword: repeatPassword
    });
  }

  public submitChangePassword(): void {
    if (this.oldPassword !== this.user.password) {
      swal({ type: 'error', title: 'Zmiana hasła', text: 'Stare hasło jest niepoprawne!'});
      return;
    }

    this.activeInputs();
    if (this.changePassword.valid) {
      this.generateSwalWaitingFromRequest('warning', 'Zmiana hasła', 'Czekaj na zmianę hasła');
      this.firebaseService.firebase.auth().currentUser.updatePassword(this.changePassword.value.password)
        .then(() => { this.changePasswordInAdmins(this.changePassword.value.password); })
        .catch(err => {
          swal.close();
          swal({ type: 'error', title: 'Zmiana hasła', text: err });
        });
    }
  }

 public generateSwalWaitingFromRequest(type, title, text): void {
    swal({
      type: type,
      title: title,
      text: text,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        const content = swal.getContent();
        const $ = content.querySelector.bind(content);
        swal.showLoading();
      }
    });
  }

  public changePasswordInAdmins(password): void {
    this.firebaseService.getDataBaseRef('admins').child(this.indexUser).child('password').set(password)
      .then(() => {
        this.clearInputs();
        this.setLocalStorage(this.user.email, password);
        swal.close();
        swal('Zmiana hasła', 'Hasło zostało zmienione!', 'success');
      })
      .catch(err => {
        swal.close();
        swal('Zmiana hasła', err, 'error');
      });
  }

  public activeInputs(): void {
    // tslint:disable-next-line:forin
    for (const inner in this.changePassword.controls) {
      this.changePassword.get(inner).markAsTouched();
      this.changePassword.get(inner).updateValueAndValidity();
    }
  }

  public clearInputs(): void {
    // tslint:disable-next-line:forin
    for (const inner in this.changePassword.controls) {
      this.changePassword.get(inner).markAsUntouched();
      this.changePassword.get(inner).setValue(null);
    }
    this.oldPassword = '';
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

  public setSecurity(): void {
    this.firebaseService.getDataBaseRef('admins').child(this.indexUser).child('security').set(!this.user.security)
      .then(() => {
        swal('Zmiana wyświetlania powiadomienia o bezpieczeństwie', 'Zmiana została zaktualizowana!', 'success');
      });
  }
}
