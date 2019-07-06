import { Component, OnInit } from '@angular/core';
import { CurrentPageService } from 'src/app/services/current-page.service';

@Component({
  selector: 'app-current-page',
  templateUrl: './current-page.component.html',
  styleUrls: ['./current-page.component.css']
})
export class CurrentPageComponent implements OnInit {
  public iconClass: string;
  public urlText: string;

  constructor(private currentPageService: CurrentPageService) { }

  ngOnInit() {
    this.currentPageService.iconClass.subscribe(i => this.iconClass = i);
    this.currentPageService.urlText.subscribe(c => this.urlText = c);
  }

}
