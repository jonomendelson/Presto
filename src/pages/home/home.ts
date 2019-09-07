import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController, ModalController } from 'ionic-angular';

import { ProfilePage } from '../profile/profile';
import { SettingsPage } from '../settings/settings';
import { MenuPage } from '../menu/menu';
import { LoginPage } from '../login/login';
import { SuccessPage } from '../success/success';

import { GlobalProvider } from "../../providers/global/global";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  restaurantInfo: object[] = [];
  regions: object[] = [];
  search = "";
  name = "";

  settingsButtonDisplay = "block";
  profileButtonDisplay = "none";
  restaurantAreaDisplay = "block";
  restaurantSearchDisplay = "none";

  contentDisplay = "block";
  devPanelDisplay = "none";
  versionPanelDisplay = "none";

  day: any = -1;
  currHour: any = 0;

  constructor(public global: GlobalProvider, private afAuth: AngularFireAuth, public db: AngularFireDatabase, public navCtrl: NavController, private alertCtrl: AlertController, public events: Events, public modalCtrl: ModalController) { //called every time home is redisplayed
    this.day = (new Date()).getDay();
    this.currHour = (new Date()).getHours() + (new Date()).getMinutes()/60;
    console.log(this.currHour);

    this.restaurantInfo = [];
    this.regions = [];

    this.events.subscribe('nav', (target, arg) => {
      if(target === "HomePage") this.navCtrl.setRoot(HomePage);
    });
    
    if(this.global.isAuth){ //logged in
      var readOnly = (this.global.readOnly as any);
      if(readOnly !== null && typeof(this.global.readOnly.active) !== "undefined" && this.global.readOnly.active !== null && this.global.readOnly.active === 1){
        this.profileButtonDisplay = "block";
      }else{
        this.profileButtonDisplay = "none";
      }
      for(var key in this.global.restaurantInfo){
        var currRestaurant = (this.global.restaurantInfo[key] as any);
        currRestaurant.key = key;
        this.restaurantInfo.push(currRestaurant);
      }
      for(var key in this.global.regions){
        var currRegion = (this.global.regions[key] as any);
        currRegion.key = key;
        this.regions[currRegion.order] = currRegion;
      }
      console.log(this.regions);
      //if(this.global.justRegistered){
        this.global.justRegistered = false;
      //  this.pushSettings();
      //}
    }else{ //not logged in
      this.navCtrl.setRoot(LoginPage);
    }

    if(this.global.constants.devMode === 1){
      console.log("DEV MODE");
      this.devPanelDisplay = "block";
      this.versionPanelDisplay = "none";
      this.contentDisplay = "none";
      this.settingsButtonDisplay = "none";
      this.profileButtonDisplay = "none";
    }else if(this.global.version < this.global.constants.currVersion){
      console.log("OLD VERSION MODE");
      this.devPanelDisplay = "none";
      this.versionPanelDisplay = "block";
      this.contentDisplay = "none";
      this.settingsButtonDisplay = "none";
      this.profileButtonDisplay = "none";
    }else{
      this.versionPanelDisplay = "none";
      this.devPanelDisplay = "none";
      this.contentDisplay = "block";
      this.settingsButtonDisplay = "block";
    }
  }

  pad(num){
    if(num < 10){
      return "0" + num;
    }
    return num;
  }

  hourToTime(hour){
    if(hour < 12){
      if(Math.floor(hour) == 0) hour += 12;
      return Math.floor(hour) + ":" + this.pad(Math.floor((hour-Math.floor(hour))*60)) + "AM";
    }else{
      hour -= 12;
      if(Math.floor(hour) == 0) hour += 12;
      return Math.floor(hour) + ":" + this.pad(Math.floor((hour-Math.floor(hour))*60)) + "PM";
    }
  }

  pushProfile(){
    this.navCtrl.push(ProfilePage, {}, {animate: true, direction: 'forward'});
  }

  pushSettings(){
    this.navCtrl.push(SettingsPage, {},  {animate: true, direction: 'back'});
  }

  pushRestaurant(key, name){
    //if(this.global.readOnly !== null && typeof(this.global.readOnly.active) !== "undefined" && this.global.readOnly.active !== null && this.global.readOnly.active === 1){
      if(this.global.restaurantInfo[key].hours == null || (this.currHour >= this.global.restaurantInfo[key].hours[this.day].start && this.currHour < this.global.restaurantInfo[key].hours[this.day].end)){
        if(this.global.restaurantInfo[key].popupLogic.pickup === 2){
          this.displayDineOption(1, key, name);
        }else if(this.global.restaurantInfo[key].popupLogic.pickup === 1){
          let typeAlert = this.alertCtrl.create({title: "", subTitle: "Would you like to pickup your food to-go or dine in?", 
            inputs: [],
            buttons: [
              {
                text: 'Pickup',
                handler: data => {
                  this.displayDineOption(1, key, name);
                }
              },
              {
                text: 'Dine In',
                handler: data => {
                  this.displayDineOption(0, key, name);
                }
              }
            ]
          });
          typeAlert.present();
        }else if(this.global.restaurantInfo[key].popupLogic.pickup === 0){
          this.displayDineOption(0, key, name);
        } 
      }else{
        let timingAlert = this.alertCtrl.create({
          title: this.global.constants.closedTitle,
          subTitle: this.global.constants.closedMessage,
          buttons: ['OK']
        });
        timingAlert.present();
      }

    //}else{
      //not active
    //}
  }

  displayDineOption(type, key, name){
    if(this.global.restaurantInfo[key].popupLogic.displayMessage){
      if(type === 0){ //dine in
        let tableAlert = this.alertCtrl.create({
          title: "Dine In", 
          subTitle: this.global.restaurantInfo[key].popupLogic.dineInMessage,
          inputs: [{
            name: 'tableNumber',
            placeholder: '36',
          }],
          buttons: ['Cancel',
          {
            text: 'Show Menu',
            handler: data => {
              if(!isNaN(data.tableNumber) && data.tableNumber !== ""){
                this.navCtrl.push(MenuPage, {key: key, rname: name, table: data.tableNumber});
              }
            }
          }]

        });
        tableAlert.present();
      }else{ //pickup
        let tableAlert = this.alertCtrl.create({
          title: "Pickup", 
          subTitle: this.global.restaurantInfo[key].popupLogic.pickupMessage,
          buttons: [{
            text: 'Show Menu',
            handler: data => {
              this.navCtrl.push(MenuPage, {key: key, rname: name, table: 'pickup'});
            }
          }]
        });
        tableAlert.present();
      }
    }else{
      if(type === 0){
        let tableAlert = this.alertCtrl.create({
          title: "Dine In", 
          subTitle: this.global.restaurantInfo[key].popupLogic.dineInMessage,
          inputs: [{
            name: 'tableNumber',
            placeholder: '36',
          }],
          buttons: ['Cancel',
          {
            text: 'Show Menu',
            handler: data => {
              if(!isNaN(data.tableNumber) && data.tableNumber !== ""){
                this.navCtrl.push(MenuPage, {key: key, rname: name, table: data.tableNumber});
              }
            }
          }]

        });
        tableAlert.present();
      }else{
        this.navCtrl.push(MenuPage, {key: key, rname: name, table: 'pickup'});
      }
    }
  }

  matchesSearch(name){
    if(this.search === ""){
      this.restaurantAreaDisplay = "block";
      this.restaurantSearchDisplay = "none";
    }else{
      this.restaurantAreaDisplay = "none";
      this.restaurantSearchDisplay = "block";
    }
    return name.toLowerCase().includes(this.search.toLowerCase());
  }

  ionViewWillLoad(){

  }

  ionViewWillLeave(){
    
  }

}
