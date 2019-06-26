import { Component, OnInit } from "@angular/core";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-evaluation",
  templateUrl: "./app-evaluation.component.html",
  styleUrls: [
    "./app-evaluation.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppEvaluationComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationEvaluation: boolean = true;
  checkAuthorized: boolean;

  refEvaluation = this.firebaseService
    .firebase
    .database()
    .ref("evaluations");

  refProducts = this.firebaseService
    .firebase
    .database()
    .ref("products");

  detailEvaluations = [];
  detailProducts = [];

  keys = [];
  productsSearch = [];

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
    if (!scores.evaluation) {
      this.authorizationEvaluation = false;
      swal({
        type: "error",
        title: "Autoryzacja",
        text: "Nie masz uprawnień do edycji komentarzy!"
      });
      return;
    }
    this.checkAuthorized = true;
    this.getEvaluations();
    this.getProducts();
  }

  getEvaluations() {
    this.refEvaluation.on(
      "value",
      this.downloadEvaulations.bind(this),
      this.err
    );
  }

  downloadEvaulations(data) {
    let scores = data.val();
    if (!scores) {
      this.detailEvaluations = null;
      return;
    }
    let keys = Object.keys(scores);
    let allScore = [];
    this.keys = keys;

    for (let i = 0; i < keys.length; i++) {
      allScore.push(scores[keys[i]]);
    }
    this.detailEvaluations = allScore;
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
        this.refEvaluation
          .child(this.keys[index])
          .remove()
          .then(() => {
            swal({
              type: "success",
              title: "Usunięcie oceny",
              text: "Ocena została pozytywnie usunięta."
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }
}
