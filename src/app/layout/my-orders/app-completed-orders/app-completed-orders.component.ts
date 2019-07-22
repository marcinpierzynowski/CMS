import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { OrdersManageService } from 'src/app/services/orders-manage.service';
import { FirebaseService } from 'src/app/services/firebase.service';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { Order } from 'src/app/models/order.model';

@Component({
  selector: 'app-completed-orders',
  templateUrl: './app-completed-orders.component.html',
  styleUrls: ['./app-completed-orders.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppCompletedOrdersComponent implements OnInit {
  public orders: Array<Order>;
  public cpOrders: Array<Order>;
  public limit = 5;
  public sortState = 0;
  public filter: FormGroup;

  private time;

  constructor(
    private ordersManageService: OrdersManageService,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.initForm();
    this.ordersManageService.ordersData.subscribe(ords => {
      if (ords) {
        this.orders = ords.filter(or => or.executed).reverse();
        this.cpOrders = this.orders.slice();
      }
    });
  }

  public initForm(): void {
    this.filter = new FormGroup({
      email: new FormControl(''),
      ref: new FormControl(''),
      name_surname: new FormControl(''),
      date: new FormControl(''),
    });
  }

  public showAll(): void {
    this.limit = this.orders.length;
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public setSortState(): void {
    this.sortState = this.sortState < 2 ? this.sortState + 1 : 0;
    this.filterData();
  }

  public filterData(): void {
    const inputs = this.filter.value;
    const keys = ['email', 'ref', 'name_surname', 'date'];

    if (this.time) {
      clearTimeout(this.time);
      this.time = null;
    }

    this.time = setTimeout(() => {
      this.limit = 5;
      const ordersManage = this.ordersManageService.ordersData.getValue().slice().reverse();
      if (this.sortState === 1) {
        this.orders = ordersManage.sort(this.sortAscending);
      } else if (this.sortState === 2) {
        this.orders = ordersManage.sort(this.sortDescending);
      } else {
        this.orders = ordersManage;
      }

      this.cpOrders = this.orders.filter(c => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] !== 'name_surname') {
            if (inputs[keys[i]] !== '' && c[keys[i]].toLowerCase()
              .includes(inputs[keys[i]].toLowerCase()) === false) {
              return false;
            }
          } else {
            if (inputs[keys[i]] !== '' && c.name.toLowerCase()
              .includes(inputs[keys[i]].toLowerCase()) === false
              && inputs[keys[i]] !== '' && c.surname.toLowerCase()
                .includes(inputs[keys[i]].toLowerCase()) === false) {
              return false;
            }
          }
        }
        return true;
      });
      this.cpOrders = this.cpOrders.filter(o => o.executed);
      this.time = null;
    }, 500);
  }

  public sortAscending(a: Order, b: Order): number {
    if (a.price < b.price) {
      return -1;
    } else if (a.price > b.price) {
      return 1;
    } else {
      return 0;
    }
  }

  public sortDescending(a: Order, b: Order): number {
    if (a.price > b.price) {
      return -1;
    } else if (a.price < b.price) {
      return 1;
    } else {
      return 0;
    }
  }

  public deleteOrder(ref: string): void {
    swal.fire({
      title: 'Usunięcie Zamówienia',
      text: 'Czy jesteś pewny że chcesz usunąć zamówienie?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        const orders = this.ordersManageService.ordersData.getValue()
          .filter(o => o.ref !== ref);

        this.firebaseService.getDataBaseRef('orders').set(orders)
          .then(() => swal.fire('Usunięcie Zamówienia', 'Zamówienie zostało usunięte', 'success'));
      } else {
        swal.fire('Usunięcie Zamówienia', 'Zamówienie wciaż jest.', 'info');
      }
    });
  }
}
