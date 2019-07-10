
/**
 * Admin
 */
export interface Admin {
    email: string;
    password: string;
    security: boolean;
    history?: Array<History>;
    detail: UserDetail;
    date: Date | string;
    media?: SocialMedia;
}

export interface UserDetail {
    name?: string;
    surname?: string;
    imageUrl: string;
    imageName?: string;
    city?: string;
    country?: string;
}

export interface SocialMedia {
    facebook: string;
    twitter: string;
    linkedIn: string;
}

export interface History {
    data: Date | string;
    ip: string;
    name: string;
    time: string;
}

/*
* Notification
*/

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
    date: Date | string;
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

export interface Slider {
    imageUrl: string;
    name: string;
}

export interface Promotion {
    ref: string;
    title: string;
}

export interface Order {
    ref: string;
    name: string;
    surname: string;
    email: string;
    products: Array<Product>;
    data: string;
    country: string;
    city: string;
    address: string;
    url: string;
    price: string;
    executed: boolean;
}

export interface Task {
    name: string;
    execute: boolean;
    url: string;
}
