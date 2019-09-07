import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController } from 'ionic-angular';

import { LoginPage } from '../login/login';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  @ViewChild('emailRef') emailElement:ElementRef;
  @ViewChild('passwordRef') passwordElement:ElementRef;
  @ViewChild('cpasswordRef') cpasswordElement:ElementRef;

  lastFocus:string = "email";

  username;
  password;
  confirmPassword;
  referralCode = "";

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public db: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController) {
  }

  async register(email, password){
    try{
    	if(this.password === this.confirmPassword){
	    	const result = this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((r) => {
          if(this.referralCode !== ""){
	    		 this.global.referrer = this.referralCode.toUpperCase();
          }
          this.global.justRegistered = true;
	    		this.navCtrl.setRoot(LoginPage);
	    	}).catch(err => {
	        	this.showAlert("ERROR", err.message);
	        });
	    }else{
	    	this.showAlert("ERROR", "Passwords don't match!");
	    }
    }
    catch(e){
      this.showAlert("ERROR", e.message);
    }
  }

  ngAfterViewChecked(){
    this.refocus();
  }

  refocus(){
    if(this.lastFocus === "email"){
      this.emailElement.nativeElement.focus();
    }else if(this.lastFocus === "password"){
      this.passwordElement.nativeElement.focus();
    }else{
      this.cpasswordElement.nativeElement.focus();
    }
  }

  showAlert(title:string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  ionViewDidLoad() {
  
  }
}
