import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FirebaseService } from './firebase.service';
import { Product, Category, Image, AddProduct, StatusProduct } from '../models/product.model';

@Injectable()
export class ProductsManageService {
    public productsData: BehaviorSubject<Array<Product>> = new BehaviorSubject(null);
    public categoryData: BehaviorSubject<Array<Category>> = new BehaviorSubject(null);
    public imagesData: BehaviorSubject<Array<Image>> = new BehaviorSubject(null);
    public addProductData: BehaviorSubject<AddProduct> = new BehaviorSubject({ status: StatusProduct.Idle });
    public templateProgress = ``
        + `<div class="progress"><div id="add-product" class="progress-bar `
        + `progress-bar-striped progress-bar-animated" `
        + `role="progressbar" aria-valuenow="0" aria-valuemin="0" `
        + `aria-valuemax="100" style="width: 0%"></div></div>`;

    private refStorage: any;
    private progress: number;
    private proportion: number;
    private urlImg: Array<Image> = [];

    constructor(private firebaseService: FirebaseService) {
        this.refStorage = firebaseService.firebase.storage();
        firebaseService.getDataBaseRef('products').on('value', this.products.bind(this), this.catchError);
        firebaseService.getDataBaseRef('categories').on('value', this.category.bind(this), this.catchError);
        firebaseService.getDataBaseRef('images').on('value', this.images.bind(this), this.catchError);
    }

    public get prepareStepperList(): Array<string> {
       return ['Zdjęcia', 'Opis', 'Parametry', 'Kategorie'];
    }

    public products(response): void {
        const data = response.val();

        if (data === null) {
            this.productsData.next([]);
            return;
        }

        const products = this.prepareData(data);
        this.productsData.next(products);
    }

    public category(response): void {
        const data = response.val();

        if (data === null) {
            this.categoryData.next([]);
            return;
        }

        const category = this.prepareData(data);
        this.categoryData.next(category);
    }

    public images(response): void {
        const data = response.val();

        if (data === null) {
            this.imagesData.next([]);
            return;
        }

        const images = this.prepareData(data);
        this.imagesData.next(images);
    }

    public prepareData(data) {
        const keys = Object.keys(data);
        const preData = [];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < keys.length; i++) {
            preData.push(data[keys[i]]);
        }
        return preData;
    }

    public catchError(error: string) {
        console.error(error);
    }

    public addProduct(product: Product, images): void {
        this.progress = 0;
        this.proportion = 100 / (1 + images.length);
        const products = this.productsData.getValue();
        products.push(product);

        this.firebaseService.getDataBaseRef('products').set(products)
            .then(() => this.updateStatus(product.ref, images));
    }

    public updateStatus(ref: string, imgs): void {
        const sel = document.getElementById('add-product');
        this.progress += this.proportion;
        sel.style.width = this.progress + '%';
        this.uploadToStorageImage(0, imgs, ref, this.getUniqueIDName());
    }

    public getUniqueIDName(): {id: number, name: string} {
        const imgDat = this.imagesData.getValue();
        let uniqueID = 1;
        if (imgDat.length > 0) { uniqueID = imgDat[imgDat.length - 1].id + 1; }
        return { id: uniqueID, name: uniqueID + '-img'};
    }

    public uploadToStorageImage(index: number, images, ref, info: {id: number , name: string}): void {
        if (index === images.length) {
            this.addRefImages(0);
            return;
        }
        const { id, name } = info;
        const sel = document.getElementById('add-product');
        const storageRef = this.refStorage.ref(name);
        const task = storageRef.put(images[index].file);

        task.on('state_changed',
          snapshot => {
            const value = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100) / (1 + images.length);
            const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            sel.style.width = (this.progress + value) + '%';
            if (percentage === 100) {
                this.progress += this.proportion;
                const prod = this.productsData.getValue().find(prds => prds.ref === ref);
                if (prod.images) {
                    prod.images.push(id);
                } else { prod.images = [id]; }

                this.urlImg.push({ id: info.id, name });
                this.firebaseService.getDataBaseRef('products').set(this.productsData.getValue());
                this.uploadToStorageImage(index + 1, images, ref, {id: id + 1, name: (id + 1) + '-img'});
            }
          },
          error => {
            this.uploadToStorageImage(index, images, ref, info);
          }
        );
    }

    public addRefImages(index: number) {
        if (index === this.urlImg.length) {
            let images = this.imagesData.getValue();
            images = [...images, ...this.urlImg];
            this.firebaseService.getDataBaseRef('images').set(images)
                .then(() => {
                    this.addProductData.next({status: StatusProduct.Complete});
                    this.urlImg = [];
                });
            return;
        }
        const ref = this.refStorage.ref().child(this.urlImg[index].name).getDownloadURL()
            .then(url => {
                this.urlImg[index].url = url;
                this.addRefImages(index + 1);
            })
            .catch(() => {
                this.addRefImages(index);
            });
    }
}
