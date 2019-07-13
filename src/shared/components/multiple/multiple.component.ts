import { Component, OnInit, Input } from '@angular/core';

interface Data {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-multiple',
  templateUrl: './multiple.component.html',
  styleUrls: ['./multiple.component.css']
})
export class MultipleComponent implements OnInit {
  public text = 'Wybierz opcje';
  public vissible = false;
  public vissibleText = true;
  public listSelected = [];

  @Input() list: Array<Data>;

  constructor() { }

  ngOnInit(): void {
  }

  public select(index: number) {
    const list = this.list[index];
    list.selected = !list.selected;
    this.vissibleText = false;

    this.listSelected = this.list.filter(l => l.selected);

    if (this.listSelected.length === 0) {
      this.vissibleText = true;
    }
  }

  public active(e): void {
    this.vissible = true;
    e.focus();
  }

  public show(): void {
    this.vissible = true;
  }

  public hide(): void {
    this.vissible = false;
  }

}
