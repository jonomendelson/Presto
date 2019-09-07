import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { SigninPage } from '../signin/signin';

import { GlobalProvider } from "../../providers/global/global";


/**
 * Generated class for the ResetpassPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-resetpass',
  templateUrl: 'resetpass.html',
})
export class ResetpassPage {
  @ViewChild('emailRef') emailElement:ElementRef;

  email: any = "";

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public events: Events, private keyboard: Keyboard) {

  }

  showAlert(title: string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  resetPass(email){
    try{
      const result = this.afAuth.auth.sendPasswordResetEmail(this.email).then(() => {this.navCtrl.pop(); this.showAlert("Reset Email Sent", "A password reset link was sent to your email.");}).catch(err => {
        this.showAlert("ERROR", err.message);
      });
    }
    catch(e){
      this.showAlert("ERROR", e.message);
    }
  }

  ngAfterViewChecked(){
    this.refocus();
  }

  refocus(){
    this.emailElement.nativeElement.focus();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetpassPage');
  }

}
