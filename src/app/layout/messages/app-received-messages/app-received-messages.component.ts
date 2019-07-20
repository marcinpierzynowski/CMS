import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-app-received-messages',
  templateUrl: './app-received-messages.component.html',
  styleUrls: ['./app-received-messages.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppReceivedMessagesComponent implements OnInit {
  public messages: Array<Message>;
  public cpMessages: Array<Message>;
  public email = '';
  public date = '';

  constructor(
    private firebaseService: FirebaseService,
    private messagesManageService: MessagesManageService
    ) {}

  ngOnInit(): void {
    this.messagesManageService.messageData.subscribe(msgs => {
      if (msgs) {
        this.cpMessages = msgs.filter(msg => msg.read === true).slice();
        this.messages = msgs.filter(msg => msg.read === true);
      }
    });
  }

  public deleteMessage(index) {
    swal.fire({
      title: 'Usunięcie Wiadomości',
      text: 'Czy jesteś pewny że chcesz usunąć wiadomość?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
       this.messages.splice(index, 1);
       this.firebaseService.getDataBaseRef('messages').set(this.messages)
        .then(() => swal.fire('Usunięcie wiadomości', 'Wiadomość została usunięta!', 'success'));
      }
    });
  }

  public filterData(): void {
    // tslint:disable-next-line:one-variable-per-declaration
    const e = this.email, d = this.date;
    const inpVal = [e, d];
    const keys = ['email', 'date'];

    this.cpMessages = this.messages.filter((msg) => {
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < inpVal.length; i++) {
        if (inpVal[i] !== '' && msg[keys[i]].toLowerCase().includes(inpVal[i].toLowerCase()) === false) {
         return false;
        }
      }
      return true;
    });

    // if all inputs empty
    if (!inpVal.find(el => el !== '')) {
      this.cpMessages = this.messages.slice();
    }
  }
}
