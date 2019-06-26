import { Component, OnInit } from "@angular/core";
import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-list-users",
  templateUrl: "./app-list-users.component.html",
  styleUrls: [
    "./app-list-users.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppListUsersComponent implements OnInit {
  checkFromUid; // uid to auth users login set timeout exit when uid be has value.
  checkFromGetData; //  set Timeout check on data admin and authorizationUsers hide when 2 variables be have value //

  /* variable save detail authorizationUsers && admins*/
  authorizationUsers = [];
  adminsUserDetail = [];
  /*------------------------------------------*/

  /* reference to database */
  refAuthorizationUsers;
  refAdmins;
  /*-----------------------*/

  authorized: boolean = true; // if authorized === false then user give communicate about wrong authorized.
  checkAuthorized: boolean; // if get authorizationUsers be complete checkAuthorized change status true and animation spinner loading be off.

  getError: boolean = false; // if companyAdmin or admin database return error then use once this funtcion //

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
  }

  filterAuthorizationUsers(AuthorizationUsers) {
    let filterAuthorizationUsers = [];
    let email = '';
    AuthorizationUsers.forEach(user => {
      if(user.email !== email) {
        filterAuthorizationUsers.push(user);
      }
    })

    return filterAuthorizationUsers;
  }

  getDetailAdmins() {
     let refAdmins = this.firebaseService
      .firebase
      .database()
      .ref('admins');
      refAdmins.on("value", this.donwloadDetailAdmins, this.errAdmins);

    this.refAdmins = refAdmins; // reference admins data //
  }

  donwloadDetailAdmins = data => {
    let scores = data.val();
    let keys = Object.keys(scores);
    let allScore = [];

    for (let i = 0; i < keys.length; i++) {
      allScore.push(scores[keys[i]]);
    }

    this.adminsUserDetail = allScore;
  };

  errAdmins(error) {
    console.log(error);
  }

  /* Section delete user */
  checkSureDelete(index) {
    swal({
      title: "Usunięcie użytkownika",
      text: "Czy jesteś pewny że chcesz usunąć użytkownika?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        this.deleteUser(index);
      }
    });
    return;
  }



  deleteUser(index) {
    let detailAdminUser = this.getDeleteUserWithDatabaseAdmins(this.authorizationUsers[index].email);
    let uidUserDelete = detailAdminUser.uid;
    let emailDeleteUser = detailAdminUser.email;
    let passwordDeleteUser = detailAdminUser.password;
    let email = '';
    let password = '';

    this.generateSwalWaitingFromRequest(
      "warning",
      "Usuwanie użytkownika",
      "Czekaj na usunięcie użytkownika!"
    );
    this.loginAccountUserDelete(
      email,
      password,
      emailDeleteUser,
      passwordDeleteUser,
      uidUserDelete
    );
  }

  getDeleteUserWithDatabaseAdmins(email) {
    return this.adminsUserDetail.find((admin) => {
      if(admin.email === email) {
        return admin;
      }
    })
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

  loginAccountUserDelete(
    email,
    password,
    emailUserDelete,
    passwordUserDelete,
    uidUserDelete
  ) {
    this.firebaseService
      .firebase
      .auth()
      .signInWithEmailAndPassword(emailUserDelete, passwordUserDelete)
      .then(() => {
        this.deleteUserAccountAfterLogin(email, password, uidUserDelete);
      })
      .catch(err => {
        console.log(err);
        swal.close();
      });
  }

  deleteUserAccountAfterLogin(email, password, uidUserDelete) {
    this.firebaseService
      .firebase
      .auth()
      .currentUser.delete()
      .then(() => {
        this.returnToLoginMyAccount(email, password, uidUserDelete);
      })
      .catch(err => {
        console.log(err);
        swal.close();
      });
  }

  returnToLoginMyAccount(email, password, uidUserDelete) {
    this.firebaseService
      .firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.deleteUserWithAdmins(uidUserDelete);
      })
      .catch(err => {
        console.log(err);
        swal.close();
      });
  }

  deleteUserWithAdmins(uidUserDelete) {
    this.firebaseService
      .firebase
      .database()
      .ref("admins")
      .child(uidUserDelete)
      .remove()
      .then(() => {
        this.deleteUserWithAuthorizationUsers(uidUserDelete);
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteUserWithAuthorizationUsers(uidUserDelete) {
    this.firebaseService
      .firebase
      .database()
      .ref("authorizationUsers")
      .child(uidUserDelete)
      .remove()
      .then(() => {
        swal.close();
        this.generateSwalInformation(
          "success",
          "Usunięcie użytkownika",
          "Użytkownik został usunięty poprawnie!"
        );
      })
      .catch(err => {
        console.log(err);
      });
  }

  /* -------------------*/

  generateSwalInformation(type, title, text) {
    swal({
      type: type,
      title: title,
      text: text
    });
  }
}
