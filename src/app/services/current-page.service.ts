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
        '/list-admins': 'fas fa-users-cog',
        '/list-customers': 'fas fa-users',
        '/add-product': 'fas fa-cart-plus',
        '/list-products': 'fas fa-shopping-bag',
        '/new-messages': 'fas fa-envelope',
        '/received-messages': 'fas fa-envelope-open-text',
        '/evaluations': 'fas fa-star-half-alt',
        '/reviews': 'fas fa-comments',
        '/slider': 'fab fa-slideshare',
        '/promotions': 'fas fa-percent',
        '/edit-product': 'fas fa-edit',
        '/details-product': 'fas fa-glasses'
    };

    private namePages = {
        '/dashboard': '/ Przegląd',
        '/my-profile': '/ Profil',
        '/my-settings': '/ Ustawienia',
        '/list-admins': '/ Administratorzy',
        '/list-customers': '/ Klienci',
        '/add-product': '/ Dodaj Produkt',
        '/list-products': '/ Lista Produktów',
        '/new-messages': '/ Nowe Wiadomości',
        '/received-messages': '/ Przeczytane Wiadomości',
        '/evaluations': '/ Oceny',
        '/reviews': '/ Opinie',
        '/slider': '/ Slajder',
        '/promotions': '/ Promocje',
        '/edit-product': '/ Edycja Produktu / ',
        '/details-product': '/ Szczegóły Produktu / '
    };

    public update(urlText: string): void {
        this.iconClass.next(this.urlsClass[urlText]);
        this.urlText.next(this.namePages[urlText]);
        this.checkNotMatchinUrl(urlText);
    }

    public checkNotMatchinUrl(urlText: string): void {
        const texts = urlText.split('/');
        let iconClass = '';
        let namePages = '';
        if (texts.length === 3) {
            if (texts[1] === 'add-product') {
                iconClass = this.urlsClass['/edit-product'];
                namePages = this.namePages['/edit-product'] + texts[2];
            }

            if (texts[1] === 'details-product') {
                iconClass = this.urlsClass['/details-product'];
                namePages = this.namePages['/details-product'] + texts[2];
            }
            this.iconClass.next(iconClass);
            this.urlText.next(namePages);
        }
    }
}
