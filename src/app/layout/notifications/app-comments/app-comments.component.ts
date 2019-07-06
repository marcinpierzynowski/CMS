import { Component, OnInit } from '@angular/core';

import { fadeInOutTranslate } from '../../../../shared/animations/animation';
import { FirebaseService } from '../../../services/firebase.service';

import swal from 'sweetalert2';
import { NotificationsManageService } from 'src/app/services/notifications-manage.service';
import { Comment } from 'src/app/models/model';

@Component({
  selector: 'app-app-comments',
  templateUrl: './app-comments.component.html',
  styleUrls: [
    './app-comments.component.css',
    '../../../../assets/styles-custom/spinner2-style.css'
  ],
  providers: [NotificationsManageService],
  animations: [fadeInOutTranslate]
})
export class AppCommentsComponent implements OnInit {
  public comments: Array<Comment>;
  public cpComments: Array<Comment>;
  public rate = '';
  public date = '';

  constructor(
    private firebaseService: FirebaseService,
    private notificationsManageService: NotificationsManageService
    ) {}

  ngOnInit(): void {
    this.notificationsManageService.commentsData.subscribe(coms => {
      this.comments = coms;
      if (coms) {
        this.cpComments = coms.slice();
      }
    });
  }

  public filterData(): void {
    const r = this.rate, d = this.date;
    const inpVal = [r, d];
    const keys = ['rate', 'date'];

    this.cpComments = this.comments.filter((com) => {
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
      this.cpComments = this.comments.slice();
    }
  }

  public showComments(message): void {
    swal.fire({
      type: 'info',
      title: 'Komentarz',
      text: message
    });
  }

  public deleteComment(id: number): void {
    swal.fire({
      title: 'Usunięcie Komentarza',
      text: 'Czy jesteś pewny że chcesz usunąć komentarz?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
        const coms = this.comments.filter(com => com.id !== id);
        this.firebaseService.getDataBaseRef('comments').set(coms)
          .then(() => swal.fire('Usunięcie Komentarza', 'Komentarz został usunięty', 'success'));
      }
    });
  }
}
