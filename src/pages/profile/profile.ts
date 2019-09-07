import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { CartPage } from '../cart/cart';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  orders: any[] = [];

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public db: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
    this.orders = [];

    console.log(global.readOnly.points);

    if(this.global.isAuth){
      if(typeof(this.global.user.orders) !== "undefined" && this.global.user.orders !== null){
        for(var orderKey in this.global.user.orders){
          var currOrder = (this.global.user.orders[orderKey] as any);
          currOrder.key = orderKey;
          this.orders.push(currOrder);
        }
        this.orders.sort(function(a, b){ return b.orderTime - a.orderTime; });
      }
    }else{ //not logged in
      this.navCtrl.setRoot(LoginPage);
    }
  }

  rootHome(){
    this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: 'backward'});
  }

  goodFormatting(o){
    if(typeof(o.status) !== "undefined" && o.status !== null && o.status === 1) return true;
    return false;
  }

  isDefined(ref){
    return typeof(ref) !== "undefined" && ref !== null;
  }

  milliToDate(milli){
    var d = new Date(milli);
    return (d.getMonth()+1) + "/" + d.getDate() + "/" + (d.getFullYear()) + " at " + d.getHours() + ":" + (("0" + d.getMinutes()).slice(-2));
  }

  presentOrder(key){ 
    var cart = this.global.user.orders[key].foodIds;
    
    let contactModal = this.modalCtrl.create(CartPage, {cart: cart, paymentSource: this.global.user.orders[key].paymentSource, discountRate: this.global.user.orders[key].discountRate, rid: this.global.user.orders[key].rid, menu: this.global.restaurantInfo[this.global.user.orders[key].rid].menu, rname: this.global.restaurantInfo[this.global.user.orders[key].rid].name, taxRate: this.global.restaurantInfo[this.global.user.orders[key].rid].tax, tipRate: this.global.user.orders[key].tip, table: this.global.user.orders[key].table, isCurrent: false});
    contactModal.present();
  }

  tackPercent(am){
    return Math.min(am, 100) + "%";
  }

  ionViewWillLoad(){
    
  }

  signOut(){
    this.afAuth.auth.signOut();
    this.global.isAuth = false;
    this.navCtrl.setRoot(LoginPage);
  }

  ionViewWillLeave(){
  
  }


}
