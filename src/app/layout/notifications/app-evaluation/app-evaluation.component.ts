import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';

import { NotificationsManageService } from 'src/app/services/notifications-manage.service';
import { Evaluation } from 'src/app/models/notification.model';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-evaluation',
  templateUrl: './app-evaluation.component.html',
  styleUrls: ['./app-evaluation.component.css'],
  providers: [NotificationsManageService],
  animations: [fadeInOutTranslate]
})
export class AppEvaluationComponent implements OnInit {
  public evaluations: Array<Evaluation>;
  public cpEvaluations: Array<Evaluation>;
  public limit = 5;
  public filter: FormGroup;
  public stars: Array<Array<string>> = [];

  private time: any;


  constructor(
    private notificationsManageService: NotificationsManageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.notificationsManageService.evaluationsData.subscribe(evals => {
      if (evals) {
        this.evaluations = evals.slice().reverse();
        this.cpEvaluations = evals.slice().reverse();
        this.prepareStar();
      }
    });
  }

  public initForm(): void {
    this.filter = new FormGroup({
      email: new FormControl(''),
      ref: new FormControl(''),
      date: new FormControl('')
    });
  }

  public showAll(): void {
    this.limit = this.cpEvaluations.length;
  }

  public setLimit(): void {
    this.limit += 5;
  }

  public filterData(): void {
    const inputs = this.filter.value;
    const keys = ['email', 'ref', 'date'];

    if (this.time) {
      clearTimeout(this.time);
      this.time = null;
    }

    this.time = setTimeout(() => {
      this.limit = 5;
      this.cpEvaluations = this.evaluations.filter(c => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
          if (inputs[keys[i]] !== '' && c[keys[i]].toLowerCase()
            .includes(inputs[keys[i]].toLowerCase()) === false) {
            return false;
          }
        }
        return true;
      });
      this.prepareStar();
      this.time = null;
    }, 500);
  }

  public prepareStar(): void {
    if (this.stars.length > 0) {
      this.stars = [];
    }

    this.cpEvaluations.forEach(evl => {
      const evalFloat = evl.rate;
      const evalInt = Math.floor(evl.rate);
      const stars = new Array(5);

      for (let i = 0; i < 5; i++) {
        if (evalInt >= i + 1) {
          stars[i] = 'fas fa-star';
        } else if (evalFloat + 1 > i + 1) {
          stars[i] = 'fas fa-star-half-alt';
        } else {
          stars[i] = 'far fa-star';
        }
      }

      this.stars.push(stars);
    });
  }

}
