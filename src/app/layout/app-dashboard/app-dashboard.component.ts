import { Component, OnInit, ViewChild } from '@angular/core';

import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Task } from 'src/app/models/model';
import { Chart } from 'chart.js';
import { Admin } from 'src/app/models/admin.model';

import { fadeInOutTranslate } from '../../../shared/animations/animation';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import Swal from 'sweetalert2';
import { Product } from 'src/app/models/product.model';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppDashboardComponent implements OnInit {
  @ViewChild('chartFirst', { static: true }) private chartFirstRef;

  @ViewChild('chartSecond', { static: true }) private chartSecondRef;

  public user: Admin;
  public visibleNotificationSecurity = true;
  public tasks: Array<Task>;
  public messages: Array<Message>;
  public products: Array<Product>;
  public admins: Array<Admin>;

  private chartFirst: any;
  private chartSecond: any;
  private scaleX = { display: true, gridLines: { display: false}};

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private productManageService: ProductsManageService,
    private messagesManageService: MessagesManageService
    ) {}

  ngOnInit() {
    const email = this.layoutManageService.emailData.getValue();
    const admins = this.layoutManageService.adminsData.getValue();

    this.tasks = this.layoutManageService.tasksData.getValue();
    this.layoutManageService.adminsData.subscribe(ad => this.admins = ad);
    this.productManageService.productsData.subscribe(pr => this.products = pr);
    this.messagesManageService.messageData.subscribe(m => this.messages = m);
    this.user = admins.find(admin => admin.email === email);

    this.createFirstChart();
    this.createSecondChart();
  }

  /*
  * Statistic Orders
  */
  public createFirstChart(): void {
    this.chartFirst = new Chart(this.chartFirstRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.getAllDaysInMounth(), // your labels array
        datasets: [{
            data: [180, 700, 500, 200, 110, 400, 50, 150, 70],
            borderColor: '#00AEFF',
            fill: true,
            backgroundColor: '#e5f7ff'
        }]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [this.scaleX],
          yAxes: [{
            display: true,
            ticks: {
              suggestedMin: 50,
              suggestedMax: 1000,
              beginAtZero: true,
              stepSize: 250
            },
            gridLines: {
              display: false
            }
          }],
        }
      }
    });
  }

  public getAllDaysInMounth(): Array<number> {
    const currentDay = new Date('2018-05-01');
    const daysInMonth = new Date(
      currentDay.getFullYear(), currentDay.getMonth() + 1, 0
      ).getDate();
    const days = [];

    for (let i = 0; i < daysInMonth; i++) {
      if (i % 4 === 0) {
        days.push(i + 1);
      }

      if (i === daysInMonth - 1) {
        days.push(i + 1);
      }
    }
    return days;
  }

  public createSecondChart(): void {
    this.chartSecond = new Chart(this.chartSecondRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
        datasets: [{
            data: [2150, 1700, 4500, 1200, 1810, 1400, 4500, 11150, 650, 850, 2110, 4500],
            borderColor: '#886ce6',
            fill: true,
            backgroundColor: '#f6f3fc'
        }]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [this.scaleX],
          yAxes: [{
            display: true,
            ticks: {
              suggestedMin: 50,
              suggestedMax: 12000,
              beginAtZero: true,
              stepSize: 2000
            },
            gridLines: {
              display: false
            }
          }],
        }
      }
    });
  }

  /**
   * Activity Page
   */
    public getNewAdmin(): Admin {
      const admin = this.admins[this.admins.length - 1];
      return admin;
    }

    public getNewProduct(): Product {
      if (!this.products) { return null; }
      const product = this.products[this.products.length - 1];
      return product;
    }

    public getNewMessage(): Message {
      if (!this.messages) { return null; }
      const message = this.messages[this.messages.length - 1];
      return message;
    }

    public getDaysCreated(date: string): number | string {
      const current = new Date();
      const prev = new Date(date);
      const time = current.getTime() - prev.getTime();
      if (time === null) {return 'Brak'; }
      return Math.floor(time / 86400000);
    }

    public executeTask(index: number): void {
      this.layoutManageService.updateTask(index);
    }

    public executeAllTask(): void {
      this.layoutManageService.updateAllTasks();
    }

    public getNewMessages(): Array<Message> {
      if (this.messages && this.messages.length > 0) {
        const messages = this.messages.filter(m => m.read === false);
        const reverseMessage = [];

        if (messages.length === 0) {
          return [];
        }
        let increment = 0;
        for (let i = messages.length - 1; i >= 0; i--) {
          reverseMessage.push(messages[i]);

          if (++increment === 5) {
            break;
          }
        }
        return reverseMessage;
      }
      return [];
    }

    public markMessage(id: number): void {
      const index = this.messages.findIndex(m => m.id === id).toString();
      this.firebaseService.getDataBaseRef('messages')
        .child(index).child('read').set(true)
          .then(() => Swal.fire('Oznaczenie wiadomości', 'Wiadomość została oznaczona jako przeczytana.', 'success'));
    }

    public markLastFiveMessage(): void {
      if (this.messages.length > 0) {
        const messages = this.messages.filter(m => m.read === false);
        if (messages.length > 0) {
          const reverseMsgs = messages.reverse();
          let increment = 0;
        // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < reverseMsgs.length; i++) {
          reverseMsgs[i].read = true;
          if (++increment === 5) { break; }
        }
          this.firebaseService.getDataBaseRef('messages').set(this.messages)
          .then(() => Swal.fire('Oznaczenie wiadomości', 'Wiadomości zostały oznaczone jako przeczytana.', 'success'));
          return;
        }
      }
      Swal.fire('Oznaczenie wszystkich wiadomości', 'Brak wiadomości do oznaczenia', 'error');
    }
}
