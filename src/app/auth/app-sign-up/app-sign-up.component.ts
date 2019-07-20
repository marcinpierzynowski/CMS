import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, NgControlStatus } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';

import { FirebaseService } from '../../services/firebase.service';

import { fadeInOutTranslate, flipInX } from '../../../shared/animations/animation';
import swal from 'sweetalert2';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { DatePipe } from '@angular/common';
import { Admin } from 'src/app/models/admin.model';

@Component({
  selector: 'app-app-sign-up',
  templateUrl: './app-sign-up.component.html',
  styleUrls: ['./app-sign-up.component.css'],
  animations: [fadeInOutTranslate, flipInX]
})
export class AppSignUpComponent implements OnInit {
  public vissiblePassword: boolean;
  public vissibleRepeatPassword: boolean;
  public newDataAccount: FormGroup;

  private admins: Array<Admin>;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.initForms();
  }

  public initForms(): void {
    const email = new FormControl('', [Validators.required, Validators.email]);
    const password = new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(
        '^(?=.*[A-Za-zęóąśłżźćńĘÓĄŚŁŻŹĆŃ])(?=.*\\d)(?=.*[$@$!%*#?&.,_-])[A-Za-zęóąśłżźćńĘÓĄŚŁŻŹĆŃ\\d$@$!%*#?&.,_-]{8,}$'
      )
    ]);

    this.authorizedLogin();
    const repeatPassword = new FormControl('', [
      Validators.required,
      CustomValidators.equalTo(password)
    ]);
    this.newDataAccount = new FormGroup({
      email,
      password,
      repeatPassword
    });
  }

  public authorizedLogin(): void {
    if (localStorage.getItem('shop-admin')) {
      this.router.navigate(['/']);
      return;
    }
    this.layoutManageService.adminsData.subscribe(el => this.admins = el);
  }

  public submitRegister(): void {
    this.activeInputs();

    if (this.newDataAccount.valid) {
      this.firebaseService
        .firebase
        .auth()
        .createUserWithEmailAndPassword(
          this.newDataAccount.value.email,
          this.newDataAccount.value.password
        )
        .then(() => {
          this.continuedRegistration();
        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            swal.fire('Rejestracja', 'Profil o takim emailu już istnieje!', 'error');
          } else {
            swal.fire('Rejestracja', error.code, 'error');
          }
        });
    } else {
      swal.fire(
        'Rejestracja',
        'Wypełnij prawidłowo formularz rejestracji!',
        'warning'
      );
    }
  }

  public continuedRegistration(): void {
    this.layoutManageService.email = this.newDataAccount.value.email;
    this.admins.push(this.prepareAdmin());
    this.firebaseService.getDataBaseRef('admins').set(this.admins);
    this.saveToStorage();
    this.router.navigate(['/']);
  }

  public prepareAdmin(): Admin {
    const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    return {
      email: this.newDataAccount.value.email,
      password: this.newDataAccount.value.password,
      detail: {
        imageUrl: 'assets/images/user-empty.png',
        imageName: this.newDataAccount.value.email
      },
      // tslint:disable-next-line:object-literal-shorthand
      created_at: date
    };
  }

  public saveToStorage(): void {
      const email = this.newDataAccount.value.email;
      const password = this.newDataAccount.value.password;

      localStorage.setItem(
        'shop-admin',
        JSON.stringify({ email, password })
      );
  }

  public setVisiblePassword(refPassword): void {
      this.vissiblePassword = !this.vissiblePassword;
      this.vissiblePassword ? (refPassword.type = 'text') : (refPassword.type = 'password');
  }

  public setVisibleRepeatPassword(refRepeatPassword): void {
      this.vissibleRepeatPassword = !this.vissibleRepeatPassword;
      this.vissibleRepeatPassword ? (refRepeatPassword.type = 'text') : (refRepeatPassword.type = 'password');
  }

  public activeInputs(): void {
    // tslint:disable-next-line
    for (let inner in this.newDataAccount.controls) {
      this.newDataAccount.get(inner).markAsTouched();
      this.newDataAccount.get(inner).updateValueAndValidity();
    }
  }

  public checkValidate(inputControl: string, nameControl: string): boolean {
    const control = this.newDataAccount.controls[inputControl];
    if (control.errors) {
      if (control.errors[nameControl] && control.touched) {
        return true;
    } else {
        return false;
      }
    }
    return false;
  }

  public checkValidateEmail(): boolean {
    const control = this.newDataAccount.controls.email;
    if (control.errors) {
      if ((control.errors.required || control.errors.email)
        && control.touched) {
          return true;
      } else {
        return false;
      }
    }
    return false;
  }

  public checkValidatePassword(): boolean {
    const control = this.newDataAccount.controls.password;
    if (control.errors) {
      if ((control.errors.required || control.errors.pattern)
        && control.touched) {
          return true;
      } else {
        return false;
      }
    }
    return false;
  }

  public checkValidateRepeatPassword(): boolean {
    const control = this.newDataAccount.controls.repeatPassword;
    if (control.errors) {
      if ((control.errors.required || control.errors.equalTo)
        && control.touched) {
          return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
