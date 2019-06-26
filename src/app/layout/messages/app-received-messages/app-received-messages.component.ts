import { Component, OnInit } from "@angular/core";

import { fadeInOutTranslate } from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import swal from "sweetalert2";

@Component({
  selector: "app-app-received-messages",
  templateUrl: "./app-received-messages.component.html",
  styleUrls: [
    "./app-received-messages.component.css",
    "../../../../assets/styles-custom/spinner2-style.css"
  ],
  animations: [fadeInOutTranslate]
})
export class AppReceivedMessagesComponent implements OnInit {
  refAuthorizationUser;
  checkOnUid;
  authorizationMessages: boolean = true;
  checkAuthorized: boolean;

  refMessages = this.firebaseService
    .firebase
    .database()
    .ref("messages");

  detailMessages = [];

  valueEmail = "";
  valueData = "";
  copyMessages = [];
  editMessages = -1;

  vissibleMessage: boolean;
  messageData = {
    email: null,
    description: null,
    data: null
  };

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
  }

  getMessages() {
    this.refMessages.on("value", this.downloadMessages.bind(this), this.err);
  }

  downloadMessages(data) {
    let scores = data.val();
    if (!scores) {
      this.detailMessages = null;
      this.copyMessages = null;
      return;
    }
    let keys = Object.keys(scores);
    let allScore = [];

    for (let i = 0; i < keys.length; i++) {
      allScore.push(scores[keys[i]]);
    }

    this.detailMessages = allScore;
    this.copyMessages = allScore.slice();
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
      this.detailMessages = this.copyMessages.filter(data => {
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
      email: this.detailMessages[index].email,
      description: this.detailMessages[index].description,
      data: this.detailMessages[index].data
    };
    this.editMessages = index;
    this.vissibleMessage = true;
  }

  deleteMessage(index) {
    if(index === -1) {
      index = this.editMessages;
    }
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
        this.detailMessages.splice(index, 1);
        this.refMessages
          .set(this.detailMessages)
          .then(() => {
            swal({
              type: "success",
              title: "Usunięcie wiadomości",
              text: "Wiadomość została pomyślnie usunięta"
            });
            if(this.vissibleMessage) {
              this.vissibleMessage = false;
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }
}
