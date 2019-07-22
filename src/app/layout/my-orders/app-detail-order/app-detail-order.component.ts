import { Component, OnInit } from '@angular/core';

import { OrdersManageService } from 'src/app/services/orders-manage.service';
import { FirebaseService } from 'src/app/services/firebase.service';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { Order } from 'src/app/models/order.model';
import { ActivatedRoute } from '@angular/router';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detail-order',
  templateUrl: './app-detail-order.component.html',
  styleUrls: ['./app-detail-order.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppDetailOrderComponent implements OnInit {
  public order: Order;

  private ref: string;

  constructor(
    private ordersManageService: OrdersManageService,
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.ref = this.route.snapshot.params.id;

    this.ordersManageService.ordersData.subscribe(ords => {
      if (ords) {
        this.order = ords.find(or => or.ref === this.ref);
      }
    });
  }

  public showNotification(): void {
    this.layoutManageService.showNotification();
  }

  public showSummary(ref): void {
    ref.scrollIntoView({ behavior: 'smooth' });
  }

  public getTax(value: number): number {
    return Math.floor(value * 0.23);
  }

  public realizeOrder(): void {
    swal.fire({
      title: 'Zrealizowanie Zamówienia',
      text: 'Czy jesteś pewny że chcesz oznaczyć zamówienie jako zrealizowane?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.updateOrderToDatabase(true, 'Zrealizowanie Zamówienia', 'zrealizowane');
      } else {
        swal.fire('Zrealizowanie Zamówienia', 'Zamówienie nadal czeka na realizację.', 'info');
      }
    });
  }

  public discardOrder(): void {
    swal.fire({
      title: 'Odrzuczenie Zamówienia',
      text: 'Czy jesteś pewny że chcesz odrzucić zamówienie?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.updateOrderToDatabase(false, 'Odrzuczenie Zamówienia', 'odrzucone');
      } else {
        swal.fire('Odrzuczenie Zamówienia', 'Zamówienie nadal czeka na realizację.', 'info');
      }
    });
  }

  updateOrderToDatabase(status: boolean, title: string, message: string) {
    const orders = this.ordersManageService.ordersData.getValue();
    const email = this.layoutManageService.emailData.getValue();
    this.order.realized = {
      email,
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      status
    };
    this.order.executed = true;

    this.firebaseService.getDataBaseRef('orders').set(orders)
      .then(() => swal.fire(title, 'Zamówienie zostało ' + message, 'success'));
  }

}
