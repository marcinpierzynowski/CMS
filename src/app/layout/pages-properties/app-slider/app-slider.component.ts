import { Component, OnInit } from '@angular/core';

import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
// tslint:disable-next-line: max-line-length
import { fadeInOutTranslate, fadeOutTranslate, fadeInOutTranslateInOpacity, fadeOutTranslateInOpacity } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { PagesManageService } from 'src/app/services/pages-manage.service';
import { Slider } from 'src/app/models/model';

@Component({
  selector: 'app-app-slider',
  templateUrl: './app-slider.component.html',
  styleUrls: [
    './app-slider.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  providers: [PagesManageService],
  animations: [
    fadeInOutTranslate,
    fadeOutTranslate,
    fadeInOutTranslateInOpacity,
    fadeOutTranslateInOpacity
  ]
})
export class AppSliderComponent implements OnInit {
  public sliders: Array<Slider>;
  public vissibleMoreOptions = 0;

  private areaDropTime;
  private reader;
  private refStorage;

  constructor(
    private firebaseService: FirebaseService,
    private pagesManageService: PagesManageService
    ) {}

  ngOnInit(): void {
    this.refStorage = this.firebaseService.firebase.storage();
    this.initAreaDrop();
    this.pagesManageService.sliderData.subscribe(sld => this.sliders = sld);
  }

  public initAreaDrop(): void {
    this.areaDropTime = setInterval(
      (): void => {
        if (document.querySelector('.drop-zone')) {
          clearInterval(this.areaDropTime);
          this.setStyleDropArena(document.querySelector('.drop-zone'));
        }
      }
    );
  }

  public setStyleDropArena(selector): void {
    selector['style'].height = '300px';
    selector['style'].border = '1px dashed #e0e0e0';
    selector['style'].borderRadius = '0px';
    selector['style'].zIndex = 10;
  }

  public getFile(refInputFile): void {
    refInputFile.value = null;
    refInputFile.click();
  }

  public uploadImage(event): void {
    this.uploadToStorageImage(event.files[0]);
  }

  public dropped(event: UploadEvent): void {
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

  public uploadToStorageImage(value): void {
    const name = this.sliders.length + '-slider';
    const storageRef = this.refStorage.ref(name);
    this.generateSwalWaitingFromRequest('warning', 'Dodanie zdjęcia do slajdera', 'Czekaj na dodanie zdjęcia!');

    const task = storageRef.put(value);
    task.on('state_changed', snapshot => {
        const percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (percentage === 100) {
         this.addImagesToDataBase(name);
        }
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
    this.refStorage.ref().child(name).getDownloadURL().then(imageUrl => {
        this.sliders.push( { imageUrl, name } );
        this.firebaseService.getDataBaseRef('sliders').set(this.sliders).then(() => {
          swal.close();
          swal({
            type: 'success',
            title: 'Dodanie nowego zdjęcia do slajdera',
            text: 'Zdjęcie dodano pomyślnie.'
          });
        });
      })
      .catch(() => {
        this.sliders.splice(this.sliders.length - 1, 1);
        this.addImagesToDataBase(name);
      });
  }

  deleteImage(name, index) {
    swal({
      title: 'Usunięcie zdjęcia',
      text:
        'Czy jesteś pewny że usunąć zdjęcie ze slajdera?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        this.generateSwalWaitingFromRequest('warning', 'Usuwanie zdjęcia ze slajdera', 'Czekaj na usunięcie zdjęcia!');
        this.refStorage.ref(name).delete()
          .then(() => {
            this.sliders.splice(index, 1)
            this.firebaseService.getDataBaseRef('sliders').set(this.sliders)
            .then(() => {
              swal.close();
              // tslint:disable-next-line: max-line-length
              swal({ type: 'success', title: 'Usunięcie zdjęcia ze slidera', text: 'Usuwanie zdjęcia ze slidera zakończyło się pomyślnie' });
            });
        });
      }});
  }
}
