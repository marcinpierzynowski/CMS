import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, NgControlStatus } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';

import { FirebaseService } from '../../services/firebase.service';

import { fadeInOutTranslate, flipInX } from '../../../shared/animations/animation';
import swal from 'sweetalert2';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin } from 'src/app/models/model';

@Component({
  selector: 'app-app-sign-up',
  templateUrl: './app-sign-up.component.html',
  styleUrls: [
    './app-sign-up.component.css',
    '../../../assets/styles-custom/field-input.css',
    '../../../assets/styles-custom/spinner-style.css',
    '../../../assets/styles-custom/roller-style.css'
  ],
  animations: [fadeInOutTranslate, flipInX]
})
export class AppSignUpComponent implements OnInit {
  public displayAnimate: string;
  public displayAnimateRepeatPassword: string;
  public vissiblePassword: boolean;
  public vissibleRepeatPassword: boolean;
  public newDataAccount: FormGroup;

  private admins: Array<Admin>;

  private readonly handles = {
    timeFirst$: null,
    timeSecond$: null
  };

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService
    ) { }

  ngOnInit(): void {
    this.displayAnimate = 'none';
    this.displayAnimateRepeatPassword = 'none';
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
      email: email,
      password: password,
      repeatPassword: repeatPassword
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
    this.admins.push(this.prepareAdmin());
    this.firebaseService.getDataBaseRef('admins').set(this.admins);
    this.saveToStorage();
    this.router.navigate(['/']);
  }

  public prepareAdmin(): Admin {
    return {
      email: this.newDataAccount.value.email,
      password: this.newDataAccount.value.password,
      security: true,
      history: []
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
    const { timeFirst$, timeSecond$ } = this.handles;
    if (timeFirst$ || timeSecond$) { return; }

    if (!this.vissiblePassword) { this.displayAnimate = 'block'; }
    this.handles.timeFirst$ = setTimeout(() => {
      refPassword.focus();
      this.handles.timeFirst$ = null;
      this.vissiblePassword = !this.vissiblePassword;
      this.vissiblePassword ? (refPassword.type = 'text') : (refPassword.type = 'password');
    }, 100);

    this.handles.timeSecond$ = setTimeout(() => {
      this.displayAnimate = 'none';
      this.handles.timeSecond$ = null;
    }, 1000);
  }

  public setVisibleRepeatPassword(refRepeatPassword): void {
    const { timeFirst$, timeSecond$ } = this.handles;
    if (timeFirst$ || timeSecond$) { return; }

    if (!this.vissibleRepeatPassword) { this.displayAnimateRepeatPassword = 'block'; }
    this.handles.timeFirst$ = setTimeout(() => {
      refRepeatPassword.focus();
      this.handles.timeFirst$ = null;
      this.vissibleRepeatPassword = !this.vissibleRepeatPassword;
      this.vissibleRepeatPassword ? (refRepeatPassword.type = 'text') : (refRepeatPassword.type = 'password');
    }, 100);

    this.handles.timeSecond$ = setTimeout(() => {
      this.displayAnimateRepeatPassword = 'none';
      this.handles.timeSecond$ = null;
    }, 1000);
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
