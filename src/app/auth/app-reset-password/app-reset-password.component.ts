import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { FirebaseService } from '../../services/firebase.service';

import { fadeInOutTranslate, flipInX } from '../../../shared/animations/animation';
import swal from 'sweetalert2';

@Component({
  selector: 'app-app-reset-password',
  templateUrl: './app-reset-password.component.html',
  styleUrls: ['./app-reset-password.component.css'],
  animations: [fadeInOutTranslate, flipInX]
})
export class AppResetPasswordComponent implements OnInit {
  public resetPassword: FormGroup;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit(): void {
    this.authorizedLogin();
    const email: FormControl = new FormControl('', [Validators.required, Validators.email]);
    this.resetPassword = new FormGroup({
      email
    });
  }

  public authorizedLogin(): void {
    if (localStorage.getItem('shop-admin')) {
      this.router.navigate(['/']);
    }
  }

  public submitResetPassword(): void {
    this.activeFormInput();
    if (this.resetPassword.valid) {
      this.getReferenceAuth()
        .then(resposne => {
          this.continuedResetPassword();
        })
        .catch(error => {
          this.generateSwalEror(error);
        });
    } else {
      swal.fire('Resetowanie hasła', 'Wpisz poprawnie email!', 'warning');
    }
  }

  public activeFormInput(): void {
    // tslint:disable-next-line
    for (let inner in this.resetPassword.controls) {
      this.resetPassword.get(inner).markAsTouched();
      this.resetPassword.get(inner).updateValueAndValidity();
    }
  }

  public getReferenceAuth(): any {
    return this.firebaseService
      .firebase
      .auth()
      .sendPasswordResetEmail(this.resetPassword.value.email);
  }

  public continuedResetPassword(): void {
    swal.fire({
      title: 'Rejestracja',
      text: 'Na twój email został wygenerowany link do zresetowania hasła.',
      type: 'success',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Rozumiem i kontynuuje'
    }).then(() => {
      this.router.navigate(['/auth/sign-in']);
    });
  }

  public generateSwalEror(error): void {
    if (error.code === 'auth/user-not-found') {
      swal.fire('Resetowanie hasła', 'Podany email nie istnieje!', 'error');
    } else if (error.code === 'auth/too-many-requests') {
      swal.fire(
        'Resetowanie hasła',
        'Resetowanie hasła na podany email zostało zablokowane z powodu dużej ilości prób, spróbuj ponownie później!',
        'error'
      );
    }
  }

  public checkValidate(inputControl: string, nameControl: string): boolean {
    const control = this.resetPassword.controls[inputControl];
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
    const control = this.resetPassword.controls.email;
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
}
