import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';

import { GlobalProvider } from "../../providers/global/global";

/**
 * Generated class for the SuccessPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-success',
  templateUrl: 'success.html',
})
export class SuccessPage {

  points: any = 1;
  waitTime: any = 0;
  name: any = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public global: GlobalProvider) {
  	this.points = this.navParams.get('points');
    this.waitTime = this.navParams.get('waitTime') + 5*Math.floor(Math.random()*3)-5;
    this.name = this.global.user.userName;
  }

  backToHome(){
  	this.navCtrl.setRoot(HomePage, {}, {animate: false, direction: 'up'});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SuccessPage');
  }

  ionViewWillLeave() {
  }

	 

}
