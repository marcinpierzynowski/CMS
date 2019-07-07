import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Admin, Notificactions, GroupNotification, Task } from '../models/model';

@Injectable()
export class LayoutManageService {
    public readyData: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public adminsData: BehaviorSubject<Array<Admin>> = new BehaviorSubject(null);
    public groupNotificationsData: BehaviorSubject<Array<GroupNotification>> = new BehaviorSubject(null);
    public notificationsData: BehaviorSubject<Array<Notificactions>> = new BehaviorSubject(null);
    public emailData: BehaviorSubject<string> = new BehaviorSubject(null);
    public tasksData: BehaviorSubject<Array<Task>> = new BehaviorSubject([]);

    constructor(private firebaseService: FirebaseService) {
        this.init();
    }

    public init(): void {
        this.firebaseService.getDataBaseRef('admins').on('value', this.admins.bind(this), this.catchError);
        this.firebaseService.getDataBaseRef('new_notifications').on('value', this.groupNotifications.bind(this), this.catchError);
        this.firebaseService.getDataBaseRef('notifications').on('value', this.notifications.bind(this), this.catchError);
        this.firebaseService.getDataBaseRef('tasks').on('value', this.tasks.bind(this), this.catchError);
    }

    public admins(response): void {
        const data = response.val();

        if (data === null) {
            this.adminsData.next([]);
            this.addReadyStatus();
            return;
        }

        const admins = this.prepareData(data);
        this.adminsData.next(admins);
        this.addReadyStatus();
    }

    public groupNotifications(response): void {
        const data = response.val();

        if (data === null) {
            this.groupNotificationsData.next([]);
            return;
        }

        const notifications = this.prepareData(data);
        this.groupNotificationsData.next(notifications);
    }

    public notifications(response): void {
        const data = response.val();

        if (data === null) {
            this.notificationsData.next([]);
            return;
        }

        const notifications = this.prepareData(data);
        this.notificationsData.next(notifications);
    }

    public tasks(response): void {
        const data = response.val();

        if (data === null) {
            this.tasksData.next([]);
            return;
        }

        const tasks = this.prepareData(data);
        this.tasksData.next(tasks);
    }

    public updateTask(index: number): void {
        const tasks = this.tasksData.getValue();
        tasks[index].execute = !tasks[index].execute;
        this.tasksData.next(tasks);
    }

    public updateAllTasks(): void {
        const tasks = this.tasksData.getValue();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tasks.length; i++) {
            tasks[i].execute = true;
        }
        this.tasksData.next(tasks);
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

    public addReadyStatus() {
        this.readyData.next(true);
    }



    set email(email: string) { this.emailData.next(email); }
}
