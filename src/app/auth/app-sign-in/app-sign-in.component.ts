import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { FirebaseService } from '../../services/firebase.service';

import { fadeInOutTranslate, flipInX } from '../../../shared/animations/animation';
import swal from 'sweetalert2';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin } from 'src/app/models/admin.model';

@Component({
  selector: 'app-app-sign-in',
  templateUrl: './app-sign-in.component.html',
  styleUrls: ['./app-sign-in.component.css'],
  animations: [fadeInOutTranslate, flipInX]
})
export class AppSignInComponent implements OnInit {
  public loginAccountForm: FormGroup;
  public vissiblePassword: boolean;
  public savePassword: boolean;

  private admins: Array<Admin>;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService
  ) { }

  ngOnInit(): void {
    this.authorizedLogin();
    this.initForms();
  }

  public initForms(): void {
    const email = new FormControl('', [Validators.required, Validators.email]);
    const password = new FormControl('', [Validators.required, Validators.minLength(5)]);

    this.loginAccountForm = new FormGroup({
      email,
      password
    });
  }

  public authorizedLogin() {
    if (localStorage.getItem('shop-admin')) {
      this.router.navigate(['/']);
    }
    this.layoutManageService.adminsData.subscribe(el => this.admins = el);
  }

  public submitLogin(): void {
    this.activeInputs();

    if (this.loginAccountForm.valid) {
      this.getRefAuth()
        .then(() => {
          this.firebaseService.authorization = true;
          this.layoutManageService.email = this.loginAccountForm.value.email;
          this.saveToStorage();
          this.router.navigate(['/']);
        })
        .catch(error => {
          this.generateErrorSwal(error);
        });
    } else {
      swal.fire('Logowanie', 'Wypełnij prawidłowo formularz logowania!', 'warning');
    }
  }

  public getRefAuth(): any {
    return this.firebaseService
      .firebase
      .auth()
      .signInWithEmailAndPassword(
        this.loginAccountForm.value.email,
        this.loginAccountForm.value.password
      );
  }

  public saveToStorage(): void {
    if (this.savePassword) {
      const email = this.loginAccountForm.value.email;
      const password = this.loginAccountForm.value.password;
      localStorage.setItem(
        'shop-admin',
        JSON.stringify({ email, password })
      );
    }
    this.clearInputs();
  }

  public getAdmin(): Admin {
    const email = this.loginAccountForm.value.email;
    const admin = this.admins.find(el => el.email.toLowerCase() === email.toLowerCase());
    return admin;
  }

  public generateErrorSwal(error): void {
    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-email'
    ) {
      swal.fire('Logowanie', 'Hasło lub email jest niepoprawne!', 'error');
    } else if (error.code === 'auth/user-not-found') {
      swal.fire('Logowanie', 'Użytkownik z takim emailem nie istnieje!', 'error');
    } else if (error.code === 'auth/operation-not-allowed') {
      swal.fire('Logowanie', 'Logowanie i rejestracja zostały zablokowane!', 'error');
    } else {
      swal.fire('Logowanie', error.code, 'error');
    }
  }

  public err(err): void {
    console.log(err);
  }

  public setVisiblePassword(refPassword): void {
      this.vissiblePassword = !this.vissiblePassword;
      this.vissiblePassword ? refPassword.type = 'text' : refPassword.type = 'password';
  }

  public activeInputs(): void {
    // tslint:disable-next-line
    for (let inner in this.loginAccountForm.controls) {
      this.loginAccountForm.get(inner).markAsTouched();
      this.loginAccountForm.get(inner).updateValueAndValidity();
    }
  }

  public clearInputs(): void {
     // tslint:disable-next-line
    for (let inner in this.loginAccountForm.controls) {
      this.loginAccountForm.get(inner).markAsUntouched();
      this.loginAccountForm.get(inner).setValue(null);
    }
  }

  public checkValidate(inputControl: string, nameControl: string): boolean {
    const control = this.loginAccountForm.controls[inputControl];
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
    const control = this.loginAccountForm.controls.email;
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
    const control = this.loginAccountForm.controls.password;
    if (control.errors) {
      if (control.errors.required && control.touched) {
          return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
