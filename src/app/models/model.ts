export interface Admin {
    email: string;
    password: string;
    security: boolean;
    history?: Array<History>;
}

export interface History {
    data: Date | string;
    ip: string;
    name: string;
    time: string;
}

export interface GroupNotification {
    name: string;
}

export interface Notificactions {
    date: Date | string;
    comments: number;
    evaluations: number;
    messages: number;
}

export interface Comment {
    desc: string;
    user: string;
    date: Date | string;
    ref: string;
    id: number;
}

export interface Evaluation {
    rate: number;
    date: Date | string;
    ref: string;
    id: number;
}

export enum StatusProduct {
    Complete,
    Idle
}

export interface AddProduct {
    status: StatusProduct;
}

export interface Product {
    title: string;
    price: number;
    promotion: number;
    ref: string;
    desc: string;
    params: Array<ParamsProduct>;
    images?: Array<number>;
    categoryID: number;
}

export interface ParamsProduct {
    name: string;
    value: string;
}

export interface Category {
    name: string;
    id: number;
}

export interface Image {
    id: number;
    name: string;
    url?: string;
}

export interface Message {
    email: string;
    date: Date | string;
    desc: string;
    read: boolean;
    id: number;
}
