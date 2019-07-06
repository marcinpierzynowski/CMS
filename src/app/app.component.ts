import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selector;
  alreadySelector = 1;
  clickDeleteSpam;

  constructor() {
  }
}
