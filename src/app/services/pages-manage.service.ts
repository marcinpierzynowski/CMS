import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Slider, Promotion } from '../models/page.model';

@Injectable()
export class PagesManageService {
    public sliderData: BehaviorSubject<Array<Slider>> =  new BehaviorSubject(null);
    public promotionsData: BehaviorSubject<Array<Promotion>> =  new BehaviorSubject(null);

    constructor(private firebaseService: FirebaseService) {
        this.init();
    }

    public init(): void {
        this.firebaseService.getDataBaseRef('slider').on('value', this.slider.bind(this), this.catchError);
        this.firebaseService.getDataBaseRef('promotions').on('value', this.promotions.bind(this), this.catchError);
    }

    public slider(response): void {
        const data = response.val();

        if (data === null) {
            this.sliderData.next([]);
            return;
        }

        const messages = this.prepareData(data);
        this.sliderData.next(messages);
    }

    public promotions(response): void {
        const data = response.val();

        if (data === null) {
            this.promotionsData.next([]);
            return;
        }

        const messages = this.prepareData(data);
        this.promotionsData.next(messages);
    }

    public prepareData(data) {
        const keys = Object.keys(data);
        const preData = [];

        for (let i = 0; i < keys.length; i++) {
            preData.push(data[keys[i]]);
        }
        return preData;
    }

    public catchError(error: string) {
        console.error(error);
    }
}
