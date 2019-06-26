import { Component, OnInit, Renderer2 } from "@angular/core";
import {
  fadeInOutTranslate,
  fadeInDown,
  fadeOutUp
} from "../../../../shared/animations/animation";
import { FirebaseService } from "../../../services/firebase.service";

import Swal from "sweetalert2";

@Component({
  selector: "app-app-my-profil",
  templateUrl: "./app-my-profil.component.html",
  styleUrls: ["./app-my-profil.component.css"],
  animations: [fadeInOutTranslate, fadeInDown, fadeOutUp]
})
export class AppMyProfilComponent implements OnInit {
  checkFromUid: any;
  user: any; // user detail //
  copyUser: any; // copy when filter data //
  logins: any; // number of logins //
  products: any; // numer of products add //
  users: any; // numer of users //

  /* Copy Variables */

  textCopy: any; // global copy category with tab //
  tabCopy: any; // global copy text with tab
  visibleClipboardCopy: boolean;

  /*---------------*/

  /* Filter Variables */

  valueName: any = "";
  valueDate: any = "";
  valueTime: any = "";
  valueIp: any = "";

  /*-----------------*/

  constructor(private firebaseService: FirebaseService, private renderer: Renderer2) {

  }

  ngOnInit() {
  }

  getDetail(uid) {
    let refUserDetail = this.firebaseService
      .firebase
      .database()
      .ref("admins")
      .child(uid);
    refUserDetail.on("value", this.donwloadDetailUser, this.err);
  }

  donwloadDetailUser = data => {
    let scores = data.val();
    this.user = scores;
    this.setViewDataLoginProductsClients(scores);
  };

  err(err) {
    console.log(err);
  }

  setViewDataLoginProductsClients(scores) {
    if (scores.history) {
      this.copyUser = this.user.history.slice();
      this.logins = scores.history.filter(score => {
        if (score.name === "Logowanie") {
          return true;
        }
        return false;
      });

      this.products = scores.history.filter(score => {
        if (score.name === "Produkt") {
          return true;
        }
        return false;
      });

      this.users = scores.history.filter(score => {
        if (score.name === "Użytkownik") {
          return true;
        }
        return false;
      });

      this.logins = this.logins.length;
      this.products = this.products.length;
      this.users = this.users.length;
    } else {
      this.logins = 0;
      this.products = 0;
      this.users = 0;
    }
    this.filterData();
  }

  /* Filter Functions */

  setFilterName(value) {
    this.valueName = value;
    this.filterData();
  }

  setFilterDate(value) {
    this.valueDate = value;
    this.filterData();
  }

  setFilterTime(value) {
    this.valueTime = value;
    this.filterData();
  }

  setFilterIp(value) {
    this.valueIp = value;
    this.filterData();
  }

  filterData() {
    if (this.copyUser) {
      this.user.history = this.copyUser.filter(data => {
        if (
          this.valueName === "" &&
          this.valueDate === "" &&
          this.valueTime === "" &&
          this.valueIp === ""
        ) {
          return true;
        } else {
          if (
            (this.valueName !== "" &&
              !data.name
                .toLowerCase()
                .includes(this.valueName.toLowerCase())) ||
            (this.valueDate !== "" &&
              !data.data
                .toLowerCase()
                .includes(this.valueDate.toLowerCase())) ||
            (this.valueTime !== "" &&
              !data.time
                .toLowerCase()
                .includes(this.valueTime.toLowerCase())) ||
            (this.valueIp !== "" &&
              data.ip.toLowerCase().includes(this.valueIp.toLowerCase()))
          ) {
            return false;
          }
          return true;
        }
      });
    }
  }

  /*-----------------*/

  showMeIp() {
    const ipAPI = "https://api.ipify.org?format=json";

    Swal.queue([
      {
        title: "Your public IP",
        confirmButtonText: "Show my public IP",
        text: "Your public IP will be received " + "via AJAX request",
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return fetch(ipAPI)
            .then(response => response.json())
            .then(data => Swal.insertQueueStep(data.ip))
            .catch(() => {
              Swal.insertQueueStep({
                type: "error",
                title: "Unable to get your public IP"
              });
            });
        }
      }
    ]);
  }

  copy(tab, text) {
    this.tabCopy = tab;
    this.textCopy = text;
    this.visibleClipboardCopy = true;
    if (timeClipboard) {
      clearTimeout(timeClipboard);
    }
    timeClipboard = setTimeout(() => {
      this.visibleClipboardCopy = false;
    }, 3000);
  }

  highlight(value, valueFilter) {
    if(!valueFilter) return value;
    let indexFilterValue = value.toLowerCase().search(valueFilter.toLowerCase());
    let lengthTextFilter = valueFilter.length;
    let template = '';

    for(let i = 0; i < value.length; i++) {
      if(i === indexFilterValue) {
        template += '<span class="mark-target">' + value.substr(indexFilterValue, valueFilter.length);
        if(i + lengthTextFilter === value.length) {
          template += '</span>';
        }
      } else if(i > indexFilterValue + lengthTextFilter - 1 || i < indexFilterValue) {
        if(i === indexFilterValue + lengthTextFilter) {
          template += '</span>' + value.charAt(i);
        } else {
          template += value.charAt(i);
        }
      }
    }
    return template;
  }
}



var timeClipboard;
