import { Component, OnInit } from "@angular/core";
import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CustomValidators } from "ng2-validation";
import swal from "sweetalert2";

@Component({
  selector: "app-app-my-settings",
  templateUrl: "./app-my-settings.component.html",
  styleUrls: ["./app-my-settings.component.css"],
  animations: [fadeInOutTranslate]
})
export class AppMySettingsComponent implements OnInit {
  checkFromUid: any;
  user: any;
  refUserDetail;
  changePassword;
  oldPassword: string = "";

  /* Variable profil settings*/
  firstName: string;
  lastName: string;
  /*-------------------------*/

  color = "primary";
  activeNotificationSecurity: boolean = true;

  constructor(private firebaseService: FirebaseService) {
    const password = new FormControl("", [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(
        "^(?=.*[A-Za-zęóąśłżźćńĘÓĄŚŁŻŹĆŃ])(?=.*\\d)(?=.*[$@$!%*#?&.,_-])[A-Za-zęóąśłżźćńĘÓĄŚŁŻŹĆŃ\\d$@$!%*#?&.,_-]{8,}$"
      )
    ]);
    const repeatPassword = new FormControl("", [
      Validators.required,
      CustomValidators.equalTo(password)
    ]);
    this.changePassword = new FormGroup({
      password: password,
      repeatPassword: repeatPassword
    });
  }

  ngOnInit() {
  }

  getDetail(uid) {
    let refUserDetail = this.firebaseService
      .firebase
      .database()
      .ref("admins")
      .child(uid);
    refUserDetail.on("value", this.donwloadDetailUser, this.err);
    this.refUserDetail = refUserDetail;
  }

  donwloadDetailUser = data => {
    let scores = data.val();
    this.user = scores;
    this.activeNotificationSecurity = this.user.homeStart.securityRead;
    this.firstName = this.user.firstName ? this.user.firstName : "";
    this.lastName = this.user.lastName ? this.user.lastName : "";
  };

  err(err) {
    console.log(err);
  }

  updateProfil() {
    if (
      this.user.firstName === this.firstName &&
      this.user.lastName === this.lastName
    )
      return;
    this.generateSwalWaitingFromRequest(
      "warning",
      "Zmiana hasła",
      "Czekaj na zmianę twoich danych w profilu!"
    );
    this.user.firstName = this.firstName;
    this.user.lastName = this.lastName;
    this.refUserDetail
      .set(this.user)
      .then(() => {
        swal.close();
        swal({
          type: "success",
          title: "Aktualizacja",
          text: "Dane zaktualizowano"
        });
      })
      .catch(err => {
        swal.close();
        swal({
          type: "error",
          title: "Błąd",
          text: err
        });
      });
  }

  submitChangePassword() {
    if (
      this.oldPassword !== 'ss'
    ) {
      swal({
        type: "error",
        title: "Zmiana hasła",
        text: "Stare hasło jest niepoprawne!"
      });
      return;
    }
    for (let inner in this.changePassword.controls) {
      this.changePassword.get(inner).markAsTouched();
      this.changePassword.get(inner).updateValueAndValidity();
    }

    if (this.changePassword.valid) {
      this.generateSwalWaitingFromRequest(
        "warning",
        "Zmiana hasła",
        "Czekaj na zmianę hasła"
      );
      this.firebaseService
        .firebase
        .auth()
        .currentUser.updatePassword(this.changePassword.value.password)
        .then(res => {
          this.changePasswordInAdmins(this.changePassword.value.password);
        })
        .catch(err => {
          swal.close();
          swal({
            type: "error",
            title: "Zmiana hasła",
            text: err
          });
        });
    }
  }

  generateSwalWaitingFromRequest(type, title, text) {
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

  changePasswordInAdmins(password) {
    this.refUserDetail
      .child("password")
      .set(password)
      .then(() => {
        // todo
        this.clearInputs();
        this.setLocalStorage(this.user.email, password);
        swal.close();
        swal({
          type: "success",
          title: "Zmiana hasła",
          text: "Hasło zostało zmienione!"
        });
      })
      .catch(err => {
        swal.close();
        swal({
          type: "error",
          title: "Zmiana hasła",
          text: err
        });
      });
  }

  clearInputs() {
    for (let inner in this.changePassword.controls) {
      this.changePassword.get(inner).markAsUntouched();
      this.changePassword.get(inner).setValue(null);
    }
    this.oldPassword = "";
  }

  setLocalStorage(email, password) {
    let dataStorage = localStorage.getItem("muszelka-admin");
    if (dataStorage) {
      localStorage.setItem(
        "muszelka-admin",
        JSON.stringify({ email, password })
      );
    }
  }

  setSecurity() {
    this.refUserDetail
      .child("homeStart")
      .child("securityRead")
      .set(!this.user.homeStart.securityRead)
      .then(() => {
        swal({
          type: "success",
          title: "Zmiana wyświetlania powiadomienia o bezpieczeństwie",
          text: "Zmiana została zaktualizowana!"
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
}
