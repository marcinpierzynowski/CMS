import { Component, OnInit } from '@angular/core';

import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin, History } from 'src/app/models/model';

import { fadeInOutTranslate, fadeInDown, fadeOutUp } from '../../../../shared/animations/animation';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-app-my-profil',
  templateUrl: './app-my-profil.component.html',
  styleUrls: ['./app-my-profil.component.css'],
  animations: [fadeInOutTranslate, fadeInDown, fadeOutUp]
})
export class AppMyProfilComponent implements OnInit {
  checkFromUid: any;

  public user: Admin;
  public history: Array<History>;
  public amountLogins = 0;
  public amountProducts = 0;
  public name = '';
  public date = '';
  public time = '';
  public IP = '';
  public textCopy: any;
  public tabCopy: any;
  public visibleClipboardCopy: boolean;

  private timeClipboard;

  constructor(
    private layoutManageService: LayoutManageService
    ) {}

  ngOnInit(): void {
    const email = this.layoutManageService.emailData.getValue();
    this.layoutManageService.adminsData.subscribe(ad => {
      if (ad.length > 0) {
        this.user = ad.find(admin => admin.email === email);
      }
    });
    this.prepareScores();
  }

  public prepareScores(): void {
    const user = this.user;
    if (user.history) {
      this.history = this.user.history.slice();
      this.amountLogins = this.history.filter(scr => scr.name === 'Logowanie').length;
      this.amountProducts = this.history.filter(scr => scr.name === 'Produkt').length;
    }
    this.filterData();
  }

  public filterData(): void {
    // tslint:disable-next-line:one-variable-per-declaration
    const n = this.name, t = this.time, d = this.date;
    const inpVal = [n, t, d];
    const keys = ['name', 'time', 'data'];

    this.history = this.user.history.filter((his) => {
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < inpVal.length; i++) {
        if (inpVal[i] !== '' && his[keys[i]].toLowerCase().includes(inpVal[i].toLowerCase()) === false) {
         return false;
        }
      }
      return true;
    });

    // exclude Ip
    if (this.IP !== '') {
      this.history = this.history.filter((his) => his.ip !== this.IP);
    }

    // if all inputs empty
    if (!inpVal.find(el => el !== '') && this.IP === '') {
      this.history = this.user.history;
    }
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
  }
}
