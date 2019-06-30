import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Comment, Evaluation } from '../models/model';

@Injectable()
export class NotificationsManageService {
    public commentsData: BehaviorSubject<Array<Comment>> =  new BehaviorSubject(null);
    public evaluationsData: BehaviorSubject<Array<Evaluation>> =  new BehaviorSubject(null);

    constructor(private firebaseService: FirebaseService) {
        this.init();
    }

    public init(): void {
        this.firebaseService.getDataBaseRef('comments').on('value', this.comments.bind(this), this.catchError);
        this.firebaseService.getDataBaseRef('evaluations').on('value', this.evaluations.bind(this), this.catchError);
    }

    public comments(response): void {
        const data = response.val();

        if (data === null) {
            this.commentsData.next([]);
            return;
        }

        const messages = this.prepareData(data);
        this.commentsData.next(messages);
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

        for (let i = 0; i < keys.length; i++) {
            preData.push(data[keys[i]]);
        }
        return preData;
    }

    public catchError(error: string) {
        console.error(error);
    }
}
