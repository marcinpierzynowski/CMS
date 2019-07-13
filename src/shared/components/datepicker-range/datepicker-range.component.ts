import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface Week {
  week: Array<Day>;
}

export interface Day {
  current?: boolean;
  date: Date;
  dateFrom?: boolean;
  dateTo?: boolean;
  betweenPrevNext?: boolean;
}

@Component({
  selector: 'app-datepicker-range',
  templateUrl: './datepicker-range.component.html',
  styleUrls: ['./datepicker-range.component.css']
})
export class DatepickerRangeComponent implements OnInit {

  public readonly allDaysWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public leftCalWeeks: Array<Week>;
  public rightCalWeeks: Array<Week> = null;
  public leftCalDate: Date = new Date();
  public rightCalDate: Date = new Date(this.leftCalYear, this.leftCalMonth + 1, 1);
  public dateFrom: Date = null;
  public dateTo: Date = null;

  @Output()
  setDate = new EventEmitter();

  @Output()
  toggleCalendar = new EventEmitter();

  @Output()
  clearCalendar = new EventEmitter();

  @Input()
  curDateFrom;

  @Input()
  curDateTo;

  constructor(private datePipe: DatePipe) { }

  ngOnInit() {
    if (this.curDateFrom) {
      const date = new Date(this.curDateFrom);
      this.dateFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this.leftCalDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this.rightCalDate = new Date(this.leftCalYear, this.leftCalMonth + 1, 1);
    } else {
      this.dateFrom = new Date(this.leftCalYear, this.leftCalMonth, this.leftCalDate.getDate());
    }

    if (this.curDateTo) { this.dateTo = new Date(this.curDateTo); }

    this.leftCalWeeks = this.generateDays(this.leftCalDate, this.leftCalYear, this.leftCalMonth);
    this.rightCalWeeks = this.generateDays(this.rightCalDate, this.rightCalYear, this.rightCalMonth);
  }

  get leftCalYear(): number { return this.leftCalDate.getFullYear(); }

  get leftCalMonth(): number { return this.leftCalDate.getMonth(); }

  get rightCalYear(): number { return this.rightCalDate.getFullYear(); }

  get rightCalMonth(): number { return this.rightCalDate.getMonth(); }

  public amountDaysInMounth(year: number, month: number): number { return new Date(year, month + 1, null).getDate(); }

  public firstDayInMounth(year: number, month: number): number { return new Date(year, month, 1).getDay(); }

  public generateDays(date: Date, year: number, month: number): Array<Week> {
    const amountDays = this.amountDaysInMounth(date.getFullYear(), date.getMonth());
    const firstDayMonth = this.firstDayInMounth(date.getFullYear(), date.getMonth());
    const cells = this.checkEmptyCells(amountDays + firstDayMonth);
    const calWeek = [];
    let afterDays = 1;

    if (firstDayMonth !== 0) { calWeek.push(...this.generateBeforeEmptyCells(date, firstDayMonth)); }
    const length = calWeek.length;

    for (let day = 0; day < cells - length; day++) {
      if (day + 1 > amountDays) { // Generate After Empty Cells
        calWeek.push({ date: new Date(year, month + 1, afterDays++), } as Day);
      } else {
        calWeek.push({
          current: true,
          date: new Date(year, month, day + 1),
          dateFrom: this.checkChosen(new Date(year, month, day + 1), this.dateFrom),
          dateTo: this.checkChosen(new Date(year, month, day + 1), this.dateTo),
          betweenPrevNext: this.checkBetweenRange(new Date(year, month, day + 1))
        } as Day);
      }
    }
    return this.divideDays(calWeek);
  }

  public generateBeforeEmptyCells(date: Date, amountDay: number): Array<Week> {
    const calDate = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const amountDays = this.amountDaysInMounth(year, month - 1);

    for (let day = 0; day < amountDay; day++) {
      calDate.push({ date: new Date(year, month - 1, amountDays - day), } as Day);
    }
    return calDate.reverse();
  }

  public divideDays(calDates: Array<Day>): Array<Week> {
    const calWeeks: Array<Week> = [];

    for (let i = 0; i < calDates.length; i++) {
      if (i % 7 === 0) { calWeeks.push({ week: [] }); }
      calWeeks[calWeeks.length - 1].week.push(calDates[i]);
    }
    return calWeeks;
  }

