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
