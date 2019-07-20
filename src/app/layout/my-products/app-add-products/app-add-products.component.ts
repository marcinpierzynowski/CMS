import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ProductsManageService } from 'src/app/services/products-manage.service';
import { FirebaseService } from '../../../services/firebase.service';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin, CreatedProduct } from 'src/app/models/admin.model';
import { Product, Category, AddProduct, StatusProduct } from 'src/app/models/product.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-products',
  templateUrl: './app-add-products.component.html',
  styleUrls: ['./app-add-products.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppAddProductsComponent implements OnInit, OnDestroy {
  public products: Array<Product>;
  public productForm: FormGroup;
  public categories: Array<Category>;
  public vissibleModalAddProduct: boolean;
  public user: Admin;
  public admins: Array<Admin>;
  public vissibleSelect = false;
  public editMode = false;

  private subsProducts: Subscription;
  private subsStatusAddProduct: Subscription;
  private reader;
  private areaDropTime;
  private categoryID;
  private ref;
  private editProduct: Product;
  private FLAG_CHANGE_PICTURE = false;
  private FLAG_IS_PICTURE = false;

  @HostListener('window:click')
  public onClick(): void {
    this.vissibleSelect = false;
  }

  constructor(
    private firebaseService: FirebaseService,
    private productsManageService: ProductsManageService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.prepareDropArea();
    this.ref = this.route.snapshot.params.id;
    if (this.ref) {
      this.editMode = true;
    }
    const email = this.layoutManageService.emailData.getValue();
    this.layoutManageService.adminsData.subscribe(ad => {
      if (ad.length > 0) {
        this.admins = ad;
        this.user = ad.find(admin => admin.email === email);
      }
    });

    this.subsProducts = this.productsManageService.productsData.subscribe(prs => {
      this.products = prs;
      if (this.editMode && prs) {
        this.setEditMode();
      }
    });
    this.productsManageService.categoryData.subscribe(cat => this.categories = cat);
    this.subsStatusAddProduct = this.productsManageService.addProductData.subscribe(this.statusAddProduct.bind(this));
  }

  ngOnDestroy(): void {
    this.productsManageService.addProductData.next({ status: StatusProduct.Idle });
    this.subsStatusAddProduct.unsubscribe();
    this.subsProducts.unsubscribe();
  }

  public initForm(): void {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      price: new FormControl(0, Validators.min(1)),
      promotion: new FormControl(0, [Validators.min(0), Validators.max(100)]),
      categoryID: new FormControl('', Validators.required),
      desc: new FormControl('', Validators.required),
      metaTitle: new FormControl('', Validators.required),
      metaKeyword: new FormControl('', Validators.required),
      params: new FormControl([]),
      image: new FormControl('', Validators.required),
    });
  }

  public setEditMode() {
    const product = this.products.find(pr => pr.ref === this.ref);
    this.editProduct = product;
    this.prepareImage();
    this.prepareValueFormControl();
  }

  public prepareImage(): void {
    const selector = document.getElementsByClassName('image-select')[0];
    // tslint:disable-next-line:no-string-literal
    selector['style']['display'] = 'block';
    // tslint:disable-next-line:no-string-literal
    selector['src'] = this.editProduct.image.url;
    this.FLAG_IS_PICTURE = true;
  }

  public prepareValueFormControl(): void {
    // tslint:disable-next-line:forin
    for (const inner in this.productForm.controls) {
      if (inner !== 'params') {
        this.productForm.get(inner).setValue(this.editProduct[inner]);
      }
    }

    if (this.editProduct.params) {
      this.productForm.controls.params.setValue([]);
      this.editProduct.params.forEach(p => {
        this.productForm.value.params.push(
          new FormGroup({ name: new FormControl(p.name), value: new FormControl(p.value) })
        );
      });
    }
  }

  public prepareDropArea(): void {
    this.areaDropTime = setInterval(() => {
      if (document.querySelector('.drop-zone')) {
        clearInterval(this.areaDropTime);
        const sel: HTMLElement = document.querySelector('.drop-zone');
        sel.style.height = '300px';
        sel.style.border = '1px dashed #e0e0e0';
        sel.style.borderRadius = '0px';
        sel.style.zIndex = '10';
      }
    }
    );
  }

  public statusAddProduct(response: AddProduct): void {
    if (response.status === StatusProduct.Complete) {
      swal.close();
      this.FLAG_IS_PICTURE = false;
      swal.fire('Dodanie produktu', 'Produkt został dodany pomyślnie', 'success');
      this.addHistoryFromUser();
      this.initForm();
      // tslint:disable-next-line:no-string-literal
      document.getElementsByClassName('image-select')[0]['style']['display'] = 'none';
    }
  }

  public addHistoryFromUser(): void {
    const data: CreatedProduct = {
      data: this.getFullData(),
      ref: this.ref,
      time: this.getFullTime()
    };
    let addProducts = this.user.addProducts;

    addProducts ? addProducts.push(data) : addProducts = [data];
    this.user.addProducts = addProducts;
    this.firebaseService.getDataBaseRef('admins').set(this.admins);
  }

  public getFullData(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  public getFullTime(): string {
    return this.datePipe.transform(new Date(), 'HH:mm:ss');
  }

  public submitAddProduct(): void {
    if (this.productForm.invalid) {
      swal.fire('Dodanie Produktu', 'Wypełnij Prawidłowo Formularz', 'error');
      this.activeInputs();
      return;
    }

    if (!this.editMode) {
      swal.fire({
        type: 'warning',
        title: 'Czekaj na dodanie produktu!',
        html: this.productsManageService.templateProgress,
        allowOutsideClick: false,
        showConfirmButton: false
      });
      const prod = this.prepareDataNewProduct();
      this.productsManageService.addProduct(prod, this.productForm.value.image);
    } else {
      swal.fire({
        type: 'warning',
        title: 'Czekaj na aktualizację produktu!',
        allowOutsideClick: false,
        showConfirmButton: false
      });
      this.updateDataProduct();
    }
  }

  public async updateDataProduct(): Promise<any> {
    const indexPr = this.products.findIndex(pr => pr.ref === this.ref);
    const { image } = this.productForm.value;
    const params = [...this.productForm.value.params].map((gr) => gr.value);

    this.editProduct = {
      ...this.productForm.value,
      image: this.editProduct.image,
      ref: this.editProduct.ref,
      params,
      date: this.editProduct.date,
      categoryName: this.editProduct.categoryName,
      reviewsCustomer: this.editProduct.reviewsCustomer ? this.editProduct.reviewsCustomer : null
    };

    if (this.FLAG_CHANGE_PICTURE) {
      this.FLAG_CHANGE_PICTURE = false;
      const refStorage = this.firebaseService.firebase.storage().ref('PRODUCTS/' + this.editProduct.image.name);
      await refStorage.put(image);
      const url = await this.firebaseService.firebase.storage().ref('PRODUCTS/' + this.editProduct.image.name).getDownloadURL();
      this.editProduct.image.url = url;
    }
    await this.firebaseService.getDataBaseRef('products').child(indexPr.toString()).set(this.editProduct);
    swal.fire('Aktualizacja Produktu', 'Produkt został zaaktualizowany', 'success');
  }

  public prepareDataNewProduct(): Product {
    const { name, subject, price, promotion, desc, categoryID, metaTitle, metaKeyword } = this.productForm.value;
    this.ref = this.generateRandomNumber();
    const params = [...this.productForm.value.params].map((gr) => gr.value);
    // CategoryID in the input has name category
    /// Field categoryID in the class has id category
    const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    // tslint:disable-next-line:max-line-length
    return {
      name,
      subject,
      categoryID: this.categoryID,
      price,
      promotion,
      desc,
      params,
      date,
      ref: this.ref,
      categoryName: categoryID,
      metaTitle,
      metaKeyword
    };
  }

  public getFile(refInputFile): void {
    refInputFile.value = null;
    refInputFile.click();
  }

  public uploadImage(event): void {
    this.FLAG_CHANGE_PICTURE = true;
    this.productForm.controls.image.setValue(event.files[0]);
    if (!this.reader) {
      this.reader = new FileReader();
      // tslint:disable-next-line:only-arrow-functions
      this.reader.onload = (e: Event) => {
        // tslint:disable-next-line:no-string-literal
        const selector = document.getElementsByClassName('image-select')[0];
        // tslint:disable-next-line:no-string-literal
        selector['style']['display'] = 'block';
        // tslint:disable-next-line:no-string-literal
        selector['src'] = e.target['result'];
        this.FLAG_IS_PICTURE = true;
      };
    }

    this.reader.readAsDataURL(event.files[0]);
  }

  public dropped(event: UploadEvent): void {
    this.FLAG_CHANGE_PICTURE = true;
    for (const droppedFile of event.files) {
      if (!this.reader) {
        this.reader = new FileReader();
        // tslint:disable-next-line:only-arrow-functions
        this.reader.onload = (e: Event) => {
          // tslint:disable-next-line:no-string-literal
          const selector = document.getElementsByClassName('image-select')[0];
          // tslint:disable-next-line:no-string-literal
          selector['style']['display'] = 'block';
          // tslint:disable-next-line:no-string-literal
          selector['src'] = e.target['result'];
          this.FLAG_IS_PICTURE = true;
        };
      }

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // tslint:disable-next-line:object-literal-shorthand
          this.productForm.controls.image.setValue(file);
          this.reader.readAsDataURL(file);
        });
      }
      this.productForm.controls.image.setValue(event.files[0]);
    }
  }

  public generateRandomNumber(): string {
    // tslint:disable-next-line:one-variable-per-declaration
    let ref, isUnique;

    if (this.products.length > 0) {
      do {
        ref = this.getRandomNumber();
        isUnique = this.products.find(prs => prs.ref === ref);
      } while (isUnique);
    } else {
      ref = this.getRandomNumber();
    }
    return ref;
  }

  public getRandomNumber(): string {
    let value = '';
    for (let i = 0; i < 9; i++) { value += (Math.floor(Math.random() * 9) + 1).toString(); }
    return value;
  }

  public addParam(): void {
    this.productForm.value.params.push(
      new FormGroup({ name: new FormControl(''), value: new FormControl('') })
    );
  }

  public deleteParam(index: number): void {
    const params = this.productForm.value.params;
    params.splice(index, 1);
    this.productForm.controls.params.setValue(params);
  }

  public checkValidate(inputControl: string, nameControl: string): boolean {
    const control = this.productForm.controls[inputControl];
    if (control.errors) {
      if (control.errors[nameControl] && control.touched) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  public setCategory(name: string, id: number): void {
    this.productForm.controls.categoryID.setValue(name);
    this.categoryID = id;
    this.vissibleSelect = false;
  }

  public clearCategory(name: string, id: number): void {
    const { categoryID } = this.productForm.value;
    if (categoryID === name) {
      this.productForm.controls.categoryID.setValue('');
      this.categoryID = id;
    }
  }

  public toggleSelect(): void {
    this.vissibleSelect = !this.vissibleSelect;
  }

  public activeInputs(): void {
    // tslint:disable-next-line:forin
    for (const inner in this.productForm.controls) {
      this.productForm.get(inner).markAsTouched();
      this.productForm.get(inner).updateValueAndValidity();
    }
  }
}
