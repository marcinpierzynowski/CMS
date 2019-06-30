import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';

import { NotificationsManageService } from 'src/app/services/notifications-manage.service';
import { Evaluation } from 'src/app/models/model';

@Component({
  selector: 'app-app-evaluation',
  templateUrl: './app-evaluation.component.html',
  styleUrls: [
    './app-evaluation.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  providers: [NotificationsManageService],
  animations: [fadeInOutTranslate]
})
export class AppEvaluationComponent implements OnInit {
  public evaluations: Array<Evaluation>;
  public cpEvaluations: Array<Evaluation>;
  public rate = '';
  public date = '';

  constructor(
    private notificationsManageService: NotificationsManageService
    ) {}

  ngOnInit(): void {
    this.notificationsManageService.evaluationsData.subscribe(evals => {
      this.evaluations = evals;
      if (evals) {
        this.cpEvaluations = evals.slice();
      }
    });
  }

  public filterData(): void {
    const r = this.rate, d = this.date;
    const inpVal = [r, d];
    const keys = ['rate', 'date'];

    this.cpEvaluations = this.evaluations.filter((com) => {
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < inpVal.length; i++) {
        if (inpVal[i] !== '' && com[keys[i]].toString().toLowerCase().includes(inpVal[i].toString().toLowerCase()) === false) {
         return false;
        }
      }
      return true;
    });

    // if all inputs empty
    if (!inpVal.find(el => el !== '')) {
      this.cpEvaluations = this.evaluations.slice();
    }
  }
}
