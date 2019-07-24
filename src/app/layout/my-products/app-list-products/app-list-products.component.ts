import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../../../services/firebase.service';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { Product, Image } from 'src/app/models/product.model';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

@Component({
  selector: 'app-list-products',
  templateUrl: './app-list-products.component.html',
  styleUrls: ['./app-list-products.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppListProductsComponent implements OnInit {
  public products: Array<Product>;
  public cpProducts: Array<Product>;
  public images: Array<Image>;
  public title = '';
  public ref = '';
  public filter: FormGroup;
  public limit = 5;
  public sortState = 0;

  private productDelete: Product;
  private refStorage = null;
  private time;

  constructor(
    private firebaseService: FirebaseService,
    private productManageService: ProductsManageService
  ) { }

  ngOnInit(): void {
    this.productManageService.productsData.subscribe(prs => {
      if (prs) {
        this.products = prs.slice().reverse();
        this.cpProducts = prs.slice().reverse();
      }
    });

    this.productManageService.imagesData.subscribe(imgs => this.images = imgs);
    this.refStorage = this.firebaseService.firebase.storage();
    this.initForm();
  }

  public initForm(): void {
    this.filter = new FormGroup({
      name: new FormControl(''),
      categoryName: new FormControl(''),
      ref: new FormControl(''),
      date: new FormControl(''),
    });
  }

  public showAll(): void {
    this.limit = this.products.length;
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public setSortState(): void {
    this.sortState = this.sortState < 2 ? this.sortState + 1 : 0;
    this.filterData();
  }

  public filterData(): void {
    const inputs = this.filter.value;
    const keys = ['name', 'categoryName', 'ref', 'date'];

    if (this.time) {
      clearTimeout(this.time);
      this.time = null;
    }

    this.time = setTimeout(() => {
      this.limit = 5;
      const productsManage = this.productManageService.productsData.getValue().slice();
      if (this.sortState === 1) {
        this.products = productsManage.sort(this.sortAscending);
      } else if (this.sortState === 2) {
        this.products = productsManage.sort(this.sortDescending);
      } else {
        this.products = this.productManageService.productsData.getValue();
      }

      this.cpProducts = this.products.filter(c => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
          if (inputs[keys[i]] !== '' && c[keys[i]].toLowerCase()
            .includes(inputs[keys[i]].toLowerCase()) === false) {
            return false;
          }
        }
        return true;
      }).reverse();
      this.time = null;
    }, 500);
  }

  public sortAscending(a: Product, b: Product): number {
    if (a.price < b.price) {
      return -1;
    } else if (a.price > b.price) {
      return 1;
    } else {
      return 0;
    }
  }

  public sortDescending(a: Product, b: Product): number {
    if (a.price > b.price) {
      return -1;
    } else if (a.price < b.price) {
      return 1;
    } else {
      return 0;
    }
  }

  public deleteProduct(ref): void {
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
        this.deleteImages();
      }
    });
  }

  public generateSwalWaitingFromRequest(type, title, text): void {
    swal.fire({
      type,
      title,
      text,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        const content = swal.getContent();
        const $ = content.querySelector.bind(content);
        swal.showLoading();
      }
    });
  }

  public async deleteImages(): Promise<any> {
      const idImage = this.productDelete.image.id;
      const delImage = this.images.find(imgs => imgs.id === idImage);
      const filImages = this.images.filter(imgs => imgs.id !== idImage);
      const filPrs = this.products.filter(pr => pr.ref !== this.productDelete.ref);

      await this.refStorage.ref(delImage.name).delete();
      await this.firebaseService.getDataBaseRef('images').set(filImages);
      await this.firebaseService.getDataBaseRef('products').set(filPrs);

      swal.fire('Usunięcie produktu', 'Produkt usunięto pomyślnie.', 'success');
  }
}
