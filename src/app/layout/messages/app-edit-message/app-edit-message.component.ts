import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MessagesManageService } from 'src/app/services/messages-manage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from 'src/app/models/model';

import swal from 'sweetalert2';
import { fadeInOutTranslate } from '../../../../shared/animations/animation';

@Component({
  selector: 'app-app-edit-message',
  templateUrl: './app-edit-message.component.html',
  styleUrls: ['./app-edit-message.component.css'],
  animations: [fadeInOutTranslate],
  providers: [MessagesManageService]
})
export class AppEditMessageComponent implements OnInit {
  public message: Message;
  public id: number;

  constructor(
    private firebaseService: FirebaseService,
    private messageManageService: MessagesManageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = +this.route.snapshot.params['id'];
    this.messageManageService.messageData.subscribe(msgs => {
      if (msgs) {
        this.message = msgs.find(msg => msg.id === this.id);
        if (this.message) {
          this.isRead();
        }
      }
    });
  }

  public isRead(): void {
    if (this.message.read === false) {
      const index = this.messageManageService.messageData.getValue().findIndex(msg => msg.id === this.id).toString();
      this.firebaseService.getDataBaseRef('messages').child(index).child('read').set(true);
    }
  }

  public deleteMessage(): void {
    swal.fire({
      title: 'Usunięcie Wiadomości',
      text: 'Czy jesteś pewny że chcesz usunąć wiadomość?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then(result => {
      if (result.value) {
       const msgs = this.messageManageService.messageData.getValue().filter(msg => msg.id !== this.id);
       this.firebaseService.getDataBaseRef('messages').set(msgs)
        .then(() => {
          swal.fire('Usunięcie wiadomości', 'Wiadomość została usunięta!', 'success')
            .then(() => this.router.navigate(['../']));
        });
      }
    });
  }

  public back(): void {
    this.router.navigate(['../']);
  }

}
