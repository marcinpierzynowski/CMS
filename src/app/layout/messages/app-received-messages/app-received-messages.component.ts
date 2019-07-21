import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { Message } from 'src/app/models/message.model';
import { FormGroup, FormControl } from '@angular/forms';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { ModalManageService } from 'src/app/services/modal-manage.service';
import { ReceivedMessageModal } from 'src/app/models/modal.model';

@Component({
  selector: 'app-received-messages',
  templateUrl: './app-received-messages.component.html',
  styleUrls: ['./app-received-messages.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppReceivedMessagesComponent implements OnInit {
  public messages: Array<Message>;
  public cpMessages: Array<Message>;
  public email = '';
  public date = '';
  public limit = 5;
  public filter: FormGroup;

  private time;
  private withoutAnswer = false;

  constructor(
    private firebaseService: FirebaseService,
    private messagesManageService: MessagesManageService,
    private modalManageService: ModalManageService
  ) { }

  ngOnInit(): void {
    this.messagesManageService.messageData.subscribe(msgs => {
      if (msgs) {
        this.cpMessages = msgs.filter(msg => msg.read === true).slice().reverse();
        this.messages = msgs.filter(msg => msg.read === true).reverse();
      }
    });
    this.initForm();
  }

  public initForm(): void {
    this.filter = new FormGroup({
      email: new FormControl(''),
      name_surname: new FormControl(''),
      date: new FormControl('')
    });
  }

  public showAll(): void {
    this.limit = this.cpMessages.length;
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public deleteMessage(id: number): void {
    swal.fire({
      title: 'Usunięcie Wiadomośći',
      text: 'Czy jesteś pewny że chcesz usunąć wiadomość?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        const messages = this.messagesManageService.messageData.getValue()
          .filter(msg => msg.id !== id);
        this.firebaseService.getDataBaseRef('messages').set(messages)
          .then(() => swal.fire('Usunięcie Wiadomości', 'Wiadomość zostałą usunięta', 'success'));
      } else {
        swal.fire('Usunięcie Wiadomości', 'Wiadomość nie została usunięta', 'info');
      }
    });
  }

  public filterData(): void {
    const inputs = this.filter.value;
    const keys = ['email', 'name_surname', 'date'];

    if (this.time) {
      clearTimeout(this.time);
      this.time = null;
    }

    this.time = setTimeout(() => {
      this.limit = 5;
      this.cpMessages = this.messages.filter(c => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] !== 'name_surname') {
            if (inputs[keys[i]] !== '' && c[keys[i]].toLowerCase()
              .includes(inputs[keys[i]].toLowerCase()) === false) {
              return false;
            }
          } else {
            if (inputs[keys[i]] !== '' && c.name.toLowerCase()
              .includes(inputs[keys[i]].toLowerCase()) === false
              && inputs[keys[i]] !== '' && c.surname.toLowerCase()
                .includes(inputs[keys[i]].toLowerCase()) === false) {
              return false;
            }
          }
        }
        return true;
      });
      this.time = null;
      if (this.withoutAnswer) {
        this.answerFilter(true);
      }
    }, 500);
  }

  public answerFilter(value: boolean): void {
    this.withoutAnswer = value;
    this.limit = 5;

    if (this.withoutAnswer) {
      this.cpMessages = this.cpMessages.filter(m => !m.answer);
    } else {
      this.filterData();
    }
  }

  public showModalMessage(message: Message) {
    const { email, date, desc, read, name, surname, url, answer, id } = message;
    const data: ReceivedMessageModal = {
      vissible: true, email, date, desc, read, name, surname, url, answer, id
    };
    this.modalManageService.update(1, data);
  }
}
