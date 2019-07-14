import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

import { FirebaseService } from '../../../services/firebase.service';
import { LayoutManageService } from 'src/app/services/layout-manage.service';

import swal from 'sweetalert2';
import { Customer } from 'src/app/models/customer.model';
import { FormGroup, FormControl } from '@angular/forms';
import { IfStmt } from '@angular/compiler';

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
  public limit = 5; // TODO zmienic
  public filter: FormGroup;

  private time = null;

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService
  ) { }

  ngOnInit(): void {
    this.layoutManageService.customersData.subscribe(c => {
      this.customers = c;
      if (c) {
        this.copyCustomers = c.filter((cp, i) => i < this.limit);
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
    this.copyCustomers = [...this.customers];
  }

  public setLimit(): void {
    this.limit += 5;
    this.copyCustomers = this.customers.filter((c, i) => i < this.limit);
  }

  public filterData(): void {
    const inputs = this.filter.value;
    const keys = ['email', 'name', 'surname', 'address', 'contact'];

    if (this.time) {
      clearTimeout(this.time);
      this.time = null;
    }

    this.time = setTimeout(() => {
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

}
