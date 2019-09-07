import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { CartPage } from '../cart/cart';
import { DetailsPage } from '../details/details';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  rid: string = '';
  rname: string = '';
  table: any;

  restaurant: any = {};
  categories: any[] = [];

  menu: any[] = [];
  cart: any[] = [];

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public db: AngularFireDatabase, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public modalCtrl: ModalController) {
  	this.categories = [];
    this.menu = [];
    this.cart = [];

    this.rid = this.navParams.get('key');
    this.rname = this.navParams.get('rname');
    this.table = this.navParams.get('table');

    console.log(this.rid);

    
    this.restaurant = this.global.restaurantInfo[this.rid];
    

    for(var catKey in this.restaurant.categories){
      this.categories[this.restaurant.categories[catKey].order] = {key: catKey, name: this.restaurant.categories[catKey].name};
    }

    var i = 0;
    for(var menuKey in this.restaurant.menu){
    	var currItem = this.restaurant.menu[menuKey];
      var injectedItem = {price: currItem.price.toFixed(2), key: menuKey, name: currItem.name, cat: currItem.cat, options: currItem.options};
    	this.menu.push(injectedItem);
    }
  }

  objectToList(object){
    var list = [];
    for(var key in object){
      object[key].key = key;
      list.push(object[key]);
    }
    return list;
  }

  showAlert(title: string, message:string){
    let alert = this.alertCtrl.create({title: title, subTitle: message, buttons: ['OK']});
    alert.present();
  }

  isDefined(ref){
    return typeof(ref) !== "undefined";
  }

  addToCart(k, type){
    if(type == 0){
      if(typeof(this.restaurant.menu[k].options) !== "undefined"){
        let detailsModal = this.modalCtrl.create(DetailsPage, {menu: this.restaurant.menu, item: this.restaurant.menu[k]});
        detailsModal.onDidDismiss((options, message) => {
          if(message !== "[noadd]"){
            this.cart.push({key: k, options: options, message: message});
          }
        });
        detailsModal.present();
      }else{
        console.log("PUHSED WITHOUT OPTIONS");
        this.cart.push({key: k, options: [], message: ""});
      }
    }else{
      let detailsModal = this.modalCtrl.create(DetailsPage, {menu: this.restaurant.menu, item: this.restaurant.menu[k]});
      detailsModal.onDidDismiss((options, message) => {
        if(message !== "[noadd]"){
          this.cart.push({key: k, options: [], message: message});
        }
      });
      detailsModal.present();
    }
  }

  quantityInCart(k){
    var quantity = 0;
  	for(var i = 0; i < this.cart.length; i++){
  		if(this.cart[i].key === k) quantity++;
  	}
  	return quantity;
  }

  clearItem(k){
    console.log(k);
    for(var i = 0; i < this.cart.length; i++){
      if(this.cart[i].key === k){
        this.cart.splice(i, 1);
        i--;
        console.log(this.cart);
      }
    }
  }

  clearCart(){
    this.cart = [];
  }

  viewCart(){
    //if(this.global.readOnly !== null && typeof(this.global.readOnly.active) !== "undefined" && this.global.readOnly.active !== null && this.global.readOnly.active === 1){
      if(this.cart.length != 0){
        this.navCtrl.push(CartPage, {cart: this.cart, rid: this.rid, menu: this.restaurant.menu, rname: this.rname, taxRate: this.restaurant.tax, isCurrent: true, table: this.table});
      }else{
        this.showAlert("ERROR", "Cart is empty.");
      }
    //}else{
    //  this.showAlert("ERROR", "You cannot order until you fill out all settings.");
    //}
  }

  prune(name, wasCut){
    if(name.length > 35){
      return this.prune(name.substr(0, name.lastIndexOf(' ')), 1);
    }
    if(wasCut) return name + " ...";
    return name;
  }

  ionViewWillLoad(){
  }

  ionViewWillLeave(){
  }

}
