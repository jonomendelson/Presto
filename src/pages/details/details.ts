import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {

  menu: any = {};
  item: any = {};
  optionSections: any[] = [];
  selectedOptions: any[] = [];
  message: string = "";
  cartText: string = "Add To Cart";

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  	this.item = this.navParams.get('item');
	  this.menu = this.navParams.get('menu');

  	for(var sectionKey in this.item.options){
      this.optionSections[this.item.options[sectionKey].order] = this.item.options[sectionKey];
    }

    for(var i = 0; i < this.optionSections.length; i++){
      if(this.optionSections[i].radio === 2){
        console.log(this.optionSections[i].itemIds[0]);
        this.selectedOptions.push(this.optionSections[i].itemIds[0]);
      }
    }

    this.updateCartButton();
  }

  indexOfOption(key){
  	for(var i = 0; i < this.selectedOptions.length; i++){
  		if(key === this.selectedOptions[i]) return i;
  	}
  	return -1;
  }

  addOption(key, radio, order){
  	if(radio === 0){
  		var optionIndex = this.indexOfOption(key);
	  	if(optionIndex !== -1){
	  		this.selectedOptions.splice(optionIndex, 1);
	  	}else{
	  		this.selectedOptions.push(key);
	  	}
  	}else{
  		var optionIndex = this.indexOfOption(key);
      console.log(this.selectedOptions);
  		if(optionIndex === -1){
  			var groupIds = this.optionSections[order].itemIds;
  			for(var i = 0; i < groupIds.length; i++){
  				var groupMemberIndex = this.selectedOptions.indexOf(groupIds[i]);
  				if(groupMemberIndex !== -1){
  					this.selectedOptions.splice(groupMemberIndex, 1);
  				}
  			}
        if(key !== ""){
  			  this.selectedOptions.push(key);
        }
  		}
  	}

    this.updateCartButton();
  }

  updateCartButton(){
    var price = this.item.price;
    for(var i = 0; i < this.selectedOptions.length; i++){
      price += this.menu[this.selectedOptions[i]].price;
    }
    this.cartText = "Add To Cart ($" + price.toFixed(2) + ")";
  }

  backToMenu(){
  	this.viewCtrl.dismiss(this.selectedOptions, this.message);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailsPage');
  }

}
