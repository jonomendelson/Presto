import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController, LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { ResetpassPage } from '../resetpass/resetpass';
import { LoginPage } from '../login/login';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the SigninPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {
  @ViewChild('emailRef') emailElement:ElementRef;
  @ViewChild('passwordRef') passwordElement:ElementRef;

  lastFocus:string = "email";

  loginFormWrapperDisplay = "none";
  loadingScreenDisplay = "block";
  contentDisplay = "none";

  loader:any;
  isLoadingDisplayed:any = false;

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private loadingCtrl: LoadingController, public events: Events, private keyboard: Keyboard) {
    this.keyboard.hideKeyboardAccessoryBar(true);

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

  ngAfterViewChecked(){
    this.refocus();
  }

  refocus(){
    if(this.lastFocus === "email"){
      this.emailElement.nativeElement.focus();
    }else{
      this.passwordElement.nativeElement.focus();
    }
  }

  async login(email, password){
    this.presentLoader();
    try{
    	const result = this.afAuth.auth.signInWithEmailAndPassword(email, password).then(() => {
        if(this.isLoadingDisplayed) this.loader.dismiss();
        this.isLoadingDisplayed = false;
        this.navCtrl.setRoot(LoginPage);
      }).catch(err => {
        if(this.isLoadingDisplayed) this.loader.dismiss();
        this.showAlert("ERROR", err.message);
        this.isLoadingDisplayed = false;
      });
    }
    catch(e){
      if(this.isLoadingDisplayed) this.loader.dismiss();
      this.showAlert("ERROR", e.message);
      this.isLoadingDisplayed = false;
    }

    
  }

  showAlert(title: string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  presentLoader() {
    this.loader = this.loadingCtrl.create({
      content: 'Checking your username and password...'
    });

    this.loader.present().then(() => {
      this.isLoadingDisplayed = true;
    });
  }


  pushRegister(){
    this.navCtrl.push(RegisterPage);
  }

  pushReset(){
    this.navCtrl.push(ResetpassPage);
  }

  ionViewWillLoad(){
    
  }

}