import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CurrentPageService {
    public iconClass: BehaviorSubject<string> = new BehaviorSubject('');
    public urlText: BehaviorSubject<string> = new BehaviorSubject('');

    private urlsClass = {
        '/dashboard': 'fas fa-home',
        '/my-profile': 'fas fa-user',
        '/my-settings': 'fas fa-cogs',
        '/list-users': 'fas fa-users-cog',
        '/list-customers': 'fas fa-users',
        '/add-product': 'fas fa-cart-plus',
        '/list-products': 'fas fa-shopping-bag',
        '/new-messages': 'fas fa-envelope',
        '/received-messages': 'fas fa-envelope-open-text',
        '/evaluations': 'fas fa-star-half-alt',
        '/comments': 'fas fa-comments',
        '/slider': 'fab fa-slideshare',
        '/promotions': 'fas fa-percent'
    };

    public update(urlText: string): void {
        this.iconClass.next(this.urlsClass[urlText]);
        this.urlText.next(urlText);
    }
}
