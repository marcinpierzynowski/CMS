import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { FirebaseService } from '../services/firebase.service';

import { LayoutManageService } from '../services/layout-manage.service';
import { CurrentPageService } from '../services/current-page.service';
import { OrdersManageService } from '../services/orders-manage.service';
import { Admin } from '../models/admin.model';
import { Notificaction } from '../models/notification.model';
import { Order } from '../models/page.model';
import ManageData from './app-manage-data';

import { fadeInOutTranslate, fadeOutTranslate, zoomOut } from '../../shared/animations/animation';
import swal from 'sweetalert2';

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
  public notification: Notificaction;
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
    private ordersManageService: OrdersManageService,
    private manageData: ManageData
  ) { }

  ngOnInit(): void {
    // import * as jsPDF from 'jspdf';
    // import html2canvas from 'html2canvas';
    // setTimeout(() => {
    //   const filename  = 'ThisIsYourPDFFilename.pdf';

    //   html2canvas(document.querySelector('#test'), {scale: 10}).then(canvas => {
    //     let pdf = new jsPDF('p', 'px', 'a4');
    //     pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 100, 0, 239, 337);
    //     pdf.save(filename);
    //   });
    // }, 5000)
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

    this.layoutManageService.adminsData.subscribe(admins => {
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
    const { email, password } = (JSON.parse(localStorage.getItem('shop-admin')) as Admin);
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
    this.layoutManageService.notificationData.subscribe(data => {
      this.notification = data;
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
    if (!this.notification) { return 0; }
    const notif = this.notification;
    return (notif.messages || 0) + (notif.evaluations || 0) + (notif.reviews || 0);
  }

  public resetNotification(key, url): void {
    this.vissibleOptions[1] = false;
    this.notification[key] = 0;
    const notif = this.notification;
    if (!notif.evaluations && !notif.messages && !notif.reviews) {
      this.notification = null;
    }
    this.firebaseService.getDataBaseRef('notification').set(this.notification)
      .then(() => {
        this.router.navigate([url]);
      });
  }
}
