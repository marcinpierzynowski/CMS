import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import { FirebaseService } from 'src/app/services/firebase.service';
import { ModalManageService } from 'src/app/services/modal-manage.service';
import { LayoutManageService } from 'src/app/services/layout-manage.service';

import swal from 'sweetalert2';
import { fadeInOutTranslate, zoomOut } from 'src/shared/animations/animation';
import { ReceivedMessageModal } from 'src/app/models/modal.model';
import { MessagesManageService } from 'src/app/services/messages-manage.service';

@Component({
  selector: 'app-received-message-modal',
  templateUrl: './received-message-modal.component.html',
  styleUrls: ['./received-message-modal.component.css'],
  animations: [
    fadeInOutTranslate,
    zoomOut
  ]
})
export class ReceivedMessageModalComponent implements OnInit {
  public modalData: ReceivedMessageModal;
  public message: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private modalManageService: ModalManageService,
    private messagesManageService: MessagesManageService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.modalManageService.activeModalsData.subscribe((
      m => {
        this.modalData = (m[1] as ReceivedMessageModal);
        this.initForm();
        if (this.modalData.answer) {
          this.message.get('desc').disable();
        }
      }
    ));
  }

  initForm() {
    this.message = new FormGroup({
      desc: new FormControl('', Validators.required)
    });
  }

  public close() {
    const data = { ...this.modalData };
    data.vissible = false;
    this.modalManageService.update(1, data);
  }

  public send() {
    if (this.modalData.answer) {
      swal.fire('Wysłanie wiadomości', 'Wiadomość została już nadana wcześniej', 'error');
    } else if (this.message.invalid) {
      swal.fire('Wysłanie wiadomośći', 'Pole z wiadomością nie może być puste', 'error');
    } else {
      const { id } = this.modalData;
      const messages = this.messagesManageService.messageData.getValue();
      const message = messages.find(m => m.id === id);
      const emailAdmin = this.layoutManageService.emailData.getValue();
      const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      const { email, detail } = this.layoutManageService.adminsData.getValue().find(a => a.email === emailAdmin);

      message.answer = { ...this.message.value, url: detail.imageUrl, email, date };
      this.firebaseService.getDataBaseRef('messages').set(messages)
        .then(() => {
          swal.fire('Wysłanie Wiadomości', 'Wiadomość została wysłana', 'success');
          this.close();
        });
    }
  }

}
