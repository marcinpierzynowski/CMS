import { Component, OnInit } from '@angular/core';

import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { Message } from 'src/app/models/message.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin } from 'src/app/models/admin.model';
import { DatePipe } from '@angular/common';

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
  public messageForm: FormGroup;

  private time;
  private admin: Admin;

  constructor(
    private firebaseService: FirebaseService,
    private messagesManageService: MessagesManageService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.messagesManageService.messageData.subscribe(msgs => {
      if (msgs) {
        this.messages = msgs.filter(msg => msg.read === false).reverse();
        this.cpMessages = msgs.filter(msg => msg.read === false).reverse();
      }
    });
    this.initForm();
    this.findAdmin();
  }

  public findAdmin(): void {
    const email = this.layoutManageService.emailData.getValue();
    this.admin = this.layoutManageService.adminsData.getValue().find(a => a.email === email);
  }

  public initForm(): void {
    this.messageForm = new FormGroup({
      message: new FormControl('', Validators.required)
    });
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public async dialogConfirm(title: string, text: string, type): Promise<any> {
    return await swal.fire({
      title,
      text,
      type,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    });
  }

  public async sendDefaultMessage(): Promise<any> {
    const title = 'Automatyczna Wiadomość';
    const text = 'Czy jesteś pewny, że chcesz wysłać wygenerowaną wiadomość?';
    const type = 'warning';
    const result = await this.dialogConfirm(title, text, type);

    if (result.value) {
      const allMessages = this.messagesManageService.messageData.getValue();
      const currentMessage = allMessages.find(msg => msg.id === this.targetMsg.id);

      currentMessage.read = true;
      currentMessage.answer = {
        desc: 'Wiadomość wygenerowana automatycznie. Niedługo odezwiemy się do Ciebie!',
        url: this.admin.detail.imageUrl,
        email: this.admin.email,
        date: this.datePipe.transform(new Date(), 'HH:mm:ss')
      };

      await this.firebaseService.getDataBaseRef('messages').set(allMessages);
      await swal.fire(title, 'Wiadomość została wysłana. Wiadomość zostanie przeniesiona do przeczytanych', 'success');
      this.resetMessage();
    } else {
      swal.fire(title, 'Wiadomość nie została wysłana', 'info');
    }
  }

  public async deleteMessage(): Promise<any> {
    const title = 'Usunięcie Wiadomości';
    const text = 'Czy jesteś pewny, że chcesz usunąć wiadomość?';
    const type = 'warning';
    const result = await this.dialogConfirm(title, text, type);

    if (result.value) {
      const messages = this.messagesManageService.messageData.getValue().filter(msg => msg.id !== this.targetMsg.id);
      await this.firebaseService.getDataBaseRef('messages').set(messages);
      swal.fire('Usunięcie wiadomości', 'Wiadomość została usunięta!', 'success');
      this.resetMessage();
    } else {
      swal.fire(title, 'Wiadomość nie została usunięta', 'info');
    }
  }

  public async markMessage(): Promise<any> {
    const title = 'Oznaczenie wiadomości';
    const text = 'Czy jesteś pewny, że chcesz oznaczyć wiadomość jako przeczytaną?';
    const type = 'warning';
    const result = await this.dialogConfirm(title, text, type);

    if (result.value) {
      const allMessages = this.messagesManageService.messageData.getValue();
      const currentMessage = allMessages.find(msg => msg.id === this.targetMsg.id);

      currentMessage.read = true;

      await this.firebaseService.getDataBaseRef('messages').set(allMessages);
      await swal.fire(title, 'Wiadomość została oznaczona jako przeczytana. Wiadomość zostanie przeniesiona do przeczytanych', 'success');
      this.resetMessage();
    } else {
      swal.fire(title, 'Wiadomość nie została oznaczona jako przeczytana', 'info');
    }
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
    if (time === null) { return 'Brak'; }
    return Math.floor(time / 86400000);
  }

  public async submitMessage(): Promise<any> {
    if (this.messageForm.invalid) {
      swal.fire('Wysłanie Wiadomości', 'Wiadomość nie może być pusta', 'error');
    } else {
      const { message } = this.messageForm.value;

      const allMessages = this.messagesManageService.messageData.getValue();
      const currentMessage = allMessages.find(msg => msg.id === this.targetMsg.id);

      currentMessage.answer = {
        desc: message,
        url: this.admin.detail.imageUrl,
        email: this.admin.email,
        date: this.datePipe.transform(new Date(), 'HH:mm:ss')
      };
      currentMessage.read = true;

      await this.firebaseService.getDataBaseRef('messages').set(allMessages);
      await swal.fire('Wysłanie Wiadomości', 'Wiadomość została wysłana. Wiadomość zostanie przeniesiona do przeczytanych', 'success');
      this.resetMessage();
    }
  }

  public resetMessage(): void {
    this.targetMsg = null;
    this.selectValue = 0;
    this.limit = 5;
    this.initForm();
  }
}
