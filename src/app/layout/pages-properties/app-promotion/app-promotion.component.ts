import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../../../services/firebase.service';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import swal from 'sweetalert2';
import { PagesManageService } from 'src/app/services/pages-manage.service';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { Product } from 'src/app/models/product.model';
import { Promotion } from 'src/app/models/page.model';

@Component({
  selector: 'app-promotion',
  templateUrl: './app-promotion.component.html',
  styleUrls: [
    './app-promotion.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  providers: [
    PagesManageService,
    ProductsManageService
  ],
  animations: [fadeInOutTranslate]
})
export class AppPromotionComponent implements OnInit {
  public products: Array<Product>;
  public cpProducts: Array<Product>;
  public promotions: Array<Promotion> = [];
  public title = '';
  public ref = '';

  constructor(
    private firebaseService: FirebaseService,
    private productManageService: ProductsManageService,
    private pageManageService: PagesManageService
    ) {}

  ngOnInit(): void {
    this.productManageService.productsData.subscribe(pr => {
      this.products = pr;
      if (pr) { this.cpProducts = pr.slice(); }
      if (this.promotions && this.promotions.length > 0) {
        this.checkIsPromotion();
      }
    });
    this.pageManageService.promotionsData.subscribe(prs => {
      this.products = this.productManageService.productsData.getValue();
      if (this.products) { this.cpProducts = this.products.slice(); }
      this.promotions = prs;
      if (prs && prs.length > 0) {
        this.checkIsPromotion();
      }
    });
  }

  public checkIsPromotion() {
    this.promotions.forEach(prs => {
      this.products = this.products.filter(pr => pr.ref !== prs.ref);
      this.cpProducts = this.products.slice();
    });
  }

  public filterData(): void {
    // tslint:disable-next-line:one-variable-per-declaration
    const t = this.title, r = this.ref;
    const inpVal = [t, r];
    const keys = ['title', 'ref'];

    this.cpProducts = this.products.filter((prd) => {
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < inpVal.length; i++) {
        if (inpVal[i] !== '' && prd[keys[i]].toLowerCase().includes(inpVal[i].toLowerCase()) === false) {
         return false;
        }
      }
      return true;
    });

    // if all inputs empty
    if (!inpVal.find(el => el !== '')) {
      this.cpProducts = this.products;
    }
  }

  public addToPromotions(product): void {
    const promotions = this.promotions.slice();
    const { ref, title } = product;
    promotions.push({ ref, title });
    this.firebaseService.getDataBaseRef('promotions').set(promotions)
      .then(() => swal.fire('Dodanie produktu do promocji', 'Produkt został dodany pomyślnie', 'success'));
  }

  public deletePromotions(index): void {
    swal.fire({
      title: 'Usunięcie produktu z promocji',
      text:
        'Czy jesteś pewny że chcesz usunąć produkt z promocji?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        const promotions = this.promotions.slice();
        promotions.splice(index, 1);
        this.firebaseService.getDataBaseRef('promotions').set(promotions)
          .then(() => swal.fire('Usunięcie produktu z promocji', 'Produkt został usunięty pomyślnie', 'success'));
      }
    });
  }
}
