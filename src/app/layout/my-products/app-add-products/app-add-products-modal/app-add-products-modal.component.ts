import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { fadeInOutTranslate } from "../../../../../shared/animations/animation";
import { FirebaseService } from "../../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-add-products-modal",
  templateUrl: "./app-add-products-modal.component.html",
  styleUrls: [
    "./app-add-products-modal.component.css",
    "../../../../../assets/styles-custom/lds-dual-ring.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppAddProductsModalComponent implements OnInit {
  @Input()
  dataUpload;

  @Input()
  detailProducts;

  @Input()
  vissibleModal: boolean;

  @Input()
  closeModal;

  @Output()
  upload = new EventEmitter<any>();

  refDatabaseUserDetail;
  refProducts;
  refAtest;
  refImages;
  refStorage;

  detailATest;
  detailImages;
  detailUser;

  proccessAdd = [];
  idProduct;
  indexUpdateProduct;
  checkFromUid;

  successUploadProduct: boolean;

  constructor(private firebaseService: FirebaseService) {
    this.refProducts = this.firebaseService
      .firebase
      .database()
      .ref("products");

    this.refAtest = this.firebaseService
      .firebase
      .database()
      .ref("idATest");

    this.refImages = this.firebaseService
      .firebase
      .database()
      .ref("images");

    this.refAtest.on("value", this.downloadDetailAtest.bind(this), this.error);
    this.refImages.on(
      "value",
      this.downloadDetailImages.bind(this),
      this.error
    );
    this.refStorage = this.firebaseService.firebase.storage();
  }

  ngOnInit() {
    this.upload.emit(this.uploadNewProduct.bind(this));
  }

  scrollToElement(selector) {
    document.getElementById(selector).scrollIntoView({ behavior: "smooth" });
  }

  downloadDetailUser(data) {
    let scores = data.val();
    this.detailUser = scores;
  }

  downloadDetailAtest(data) {
    let scores = data.val();
    this.detailATest = scores;
  }

  downloadDetailImages(data) {
    let scores = data.val();
    this.detailImages = scores;
  }

  error(error) {
    console.log(error);
  }

  uploadNewProduct() {
    this.uploadDataProduct();
  }

  uploadDataProduct() {
    this.idProduct = this.getId();
    this.proccessAdd.push({
      template: 1,
      title: "Dodanie danych produktu",
      description: [
        "Cena produktu:",
        "Promocja:",
        "Tytuł produktu:",
        "Numer Referencyjny:",
        "Opis produktu:",
        "Powiązania produktu:",
        "Numer parametru powiązania:",
        "Lista Parametrów:",
        "Niezbędne produkty:",
        "Numer kategorii:",
      ],
      value: [
        this.dataUpload.price,
        this.dataUpload.promotionPrice,
        this.dataUpload.titleProduct,
        this.dataUpload.refNumberProduct,
        this.dataUpload.descriptionProduct,
        this.dataUpload.connectionsProduct,
        this.dataUpload.parametrChoose,
        this.dataUpload.listParametrs.length,
        this.dataUpload.necesaryProducts.length,
        this.dataUpload.categoryProduct
      ],
      status: "check"
    });

    setTimeout(() => {
      this.scrollToElement(0 + "-process");
    });

    this.indexUpdateProduct = this.detailProducts.length;

    this.refProducts
      .child(this.indexUpdateProduct)
      .update({
        id: this.idProduct,
        price: this.dataUpload.price,
        promotionPrice: this.dataUpload.promotionPrice,
        title: this.dataUpload.titleProduct,
        refNumberProduct: this.dataUpload.refNumberProduct,
        descriptionProduct: this.dataUpload.descriptionProduct,
        connectionsProduct: this.dataUpload.connectionsProduct,
        parametrChoose: this.dataUpload.parametrChoose,
        listParametrs: this.dataUpload.listParametrs,
        necesaryProducts: this.dataUpload.necesaryProducts,
        categoryProduct: this.dataUpload.categoryProduct
      })
      .then(() => {
        this.proccessAdd[0].status = "success";
        setTimeout(() => {
          this.uploadATest();
        }, 500);
      })
      .catch(err => {
        this.proccessAdd[0].status = "error";
        swal({
          type: "error",
          title: "Dodanie produktu",
          text: err
        });
        this.vissibleModal = false;
      });
  }

  getId() {
    if (this.detailProducts) {
      return this.detailProducts[this.detailProducts.length - 1].id + 1;
    }
    this.detailProducts = [];
    return 0;
  }

  uploadATest() {
    this.proccessAdd.push({
      template: 2,
      title: "Dodanie A-Testu",
      description: "A-Test:",
      value: this.dataUpload.fileATest
        ? this.dataUpload.fileATest.name
        : "brak",
      status: "check"
    });

    setTimeout(() => {
      this.scrollToElement(1 + "-process");
    });

    setTimeout(() => {
      let selectorProgressBar = document.getElementById("1-a-test");
      let idATest;

      if (this.detailATest) {
        idATest =
          parseInt(this.detailATest[this.detailATest.length - 1].id) +
          1 +
          "-a-test";
      } else {
        idATest = 0 + "-a-test";
      }

      if (this.dataUpload.fileATest) {
        this.uploadToStorageATest(idATest, selectorProgressBar, 1);
      } else {
        this.proccessAdd[1].status = "warning";
        setTimeout(() => {
          this.uploadAllImages(2, 0);
        }, 500);
      }
    });
  }

  uploadToStorageATest(name, selector, index) {
    let storageRef = this.refStorage.ref(name);
    var task = storageRef.put(this.dataUpload.fileATest);
    task.on(
      "state_changed",
      snapshot => {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        selector.style.width = percentage + "%";
        if (percentage === 100) {
          this.proccessAdd[index].status = "success";
          setTimeout(() => {
            this.addATestToDataBase(name, index + 1);
          }, 500);
        }
      },
      function error(error) {
        console.log(error);
        this.proccessAdd[index].status = "error";
        this.vissibleModal = false;
      }
    );
  }

  addATestToDataBase(name, indexProcess) {
    this.proccessAdd.push({
      template: 1,
      title: "Dodanie identyfikatora A-Testu",
      description: ["Id A-Test:"],
      value: [name],
      status: "check"
    });

    setTimeout(() => {
      this.scrollToElement(indexProcess + "-process");
    });

    let index;

    if (this.detailATest) {
      index = this.detailATest.length;
    } else {
      index = 0;
    }

    this.refAtest
      .child(index)
      .update({
        id: name
      })
      .then(() => {
        this.proccessAdd[indexProcess].status = "success";
        setTimeout(() => {
          this.uploadUrlATestToProduct(name, "new", indexProcess + 1);
        }, 500);
      })
      .catch(error => {
        console.log(error);
        this.proccessAdd[indexProcess].status = "error";
      });
  }

  uploadUrlATestToProduct(name, status, indexProcess) {
    if (status !== "again") {
      this.proccessAdd.push({
        template: 1,
        title: "Dodanie linku do pobrania A-Testu",
        description: ["Link A-Test:"],
        value: [name],
        status: "check"
      });
    }

    setTimeout(() => {
      this.scrollToElement(indexProcess + "-process");
    });

    this.refStorage
      .ref()
      .child(name)
      .getDownloadURL()
      .then(url => {
        this.refProducts
          .child(this.indexUpdateProduct)
          .update({
            urlATest: { url: url, id: name }
          })
          .then(() => {
            this.proccessAdd[indexProcess].status = "success";
            setTimeout(() => {
              this.uploadAllImages(indexProcess + 1, 0);
            }, 500);
          })
          .catch(error => {
            this.proccessAdd[indexProcess].status = "error";
          });
      })
      .catch(error => {
        console.log(error);
        this.proccessAdd[indexProcess].status = "error";
        this.uploadUrlATestToProduct(name, "again", indexProcess);
      });
  }

  uploadAllImages(indexProcess, imageIndex) {
    this.proccessAdd.push({
      template: 3,
      title: "Dodanie zdjęcia",
      description: "Zdjęcie:",
      value: this.dataUpload.urlImage[imageIndex].name,
      status: "check"
    });

    setTimeout(() => {
      this.scrollToElement(indexProcess + "-process");
    });

    setTimeout(() => {
      let selectorProgressBar = document.getElementById(
        indexProcess + "-image"
      );
      let idImage;

      if (this.detailImages) {
        idImage =
          parseInt(this.detailImages[this.detailImages.length - 1].id) +
          1 +
          "-image";
      } else {
        idImage = 0 + "-image";
      }

      this.uploadToStorageImage(
        idImage,
        selectorProgressBar,
        indexProcess,
        imageIndex
      );
    });
  }

  uploadToStorageImage(name, selector, indexProcess, imageIndex) {
    let storageRef = this.refStorage.ref(name);

    var task = storageRef.put(this.dataUpload.urlImage[imageIndex].file);
    task.on(
      "state_changed",
      snapshot => {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        selector.style.width = percentage + "%";
        if (percentage === 100) {
          this.proccessAdd[indexProcess].status = "success";
          setTimeout(() => {
            this.addImagesToDataBase(name, indexProcess + 1, imageIndex);
          });
        }
      },
      function error(error) {
        console.log(error);
        this.proccessAdd[indexProcess].status = "error";
      }
    );
  }

  addImagesToDataBase(name, indexProcess, imageIndex) {
    this.proccessAdd.push({
      template: 1,
      title: "Dodanie identyfikatora Zdjęcia",
      description: ["Id zdjęcia:"],
      value: [name],
      status: "check"
    });

    setTimeout(() => {
      this.scrollToElement(indexProcess + "-process");
    });

    let index;

    if (this.detailImages) {
      index = this.detailImages.length;
    } else {
      index = 0;
    }

    this.refImages
      .child(index)
      .update({
        id: name
      })
      .then(() => {
        this.proccessAdd[indexProcess].status = "success";
        setTimeout(() => {
          this.uploadUrlImagesToProduct(
            name,
            indexProcess + 1,
            imageIndex,
            "new"
          );
        }, 1000);
      })
      .catch(error => {
        console.log(error);
        this.proccessAdd[indexProcess].status = "error";
      });
  }

  uploadUrlImagesToProduct(name, indexProcess, imageIndex, status) {
    if (status !== "again") {
      this.proccessAdd.push({
        template: 1,
        title: "Dodanie url zdjecia do galerii zdjęć",
        description: ["Link zdjęcia:"],
        value: [name],
        status: "check"
      });
    }

    setTimeout(() => {
      this.scrollToElement(indexProcess + "-process");
    });

    this.refStorage
      .ref()
      .child(name)
      .getDownloadURL()
      .then(url => {
        this.refProducts
          .child(this.indexUpdateProduct)
          .child("urlImages")
          .set(
            this.detailProducts[this.indexUpdateProduct].urlImages
              ? [
                  ...this.detailProducts[this.indexUpdateProduct].urlImages,
                  { url: url, id: name }
                ]
              : [{ url: url, id: name }]
          )
          .then(() => {
            this.proccessAdd[indexProcess].status = "success";

            if (this.dataUpload.urlImage.length - 1 === imageIndex) {
              this.successUploadProduct = true;
              swal({
                type: "success",
                title: "Dodanie produktu",
                text: "Produkt został dodany!"
              });
              this.setNewDataAddUser();
              setTimeout(() => {
                this.scrollToElement("end-add-product");
              });
              return;
            } else {
              indexProcess++;
              imageIndex++;
              setTimeout(() => {
                this.uploadAllImages(indexProcess, imageIndex);
              }, 500);
            }
          })
          .catch(error => {
            this.proccessAdd[indexProcess].status = "error";
          });
      })
      .catch(error => {
        console.log(error);
        this.proccessAdd[indexProcess].status = "error";
        setTimeout(() => {
          this.uploadUrlImagesToProduct(
            name,
            indexProcess,
            imageIndex,
            "again"
          );
        });
      });
  }

  setNewDataAddUser() {
    fetch("https://api.ipify.org?format=json")
      .then(response => response.json())
      .then(data => {
        let newProduct = {
          name: "Produkt",
          ip: data.ip,
          data: this.getFullData(),
          time: this.getFullTime()
        };
        if (this.detailUser.history) {
          this.detailUser.history.push(newProduct);
          this.refDatabaseUserDetail
            .child("history")
            .set(this.detailUser.history);
        } else {
          this.refDatabaseUserDetail.child("history").update([newProduct]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getFullData() {
    let today: any = new Date();
    let day: any = today.getDate();
    let mounth: any = today.getMonth() + 1;
    let year = today.getFullYear();

    if (day < 10) {
      day = "0" + day;
    }

    if (mounth < 10) {
      mounth = "0" + mounth;
    }

    return (today = day + "-" + mounth + "-" + year);
  }

  getFullTime() {
    let today: any = new Date();
    let hour: any = today.getHours();
    let minutes: any = today.getMinutes();
    let seconds: any = today.getSeconds();

    if (hour < 10) {
      hour = "0" + hour;
    }

    if (minutes < 10) {
      minutes = "0" + minutes;
    }

    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return (today = hour + ":" + minutes + ":" + seconds);
  }

  exitModal() {
    this.closeModal();
    this.proccessAdd = [];
    this.vissibleModal = false;
    this.successUploadProduct = false;
  }
}
