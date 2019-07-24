import { Component, OnInit, HostListener } from '@angular/core';

import { LayoutManageService } from 'src/app/services/layout-manage.service';

import { fadeInOutTranslate, fadeInDown, fadeOutUp } from '../../../../shared/animations/animation';
import Swal from 'sweetalert2';
import { FormGroup, FormControl } from '@angular/forms';
import { Admin, Login, CreatedProduct, RealizedOrder } from 'src/app/models/admin.model';

@Component({
  selector: 'app-my-profil',
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
  public calendarVissible = false;
  public form: FormGroup;
  public listMultiple;
  public showRecords = false;
  public records = [];

  @HostListener('window:click', ['$event.target'])
  onClick(event) {
    this.calendarVissible = false;
  }

  constructor(
    private layoutManageService: LayoutManageService
    ) {
      this.prepareList();
    }

  ngOnInit(): void {
    const email = this.layoutManageService.emailData.getValue();
    this.layoutManageService.adminsData.subscribe(ad => {
      if (ad.length > 0) {
        this.user = ad.find(admin => admin.email === email);
        this.prepareHistory();
      }
    });
    this.initForm();
  }

  public showMeIp(): void {
    const ipAPI = 'https://api.ipify.org?format=json';
    Swal.queue([
      {
        title: 'Twoje IP',
        confirmButtonText: 'Pokaż moje Ip',
        text: 'Twoje publiczne IP',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return fetch(ipAPI)
            .then(response => response.json())
            .then(data => Swal.insertQueueStep(data.ip))
            .catch(() => {
              Swal.insertQueueStep({
                type: 'error',
                title: 'Nie można znaleźć twojego IP'
              });
            });
        }
      }
    ]);
  }

  public initForm(): void {
    this.form = new FormGroup({
      from: new FormControl(''),
      to: new FormControl(''),
      excludeIp: new FormControl(''),
      refProduct: new FormControl(''),
      refOrder: new FormControl(''),
      time: new FormControl('')
    });
  }

  public get dateFrom(): string { return this.form.value.from; }

  public get dateTo(): string { return this.form.value.to; }

  scrollToHistory(ref) {
    ref.scrollIntoView({ behavior: 'smooth' });
    this.onSelectHistory(3);
  }

  public onSelectHistory(index: number): void {
    if (index === this.selected) { return null; }
    if (index === 3) {
      this.showRecords = false;
      this.initForm();
      this.prepareList();
    }

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

  public setDate(from: string, to: string): void {
    this.form.controls.from.setValue(from || this.form.value.from);
    this.form.controls.to.setValue(to);
  }


  public toggleCalendar(event?): void {
    if (event) { event.stopImmediatePropagation(); }
    this.calendarVissible = !this.calendarVissible;
  }

  public clearCalendar(): void {
    this.form.controls.from.setValue('');
    this.form.controls.to.setValue('');
    this.calendarVissible = !this.calendarVissible;
  }

  public prepareList(): void {
    this.listMultiple = [
      { id: 0, name: 'Logowania', selected: false, key: 'logins', input: 'excludeIp', dataKey: 'ip' },
      { id: 1, name: 'Produkty', selected: false, key: 'addProducts', input: 'refProduct', dataKey: 'ref' },
      { id: 2, name: 'Zamówienia', selected: false, key: 'realizedOrder', input: 'refOrder', dataKey: 'ref' }
    ];
  }

  public search(): void {
    const { time } = this.form.value;
    this.records = [];
    this.showRecords = true;
    this.checkSelectedOptions();
    this.filterDate();

    // Includes: excludeIp, refProduct, refOrder, time
    for (const rec of this.records) {
     const { input, dataKey } = rec;
     if (input === 'excludeIp') {
      rec.data = rec.data.filter(r => !r[dataKey].includes(this.form.value[input])).reverse();
     } else {
      rec.data = rec.data.filter(r => r[dataKey].includes(this.form.value[input])).reverse();
     }
     rec.data = rec.data.filter(r => r.time.includes(time)).reverse();
    }
  }

  public checkSelectedOptions(): void {
    for (const list of this.listMultiple) {
      if (list.selected) {
        const { key, name, input, dataKey } = list;
        const data = this.user[key] ? this.user[key].reverse() : new Array(0);
        this.records.push({ name, data, input, dataKey });
      }
    }
  }

  public filterDate(): void {
    const { from, to } = this.form.value;
    const dateFrom = from ? new Date(from) : null;
    const dateTo = to ? new Date(to) : null;

    for (const rec of this.records) {
      rec.data = rec.data.filter(re => {
        const date = new Date(re.data);
        if (dateFrom && dateFrom.getTime() > date.getTime()
          || dateTo && dateTo.getTime() < date.getTime()) {
          return false;
        }
        return true;
      });
    }
  }
}
