import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { NotificationsManageService } from 'src/app/services/notifications-manage.service';
import { Reviews } from 'src/app/models/notification.model';
import { FormGroup, FormControl } from '@angular/forms';

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
  public limit = 5;
  public filter: FormGroup;

  private time;

  constructor(
    private firebaseService: FirebaseService,
    private notificationsManageService: NotificationsManageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.notificationsManageService.reviewsData.subscribe(coms => {
      if (coms) {
        this.reviews = coms.slice().reverse();
        this.cpReviews = coms.slice().reverse();
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

  public showReview(message): void {
    swal.fire({
      type: 'info',
      title: 'Opinia',
      text: message
    });
  }

  public deleteReview(id: number): void {
    swal.fire({
      title: 'Usunięcie Opinii',
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
      } else {
        swal.fire('Usunięcie Opinii', 'Opinia nadal jest.', 'info');
      }
    });
  }

  public showAll(): void {
    this.limit = this.cpReviews.length;
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
      this.cpReviews = this.reviews.filter(c => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
          if (inputs[keys[i]] !== '' && c[keys[i]].toLowerCase()
            .includes(inputs[keys[i]].toLowerCase()) === false) {
            return false;
          }
        }
        return true;
      });
      this.time = null;
    }, 500);
  }
}