  public checkEmptyCells(cells: number): number {
    while (true) {
      if (cells % 7 === 0) { return cells; }
      cells++;
    }
  }

  public checkBetweenRange(date: Date): boolean {
    if (this.dateTo === null) { return false; }

    if (this.checkChosen(date, this.dateFrom) === true || this.checkChosen(date, this.dateFrom) === true) {
      return false;
    }
    if (date.getTime() > this.dateFrom.getTime() && date.getTime() < this.dateTo.getTime()) {
      return true;
    }
    return false;
  }

  public checkChosen(date: Date, chosen: Date): boolean {
    if (chosen === null) { return false; }

    if (date.getFullYear() === chosen.getFullYear() && date.getMonth() === chosen.getMonth()
      && date.getDate() === chosen.getDate()) {
      return true;
    }
    return false;
  }

  public choseDayCal(day: Day, calendar: string): void {
    const date = day.date;
    const year = day.date.getFullYear();
    const month = day.date.getMonth();

    if (date.getTime() < this.dateFrom.getTime() || this.dateTo !== null) {
      this.dateTo = null;
      this.dateFrom = date;

      if (calendar === 'left') {
        this.prepareDaysAfterClickLeftCalendar(date, year, month);
      } else {
        this.prepareDaysAfterClickRightCalendar(date, year, month);
      }

    } else if (date.getTime() >= this.dateFrom.getTime()) {
      this.dateTo = date;

      if (calendar === 'left') {
        this.prepareDaysAfterClickLeftCalendar(date, year, month);
      } else {
        this.prepareDaysAfterClickRightCalendar(date, year, month);
      }
    }
  }

  public prepareDaysAfterClickLeftCalendar(date: Date, year: number, month: number): void {
    this.checkClickDaysAfterInMonth(date, 'left');
    this.leftCalWeeks = this.generateDays(date, year, month);
    this.rightCalDate = new Date(year, month + 1, 1);
    this.rightCalWeeks = this.generateDays(this.rightCalDate, year, month + 1);
  }

  public prepareDaysAfterClickRightCalendar(date: Date, year: number, month: number): void {
    this.checkClickDaysAfterInMonth(date, 'right');
    this.rightCalWeeks = this.generateDays(date, year, month);
    this.leftCalDate = new Date(year, month - 1, 1);
    this.leftCalWeeks = this.generateDays(this.leftCalDate, year, month - 1);
  }

  public checkClickDaysAfterInMonth(data: Date, calendar: string): void {
    const year = data.getFullYear();
    const month = data.getMonth();

    if (calendar === 'left') {
      if (data.getMonth() > this.leftCalMonth) { this.leftCalDate = new Date(year, month, 1); }
      if (data.getMonth() < this.leftCalMonth) { this.leftCalDate = new Date(year, month, 1); }
    } else {
      if (data.getMonth() > this.rightCalMonth) { this.rightCalDate = new Date(year, month, 1); }
      if (data.getMonth() < this.rightCalMonth) { this.rightCalDate = new Date(year, month, 1); }
    }
  }

  public onClickPrevMonth(): void {
    const year = this.leftCalYear;
    const month = this.leftCalMonth;

    this.leftCalDate = new Date(year, month - 1, 1);
    this.leftCalWeeks = this.generateDays(this.leftCalDate, year, month - 1);
    this.rightCalDate = new Date(year, month, 1);
    this.rightCalWeeks = this.generateDays(this.rightCalDate, year, month);
  }

  public onClickNextMonth(): void {
    const year = this.leftCalYear;
    const month = this.leftCalMonth;

    this.leftCalDate = new Date(year, month + 1, 1);
    this.leftCalWeeks = this.generateDays(this.leftCalDate, year, month + 1);
    this.rightCalDate = new Date(year, month + 2, 1);
    this.rightCalWeeks = this.generateDays(this.rightCalDate, year, month + 2);
  }

  public onClickSubmit(): void {
    this.toggleCalendar.emit();
    const from = this.datePipe.transform(this.dateFrom, 'yyyy-MM-dd');
    const to = this.datePipe.transform(this.dateTo, 'yyyy-MM-dd');
    this.setDate.emit([from, to]);
  }

  public onClickCancel(): void {
    this.clearCalendar.emit();
  }

}
