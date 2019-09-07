import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Events } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';  
import { AlertController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

import { GlobalProvider } from "../../providers/global/global";
import { Stripe } from '@ionic-native/stripe';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  name: string = '';
  phoneNumber: string = '';
  email: string = '';
  card: any = {};
  cardNumber; cardExpMonth; cardExpYear; cardCVC;

  signOutButtonDisplay = "block";
  helpTextDisplay = "block";

  cardAreaDisplay = "block";
  cardLabelDisplay = "none";
  unlinkCardButton = "none";
  cardWrapperDisplay = "none";
  saveButtonDisplay = "none";

  isLoadingDisplayed: boolean = false;
  loader: any;

  isFromCart:any = false;

  constructor(public global: GlobalProvider, private stripe: Stripe, private afAuth: AngularFireAuth, public db: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public events: Events, private loadingCtrl: LoadingController, public viewCtrl: ViewController) {
    this.isFromCart = this.navParams.get('isFromCart');
    if(this.isFromCart == null) this.isFromCart = false;

    if(this.isFromCart){
      this.showAlert("Settings", "You must fill out all settings, including payment information, before you can place an order.");
    }

    console.log("IS FROM CART: ");
    console.log(this.isFromCart);

    this.stripe.setPublishableKey(this.global.constants.stripeKey);

    this.events.subscribe('clearLoader', () => {
      if(this.isLoadingDisplayed){
        console.log("attempting a loader dismiss");
        this.loader.dismiss();
        this.isLoadingDisplayed = false;

        this.cardAreaDisplay = "none";
        this.cardLabelDisplay = "block";
        this.unlinkCardButton = "block";
      }
    });

    this.events.subscribe('showCardArea', () => {
      this.cardAreaDisplay = "block";
      this.cardLabelDisplay = "none";
      this.unlinkCardButton = "none";
    });

    if(this.global.isAuth){
      var readOnly = (this.global.readOnly as any);
      if(readOnly !== null && typeof(this.global.readOnly.active) !== "undefined" && this.global.readOnly.active !== null && this.global.readOnly.active === 1){
        this.signOutButtonDisplay = "none";
        this.helpTextDisplay = "none";
      }else{
        this.signOutButtonDisplay = "block";
        this.helpTextDisplay = "block";
      }

      if(this.global.user !== null && typeof(this.global.user.userName) !== "undefined" && this.global.user.userName !== null && this.global.user.userName !== "") this.name = this.global.user.userName;

      if(this.global.user !== null && typeof(this.global.user.phoneNumber) !== "undefined" && this.global.user.phoneNumber !== null && this.global.user.phoneNumber !== "") this.phoneNumber = this.global.user.phoneNumber;

      if(this.lastFourExists()){
        console.log("LAST FOUR: " + this.global.user.lastFour);
        this.cardAreaDisplay = "none";
        this.cardLabelDisplay = "block";
      }else{
        console.log("No last four.");
        this.cardAreaDisplay = "block";
        this.cardLabelDisplay = "none";
      }

      if(this.global.user !== null && typeof(this.global.user.userName) !== "undefined" && this.global.user.userName !== null && this.global.user.userName !== ""){
        this.cardWrapperDisplay = "block";
      }
    }else{
      this.navCtrl.setRoot(LoginPage);
    }
  }

  lastFourExists(){
    return this.global.user !== null && typeof(this.global.user.lastFour) !== "undefined" && this.global.user.lastFour !== null && this.global.user.lastFour !== "";
  }

  showAlert(title: string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  rootHome(){
    if(this.isFromCart){
      this.viewCtrl.dismiss();
    }else{
  	  this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: 'forward'});
    }
  }

  unlinkCard(){
    this.cardLabelDisplay  = 'none';
    this.unlinkCardButton = 'none';
    this.cardAreaDisplay = 'block';

    this.db.object("/users/" + this.global.auth.uid + "/stripeToken").remove();
    this.db.object("/users/" + this.global.auth.uid + "/stripeID").remove();
    this.db.object("/users/" + this.global.auth.uid + "/lastFour").remove();
  }

  presentLoader() {
    this.loader = this.loadingCtrl.create({
      content: 'Securely verifying credit card information with Stripe...'
    });

    this.loader.present().then(() => {
      this.isLoadingDisplayed = true;
    });
  }

  ionViewDidLoad(){
    
  } 

  saveSettings(){
    this.saveButtonDisplay = "none";
    if(this.name !== "" && this.phoneNumber !== ""){
      this.db.object("/users/" + this.global.auth.uid + "/userName").set(this.name);
      this.db.object("/users/" + this.global.auth.uid + "/phoneNumber").set(this.phoneNumber);
      this.cardWrapperDisplay = "block";
    }else{
      this.showAlert("ERROR", "Invalid name or phone number.");
    }

    if(!this.lastFourExists() && this.global.user !== null && this.global.user.name !== null && this.global.user.name !== ""){ //no card already linked
      this.card = {
       number: this.cardNumber,
       expMonth: this.cardExpMonth,
       expYear: this.cardExpYear,
       cvc: this.cardCVC
      };

      if(typeof(this.cardNumber) !== "undefined" && typeof(this.cardExpMonth) !== "undefined" && typeof(this.cardExpYear) !== "undefined" && typeof(this.cardCVC) !== "undefined" && this.cardNumber !== "" && this.cardExpMonth !== "" && this.cardExpYear !== "" && this.cardCVC !== ""){
        this.stripe.createCardToken(this.card).then(token => {
          this.db.object('/users/' + this.global.auth.uid + '/stripeToken').set(token.id);
          this.db.object('/users/' + this.global.auth.uid + '/lastFour').set(this.cardNumber.substring(this.cardNumber.length-4));
          
          this.presentLoader();
        }).catch(error => {
          this.showAlert("ERROR", "Not a valid credit card.");
        });
      }else{
        this.showAlert("ERROR", "Card information cannot be blank!");
      }
    }
  }

  signOut(){
    this.navCtrl.setRoot(LoginPage).then((r) => {this.afAuth.auth.signOut();});
  }

  ionViewWillLeave(){
    
  }

}
