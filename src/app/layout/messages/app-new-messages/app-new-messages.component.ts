import { Component, OnInit } from "@angular/core";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-new-messages",
  templateUrl: "./app-new-messages.component.html",
  styleUrls: [
    "./app-new-messages.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppNewMessagesComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationMessages: boolean = true;
  checkAuthorized: boolean;

  vissibleMessage: boolean;
  messageData = {
    email: null,
    description: null,
    data: null
  };

  keys = [];

  refUserMessages = this.firebaseService
    .firebase
    .database()
    .ref("messages-users");
  refMessages = this.firebaseService
    .firebase
    .database()
    .ref("messages");

  detailUserMessages = [];
  detailMessages = [];

  valueEmail = "";
  valueData = "";
  copyMessages = [];

  editMessages = -1;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
  }

  getUserMessages() {
    this.refUserMessages.on(
      "value",
      this.downloadUserMessages.bind(this),
      this.err
    );
  }

  downloadUserMessages(data) {
    let scores = data.val();

    if (!scores) {
      this.detailUserMessages = null;
      this.copyMessages = null;
      return;
    }
    let keys = Object.keys(scores);
    let allScore = [];
    this.keys = keys;

    for (let i = 0; i < keys.length; i++) {
      allScore.push(scores[keys[i]]);
    }

    this.detailUserMessages = allScore;
    this.copyMessages = allScore.slice();
  }

  getMessages() {
    this.refMessages.on("value", this.downloadMessages.bind(this), this.err);
  }

  downloadMessages(data) {
    let scores = data.val();
    if (!scores) {
      this.detailMessages = null;
      return;
    }
    let keys = Object.keys(scores);
    let allScore = [];

    for (let i = 0; i < keys.length; i++) {
      allScore.push(scores[keys[i]]);
    }

    this.detailMessages = allScore;
  }

  err(error) {
    console.log(error);
  }

  setFilterEmail(value) {
    this.valueEmail = value;
    this.filterMessages();
  }

  setFilterData(value) {
    this.valueData = value;
    this.filterMessages();
  }

  filterMessages() {
    if (this.copyMessages) {
      this.detailUserMessages = this.copyMessages.filter(data => {
        if (this.valueEmail === "" && this.valueData === "") {
          return true;
        } else {
          if (
            (this.valueEmail !== "" &&
              !data.email
                .toLowerCase()
                .includes(this.valueEmail.toLowerCase())) ||
            (this.valueData !== "" &&
              !data.data.toLowerCase().includes(this.valueData.toLowerCase()))
          ) {
            return false;
          }
          return true;
        }
      });
    }
  }

  editMessage(index) {
    this.messageData = {
      email: this.detailUserMessages[index].email,
      description: this.detailUserMessages[index].description,
      data: this.detailUserMessages[index].data
    };

    this.editMessages = index;
    this.vissibleMessage = true;
  }

  deleteMessage(index) {
    swal({
      title: "Usunięcie Wiadomości",
      text: "Czy jesteś pewny że chcesz usunąć wiadomość?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tak",
      cancelButtonText: "Nie"
    }).then(result => {
      if (result.value) {
        this.refUserMessages
          .child(this.keys[index])
          .remove()
          .then(() => {
            swal({
              type: "success",
              title: "Usunięcie wiadomości",
              text: "Wiadomość została pomyślnie usunięta"
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }

  saveMessage() {

    if (this.detailMessages) {
      this.detailMessages.push(this.detailUserMessages[this.editMessages]);
      this.refMessages
        .set(this.detailMessages)
        .then(() => {
          this.deleteMessageAfterAdd();
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      this.detailMessages = [
        {
          email: this.detailUserMessages[this.editMessages].email,
          data: this.detailUserMessages[this.editMessages].data,
          description: this.detailUserMessages[this.editMessages].description
        }
      ];

      this.refMessages
        .set(this.detailMessages)
        .then(() => {
          this.deleteMessageAfterAdd();
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  deleteMessageAfterAdd() {
    this.refUserMessages
      .child(this.keys[this.editMessages])
      .remove()
      .then(() => {
        swal({
          type: "success",
          title: "Dodanie wiadomości",
          text: "Wiadomość została pomyślnie dodana"
        });
        this.vissibleMessage = false;
      })
      .catch(error => {
        console.log(error);
      });
  }
}
