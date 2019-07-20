import { Component, OnInit } from '@angular/core';

import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-app-new-messages',
  templateUrl: './app-new-messages.component.html',
  styleUrls: ['./app-new-messages.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppNewMessagesComponent implements OnInit {
  public messages: Array<Message>;
  public cpMessages: Array<Message>;
  public email = '';
  public date = '';
  public limit = 5;
  public targetMsg: Message;
  public selectValue = 0;

  private time;

  constructor(
    private firebaseService: FirebaseService,
    private messagesManageService: MessagesManageService
  ) { }

  ngOnInit(): void {
    this.messagesManageService.messageData.subscribe(msgs => {
      if (msgs) {
        this.messages = msgs.filter(msg => msg.read === false);
        this.cpMessages = msgs.filter(msg => msg.read === false);
      }
    });
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public deleteMessage(index): void {
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

  public filterData(e): void {
    const value = e.target.value;

    if (this.time) {
      clearTimeout(this.time);
    }
    this.time = setTimeout(() => {
      this.targetMsg = null;
      this.selectValue = 0;
      this.limit = 5;
      this.cpMessages = this.messages.filter(m => {
        return m.email.toLowerCase().includes(value.toLowerCase())
          || m.date.toString().toLowerCase().includes(value.toLowerCase());
      });
      this.time = null;
    }, 500);
  }

  public select(id: number, index: number): void {
    this.targetMsg = this.cpMessages.find(m => m.id === id);
    this.selectValue = index;
  }

  public prevSelect(): void {
    if (this.selectValue > 1) {
      const index = this.cpMessages.findIndex(msg => msg.id === this.targetMsg.id);
      this.targetMsg = this.cpMessages[index - 1];
      this.selectValue -= 1;
    }
  }

  public nextSelect(): void {
    if (this.selectValue < this.cpMessages.length) {
      const index = this.cpMessages.findIndex(msg => msg.id === this.targetMsg.id);
      this.targetMsg = this.cpMessages[index + 1];
      this.selectValue += 1;

      if (this.selectValue > this.limit) {
        this.limit += 5;
      }
    }
  }

  public getDaysCreated(date: string): number | string {
    const current = new Date();
    const prev = new Date(date);
    const time = current.getTime() - prev.getTime();
    if (time === null) {return 'Brak'; }
    return Math.floor(time / 86400000);
  }
}
