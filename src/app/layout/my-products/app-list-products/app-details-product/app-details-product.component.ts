import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../../shared/animations/animation';
import { ProductsManageService } from 'src/app/services/products-manage.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-app-details-product',
  templateUrl: './app-details-product.component.html',
  styleUrls: ['./app-details-product.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppDetailsProductComponent implements OnInit {
  public product: Product;
  public stars = new Array(5);
  public evalAmount = 0;
  public selected = 0;
  public amountReviews: number;
  public descriptions;
  public limit = 5;

  private evalFloat = 0;
  private evalInt = 0;
  private ref;

  constructor(
    private route: ActivatedRoute,
    private productManageService: ProductsManageService
  ) { }

  ngOnInit() {
    this.ref = this.route.snapshot.params.id;
    this.productManageService.productsData.subscribe(prs => {
      if (prs) {
        this.product = prs.find(pr => pr.ref === this.ref);
        this.initAdditionalData();
      }
    });
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public initAdditionalData(): void {
    const reviewCustomer = this.product.reviewsCustomer;
    if (reviewCustomer) {
      if (reviewCustomer.evaluations) {
        this.evalAmount = reviewCustomer.evaluations.prevEvaluations.length;
        this.evalFloat = reviewCustomer.evaluations.evaluation;
        this.evalInt = Math.floor(this.evalFloat);
        this.prepareStar();
      }

      if (reviewCustomer.reviews) {
        this.descriptions = reviewCustomer.reviews.desc;
        this.amountReviews = reviewCustomer.reviews.amount;
      }
    }
  }

  public prepareStar(): void {
    for (let i = 0; i < 5; i++) {
      if (this.evalInt >= i + 1) {
        this.stars[i] = 'fas fa-star';
      } else if (this.evalFloat + 1 > i + 1) {
        this.stars[i] = 'fas fa-star-half-alt';
      } else {
        this.stars[i] = 'far fa-star';
      }
    }
  }

  public getDaysCreated(date: string): number | string {
    const current = new Date();
    const prev = new Date(date);
    const time = current.getTime() - prev.getTime();
    if (time === null) {return 'Brak'; }
    return Math.floor(time / 86400000);
  }

}
