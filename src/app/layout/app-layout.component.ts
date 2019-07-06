import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { FirebaseService } from '../services/firebase.service';

import { fadeInOutTranslate, fadeOutTranslate, zoomOut } from '../../shared/animations/animation';
import swal from 'sweetalert2';
import { Admin, Notificactions } from '../models/model';
import { LayoutManageService } from '../services/layout-manage.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  animations: [fadeInOutTranslate, fadeOutTranslate, zoomOut]
})
export class AppLayoutComponent implements OnInit {
  public activeSubMenu = [false, false, false, false, false, false, false];
  public userAuth = false;
  public vissibleLeftPanel: boolean;
  public moreOptionsProfile: boolean;
  public user: Admin;
  public notifications: Array<Notificactions>;
  public url;

  private flag = true;
  private admins: Array<Admin>;

  @HostListener('window:resize')
  public onResize(): void {
    if (window.innerWidth < 1000) { this.moreOptionsProfile = false; }
    if (window.innerWidth < 540 && this.vissibleLeftPanel) { this.vissibleLeftPanel = false; }
  }

  @HostListener('window:click')
  public onClick(): void {
    if (this.moreOptionsProfile) {
      this.moreOptionsProfile = false;
    }
  }

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.url = this.router.url;
      this.checkPanel();
    });
    this.url = this.router.url;

    this.layoutManageService.adminsData.subscribe(ad => this.admins = ad);
    this.layoutManageService.readyData.subscribe((data) => {
      if (data === true && this.flag === true) {
        this.checkPanel();
        this.checkAuth();
        this.flag = false;
      }
    });

    this.layoutManageService.adminsData.subscribe(admins =>  {
      this.admins = admins;
    });
  }

  public checkPanel(): void {
    if (window.innerWidth < 540) {
      this.vissibleLeftPanel = false;
    } else {
      this.vissibleLeftPanel = true;
    }
  }

  public checkAuth(): void {
    if (this.firebaseService.authorization) {
      this.userAuth = true;

      this.user = this.admins.find(
        ad => ad.email.toLocaleLowerCase() === this.layoutManageService.emailData.getValue().toLocaleLowerCase()
      );
      this.getNotifications();
      this.setNewDataLogin();
      return;
    } else if (localStorage.getItem('shop-admin')) {
      this.tryLogin();
      return;
    }
    this.router.navigate(['/auth/sign-in']);
  }

  public tryLogin() {
    const {email, password} = (<Admin>JSON.parse(localStorage.getItem('shop-admin')));
    this.firebaseService.firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        this.userAuth = true;
        this.layoutManageService.email = email;
        this.user = this.admins.find(el => el.email.toLowerCase() === email.toLowerCase());
        this.setNewDataLogin();
        this.getNotifications();
      })
      .catch(() => {
        localStorage.clear();
        this.router.navigate(['/auth/sign-in']);
      });
  }

  public getNotifications() {
    this.layoutManageService.notificationsData.subscribe(data => {
      this.notifications = data;
    });
    this.layoutManageService.groupNotificationsData.subscribe(data => {
      this.prepareNewNotification(data);
    });
  }

  public prepareNewNotification(data): void {
    if (data.length === 0) { return; }
    const notification = {
      date: this.getFullData() + ' ' + this.getFullTime(),
      comments: data.filter(el => el.name === 'comment').length,
      evaluations: data.filter(el => el.name === 'evaluation').length,
      messages: data.filter(el => el.name === 'message').length
    };
    this.notifications.push(notification);
    this.updateNotifications();
  }

  public updateNotifications(): void {
    this.firebaseService.getDataBaseRef('new_notifications').set(null)
      .then(() => {
        this.firebaseService.getDataBaseRef('notifications').set(this.notifications);
      });
  }

  public setNewDataLogin(): void {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        const history = { name: 'Logowanie', ip: data.ip, data: this.getFullData(), time: this.getFullTime() };
        this.user.history ? this.user.history.push(history) : this.user.history = [history];
        this.firebaseService.getDataBaseRef('admins').set(this.admins);
      });
  }

  public deleteNotification(index): void {
    swal.fire({
      title: 'Usunięcie powiadomienia',
      text: 'Czy jesteś pewny że chcesz usunąć powiadomienie?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.notifications.splice(index, 1);
        this.firebaseService.getDataBaseRef('notifications').set(this.notifications)
          .then(() => {
            swal.fire('Usunięcie powiadomienia', 'Powiadomienie zostało usunięte', 'success');
          });
      }
    });
  }

  getFullData() {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  getFullTime() {
    return this.datePipe.transform(new Date(), 'HH:mm:ss');
  }

  public hideSubMenu(index): void {
    this.activeSubMenu[index] = !this.activeSubMenu[index];
    if (this.activeSubMenu[index]) {
      document.getElementsByClassName('fa fa-angle-right')[index].className =
        'fa fa-angle-right rotate';
    } else {
      document.getElementsByClassName('fa fa-angle-right')[index].className =
        'fa fa-angle-right';
    }
  }

  public logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/sign-in']);
  }
}
