import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

import { FirebaseService } from '../../../services/firebase.service';
import { LayoutManageService } from 'src/app/services/layout-manage.service';

import swal from 'sweetalert2';
import { Admin } from 'src/app/models/model';

@Component({
  selector: 'app-app-list-users',
  templateUrl: './app-list-users.component.html',
  styleUrls: [
    './app-list-users.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  animations: [fadeInOutTranslate]
})
export class AppListUsersComponent implements OnInit {
  public admins: Array<Admin>;

  private email: string;
  private user: Admin;
  private userDelete: string;

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService
    ) {}

  ngOnInit(): void {
    this.email = this.layoutManageService.emailData.getValue();

    this.layoutManageService.adminsData.subscribe((admins => {
      this.admins = this.layoutManageService.adminsData.getValue()
      .filter(admin => admin.email !== this.email);

      this.user = this.layoutManageService.adminsData.getValue()
      .find(admin => admin.email === this.email);
    }));
  }

  /* Section delete user */
  public checkSureDelete(index): void {
    swal({
      title: 'Usunięcie użytkownika',
      text: 'Czy jesteś pewny że chcesz usunąć użytkownika?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.deleteUser(index);
      }
    });
    return;
  }

  public deleteUser(index): void {
    this.generateSwalWaitingFromRequest(
      'warning',
      'Usuwanie użytkownika',
      'Czekaj na usunięcie użytkownika!'
    );
    this.loginAccountUserDelete(index);
  }

  public loginAccountUserDelete(index: number): void {
    const { email, password } = this.admins[index];
    this.userDelete = email;
    this.firebaseService.firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => { this.deleteUserAccountAfterLogin(); })
      .catch(() => swal.close());
  }

 public deleteUserAccountAfterLogin(): void {
    this.firebaseService.firebase.auth().currentUser.delete()
      .then(() => { this.returnToLoginMyAccount(); })
      .catch(() => swal.close());
  }

  public returnToLoginMyAccount(): void {
    const {email, password} = this.user;
    this.firebaseService.firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => this.deleteUserWithAdmins())
      .catch(() => swal.close());
  }

  deleteUserWithAdmins() {
    const ad = this.layoutManageService.adminsData.getValue()
      .filter(ad => ad.email !== this.userDelete);

    this.firebaseService.getDataBaseRef('admins').set(ad)
      .then(() => {
        swal.close();
        swal('Usuwanie użytkownika', 'Użytkownik został usunięty pomyślnie!', 'success');
      });
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
}
