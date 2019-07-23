import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../../shared/animations/animation';
import { Order } from 'src/app/models/order.model';
import { OrdersManageService } from 'src/app/services/orders-manage.service';

@Component({
  selector: 'app-app-invoice',
  templateUrl: './app-invoice.component.html',
  styleUrls: ['./app-invoice.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppInvoiceComponent implements OnInit {
  public order: Order;
  public counter;
  public FLAG_READY = false;

  private ref: string;

  constructor(
    private ordersManageService: OrdersManageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ref = this.route.snapshot.params.id;

    this.ordersManageService.ordersData.subscribe(ords => {
      if (ords) {
        this.order = ords.find(or => or.ref === this.ref);

        if (!this.order.realized) {
          swal.fire('Faktura', 'Zamówienie nie zostało zrealizowane', 'error')
            .then(() => this.router.navigateByUrl('/dashboard'));
        }

        if (this.order.realized) {
          if (!this.order.realized.status) {
            swal.fire('Faktura', 'Zamówienie zostało odrzucone', 'error')
              .then(() => this.router.navigateByUrl('/dashboard'));
          }
        }
        this.setCounter();
      }
    });
  }

  public setCounter(): void {
    this.counter = ['next'];
    const length = this.order.products.length;
    for (let i = 0; i < length; i++) {
      if (i === 5) {
        this.counter.push('next');
      }
    }
    this.FLAG_READY = true;
  }

  public getTax(value: number): number {
    return Math.floor(value * 0.23);
  }

  public async getInvoice(): Promise<any> {
    this.generateSwalWaiting();
    const infoVoice = document.getElementsByClassName('invoice-print');
    const filename = 'Faktura nr:' + this.order.ref;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < infoVoice.length; i++) {
      await html2canvas(infoVoice[i] as HTMLDataElement, { scale: 2 }).then(canvas => {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 5, 5, 200, 280);

        if (i + 1 < infoVoice.length) {
          pdf.addPage();
        }
      });
    }

    pdf.save(filename);
    swal.fire('Pobranie Dokumentu', 'Dokument został pobrany', 'success');
  }

  public generateSwalWaiting(): void {
    swal.fire({
      type: 'warning',
      title: 'Pobranie Dokumentu',
      text: 'Proszę czekać na przygotowanie dokumentu do pobrania',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        const content = swal.getContent();
        const $ = content.querySelector.bind(content);
        swal.showLoading();
      }
    });
  }
}
