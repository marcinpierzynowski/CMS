import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../../../services/firebase.service';
import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { ModalManageService } from 'src/app/services/modal-manage.service';
import { Customer } from 'src/app/models/customer.model';

import swal from 'sweetalert2';

@Component({
  selector: 'app-app-list-customers',
  templateUrl: './app-list-customers.component.html',
  styleUrls: ['./app-list-customers.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppListCustomersComponent implements OnInit {
  public customers: Array<Customer>;
  public copyCustomers: Array<Customer>;
  public image = [];
  public limit = 5;
  public filter: FormGroup;

  private time = null;

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService,
    private modalManageService: ModalManageService
  ) { }

  ngOnInit(): void {
    this.layoutManageService.customersData.subscribe(c => {
      if (c) {
        this.customers = c.reverse();
        this.copyCustomers = c.slice().reverse();
        this.initForm();
      }
    });
  }

  public initForm(): void {
    this.filter = new FormGroup({
      email: new FormControl(''),
      name: new FormControl(''),
      surname: new FormControl(''),
      address: new FormControl(''),
      contact: new FormControl('')
    });
  }

  public showAll(): void {
    this.limit = this.customers.length;
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public filterData(): void {
    const inputs = this.filter.value;
    const keys = ['email', 'name', 'surname', 'address', 'contact'];

    if (this.time) {
      clearTimeout(this.time);
      this.time = null;
    }

    this.time = setTimeout(() => {
      this.limit = 5;
      this.copyCustomers = this.customers.filter(c => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
           if (inputs[keys[i]] !== '' && c[keys[i]].toLowerCase()
              .includes(inputs[keys[i]].toLowerCase()) === false) {
             return false;
            }
        }
        return true;
      });
      this.time = null;
    }, 500);
  }

  public deleteUser(email: string): void {
    swal.fire({
      title: 'Usunięcie klienta',
      text: 'Czy jesteś pewny że chcesz usunąć użytkownika?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        const customers = this.customers.filter(c => c.email !== email);
        this.firebaseService.getDataBaseRef('customers').set(customers)
          .then(() => swal.fire('Usunięcie klienta', 'Klient został pomyślnie usunięty', 'success'));
      }
    });
  }

  public showModalMessage(em: string) {
    const admin = this.layoutManageService.emailData.getValue();
    const customer: Customer = this.customers.find(c => c.email === em);
    const { imageUrl, email, name, surname, address, contact } = customer;
    const data = {
      vissible: true, imageUrl, email, name, surname, address, contact, admin
    };
    this.modalManageService.update(0, data);
  }

}
