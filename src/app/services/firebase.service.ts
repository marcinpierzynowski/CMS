import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase';

@Injectable()
export class FirebaseService {
    private firebaseShop: any;
    private isAuthorized: boolean;

    constructor() {
      const config = environment.configShop;
      this.firebaseShop = firebase.initializeApp(config);
    }

    public get firebase() { return this.firebaseShop; }

    public get authorization() { return this.isAuthorized; }

    public set authorization(flag: boolean) { this.isAuthorized = flag; }

    public getDataBaseRef(name: string) { return firebase.database().ref(name); }
}
