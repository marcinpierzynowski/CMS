import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { NotificationsManageService } from 'src/app/services/notifications-manage.service';
import { Reviews } from 'src/app/models/notification.model';

@Component({
  selector: 'app-reviews',
  templateUrl: './app-reviews.component.html',
  styleUrls: ['./app-reviews.component.css'],
  providers: [NotificationsManageService],
  animations: [fadeInOutTranslate]
})
export class AppReviewsComponent implements OnInit {
  public reviews: Array<Reviews>;
  public cpReviews: Array<Reviews>;
  public rate = '';
  public date = '';

  constructor(
    private firebaseService: FirebaseService,
    private notificationsManageService: NotificationsManageService
    ) {}

  ngOnInit(): void {
    this.notificationsManageService.reviewsData.subscribe(coms => {
      this.reviews = coms;
      if (coms) {
        this.cpReviews = coms.slice();
      }
    });
  }

  public filterData(): void {
    // tslint:disable-next-line:one-variable-per-declaration
    const r = this.rate, d = this.date;
    const inpVal = [r, d];
    const keys = ['rate', 'date'];

    this.cpReviews = this.reviews.filter((com) => {
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < inpVal.length; i++) {
        if (inpVal[i] !== '' && com[keys[i]].toLowerCase().includes(inpVal[i].toLowerCase()) === false) {
         return false;
        }
      }
      return true;
    });

    // if all inputs empty
    if (!inpVal.find(el => el !== '')) {
      this.cpReviews = this.reviews.slice();
    }
  }

  public showReview(message): void {
    swal.fire({
      type: 'info',
      title: 'Opinia',
      text: message
    });
  }

  public deleteComment(id: number): void {
    swal.fire({
      title: 'Usunięcie Opinię',
      text: 'Czy jesteś pewny że chcesz usunąć opinię?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        const coms: Array<Reviews> = this.reviews.filter(com => com.id !== id);
        this.firebaseService.getDataBaseRef('reviews').set(coms)
          .then(() => swal.fire('Usunięcie Opinii', 'Opinia została usunięta', 'success'));
      }
    });
  }
}
