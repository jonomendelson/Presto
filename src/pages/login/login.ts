import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { SigninPage } from '../signin/signin';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  loginFormWrapperDisplay = "none";
  loadingScreenDisplay = "block";
  contentDisplay = "none";

  loader:any;

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public events: Events) {
    if(!this.global.isAuth && this.global.isConnected){
      this.loadingScreenDisplay = "none";
      this.contentDisplay = "block";
    }
    this.events.subscribe('connect', () => {
      console.log("CONNECT RECIEVED");
      if(!this.global.isAuth){
        this.loadingScreenDisplay = "none";
        this.contentDisplay = "block";
      }
    });
  }

  async login(email, password){
    try{
    	const result = this.afAuth.auth.signInWithEmailAndPassword(email, password).catch(err => {
        this.showAlert("ERROR", err.message);
      });
    }
    catch(e){
      this.showAlert("ERROR", e.message);
    }
  }

  showAlert(title: string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  pushRegister(){
    this.navCtrl.push(RegisterPage);
  }

  pushSignin(){
    this.navCtrl.push(SigninPage);
  }

  ionViewWillLoad(){
    
  }

}
