import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';
import { SuccessPage } from '../success/success';
import { SettingsPage } from '../settings/settings';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the CartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  cart: any[] = [];
  rid: string = '';
  menu: any[] = [];
  rname: string = '';
  table: any;

  subtotal: any = 0;
  puresubtotal: any = 0;

  taxRate: any = 8;
  tipRate: any = 18;
  discountRate: any = 0;
  total: any = 0;
  isLoadingDisplayed: any = false;
  isCurrent:any = false;
  pointsCost = -1;
  paymentSource = "CARD";

  message: string = "";

  tip15 = "tipButton";
  tip18 = "tipButton tipButtonActive";
  tip20 = "tipButton";
  tipCustom = "tipButton";

  payCard = "paymentMethodButton paymentMethodButtonActive";
  payPoints = "paymentMethodButton";

  discountDollars: any = 0;

  isActive: any = false;

  loader:any;

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public db: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams, private loadingCtrl: LoadingController, private alertCtrl: AlertController, public events: Events, public modalCtrl: ModalController) {

    this.isActive = (this.global.readOnly !== null && typeof(this.global.readOnly.active) !== "undefined" && this.global.readOnly.active !== null && this.global.readOnly.active === 1);

    this.events.subscribe('clearLoaderAndSuccess', (pts) => {
      if(this.isLoadingDisplayed){
        this.loader.dismiss();
        this.isLoadingDisplayed = false;
        this.navCtrl.push(SuccessPage, {points: pts, waitTime: this.global.restaurantInfo[this.rid].waitTime});
      }
    });
    
    this.events.subscribe('clearLoader', () => {
      if(this.isLoadingDisplayed){
        this.loader.dismiss();
        this.isLoadingDisplayed = false;
      }
    });

  	this.cart = this.navParams.get('cart');
  	this.rid = this.navParams.get('rid');
  	this.menu = this.navParams.get('menu');
  	this.rname = this.navParams.get('rname');
  	this.taxRate = this.navParams.get('taxRate');
    this.table = this.navParams.get('table');

    console.log(this.cart);
    console.log(this.rid);
    console.log(this.menu);
    console.log(this.rname);
    console.log(this.taxRate);



    this.isCurrent = this.navParams.get('isCurrent');

    if(this.isCurrent){
      if(this.isActive){
        var firstTimeHere = (this.global.readOnly.hasEatenAt == null || this.global.readOnly.hasEatenAt[this.rid] == null || this.global.readOnly.hasEatenAt[this.rid] !== 1);
      }else{
        var firstTimeHere = true;
      }

      if(this.global.restaurantInfo[this.rid].discount != null && this.global.restaurantInfo[this.rid].discount.persistent != null && this.global.restaurantInfo[this.rid].discount.amount != null){
        if(this.global.restaurantInfo[this.rid].discount.persistent === 1){
          this.discountRate = this.global.restaurantInfo[this.rid].discount.amount*100;
        }else{
          if(firstTimeHere){
            this.discountRate = this.global.restaurantInfo[this.rid].discount.amount*100;
          }
        }
      }
    }else{
      if(typeof(this.navParams.get('discountRate')) !== "undefined" && this.navParams.get('discountRate') !== null){
        this.discountRate = this.navParams.get('discountRate')*100;
      }else{
        this.discountRate = 0;
      }
    }

    if(!this.isCurrent){
      this.tipRate = this.navParams.get('tipRate');
      this.paymentSource = this.navParams.get('paymentSource');

      this.tip15 = "tipButton";
      this.tip18 = "tipButton";
      this.tip20 = "tipButton";

      if(this.tipRate == 15) this.tip15 += " tipButtonActive";
      if(this.tipRate == 18) this.tip18 += " tipButtonActive";
      if(this.tipRate == 20) this.tip20 += " tipButtonActive";
      if(this.tipRate != 15 && this.tipRate != 18 && this.tipRate != 20) this.tipCustom += " tipButtonActive";

      if(this.paymentSource === "POINTS"){

        this.payCard = "paymentMethodButton";
        this.payPoints = "paymentMethodButton paymentMethodButtonActive";
      }else{
        this.payCard = "paymentMethodButton paymentMethodButtonActive";
        this.payPoints = "paymentMethodButton";
      }
    }

  	for(var i = 0; i < this.cart.length; i++){
        console.log("PREPARE");
        console.log(this.cart[i]);
        this.puresubtotal += parseFloat(this.menu[this.cart[i].key].price);
        if(this.menu[this.cart[i].key].noDiscount != null && this.menu[this.cart[i].key].noDiscount === 1){
          this.subtotal += parseFloat(this.menu[this.cart[i].key].price) * (1 / (1-this.discountRate/100));
        }else{
  			  this.subtotal += parseFloat(this.menu[this.cart[i].key].price);
        }
        if(this.cart[i].options != null && this.cart[i].options.length !== 0){
          for(var j = 0; j < this.cart[i].options.length; j++){
            this.puresubtotal += parseFloat(this.menu[this.cart[i].options[j]].price);
            this.subtotal += parseFloat(this.menu[this.cart[i].options[j]].price);
          }
        }
  	}
  	console.log(this.subtotal);

    this.total = Math.ceil(100*((this.subtotal * (1 + this.taxRate/100) * (1-this.discountRate/100)) + (this.puresubtotal * (this.tipRate/100))))/100;
    this.pointsCost = Math.ceil(this.total*this.global.constants.pointsPerDollar/5)*5;
    console.log(this.total);

    this.discountDollars = -this.total+this.puresubtotal+(this.puresubtotal*(this.taxRate/100))+(this.puresubtotal*(this.tipRate/100));
    this.discountDollars = Math.floor(this.discountDollars*100)/100;
  }

  showAlert(title: string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  setTip(rate){
    if(this.isCurrent){
    	this.tipRate = rate;

    	this.tip15 = "tipButton";
    	this.tip18 = "tipButton";
    	this.tip20 = "tipButton";
      this.tipCustom = "tipButton";

    	if(rate == 15) this.tip15 += " tipButtonActive";
    	if(rate == 18) this.tip18 += " tipButtonActive";
    	if(rate == 20) this.tip20 += " tipButtonActive";
      if(rate != 15 && rate != 18 && rate != 20) this.tipCustom += " tipButtonActive";
    }
    this.total = Math.ceil(100*((this.subtotal * (1 + this.taxRate/100) * (1-this.discountRate/100)) + (this.puresubtotal * (this.tipRate/100))))/100;
    this.pointsCost = Math.ceil(this.total*this.global.constants.pointsPerDollar/5)*5;
    console.log("TIP:" + this.tipRate);
  }

  setCustomTip(){
    if(this.isCurrent){
      let alert = this.alertCtrl.create({
        title: "Tip Amount", 
        subTitle: "Set a custom tip.", 
        inputs: [{
          name: 'tip',
          placeholder: '$4.75',
        }],
        buttons: ['Cancel',
        {
          text: 'Set Tip',
          handler: data => {
            if(data.tip.length !== 0){
              if(data.tip.substr(0, 1) == "$"){
                this.setTip(Math.max(0, parseFloat(data.tip.substr(1))*100.0/this.puresubtotal));
              }else{
                this.setTip(Math.max(0, parseFloat(data.tip)*100.0/this.puresubtotal));
              }

            }
          }
        }]

      });
      alert.present(); 
    }
  }

  setPay(type){
    if(this.isCurrent){
      if(type === "POINTS"){
        this.paymentSource = "POINTS";
        this.payCard = "paymentMethodButton";
        this.payPoints = "paymentMethodButton paymentMethodButtonActive";
      }else{
        this.paymentSource = "CARD";
        this.payCard = "paymentMethodButton paymentMethodButtonActive";
        this.payPoints = "paymentMethodButton";
      }
    }
  }

  placeOrder(){
    if(this.isCurrent){
      if(this.isActive){
        if(this.paymentSource === "POINTS" && this.global.readOnly.points < this.pointsCost){
          this.showAlert("ERROR", "Insufficient points!");
        }else{
          console.log("ORDER PLACED!");
          this.global.setCurrOrderID(this.db.list('/users/' + this.global.auth.uid + '/orders').push({foodIds: this.cart, rid: this.rid, tip: this.tipRate, paymentSource: this.paymentSource, table: this.table, message: this.message}).key);
          this.presentLoader();
        }
      }else{
        let paymentModal = this.modalCtrl.create(SettingsPage, {isFromCart: true});
        paymentModal.onDidDismiss((options, message) => {
          this.isActive = (this.global.readOnly !== null && typeof(this.global.readOnly.active) !== "undefined" && this.global.readOnly.active !== null && this.global.readOnly.active === 1);
          if(this.isActive){
            this.placeOrder();
          }else{
            this.showAlert("ERROR", "You cannot order until you fill out all settings.");
          }
        });
        paymentModal.present();
      }
    }
  }

  presentLoader() {
    this.loader = this.loadingCtrl.create({
      content: 'Sending your order to the kitchen... this may take up to 60 seconds'
    });

    this.loader.present().then(() => {
      this.isLoadingDisplayed = true;
    });
  }


  ionViewWillLoad(){

  }


  ionViewWillLeave(){

  }

}
