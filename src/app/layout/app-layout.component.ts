import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { FirebaseService } from '../services/firebase.service';

import { fadeInOutTranslate, fadeOutTranslate, zoomOut } from '../../shared/animations/animation';
import swal from 'sweetalert2';
import { LayoutManageService } from '../services/layout-manage.service';
import { DatePipe } from '@angular/common';
import { CurrentPageService } from '../services/current-page.service';
import { OrdersManageService } from '../services/orders-manage.service';
import { Admin } from '../models/admin.model';
import { Notificactions } from '../models/notification.model';
import { Order } from '../models/page.model';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  animations: [
    fadeInOutTranslate,
    fadeOutTranslate,
    zoomOut
  ]
})
export class AppLayoutComponent implements OnInit {
  public activeSubMenu = [false, false, false, false, false, false, false];
  public userAuth = false;
  public vissibleLeftPanel: boolean;
  public user: Admin;
  public notifications: Array<Notificactions>;
  public url;
  public vissibleOptions = [false, false, false];
  public orders: Array<Order>;

  private flag = true;
  private admins: Array<Admin>;

  @HostListener('window:resize')
  public onResize(): void {
    if (window.innerWidth < 768 && this.vissibleLeftPanel) { this.vissibleLeftPanel = false; }
    if (window.innerWidth < 540) { this.vissibleOptions = [false, false, false]; }
  }

  @HostListener('window:click')
  public onClick(): void {
    this.vissibleOptions = [false, false, false];
  }

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe,
    private currentPageService: CurrentPageService,
    private ordersManageService: OrdersManageService
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.url = this.router.url;
      this.currentPageService.update(this.url);
      this.checkPanel();
    });
    this.url = this.router.url;
    this.currentPageService.update(this.url);

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
      if (this.userAuth) {
        const email = this.layoutManageService.emailData.getValue();
        this.user = admins.find(a => a.email === email);
      }
    });

    this.ordersManageService.ordersData.subscribe(orders => this.orders = orders);
  }

  public checkPanel(): void {
    if (window.innerWidth < 768) {
      this.vissibleLeftPanel = false;
    } else {
      this.vissibleLeftPanel = true;
    }
  }

  public checkAuth(): void {
    if (this.firebaseService.authorization) {
      this.userAuth = true;
      const email = this.layoutManageService.emailData.getValue().toLowerCase();
      console.log(email);
      this.user = this.admins.find(
        ad => ad.email.toLocaleLowerCase() === email
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
    const {email, password} = (JSON.parse(localStorage.getItem('shop-admin')) as Admin);
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
    // fetch('https://api.ipify.org?format=json')
    //   .then(response => response.json())
    //   .then(data => {
    //     const login: Login = { ip: data.ip, data: this.getFullData(), time: this.getFullTime() };
    //     this.user.logins ? this.user.logins.push(login) : this.user.logins = [login];
    //     this.firebaseService.getDataBaseRef('admins').set(this.admins);
    //   });
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

  public getFullData(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  public getFullTime(): string {
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

  public moreOptions(index: number) {
    for (let i = 0; i < this.vissibleOptions.length; i++) {
      if (i === index) {
        this.vissibleOptions[i] = !this.vissibleOptions[i];
        continue;
      }
      this.vissibleOptions[i] = false;
    }
  }

  public get sumNotification(): number {
    if (!this.notifications) { return 0; }
    const not = this.notifications[this.notifications.length - 1];
    return not.messages + not.evaluations + not.comments;
  }
}
