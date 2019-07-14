export interface Customer {
    email: string;
    password: string;
    name: string;
    surname: string;
    address: string;
    contact: string;
    orders?: Array<OrderCustomer>;
    imageName: string;
    imageUrl: string;
    message?: Array<Message>;
}

export interface OrderCustomer {
    products: Array<string>;
    date: Date | string;
    value: number;
}

export interface Message {
    date: Date | string;
    admin: string;
    description: string;
    title: string;
}
