import { Answer } from './message.model';

export interface ModalMessage {
    vissible: boolean;
    imageUrl: string;
    email: string;
    name: string;
    surname: string;
    address: string;
    contact: string;
    admin: string;
}

export interface ReceivedMessageModal {
    vissible: boolean;
    email: string;
    date: Date | string;
    desc: string;
    read: boolean;
    name: string;
    surname: string;
    url: string;
    answer?: Answer;
    id: number;
}
