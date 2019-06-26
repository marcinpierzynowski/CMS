import { Component, OnInit } from "@angular/core";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-comments",
  templateUrl: "./app-comments.component.html",
  styleUrls: [
    "./app-comments.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppCommentsComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationComments: boolean = true;
  checkAuthorized: boolean;

  refComments = this.firebaseService
    .firebase
    .database()
    .ref("comments");

  refProducts = this.firebaseService
    .firebase
    .database()
    .ref("products");

  detailComments = [];
  detailProducts = [];
  productsSearch = [];

  keys = [];

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
   
  }

  getComments() {
    this.refComments.on("value", this.downloadComments.bind(this), this.err);
  }

  downloadComments(data) {
    let scores = data.val();
    if (!scores) {
      this.detailComments = null;
      return;
    }
    let keys = Object.keys(scores);
    let allScore = [];
    this.keys = keys;

    for (let i = 0; i < keys.length; i++) {
      allScore.push(scores[keys[i]]);
    }
    this.detailComments = allScore;
  }

  getProducts() {
    this.refProducts.on("value", this.downloadProducts.bind(this), this.err);
  }

  downloadProducts(data) {
    let scores = data.val();
    this.detailProducts = scores;
  }

  err(error) {
    console.log(error);
  }

  showComments(message) {
    swal({
      type: "info",
      title: "Komentarz",
      text: message
    });
  }

  searchProduct(refNumber) {
    let product;
    let text = "";

    for (let i = 0; i < this.detailProducts.length; i++) {
      if (this.detailProducts[i].refNumberProduct === refNumber) {
        product = this.detailProducts[i];
      }
    }
    text += "<p>id: " + product.id + "</p>";
    text += "<p>" + product.title + "</p>";
    text += "<p>" + product.descriptionProduct + "</p>";

    swal({
      type: "info",
      title: "Produkt",
      html: text
    });
  }

  deleteEvaluation(index) {
    swal({
      title: "Usunięcie Wiadomości",
      text: "Czy jesteś pewny że chcesz usunąć wiadomość?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        this.refComments
          .child(this.keys[index])
          .remove()
          .then(() => {
            swal({
              type: "success",
              title: "Usunięcie komentarza",
              text: "Komentarz został pozytywnie usunięty."
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }
}
