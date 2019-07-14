import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

import { FirebaseService } from '../../../services/firebase.service';
import { LayoutManageService } from 'src/app/services/layout-manage.service';

import swal from 'sweetalert2';
import { Customer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-app-list-customers',
  templateUrl: './app-list-customers.component.html',
  styleUrls: ['./app-list-customers.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppListCustomersComponent implements OnInit {
  public customers: Array<Customer>;
  public image = [];
  public limit = 5; // TODO zmienic

  constructor(
    private firebaseService: FirebaseService,
    private layoutManageService: LayoutManageService
  ) { }

  ngOnInit(): void {
    this.layoutManageService.customersData.subscribe(c => {
      this.customers = c;
    });
  }

  public showAll(): void {

  }

}
