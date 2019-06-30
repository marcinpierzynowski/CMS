import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Message } from '../models/model';

@Injectable()
export class MessagesManageService {
    public messageData: BehaviorSubject<Array<Message>> =  new BehaviorSubject(null);

    constructor(private firebaseService: FirebaseService) {
        this.init();
    }

    public init(): void {
        this.firebaseService.getDataBaseRef('messages').on('value', this.messages.bind(this), this.catchError);
    }

    public messages(response): void {
        const data = response.val();

        if (data === null) {
            this.messageData.next([]);
            return;
        }

        const messages = this.prepareData(data);
        this.messageData.next(messages);
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
