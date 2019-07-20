import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { ModalManageService } from 'src/app/services/modal-manage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ModalMessage } from 'src/app/models/modal.model';
import { LayoutManageService } from 'src/app/services/layout-manage.service';

import swal from 'sweetalert2';
import { Message } from 'src/app/models/customer.model';
import { fadeInOutTranslate, zoomOut } from 'src/shared/animations/animation';

@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrls: ['./modal-message.component.css'],
  animations: [
    fadeInOutTranslate,
    zoomOut
  ]
})
export class ModalMessageComponent implements OnInit {
  public modalData: ModalMessage;
  public message: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private modalManageService: ModalManageService,
    private layoutManageService: LayoutManageService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.modalManageService.activeModalsData.subscribe((
      m => this.modalData = m[0]
    ));
    this.initForm();
  }

  initForm() {
    this.message = new FormGroup({
      subject: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required)
    });
  }

  public checkValidate(inputControl: string, nameControl: string): boolean {
    const control = this.message.controls[inputControl];
    if (control.errors) {
      if (control.errors[nameControl] && control.touched) {
        return true;
    } else {
        return false;
      }
    }
    return false;
  }

  public checkValidateSuccess(name: string) {
    const control = this.message.controls[name];
    if (!control.errors && control.touched) {
        return true;
    } else {
      return false;
    }
  }

  public checkValidError(name: string) {
    const control = this.message.controls[name];
    if (control.errors && control.touched) {
        return true;
    } else {
      return false;
    }
  }

  public close() {
    const data = { ...this.modalData };
    data.vissible = false;
    this.modalManageService.update(0, data);
  }

  public send() {
    if (this.message.value.message === '') {
      swal.fire('Wysłanie wiadomości', 'Pole z wiadomością nie może być puste', 'error');
      this.activeInputs();
      return;
    } else {
      const { subject, message } = this.message.value;
      const { email, admin } = this.modalData;
      const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      const customers = this.layoutManageService.customersData.getValue();
      const customer = customers.find(c => c.email === email);
      const data: Message = { message, subject, admin, date};
      const messages: Array<Message> = customer.messages ? [...customer.messages, data] : [data];

      customer.messages = messages;
      this.firebaseService.getDataBaseRef('customers').set(customers)
        .then(() => {
          this.close();
          swal.fire('Wysłanie wiadomości', 'Wiadomość zostałą wysłana pomyślnie', 'success');
        });
    }
  }

  public activeInputs(): void {
    // tslint:disable-next-line:forin
    for (const inner in this.message.controls) {
      this.message.get(inner).markAsTouched();
      this.message.get(inner).updateValueAndValidity();
    }
  }

}
