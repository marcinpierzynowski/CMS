import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { ModalMessage } from '../models/modal.model';


@Injectable()
export class ModalManageService {
    public activeModalsData: BehaviorSubject<Array<ModalMessage>> = new BehaviorSubject([]);

    constructor() {
        this.prepareMessageModal();
    }

    public prepareMessageModal(): void {
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
        this.activeModalsData.next(activeModals);
    }

    public update(index: number, data: ModalMessage): void {
       const modals = this.activeModalsData.getValue();
       modals[index] = data;
       this.activeModalsData.next(modals);
    }
}
