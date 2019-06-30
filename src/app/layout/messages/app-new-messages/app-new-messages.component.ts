import { Component, OnInit } from '@angular/core';

import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { FirebaseService } from '../../../services/firebase.service';
import { Message } from 'src/app/models/model';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

@Component({
  selector: 'app-app-new-messages',
  templateUrl: './app-new-messages.component.html',
  styleUrls: [
    './app-new-messages.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  providers: [MessagesManageService],
  animations: [fadeInOutTranslate]
})
export class AppNewMessagesComponent implements OnInit {
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
        this.cpMessages = msgs.filter(msg => msg.read === false).slice();
        this.messages = msgs.filter(msg => msg.read === false);
      }
    });
  }

  public deleteMessage(index) {
    swal({
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
        .then(() => swal('Usunięcie wiadomości', 'Wiadomość została usunięta!', 'success'));
      }
    });
  }

  public filterData(): void {
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
