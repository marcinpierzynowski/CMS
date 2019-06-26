import { Component, OnInit } from '@angular/core';
import {
  UploadEvent,
  UploadFile,
  FileSystemFileEntry,
  FileSystemDirectoryEntry
} from "ngx-file-drop";

import {
  fadeInOutTranslate,
  fadeOutTranslate,
  fadeInOutTranslateInOpacity,
  fadeOutTranslateInOpacity
} from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-slider",
  templateUrl: "./app-slider.component.html",
  styleUrls: [
    "./app-slider.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [
    fadeInOutTranslate,
    fadeOutTranslate,
    fadeInOutTranslateInOpacity,
    fadeOutTranslateInOpacity
  ]
})
export class AppSliderComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationSlider: boolean = true;
  checkAuthorized: boolean;

  refSlider = this.firebaseService
    .firebase
    .database()
    .ref("slider");

  detailSlider = [];

  vissibleMoreOptions = -1;
  areaDropTime;
  reader;
  refStorage = this.firebaseService.firebase.storage();

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.areaDropTime = setInterval(
      (): void => {
        if (document.querySelector(".drop-zone")) {
          clearInterval(this.areaDropTime);
          this.setStyleDropArena(document.querySelector(".drop-zone"));
        }
      }
    );
  }

  getSlider() {
    this.refSlider.on("value", this.downloadSlider.bind(this), this.err);
  }

  downloadSlider(data) {
    let scores = data.val();
    if (!scores) {
      this.detailSlider = null;
      return;
    }
    this.detailSlider = scores;
  }

  err(error) {
    console.log(error);
  }

  setStyleDropArena(selector) {
    selector["style"].height = "300px";
    selector["style"].border = "1px dashed #e0e0e0";
    selector["style"].borderRadius = "0px";
    selector["style"].zIndex = 10;
  }

  getFile(refInputFile) {
    refInputFile.value = null;
    refInputFile.click();
  }

  uploadImage(event) {
    this.uploadToStorageImage(event.files[0]);
  }

  dropped(event: UploadEvent) {
    for (const droppedFile of event.files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.uploadToStorageImage(file);
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  uploadToStorageImage(value) {
    this.generateSwalWaitingFromRequest(
      "warning",
      "Dodanie zdjęcia do slajdera",
      "Czekaj na dodanie zdjęcia!"
    );

    let name;
    if (this.detailSlider) {
      name = this.detailSlider.length + "-slider-image";
    } else {
      name = "0-slider-image";
    }
    let storageRef = this.refStorage.ref(name);

    var task = storageRef.put(value);
    task.on(
      "state_changed",
      snapshot => {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (percentage === 100) {
          setTimeout(() => {
            this.addImagesToDataBase(name);
          });
        }
      },
      function error(error) {
        console.log(error);
      }
    );
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

  addImagesToDataBase(name) {
    this.refStorage
      .ref()
      .child(name)
      .getDownloadURL()
      .then(url => {
        if (this.detailSlider) {
          this.detailSlider.push({ name: name, url: url });
        } else {
          this.detailSlider = [{ name: name, url: url }];
        }
        this.refSlider.set(this.detailSlider).then(() => {
          swal.close();
          swal({
            type: "success",
            title: "Dodanie nowego zdjęcia do slajdera",
            text: "Zdjęcie dodano pomyślnie."
          });
        });
      })
      .catch(error => {
        console.log(error);
        this.addImagesToDataBase(name);
      });
  }

  deleteImage(name, index) {
    swal({
      title: "Usunięcie zdjęcia",
      text:
        "Czy jesteś pewny że usunąć zdjęcie ze slajdera?",
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
          "Usuwanie zdjęcia ze slajdera",
          "Czekaj na usunięcie zdjęcia!"
        );
        this.refStorage
        .ref(name)
        .delete()
        .then(() => {
          this.detailSlider.splice(index, 1)
          this.refSlider.set(this.detailSlider)
            .then(() => {
              swal.close();
              swal({
                type: "success",
                title: "Usunięcie zdjęcia ze slidera",
                text: "Usuwanie zdjęcia ze slidera zakończyło się pomyślnie"
              });
            })
            .catch((error) => {
              console.log(error);
            })
        })
        .catch(error => {
          console.log(error);
        });
      }})
  }
}
