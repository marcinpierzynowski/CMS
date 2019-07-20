import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Evaluation, Reviews } from '../models/notification.model';

@Injectable()
export class NotificationsManageService {
    public reviewsData: BehaviorSubject<Array<Reviews>> =  new BehaviorSubject(null);
    public evaluationsData: BehaviorSubject<Array<Evaluation>> =  new BehaviorSubject(null);

    constructor(private firebaseService: FirebaseService) {
        this.init();
    }

    public init(): void {
        this.firebaseService.getDataBaseRef('reviews').on('value', this.reviews.bind(this), this.catchError);
        this.firebaseService.getDataBaseRef('evaluations').on('value', this.evaluations.bind(this), this.catchError);
    }

    public reviews(response): void {
        const data = response.val();

        if (data === null) {
            this.reviewsData.next([]);
            return;
        }

        const messages = this.prepareData(data);
        this.reviewsData.next(messages);
    }

    public evaluations(response): void {
        const data = response.val();

        if (data === null) {
            this.evaluationsData.next([]);
            return;
        }

        const messages = this.prepareData(data);
        this.evaluationsData.next(messages);
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
