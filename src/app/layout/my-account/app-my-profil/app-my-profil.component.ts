import { Component, OnInit } from '@angular/core';

import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin, CreatedProduct, Login, RealizedOrder } from 'src/app/models/model';

import { fadeInOutTranslate, fadeInDown, fadeOutUp } from '../../../../shared/animations/animation';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-app-my-profil',
  templateUrl: './app-my-profil.component.html',
  styleUrls: ['./app-my-profil.component.css'],
  animations: [fadeInOutTranslate, fadeInDown, fadeOutUp]
})
export class AppMyProfilComponent implements OnInit {
  public user: Admin;
  public amountLogins = 0;
  public amountProducts = 0;
  public name = '';
  public date = '';
  public time = '';
  public IP = '';
  public textCopy: any;
  public tabCopy: any;
  public visibleClipboardCopy: boolean;
  public selectHistory = ['logins', 'addProducts', 'realizedOrder', 'search'];
  public selected = 0;
  public dataHistory = [];
  public nextDay = 0;

  constructor(
    private layoutManageService: LayoutManageService
    ) {}

  ngOnInit(): void {
    const email = this.layoutManageService.emailData.getValue();
    this.layoutManageService.adminsData.subscribe(ad => {
      if (ad.length > 0) {
        this.user = ad.find(admin => admin.email === email);
        this.prepareHistory();
      }
    });
  }

  public showMeIp(): void {
    const ipAPI = 'https://api.ipify.org?format=json';
    Swal.queue([
      {
        title: 'Your public IP',
        confirmButtonText: 'Show my public IP',
        text: 'Your public IP will be received ' + 'via AJAX request',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return fetch(ipAPI)
            .then(response => response.json())
            .then(data => Swal.insertQueueStep(data.ip))
            .catch(() => {
              Swal.insertQueueStep({
                type: 'error',
                title: 'Unable to get your public IP'
              });
            });
        }
      }
    ]);
  }

  scrollToHistory(ref) {
    ref.scrollIntoView({ behavior: 'smooth' });
    this.onSelectHistory(3);
  }

  public onSelectHistory(index: number): void {
    this.selected = index;
    this.nextDay = 0;
    this.prepareHistory();
  }

  public prepareHistory(): void {
    const name = this.selectHistory[this.selected];
    const data: Array<Login | CreatedProduct | RealizedOrder> = this.user[name];
    if (!data) {
      this.dataHistory = [];
      return;
    }
    const reverseHistory = [];
    const history = [{
        date: new Date(data[0].data),
        data: []
    }];
    let index = 0;

    data.forEach((d, i ) => {
      const date = new Date(d.data);

      if (history[index].date.getTime() === date.getTime()) {
        history[index].data.push(d);
      } else {
        history[index].data = history[index].data.reverse();
        index++;
        history.push({
          date: new Date(d.data),
          data: [d]
        });
      }

      if (i === data.length - 1) {
        history[index].data = history[index].data.reverse();
      }
    });

    for (let i = history.length - 1; i >= 0; i--) {
      reverseHistory.push(history[i]);
    }
    this.dataHistory = reverseHistory;
  }
}
