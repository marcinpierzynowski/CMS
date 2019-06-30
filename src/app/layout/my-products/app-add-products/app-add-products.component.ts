import { Component, OnInit } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { FormGroup, FormControl } from '@angular/forms';

import { ProductsManageService } from 'src/app/services/products-manage.service';
import { FirebaseService } from '../../../services/firebase.service';
import { Product, Category, AddProduct, StatusProduct } from 'src/app/models/model';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import swal from 'sweetalert2';

@Component({
  selector: 'app-app-add-products',
  templateUrl: './app-add-products.component.html',
  styleUrls: [
    './app-add-products.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  animations: [fadeInOutTranslate],
  providers: [ProductsManageService]
})
export class AppAddProductsComponent implements OnInit {
  public products: Array<Product>;
  public productForm: FormGroup;
  public categories: Array<Category>;
  public vissibleModalAddProduct: boolean;
  public uploadCallBack;
  public stepperSection = 1;
  public file: UploadFile[] = [];
  public urlName = '';
  public urlSize: number;

  private reader;
  private areaDropTime;
  private lengthUploadPicture = 0;

  constructor(
    private firebaseService: FirebaseService,
    private productsManageService: ProductsManageService
    ) {}

  ngOnInit(): void {
    this.productsManageService.productsData.subscribe(prs => this.products = prs);
    this.productsManageService.categoryData.subscribe(cat => this.categories = cat);
    this.productsManageService.addProductData.subscribe(this.statusAddProduct.bind(this));
    this.initForm();
    this.prepareDropArea();
  }

  public initForm(): void {
    this.productForm = new FormGroup({
      title: new FormControl(''),
      price: new FormControl(0),
      promotion: new FormControl(0),
      ref: new FormControl(''),
      desc: new FormControl(''),
      params: new FormControl([]),
      images: new FormControl([]),
      categoryID: new FormControl(null)
    });
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
      swal('Dodanie produktu', 'Produkt został dodany pomyślnie', 'success');
      this.initForm();
      this.stepperSection = 1;
      this.lengthUploadPicture = 0;
      if (this.productForm.value.images.length > 0) {
          this.reader.readAsDataURL(this.productForm.value.images[0].file);
      }
      this.prepareDropArea();
    }
  }

  public submitAddProduct(): void {
    if (this.stepperSection === 4) {
      swal({
        type: 'warning',
        title: 'Czekaj na dodanie produktu!',
        html: this.productsManageService.templateProgress,
        allowOutsideClick: false,
        showConfirmButton: false
      });
      const prod = this.prepareDataNewProduct();
      this.productsManageService.addProduct(prod, this.productForm.value.images);
    }
  }

  prepareDataNewProduct(): Product {
    const { title, price, promotion, ref, desc, categoryID } = this.productForm.value;
    const params = [...this.productForm.value.params].map((gr) => gr.value);
    return { title, price, promotion, ref, desc, params, categoryID};
  }

  public prevOrNextNumber(value: number): void {
    if (this.stepperSection === 1) {
      this.setStepper(0);
    } else {
      this.setStepper(value);
    }
  }

  public setStepper(numberStep: number): void {
    const nbStep = this.getStepperNumber(numberStep);
    if (nbStep === this.stepperSection) { return; }

    switch (this.stepperSection) {
      case 1:
        this.checkStepperFirst(nbStep);
        break;
      case 2:
        this.checkStepperSecond(nbStep);
        break;
      case 3:
        this.checkStepperThirst(nbStep);
        break;
      default:
        this.stepperSection = nbStep;
        break;
    }
  }

  public checkStepperFirst(nbStep: number): void {
    if (this.productForm.value.images.length === 0) {
        swal('Przejście do następnego kroku', 'Musisz dodać co najmniej jedno zdjęcie! *wymagane', 'warning');
        return;
    } else if (nbStep > 2) {
      this.checkStepperSecond(3);
    } else {
      this.stepperSection = nbStep;
    }
  }

  public checkStepperSecond(nbStep: number): void {
    if (nbStep < 2) {
      this.stepperSection = nbStep;
      this.lengthUploadPicture = 0;
      if (this.productForm.value.images.length > 0) {
          this.reader.readAsDataURL(this.productForm.value.images[0].file);
      }
      this.prepareDropArea();
      return;
    } else if (nbStep > 2) {
      const communicate = this.checkValidateStepperTwo();
      if (communicate.length > 0) {
        swal({ type: 'warning', title: 'Przejście do następnego kroku', html: communicate });
        return;
      }
    }

    this.stepperSection = nbStep;
  }

  public checkValidateStepperTwo(): string {
    const communicate = [];
    let text = '';
    const formParams = this.productForm.value;
    if (formParams.title === '') { communicate.push('Tytuł nie może być pusty!'); }
    if (formParams.price <= 0) { communicate.push('Cena nie może równa lub mniejsza od zera!'); }
    if (formParams.desc.length < 10) { communicate.push('Opis musi mieć minimum 10 znaków!'); }
    communicate.push(...this.checkRefNumber());

    if (communicate.length > 0) {
      for (let i = 0; i < communicate.length; i++) { text += '<p>' + communicate[i] + '</p>'; }
    }
    return text;
  }

  public checkRefNumber(): Array<string> {
    const communicate = [];
    const ref = this.productForm.value.ref;

    if (ref) {
      if (ref.toString().length < 9) {
        communicate.push('Zbyt krótki numer referencyjny!');
      } else if (ref.toString().length > 9) {
        communicate.push('Zbyt długi numer referencyjny!');
      } else if (this.products.find(pr => pr.ref === ref)) {
        communicate.push('Numer referencyjny już taki istnieje!');
      }
    } else {
      this.productForm.controls.ref.setValue(this.generateRandomNumber());
    }
    return communicate;
  }

  public generateRandomNumber(): string {
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
    let number = '';
    for (let i = 0; i < 9; i++) { number += (Math.floor(Math.random() * 9) + 1).toString(); }
    return number;
  }

  public checkStepperThirst(nbStep: number): void {
    if (nbStep < 3) {
      this.checkStepperSecond(nbStep);
    } else {
      this.stepperSection = nbStep;
    }
  }

  public getStepperNumber(value: number): number {
    if (this.stepperSection < 3) {
      return 2 + value;
    } else {
      return 3 + value;
    }
  }

  public getStepperName(value: number): string {
    const index = this.getStepperNumber(value);
    if (window.innerWidth > 720) {
      return this.productsManageService.prepareStepperList[index - 1];
    }
  }

  public getFile(refInputFile): void {
    refInputFile.value = null;
    refInputFile.click();
  }

  public uploadImage(event): void {
    const urlIm = this.productForm.value.images;
    urlIm.push({ file: event.files[0], urlName: event.files[0].name, urlSize: event.files[0].size });
    this.productForm.controls.images.setValue(urlIm);
    if (!this.reader) {
      this.reader = new FileReader();
      this.reader.onload = function(e: Event) {
        document.getElementsByClassName('image-upload')[this.lengthUploadPicture]['src'] = e.target['result'];
        this.lengthUploadPicture++;
        if (this.lengthUploadPicture < urlIm.length) {
          this.reader.readAsDataURL(
            urlIm[this.lengthUploadPicture].file
          );
        }
      }.bind(this);
    }

    this.reader.readAsDataURL(urlIm[urlIm.length - 1].file);
  }

  public dropped(event: UploadEvent): void {
    const urlIm = this.productForm.value.images;
    for (const droppedFile of event.files) {
      if (!this.reader) {
        this.reader = new FileReader();
        this.reader.onload = function(e: Event) {
          document.getElementsByClassName('image-upload')[this.lengthUploadPicture]['src'] = e.target['result'];
          this.lengthUploadPicture++;

          if (this.lengthUploadPicture < urlIm.length) {
            this.reader.readAsDataURL(urlIm[this.lengthUploadPicture].file);
          }
        }.bind(this);
      }

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          urlIm.push({file: file, urlName: file.name, urlSize: file.size});
          setTimeout(() => {
            this.reader.readAsDataURL(urlIm[urlIm.length - 1].file);
          }, 500);
        });
      }
      this.productForm.controls.images.setValue(urlIm);
    }
  }


  public countSizeImage(size): number {
    if (size > 1000000) {
      size = size / 1000000;
      size = this.roundValue(size, 2);
      size += ' mb';
    } else if (size > 1000) {
      size = size / 1000;
      size = this.roundValue(size, 2);
      size += ' kb';
    }
    return size;
  }

  public roundValue(number, accuracy): number {
    const factor = Math.pow(10, accuracy);
    return Math.round(number * factor) / factor;
  }

  public cancelImage(index): void {
    const urlIm = this.productForm.value.images;
    urlIm.splice(index, 1);
    this.productForm.controls.images.setValue(urlIm);
    this.lengthUploadPicture--;
  }

  public addParam(): void {
    this.productForm.value.params.push(
      new FormGroup({ name: new FormControl(''), value: new FormControl('')})
    );
  }

  public deleteParam(index: number): void {
    const params = this.productForm.value.params;
    params.splice(index, 1);
    this.productForm.controls.params.setValue(params);
  }

  public get catID(): number { return this.productForm.value.categoryID; }

  public set catID(id: number | null) { this.productForm.controls.categoryID.setValue(id); }

  public showModalAddCategory(): void {
    let uniqueID = 1;
    if (this.categories.length > 0) {
      uniqueID = this.categories[this.categories.length - 1].id + 1;
    }

    swal({
      title: 'Podaj nazwę nowej kategorii',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Dodaj',
      showLoaderOnConfirm: true,
      cancelButtonText: 'Anuluj',
      preConfirm: category => this.createCategory(category, uniqueID)
      });
  }

  public createCategory(name: string, id: number): void {
    this.categories.push({name, id});
    this.firebaseService.getDataBaseRef('categories').set(this.categories)
      .then(() => { swal('Dodanie nowej kategorii.', 'Dodano nową kategorię', 'success'); });
  }

  public showModalDeleteCategory(id: number): void {
    swal({
      title: 'Usunięcie powiązania',
      text:
        'Czy jesteś pewny że chcesz usunąć kategorie?  Wszystkie produkty powiązane z tą kategorią zostana bez kategorii!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.deleteCategory(id);
      }
    });
  }

  public deleteCategory(id: number): void {
    if (id === this.catID) { this.catID = null; }
    this.categories = this.categories.filter(cat => cat.id !== id);
    this.firebaseService.getDataBaseRef('categories').set(this.categories)
      .then(() =>  swal('Usunięcie kategorii', 'Kategoria została pomyślnie usunięta', 'success'));
  }
}
