import { Injectable } from '@angular/core';
import { MessagesManageService } from '../services/messages-manage.service';
import { FirebaseService } from '../services/firebase.service';
import { Message } from '../models/message.model';
import { LayoutManageService } from '../services/layout-manage.service';
import { Customer } from '../models/customer.model';
import { Notificaction } from '../models/notification.model';

@Injectable()
export default class ManageData {
    private messages: Array<Message>;
    private customers: Array<Customer>;
    private notification: Notificaction;

    constructor(
        private messageManageService: MessagesManageService,
        private layoutManageService: LayoutManageService,
        private firebaseService: FirebaseService
    ) {
        this.messageManageService.messageData.subscribe(msg => {
            this.messages = msg;

            if (msg && this.customers) {
                this.checkMessage();
            }

            if (msg && this.notification) {
                this.checkNotification();
            }
        });
        this.layoutManageService.customersData.subscribe(cust => {
            this.customers = cust;

            if (cust && this.messages) {
                this.checkMessage();
            }
        });

        this.layoutManageService.notificationData.subscribe(n => {
            this.notification = n;

            if (n && this.messages) {
                this.checkNotification();
            }
        });
    }

    private checkMessage(): void {
        this.messages = this.messages.filter(msg => {
            return this.customers.some(c => c.email === msg.email);
        });
        this.firebaseService.getDataBaseRef('messages').set(this.messages);
    }

    private checkNotification(): void {
        // Check Amount Not Read a New Message
        const lengthMsgs = this.messages.filter(m => m.read === false).length;
        if (lengthMsgs !== this.notification.messages) {
            this.firebaseService.getDataBaseRef('notification').child('messages').set(lengthMsgs);
        }
    }
}
