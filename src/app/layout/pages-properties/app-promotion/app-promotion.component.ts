import { Component, OnInit } from "@angular/core";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-promotion",
  templateUrl: "./app-promotion.component.html",
  styleUrls: [
    "./app-promotion.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppPromotionComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationPromotions: boolean = true;
  checkAuthorized: boolean;

  valueRef = "";
  valueTitle = "";

  copyProducts = [];

  refPromotions = this.firebaseService
    .firebase
    .database()
    .ref("promotions");

  refProducts = this.firebaseService
    .firebase
    .database()
    .ref("products");

  detailPromotions = [];
  detailProducts = [];

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
  }

  getReferenceToDatabaseAuthorization(uid) {
    return this.firebaseService
      .firebase
      .database()
      .ref("authorizationUsers")
      .child(uid);
  }

  downloadDataWithDatabaseAuthorization(data) {
    let scores = data.val();
    if (!scores.promotions) {
      this.authorizationPromotions = false;
      swal({
        type: "error",
        title: "Autoryzacja",
        text: "Nie masz uprawnień do edycji promocji!"
      });
      return;
    }
    this.checkAuthorized = true;
    this.getPromotions();
  }

  getPromotions() {
    this.refPromotions.on(
      "value",
      this.downloadPromotions.bind(this),
      this.err
    );
  }

  downloadPromotions(data) {
    let scores = data.val();
    if (!scores) {
      this.detailPromotions = null;
      this.getProducts();
      return;
    }
    this.detailPromotions = scores;
    this.getProducts();
  }

  getProducts() {
    this.refProducts.on("value", this.downloadProducts.bind(this), this.err);
  }

  downloadProducts(data) {
    let scores = data.val();
    if (!scores) {
      this.detailProducts = null;
      this.copyProducts = null;
      return;
    }
    this.detailProducts = scores.slice();

    let filterProduct = [];
    if (this.detailPromotions) {
      for (let i = 0; i < scores.length; i++) {
        for (let j = 0; j < this.detailPromotions.length; j++) {
          if (scores[i].id === this.detailPromotions[j].id) {
            break;
          }
          if(j === this.detailPromotions.length - 1) {
            filterProduct.push(scores[i]);
          }
        }
      }
      this.detailProducts = filterProduct.slice();
    } else {
      this.detailProducts = scores.slice();
    }

    if(this.detailProducts.length === 0) {
      this.detailProducts = null;
      this.copyProducts = null;
    } else {
      this.copyProducts = this.detailProducts.slice();
    }
  }

  err(error) {
    console.log(error);
  }

  setFilterRef(value) {
    this.valueRef = value;
    this.filterProduct();
  }

  setFilterTitle(value) {
    this.valueTitle = value;
    this.filterProduct();
  }

  filterProduct() {
    if (this.copyProducts) {
      this.detailProducts = this.copyProducts.filter(data => {
        if (this.valueRef === "" && this.valueTitle === "") {
          return true;
        } else {
          if (
            (this.valueRef !== "" &&
              !data.refNumberProduct
                .toLowerCase()
                .includes(this.valueRef.toLowerCase())) ||
            (this.valueTitle !== "" &&
              !data.title.toLowerCase().includes(this.valueTitle.toLowerCase()))
          ) {
            return false;
          }
          return true;
        }
      });
    }
  }

  addToPromotions(product) {
    if (this.detailPromotions) {
      this.detailPromotions.push({
        id: product.id,
        title: product.title,
        ref: product.refNumberProduct
      });
    } else {
      this.detailPromotions = [
        {
          id: product.id,
          title: product.title,
          ref: product.refNumberProduct
        }
      ];
    }

    this.refPromotions
      .set(this.detailPromotions)
      .then(() => {
        swal({
          type: "success",
          title: "Dodanie produktu do promocji",
          text: "Produkt został dodany pomyślnie"
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  deletePromotions(index) {
    swal({
      title: "Usunięcie produktu z promocji",
      text:
        "Czy jesteś pewny że chcesz usunąć produkt z promocji?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        this.detailPromotions.splice(index, 1)
        this.refPromotions
          .set(this.detailPromotions)
          .then(() => {
            swal({
              type: "success",
              title: "Usunięcie produktu z promocji",
              text: "Produkt został usunięty z promocji pomyślnie"
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }
}
