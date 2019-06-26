import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-app-not-found',
  templateUrl: './app-not-found.component.html',
  styleUrls: ['./app-not-found.component.css']
})
export class AppNotFoundComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  backToHome() {
    this.router.navigate(["/"]);
  }

}
