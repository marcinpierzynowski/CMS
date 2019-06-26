import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LayoutManageService } from 'src/app/services/layout-manage.service';
import { Admin } from 'src/app/models/model';

import { fadeInOutTranslate } from '../../../shared/animations/animation';

@Component({
  selector: 'app-app-dashboard',
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.css'],
  animations: [fadeInOutTranslate]
})
export class AppDashboardComponent implements OnInit {
  public user: Admin;
  public visibleNotificationSecurity: boolean = true;

  constructor(
    private router: Router,
    private layoutManageService: LayoutManageService
  ) {}

  ngOnInit() {
    this.layoutManageService.emailData.subscribe((email) => {
      if (email) {
        this.layoutManageService.adminsData.subscribe(admins =>
          this.user = admins.find(admin => admin.email === email)
        );
      }
    });
  }

  public goToSection(url): void {
    this.router.navigate([url]);
  }
}
