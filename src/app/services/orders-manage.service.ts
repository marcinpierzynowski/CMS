import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Order } from '../models/order.model';

@Injectable()
export class OrdersManageService {
    public ordersData: BehaviorSubject<Array<Order>> = new BehaviorSubject(null);

    constructor(private firebaseService: FirebaseService) {
        this.init();
    }

    public init(): void {
        this.firebaseService.getDataBaseRef('orders').on('value', this.orders.bind(this), this.catchError);
    }

    public orders(response): void {
        const data = response.val();

        if (data === null) {
            this.ordersData.next([]);
            return;
        }

        const orders = this.prepareData(data);
        this.ordersData.next(orders);
    }

    public prepareData(data) {
        const keys = Object.keys(data);
        const preData = [];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < keys.length; i++) {
            preData.push(data[keys[i]]);
        }
        return preData;
    }

    public catchError(error: string) {
        console.error(error);
    }
}
