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
