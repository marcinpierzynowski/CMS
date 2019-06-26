import { Component, OnInit } from "@angular/core";
import {
  UploadEvent,
  UploadFile,
  FileSystemFileEntry,
  FileSystemDirectoryEntry
} from "ngx-file-drop";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-add-products",
  templateUrl: "./app-add-products.component.html",
  styleUrls: [
    "./app-add-products.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppAddProductsComponent implements OnInit {
  authorizationProducts: boolean = true;
  checkAuthorized: boolean;

  //detail with database //
  detailProducts = [];
  detailConnectionsProducts = [];

  // Category variables //
  detailCategoryProducts = [];
  categoryLevel = "Główna";
  vissibleCategory = [];
  level = 0;
  parentIdLevel = [];
  displayedColumns: string[] = ["numer", "nazwa", "opcje"];

  // filter variable //
  copyDetailProducts;
  filterDetailProducts = [];
  filterValue = "";

  // modal add product variables //
  vissibleModalAddProduct: boolean;
  uploadCallBack;

  checkOnUid;

  // reference databse //
  refAuthorizationUser;
  refConnectionsProducts;
  refCategoryProducts;

  stepperSection = 1;

  // variables section upload images //
  reader;
  urlImage = [];
  file: UploadFile[] = [];
  areaDropTime;
  urlName = "";
  urlSize: number;
  checkPictureValidate: boolean;
  lengthUploadPicture = 0;

  // variables section description products //

  visibleFormNewConnectionProducts: boolean;
  nameOfCreateNewConnectionProducts = "";

  //variables to send //
  price = "";
  promotionPrice = "";
  titleProduct = "";
  refNumberProduct;
  descriptionProduct = "";
  connectionsProduct = -1;
  parametrChoose = -1;
  fileATest;
  listParametrs = [];
  necesaryProducts = [];
  dataUpload;
  categoryChoose = -1;

  dangerCommunicate = [];

  checkedAddNewProduct:boolean;

  constructor(private firebaseService: FirebaseService) {
    this.areaDropTime = setInterval(
      (): void => {
        if (document.querySelector(".drop-zone")) {
          clearInterval(this.areaDropTime);
          this.setStyleDropArena(document.querySelector(".drop-zone"));
        }
      }
    );
  }

  ngOnInit() {
    window.addEventListener("click", event => {
      let idName = event.target["id"];
      if (this.filterValue) {
        if (idName.toString() !== "product-filter") {
          this.filterValue = "";
          this.filterProducts();
        }
      }
    });
  }

  getDetailsConnectionsProducts() {
    this.refConnectionsProducts = this.getReferenceToDatabaseConnectionsProducts();
    this.refConnectionsProducts.on(
      "value",
      this.downloadDataWithDatabaseConnectionsProducts.bind(this),
      this.err
    );
  }

  getReferenceToDatabaseConnectionsProducts() {
    return this.firebaseService
      .firebase
      .database()
      .ref("connectionsProducts");
  }

  downloadDataWithDatabaseConnectionsProducts(data) {
    let scores = data.val();
    this.detailConnectionsProducts = scores;
  }

  getDetailsProducts() {
    this.getReferenceToDatabaseProducts().on(
      "value",
      this.downloadDataWithDatabaseProducts.bind(this),
      this.err
    );
  }

  getReferenceToDatabaseProducts() {
    return this.firebaseService
      .firebase
      .database()
      .ref("products");
  }

  downloadDataWithDatabaseProducts(data) {
    let scores = data.val();
    this.detailProducts = scores;
    this.copyDetailProducts = scores;
  }

  getDetailsCategoryProducts() {
    this.refCategoryProducts = this.getReferenceToCategoryProducts();
    this.refCategoryProducts.on(
      "value",
      this.downloadDataWithDatabaseCategoryProducts.bind(this),
      this.err
    );
  }

  getReferenceToCategoryProducts() {
    return this.firebaseService
      .firebase
      .database()
      .ref("category");
  }

  downloadDataWithDatabaseCategoryProducts(data) {
    let scores = data.val();
    this.detailCategoryProducts = scores;

    if (scores) {
      this.vissibleCategory = this.detailCategoryProducts.slice();
      this.parentIdLevel = [];
      this.categoryLevel = "Główna";
      this.level = 0;
    }
  }

  err(error) {
    console.log(error);
  }

  setStepper(numberStep) {
    let communicate;

    if (numberStep === 1 && this.stepperSection < 3) {
      this.stepperSection = numberStep;
      this.areaDropTime = setInterval(
        (): void => {
          if (document.querySelector(".drop-zone")) {
            clearInterval(this.areaDropTime);
            this.setStyleDropArena(document.querySelector(".drop-zone"));
            this.lengthUploadPicture = 0;
            if (this.urlImage.length > 0) {
              this.reader.readAsDataURL(this.urlImage[0].file);
            }
          }
        }
      );
    } else {
      if (this.urlImage.length === 0) {
        swal({
          type: "warning",
          title: "Przejście do następnego kroku",
          text: "Musisz dodać co najmniej jedno zdjęcie! *wymagane"
        });
        return;
      }

      if (
        (this.stepperSection === 1 || this.stepperSection === 2) &&
        numberStep === 3
      ) {
        communicate = this.checkValidateStepperTwo();
        if (communicate.length > 0) {
          swal({
            type: "warning",
            title: "Przejście do następnego kroku",
            html: communicate
          });
          return;
        }
      }

      if (this.stepperSection === 5 && numberStep === 3) {
        communicate = this.checkValidateStepperFive();
        if (communicate.length > 0) {
          swal({
            type: "warning",
            title: "Przejście do następnego kroku",
            html: communicate
          });
          return;
        }
      }

      if (
        (numberStep === 3 &&
          this.stepperSection >= 3 &&
          this.stepperSection < 6) ||
        (this.stepperSection === 6 && numberStep === 3)
      ) {
        this.stepperSection++;
      } else if (this.stepperSection === 7 && numberStep === 1) {
        this.stepperSection -= 2;
      } else if (
        (this.stepperSection === 7 && numberStep === 2) ||
        (this.stepperSection >= 3 && numberStep === 1)
      ) {
        this.stepperSection--;
      } else if (
        (this.stepperSection === 6 && numberStep === 3) ||
        (this.stepperSection >= 3 && numberStep === 2)
      ) {
        return;
      } else {
        this.stepperSection = numberStep;
      }
    }
  }

  /* Validate Step 2 */

  checkValidateStepperTwo() {
    var text = "";
    let communicate = [];

    if (!this.price) {
      communicate.push("Cena nie może być pusta!");
    }

    if (!this.titleProduct) {
      communicate.push("Tytuł nie może być pusty!");
    }
    communicate.push(...this.checkRefNumber());

    if (this.descriptionProduct.length < 10) {
      communicate.push("Opis musi mieć minimum 10 znaków!");
    }

    if (communicate.length > 0) {
      for (let i = 0; i < communicate.length; i++)
        text += "<p>" + communicate[i] + "</p>";
    }

    return text;
  }

  checkRefNumber() {
    let communicate = [];
    if (this.refNumberProduct) {
      if (this.refNumberProduct.toString().length < 9) {
        communicate.push("Zbyt krótki numer referencyjny!");
      }
      if (this.detailProducts) {
        if (
          this.detailProducts.find(product => {
            if (product.refNumberProduct === this.refNumberProduct) {
              return true;
            }
          })
        ) {
          communicate.push("Numer referencyjny nie może się powtarzać");
        }
      }
    } else {
      this.refNumberProduct = this.generateRandomNumber();
    }
    return communicate;
  }

  generateRandomNumber() {
    let refNumberProduct;
    if (this.detailProducts) {
      do {
        refNumberProduct = this.getRandomNumber();
      } while (
        this.detailProducts.find(product => {
          if (product.refNumberProduct === refNumberProduct) {
            return true;
          }
        })
      );
    } else {
      refNumberProduct = this.getRandomNumber();
    }
    return refNumberProduct;
  }

  getRandomNumber() {
    let number = "";

    for (let i = 0; i < 9; i++) {
      number += (Math.floor(Math.random() * 9) + 1).toString();
    }

    return number;
  }

  checkValidateStepperFive() {
    let text = "";
    let communicate = [];

    if (this.connectionsProduct >= 0 && this.listParametrs.length === 0) {
      communicate.push(
        "Dodałeś powiązanie: Musisz dodać parametr a następnie go powiązać."
      );
    }

    if (this.connectionsProduct >= 0 && this.listParametrs.length > 0) {
      if (this.parametrChoose === -1) {
        communicate.push("Musisz powiązać jeden z atrybutów");
      }
    }

    if (communicate.length > 0) {
      for (let i = 0; i < communicate.length; i++)
        text += "<p>" + communicate[i] + "</p>";
    }
    return text;
  }

  /* ------------------------------ */

  // Picture and A-Test upload section //

  getFile(refInputFile) {
    refInputFile.value = null;
    refInputFile.click();
  }

  uploadImage(event) {
    this.urlImage.push({
      file: event.files[0],
      urlName: event.files[0].name,
      urlSize: event.files[0].size
    });
    if (!this.reader) {
      this.reader = new FileReader();
      this.reader.onload = function(event) {
        document.getElementsByClassName("image-upload")[
          this.lengthUploadPicture
        ]["src"] = event.target["result"];
        this.lengthUploadPicture++;

        if (this.lengthUploadPicture < this.urlImage.length) {
          this.reader.readAsDataURL(
            this.urlImage[this.lengthUploadPicture].file
          );
        }
      }.bind(this);
    }

    this.reader.readAsDataURL(this.urlImage[this.urlImage.length - 1].file);
  }

  dropped(event: UploadEvent) {
    for (const droppedFile of event.files) {
      if (!this.reader) {
        this.reader = new FileReader();
        this.reader.onload = function(event) {
          document.getElementsByClassName("image-upload")[
            this.lengthUploadPicture
          ]["src"] = event.target["result"];
          this.lengthUploadPicture++;

          if (this.lengthUploadPicture < this.urlImage.length) {
            this.reader.readAsDataURL(
              this.urlImage[this.lengthUploadPicture].file
            );
          }
        }.bind(this);
      }

      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.urlImage.push({
            file: file,
            urlName: file.name,
            urlSize: file.size
          });
          setTimeout(() => {
            this.reader.readAsDataURL(
              this.urlImage[this.urlImage.length - 1].file
            );
          }, 500);
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  setStyleDropArena(selector) {
    selector["style"].height = "300px";
    selector["style"].border = "1px dashed #e0e0e0";
    selector["style"].borderRadius = "0px";
    selector["style"].zIndex = 10;
  }

  countSizeImage(size) {
    if (size > 1000000) {
      size = size / 1000000;
      size = this.roundValue(size, 2);
      size += " mb";
    } else if (size > 1000) {
      size = size / 1000;
      size = this.roundValue(size, 2);
      size += " kb";
    }
    return size;
  }

  roundValue(number, accuracy) {
    var factor = Math.pow(10, accuracy);
    return Math.round(number * factor) / factor;
  }

  cancelImage(index) {
    this.urlImage.splice(index, 1);
    this.lengthUploadPicture--;
  }

  getFileATest(refDropATestInput) {
    refDropATestInput.value = null;
    refDropATestInput.click();
  }

  uploadATestFile(event) {
    this.fileATest = event.files[0];
  }

  //*********************************//

  // Section add connection to new product //

  setConnectionProduct(id) {
    if (id == -1) {
      this.connectionsProduct = -1;
      this.parametrChoose = -1;
    } else {
      if (this.connectionsProduct != parseInt(id)) {
        this.parametrChoose = -1;
      }
      this.connectionsProduct = parseInt(id);
    }
  }

  createNewConnectionProducts(refCheckNewConnection) {
    if (!this.nameOfCreateNewConnectionProducts) {
      return swal({
        type: "error",
        title: "Nowe powiązanie",
        text: "Pole nie może być puste!"
      });
    }
    if (!this.detailConnectionsProducts) {
      this.refConnectionsProducts
        .set([{ id: 0, name: this.nameOfCreateNewConnectionProducts }])
        .then(() => {
          swal({
            type: "success",
            title: "Nowe powiązanie",
            text: "Dodano nowe powiązanie!"
          });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      this.detailConnectionsProducts.push({
        id:
          this.detailConnectionsProducts[
            this.detailConnectionsProducts.length - 1
          ].id + 1,
        name: this.nameOfCreateNewConnectionProducts
      });

      this.refConnectionsProducts
        .set(this.detailConnectionsProducts)
        .then(() => {
          swal({
            type: "success",
            title: "Nowe powiązanie",
            text: "Dodano nowe powiązanie!"
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
    refCheckNewConnection.checked = false;
    this.nameOfCreateNewConnectionProducts = "";
    this.visibleFormNewConnectionProducts = false;
  }

  deleteConnectionsProducts(index) {
    swal({
      title: "Usunięcie powiązania",
      text:
        "Czy jesteś pewny że chcesz usunąć powiązanie?  Wszystkie produkty powiązane z tym parametrem zostanę bez powiązania!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        if (!this.detailProducts) {
          this.detailConnectionsProducts.splice(index, 1);
          this.refConnectionsProducts
            .set(this.detailConnectionsProducts)
            .then(() => {
              swal({
                title: "Usunięcie powiązania",
                text: "Usunięcie powiązania zakończone pomyślnie!",
                type: "success"
              });
              this.connectionsProduct = -1;
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          this.detailProducts.forEach((product, i) => {
            if (
              product.connectionsProduct ===
              this.detailConnectionsProducts[index].id
            ) {
              this.detailProducts[i].connectionsProduct = -1;
              this.detailProducts[i].parametrChoose = -1;
            }
          });

          this.getReferenceToDatabaseProducts()
            .set(this.detailProducts)
            .then(() => {
              this.detailConnectionsProducts.splice(index, 1);
              this.refConnectionsProducts
                .set(this.detailConnectionsProducts)
                .then(() => {
                  swal({
                    title: "Usunięcie powiązania",
                    text: "Usunięcie powiązania zakończone pomyślnie!",
                    type: "success"
                  });
                  this.connectionsProduct = -1;
                })
                .catch(err => {
                  console.log(err);
                });
            });
        }
      }
    });
  }

  chooseConnectionParametr(index, selector) {
    if (selector.checked) {
      this.parametrChoose = index;
    } else {
      this.parametrChoose = -1;
    }
  }

  deleteParametr(index) {
    this.listParametrs.splice(index, 1);
    if (index === this.parametrChoose) this.parametrChoose = -1;
  }

  // Section create product //

  createProduct() {
    this.checkedAddNewProduct = true;
    this.dataUpload = {
      price: this.price,
      promotionPrice: this.promotionPrice,
      urlImage: this.urlImage,
      titleProduct: this.titleProduct,
      refNumberProduct: this.refNumberProduct,
      descriptionProduct: this.descriptionProduct,
      connectionsProduct: this.connectionsProduct,
      parametrChoose: this.parametrChoose,
      fileATest: this.fileATest,
      listParametrs: this.listParametrs,
      necesaryProducts: this.necesaryProducts,
      categoryProduct: this.categoryChoose
    };

    setTimeout(() => {
      this.vissibleModalAddProduct = true;
      this.uploadCallBack();
    }, 500);
  }

  checkValidate() {
    let communicate = [];

    return communicate;
  }

  setFilterProducts(value) {
    this.filterValue = value;
    this.filterProducts();
  }

  filterProducts() {
    if (this.filterValue !== "") {
      this.filterDetailProducts = this.copyDetailProducts.filter(product => {
        if (
          product.title.toLowerCase().includes(this.filterValue.toLowerCase())
        ) {
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
    this.filterProducts();
  }

  closeModal = () => {
    this.checkedAddNewProduct = false;
    this.vissibleModalAddProduct = false;
    this.urlImage = [];
    this.price = "";
    this.promotionPrice = "";
    this.titleProduct = "";
    this.refNumberProduct = null;
    this.descriptionProduct = "";
    (this.connectionsProduct = -1), (this.fileATest = null);
    this.parametrChoose = -1;
    this.listParametrs = [];
    this.necesaryProducts = [];
    this.stepperSection = 1;
    this.categoryChoose = -1;
    this.setStepper(1);
    this.level = 0;
    this.parentIdLevel = [];
    this.categoryLevel = "Główna";
    this.vissibleCategory = this.detailCategoryProducts;
  };

  //******************************//

  /* Category section */

  createCategory() {
    let id;
    if (this.detailCategoryProducts) {
      id = parseInt(this.getId()) + 1;
    } else {
      id = 0;
    }

    swal({
      title: "Podaj nazwę nowej kategorii",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Dodaj",
      showLoaderOnConfirm: true,
      cancelButtonText: "Anuluj",
      preConfirm: category => {
        if (this.detailCategoryProducts) {
          this.detailCategoryProducts.push({
            id: id,
            name: category
          });
          this.refCategoryProducts
            .set(this.detailCategoryProducts)
            .then(() => {
              swal({
                type: "success",
                title: "Dodanie nowej kategorii.",
                text: "Dodano nową kategorię"
              });
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          this.refCategoryProducts
            .update([
              {
                id: 0,
                name: category
              }
            ])
            .then(() => {
              swal({
                type: "success",
                title: "Dodanie nowej kategorii.",
                text: "Dodano nową kategorię"
              });
            })
            .catch(err => {
              console.log(err);
            });
        }
      }
    });
  }

  assignCategoryProducts(idCategory) {
    this.categoryChoose = idCategory;
  }

  checkAssign(idCategory) {
    if (this.categoryChoose === idCategory) {
      return false;
    }
    if(!this.detailProducts) return true;
    if (this.detailProducts.length > 0) {
      let idProduct;
      idProduct = this.detailProducts.find(product => {
        if (parseInt(product.categoryProduct) == parseInt(idCategory)) {
          return true;
        }
      });
      if (idProduct) {
        return false;
      }
    }
    return true;
  }

  createSubCategory(idCategory, index) {
    let id = parseInt(this.getId()) + 1;
    swal({
      title: "Podaj nazwę nowej kategorii",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Dodaj",
      showLoaderOnConfirm: true,
      cancelButtonText: "Anuluj",
      preConfirm: category => {
        let data = {
          id: id,
          name: category
        };

        this.findCategory(idCategory, data);
        this.refCategoryProducts
          .set(this.detailCategoryProducts)
          .then(() => {
            swal({
              type: "success",
              title: "Dodanie nowej pod kategorii.",
              text: "Dodano nową pod kategorię"
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }

  getId() {
    let id = -1;

    for (let i = 0; i < this.detailCategoryProducts.length; i++) {
      if (this.detailCategoryProducts[i].id > id) {
        id = this.detailCategoryProducts[i].id;
      }

      if (this.detailCategoryProducts[i].subCategory) {
        id = this.getSubId(this.detailCategoryProducts[i].subCategory, id);
      }
    }
    return id.toString();
  }

  getSubId(subCategory, id) {
    for (let i = 0; i < subCategory.length; i++) {
      if (subCategory[i].id > id) {
        id = subCategory[i].id;
      }

      if (subCategory[i].subCategory) {
        id = this.getSubId(subCategory[i].subCategory, id);
      }
    }
    return id;
  }

  findCategory(id, data) {
    let foundCategory = false;

    for (let i = 0; i < this.detailCategoryProducts.length; i++) {
      if (this.detailCategoryProducts[i].id === id) {
        this.detailCategoryProducts[i].subCategory = this.addNewCategory(
          this.detailCategoryProducts[i].subCategory,
          data
        );
        break;
      }

      if (this.detailCategoryProducts[i].subCategory) {
        foundCategory = this.findSubCategory(
          this.detailCategoryProducts[i].subCategory,
          id,
          data
        );
        if (foundCategory) {
          this.detailCategoryProducts[i].subCategory = foundCategory;
          break;
        }
      }
    }
  }

  findSubCategory(subCategory, id, data) {
    let foundSubCategory;

    for (let i = 0; i < subCategory.length; i++) {
      if (subCategory[i].id === id) {
        subCategory[i].subCategory = this.addNewCategory(
          subCategory[i].subCategory,
          data
        );
        return subCategory;
      }

      if (subCategory[i].subCategory) {
        foundSubCategory = this.findSubCategory(
          subCategory[i].subCategory,
          id,
          data
        );
      }
      if (foundSubCategory) {
        subCategory[i].subCategory = foundSubCategory;
        return subCategory;
      }
    }
    return null;
  }

  addNewCategory(subCategory, data) {
    if (subCategory) {
      subCategory.push(data);
    } else {
      subCategory = [data];
    }
    return subCategory;
  }

  setVissibleCategoryProducts(index) {
    this.parentIdLevel.push(this.vissibleCategory[index].id);
    this.categoryLevel = this.vissibleCategory[index].name;
    this.vissibleCategory = this.vissibleCategory[index].subCategory;
    this.level++;
  }

  returnToCategory() {
    this.categoryLevel = "Główna";
    this.SearchParentId(this.parentIdLevel[this.level - 1]);
    this.parentIdLevel.splice(this.level - 1, 1);
    this.level--;
  }

  SearchParentId(idSearch) {
    for (let i = 0; i < this.detailCategoryProducts.length; i++) {
      if (this.detailCategoryProducts[i].id === idSearch) {
        this.vissibleCategory = this.detailCategoryProducts;
        break;
      }

      if (this.detailCategoryProducts[i].subCategory) {
        this.SearchParentSubId(
          this.detailCategoryProducts[i].subCategory,
          idSearch
        );
      }
    }
  }

  SearchParentSubId(subCategory, idSearch) {
    for (let i = 0; i < subCategory.length; i++) {
      if (subCategory[i].id === idSearch) {
        this.vissibleCategory = subCategory;
        break;
      }
      if (subCategory[i].subCategory) {
        this.SearchParentSubId(subCategory[i].subCategory, idSearch);
      }
    }
  }

  deleteCategory(id, index) {
    swal({
      title: "Usunięcie powiązania",
      text:
        "Czy jesteś pewny że chcesz usunąć kategorie?  Wszystkie produkty powiązane z tą kategorią zostana bez kategorii!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        this.searchDeleteCategory(id, index);
        this.refCategoryProducts
          .set(this.detailCategoryProducts)
          .then(() => {
            this.findNotExistingIdInProductsAndClearId();
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }

  searchDeleteCategory(idSearch, index) {
    for (let i = 0; i < this.detailCategoryProducts.length; i++) {
      if (this.detailCategoryProducts[i].id === idSearch) {
        this.detailCategoryProducts.splice(index, 1);
        break;
      }

      if (this.detailCategoryProducts[i].subCategory) {
        this.searchDeleteSubCategory(
          this.detailCategoryProducts[i].subCategory,
          idSearch,
          index
        );
      }
    }
  }

  searchDeleteSubCategory(subCategory, idSearch, index) {
    for (let i = 0; i < subCategory.length; i++) {
      if (subCategory[i].id === idSearch) {
        subCategory.splice(index, 1);
        break;
      }

      if (subCategory[i].subCategory) {
        this.searchDeleteSubCategory(
          subCategory[i].subCategory,
          idSearch,
          index
        );
      }
    }
  }

  findNotExistingIdInProductsAndClearId() {
    let allId = [];
    this.getAllId(allId);
    if(!this.detailProducts) return;

    for (let i = 0; i < this.detailProducts.length; i++) {
      for (let j = 0; j < allId.length; j++) {
        if (this.detailProducts[i].categoryProduct === allId[j]) {
          break;
        }
        if (j === allId.length - 1) {
          this.detailProducts[i].categoryProduct = -1;
        }
      }
    }
    this.getReferenceToDatabaseProducts()
      .set(this.detailProducts)
      .then(() => {
        swal({
          type: "success",
          title: "Ususnięcie kategorii",
          text: "Kategoria została pomyślnie usunięta"
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  getAllId(allId) {
    if(!this.detailCategoryProducts) {
      allId.push (-1);
      return;
    }
    for (let i = 0; i < this.detailCategoryProducts.length; i++) {
      allId.push(this.detailCategoryProducts[i].id);

      if (this.detailCategoryProducts[i].subCategory) {
        this.getAllSubId(this.detailCategoryProducts[i].subCategory, allId);
      }
    }
  }

  getAllSubId(subCategory, allId) {
    for (let i = 0; i < subCategory.length; i++) {
      allId.push(subCategory[i].id);

      if (subCategory[i].subCategory) {
        this.getAllSubId(subCategory[i].subCategory, allId);
      }
    }
  }
  /* ----------------- */
}
