import { Component, OnInit } from '@angular/core';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

import { LayoutManageService } from 'src/app/services/layout-manage.service';

import swal from 'sweetalert2';
import { Admin } from 'src/app/models/admin.model';

@Component({
  selector: 'app-list-users',
  templateUrl: './app-list-admins.component.html',
  styleUrls: ['./app-list-admins.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppListAdminsComponent implements OnInit {
  public admins: Array<Admin>;
  public image = [];

  private email: string;
  private user: Admin;

  constructor(private layoutManageService: LayoutManageService) {}

  ngOnInit(): void {
    this.email = this.layoutManageService.emailData.getValue();

    this.layoutManageService.adminsData.subscribe((admins => {
      this.admins = admins.filter(admin => admin.email !== this.email);
      this.user = admins.find(admin => admin.email === this.email);
      this.prepareRandomImage();
    }));
  }

  public generateSwalWaitingFromRequest(type, title, text): void {
    swal.fire({
      type,
      title,
      text,
      allowOutsideClick: false,
      onBeforeOpen: () => {
        const content = swal.getContent();
        const $ = content.querySelector.bind(content);
        swal.showLoading();
      }
    });
  }

  public prepareRandomImage(): void {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.admins.length; i++) {
      const value = Math.floor(Math.random() * 10) + 1;
      this.image.push(value);
    }
  }
}
