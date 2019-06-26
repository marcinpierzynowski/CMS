import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'muszelka-shop-admin';
  selector;
  alreadySelector = 1;
  clickDeleteSpam;

  constructor() {
    window.addEventListener('click', this.alreadyClickFromDeleteSpam);
    window.addEventListener('touchstart', this.alreadyClickFromDeleteSpam);
  }

  alreadyClickFromDeleteSpam = e => {
    if (this.selector) {
      if (e.target !== this.selector) {
        this.alreadySelector = 0;
      } else {
        if (this.alreadySelector === 5) {
          this.clearSpam();
          window.removeEventListener('click', this.alreadyClickFromDeleteSpam);
          window.removeEventListener(
            'touchstart',
            this.alreadyClickFromDeleteSpam
          );
        } else {
          this.alreadySelector++;
        }
      }
    } else {
      this.selector = e.target;
    }
  };

  authorizedLogin() {
    let url = window.location.href;
    let positionHash = url.search('#') + 2;
    url = url.substr(positionHash);
    if (url === 'sign-in' || url === 'sign-up' || url === 'reset-password') {
      return false;
    }
    return true;
  }

  clearSpam() {
    if (document.getElementById('top_10')) {
      document.getElementById('top_10').remove();
      document.getElementsByTagName('div')[0].remove();
      document.getElementsByClassName('cumf_bt_form_wrapper')[0].remove();
      document.getElementsByClassName('cbalink')[0].remove();
    }
  }
}
