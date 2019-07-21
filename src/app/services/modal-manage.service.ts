import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { ModalMessage, ReceivedMessageModal } from '../models/modal.model';


@Injectable()
export class ModalManageService {
    public activeModalsData: BehaviorSubject<Array<ModalMessage | ReceivedMessageModal>> = new BehaviorSubject([]);

    constructor() {
        this.prepareData();
    }

    public async prepareData(): Promise<any> {
       await this.prepareMessage();
       await this.prepareReceivedMessage();
    }

    public async prepareMessage(): Promise<any> {
        const modal: ModalMessage = {
            vissible: false,
            imageUrl: '',
            email: '',
            name: '',
            surname: '',
            address: '',
            contact: '',
            admin: ''
        };
        const activeModals = this.activeModalsData.getValue();

        activeModals.push(modal);
        await this.activeModalsData.next(activeModals);
    }

    public async prepareReceivedMessage(): Promise<any> {
        const modal: ReceivedMessageModal = {
            vissible: false,
            email: '',
            name: '',
            surname: '',
            url: '',
            date: '',
            desc: '',
            read: false,
            id: 0
        };
        const activeModals = this.activeModalsData.getValue();

        activeModals.push(modal);
        await this.activeModalsData.next(activeModals);
    }

    public update(index: number, data: ModalMessage | ReceivedMessageModal): void {
       const modals = this.activeModalsData.getValue();
       modals[index] = data;
       this.activeModalsData.next(modals);
    }
}
