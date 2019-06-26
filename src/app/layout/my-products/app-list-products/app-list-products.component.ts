import { Component, OnInit } from "@angular/core";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-list-products",
  templateUrl: "./app-list-products.component.html",
  styleUrls: [
    "./app-list-products.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppListProductsComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationProducts: boolean = true;
  checkAuthorized: boolean;

  detailProducts = [];
  detailUrlImages = [];
  detailUrlATest = [];

  vissibleSectionEdit: boolean;

  /* Variables Edit */
  indexEditProducts = -1;
  nameEditProducts = "";
  price = "";
  promotionPrice = "";
  titleProduct = "";
  descriptionProduct = "";
  necesaryProducts = [];
  filterValue = "";
  filterDetailProducts = [];

  refProducts;
  refUrlImages = this.firebaseService
    .firebase
    .database()
    .ref("images");
  refATest = this.firebaseService
    .firebase
    .database()
    .ref("idATest");
  refStorage = this.firebaseService.firebase.storage();

  copyProducts;
  valueTitle = "";
  valueRefNumber = "";

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
  }

  getProducts() {
    this.refProducts = this.firebaseService
      .firebase
      .database()
      .ref("products");

    this.refProducts.on("value", this.downloadProducts.bind(this), this.err);
  }

  downloadProducts(data) {
    let scores = data.val();
    this.detailProducts = scores;
    if (scores) {
      this.copyProducts = this.detailProducts.slice();
    } else {
      this.copyProducts = [];
    }
  }

  getUrlImages() {
    this.refUrlImages.on("value", this.downloadUrlImages.bind(this), this.err);
  }

  downloadUrlImages(data) {
    let scores = data.val();
    this.detailUrlImages = scores;
  }

  getUrlATest() {
    this.refATest.on("value", this.downloadUrlATest.bind(this), this.err);
  }

  downloadUrlATest(data) {
    let scores = data.val();
    this.detailUrlATest = scores;
  }

  err(error) {
    console.log(error);
  }

  setFilterTitle(value) {
    this.valueTitle = value;
    this.filterProducts();
  }

  setFilterRefNumber(value) {
    this.valueRefNumber = value;
    this.filterProducts();
  }

  filterProducts() {
    if (this.copyProducts) {
      this.detailProducts = this.copyProducts.filter(data => {
        if (this.valueTitle === "" && this.valueRefNumber === "") {
          return true;
        } else {
          if (
            (this.valueTitle !== "" &&
              !data.title
                .toLowerCase()
                .includes(this.valueTitle.toLowerCase())) ||
            (this.valueRefNumber !== "" &&
              !data.refNumberProduct
                .toLowerCase()
                .includes(this.valueRefNumber.toLowerCase()))
          ) {
            return false;
          }
          return true;
        }
      });
    }
  }

  deleteProduct(index) {
    swal({
      title: "Usunięcie Produktu",
      text: "Czy jesteś pewny że chcesz usunąć produkt?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        this.generateSwalWaitingFromRequest(
          "warning",
          "Usuwanie produktu",
          "Czekaj na usunięcie produktu!"
        );
        this.deleteAllImages(index, 0);
      }
    });
  }

  generateSwalWaitingFromRequest(type, title, text) {
    swal({
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

  deleteAllImages(index, numberDelete) {
    if (this.detailProducts[index].urlImages[numberDelete]) {
      this.refStorage
        .ref(this.detailProducts[index].urlImages[numberDelete].id)
        .delete()
        .then(() => {
          this.deleteAllImages(index, numberDelete + 1);
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      let amountDeleteImage = this.detailProducts[index].urlImages.length;
      let start = this.findIdUrlImages(
        this.detailProducts[index].urlImages[0].id
      );
      this.deleteInformationPicture(index, start, amountDeleteImage);
    }
  }

  findIdUrlImages(id) {
    for (let i = 0; i < this.detailUrlImages.length; i++) {
      if (this.detailUrlImages[i].id === id) {
        return i;
      }
    }
  }

  deleteInformationPicture(index, start, amount) {
    this.detailUrlImages.splice(start, amount);
    this.refUrlImages
      .set(this.detailUrlImages)
      .then(() => {
        if (this.detailProducts[index].urlATest) {
          this.refStorage
            .ref(this.detailProducts[index].urlATest.id)
            .delete()
            .then(() => {
              this.deleteInformationUrlATest(index);
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          this.deleteInformationProduct(index);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  deleteInformationUrlATest(index) {
    for (let i = 0; i < this.detailUrlATest.length; i++) {
      if (
        this.detailUrlATest[i].id === this.detailProducts[index].urlATest.id
      ) {
        this.detailUrlATest.splice(i, 1);
      }
    }
    this.refATest
      .set(this.detailUrlATest)
      .then(() => {
        this.deleteInformationProduct(index);
      })
      .catch(error => {
        console.log(error);
      });
  }

  deleteInformationProduct(index) {
    this.detailProducts.splice(index, 1);
    this.refProducts
      .set(this.detailProducts)
      .then(() => {
        swal({
          type: "success",
          title: "Usunięcie produktu",
          text: "Produkt usunięto pomyślnie."
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  editProduct(index) {
    this.vissibleSectionEdit = true;
    this.nameEditProducts = this.detailProducts[index].title;
    this.price = this.detailProducts[index].price;
    this.promotionPrice = this.detailProducts[index].promotionPrice;
    this.titleProduct = this.detailProducts[index].title;
    this.descriptionProduct = this.detailProducts[index].descriptionProduct;
    this.indexEditProducts = index;
    if (this.detailProducts[index].necesaryProducts) {
      this.necesaryProducts = this.detailProducts[index].necesaryProducts.slice();
    }
  }

  exitEditProduct() {
    this.copyProducts = this.detailProducts.slice();
    this.vissibleSectionEdit = false;
  }

  saveEdit() {
    let htmlText = this.checkValidate();

    if (htmlText) {
      swal({
        type: "warning",
        title: "Edycja produktu",
        html: htmlText
      });
      return;
    }

    let editProduct = this.detailProducts[this.indexEditProducts];

    editProduct.price = this.price;
    editProduct.promotionPrice = this.promotionPrice;
    editProduct.title = this.titleProduct;
    editProduct.descriptionProduct = this.descriptionProduct;
    editProduct.necesaryProducts = this.necesaryProducts;

    this.refProducts
      .child(this.indexEditProducts)
      .set(editProduct)
      .then(() => {
        swal({
          type: "success",
          title: "Edycja produktu",
          text: "Dane produktu zostały zmienione pomyślnie"
        });
      })
      .catch(error => {
        console.log(error);
      });
    this.vissibleSectionEdit = false;
  }

  checkValidate() {
    var text = "";
    let communicate = [];

    if (!this.price) {
      communicate.push("Cena nie może być pusta!");
    }

    if (!this.titleProduct) {
      communicate.push("Tytuł nie może być pusty!");
    }

    if (this.descriptionProduct.length < 10) {
      communicate.push("Opis musi mieć minimum 10 znaków!");
    }

    if (communicate.length > 0) {
      for (let i = 0; i < communicate.length; i++)
        text += "<p>" + communicate[i] + "</p>";
    }

    return text;
  }

  setFilterProducts(value) {
    this.filterValue = value;
    this.filterNeccesaryProducts();
  }

  filterNeccesaryProducts() {
    if (this.filterValue !== "") {
      this.filterDetailProducts = this.copyProducts.filter(product => {
        if (
          product.title.toLowerCase().includes(this.filterValue.toLowerCase())
        ) {
          if (this.detailProducts[this.indexEditProducts].id === product.id) {
            return false;
          }
          let productSearch = this.necesaryProducts.find(necesaryProduct => {
            return necesaryProduct.id === product.id;
          });
          return productSearch ? false : true;
        } else {
          return false;
        }
      });
    } else {
      this.filterDetailProducts = [];
    }
  }

  addNeccesaryProduct(product) {
    this.necesaryProducts.push({
      title: product.title,
      id: product.id
    });
    this.filterNeccesaryProducts();
  }
}
