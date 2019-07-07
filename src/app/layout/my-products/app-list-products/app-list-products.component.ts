import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { Product, Image } from 'src/app/models/model';

@Component({
  selector: 'app-app-list-products',
  templateUrl: './app-list-products.component.html',
  styleUrls: [
    './app-list-products.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  animations: [fadeInOutTranslate]
})
export class AppListProductsComponent implements OnInit {
  public products: Array<Product>;
  public cpProducts: Array<Product>;
  public images: Array<Image>;
  public title = '';
  public ref = '';

  private productDelete: Product;
  private refStorage = null;

  constructor(
    private firebaseService: FirebaseService,
    private productManageService: ProductsManageService
    ) {}

  ngOnInit(): void {
    this.productManageService.productsData.subscribe(prs => {
      this.products = prs;
      if (prs) {
        this.cpProducts = prs.slice();
      }
    });
    this.productManageService.imagesData.subscribe(imgs => this.images = imgs);
    this.refStorage = this.firebaseService.firebase.storage();
  }

  deleteProduct(ref) {
    swal.fire({
      title: 'Usunięcie Produktu',
      text: 'Czy jesteś pewny że chcesz usunąć produkt?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.generateSwalWaitingFromRequest(
          'warning',
          'Usuwanie produktu',
          'Czekaj na usunięcie produktu!'
        );
        this.productDelete = this.cpProducts.find(prs => prs.ref === ref);
        this.deleteAllImages(0);
      }
    });
  }

  generateSwalWaitingFromRequest(type, title, text) {
    swal.fire({
      type: type,
      title: title,
      text: text,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        const content = swal.getContent();
        const $ = content.querySelector.bind(content);
        swal.showLoading();
      }
    });
  }

  deleteAllImages(index: number) {
      if (index === this.productDelete.images.length) {
        const filPrs = this.products.filter(prs => prs.ref !== this.productDelete.ref);
        this.firebaseService.getDataBaseRef('products').set(filPrs)
          .then(() => {
            swal.fire('Usunięcie produktu', 'Produkt usunięto pomyślnie.', 'success');
            this.title = '';
            this.ref = '';
          });
        return;
      }

      const idImage = this.productDelete.images[index];
      const delImage = this.images.find(imgs => imgs.id === idImage);
      const filImages = this.images.filter(imgs => imgs.id !== idImage);
      this.refStorage.ref(delImage.name).delete()
        .then(() => {
          this.firebaseService.getDataBaseRef('images').set(filImages)
            .then(() => this.deleteAllImages(index + 1));
        });
  }

  public filterData(): void {
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
}
