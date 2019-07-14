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
