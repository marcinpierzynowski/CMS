import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from 'src/app/services/firebase.service';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { Product } from 'src/app/models/model';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from 'src/shared/animations/animation';

@Component({
  selector: 'app-app-edit-product',
  templateUrl: './app-edit-product.component.html',
  styleUrls: ['./app-edit-product.component.css'],
  animations: [fadeInOutTranslate],
  providers: [ProductsManageService]
})
export class AppEditProductComponent implements OnInit {
  ref: string;
  product: Product;
  productForm: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private productsManageService: ProductsManageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.ref = this.route.snapshot.params['id'];
    this.productsManageService.productsData.subscribe(prs => {
      if (prs) {
        this.product = prs.find(pr => pr.ref === this.ref);
        this.initForm();
      }
    });
  }

  public initForm(): void {
    this.productForm = new FormGroup({
      title: new FormControl(this.product.title),
      price: new FormControl(this.product.price),
      promotion: new FormControl(this.product.promotion),
      desc: new FormControl(this.product.desc)
    });
  }

  public sbumitEditProduct(): void {
    const communicate = this.checkValidate();

    if (communicate.length > 0) {
      swal.fire({ type: 'warning', title: 'Przejście do następnego kroku', html: communicate });
    } else {
      const { title, price, promotion, desc } = this.productForm.value;
      this.product = {...this.product, title, price, promotion, desc};
      const products = this.productsManageService.productsData.getValue()
        .map(pr => {
          if (pr.ref === this.product.ref) { pr = this.product; }
          return pr;
        });
      this.updateProduct(products);
    }
  }

  public checkValidate(): string {
    const communicate = [];
    let text = '';
    const formParams = this.productForm.value;
    if (formParams.title === '') { communicate.push('Tytuł nie może być pusty!'); }
    if (formParams.price <= 0) { communicate.push('Cena nie może równa lub mniejsza od zera!'); }
    if (formParams.desc.length < 10) { communicate.push('Opis musi mieć minimum 10 znaków!'); }

    if (communicate.length > 0) {
      for (let i = 0; i < communicate.length; i++) { text += '<p>' + communicate[i] + '</p>'; }
    }
    return text;
  }

  public updateProduct(products: Array<Product>): void {
    this.firebaseService.getDataBaseRef('products').set(products)
      .then(() => {
        swal.fire('Edycja produktu', 'produkt został zaaktualizowany', 'success')
          .then(() => {
            this.router.navigate(['/list-products']);
          });
      });
  }

  public back(): void {
    this.router.navigate(['/list-products']);
  }

}
