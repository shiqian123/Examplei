"use strict";

import React, { Component } from 'react';
import {
    Alert,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicator,
    ScrollView,
    ListView,
    RefreshControl,
    Modal,
    View,
    Image,
    Text,
    Animated,
    StyleSheet
} from 'react-native';

import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets, Device} from "../base";
import lodash from 'lodash';
import {Header, Loading, Button, Developing, Tip} from '../components';

let saleTypeList = [];
let timer;

class createCart extends Component{
    constructor(props) {
        super();
        this.state = {
        	data:{
        		customer: {
	        		customer_id: '',
	        		customer_name: '',
	        		customer_pid: '',
	        		customer_sex: '',
	        		customer_tel: '',
	        		ptype_name: '',
	        	},
	        	common: {
	        		sale_type : '',
	        	}
        	},
        	cusTipsIsShow: false,
        	saleTipsIsShow: false,
        	createSuccessShow: false,
          loadingShow: false,
        }
    }

    componentDidMount() {
    	Utils.fetch( Utils.api.load, 'post', {keys: 'cart_type'})
	    .then( (res)=> {
	    	saleTypeList = res.cart_type;
	    })
    }

    componentWillReceiveProps(nextPage){
      if(nextPage.data){
        this.setState({data: nextPage.data});
      }
	}

    _back() {
    	Actions.pop();
    }

    _save() {
    	clearTimeout(timer);
    	if(this.state.data.customer.customer_name == null || this.state.data.customer.customer_name == ''){
    		this.setState({cusTipsIsShow : true});
    		let that = this;
    		timer = setTimeout(function(){
    			that.setState({cusTipsIsShow : false});
    		},2000);
    	} else {
    		if(this.state.data.common.sale_type == null || this.state.data.common.sale_type == ''){
    			this.setState({saleTipsIsShow : true});
    			let that = this;
	    		timer = setTimeout(function(){
	    			that.setState({saleTipsIsShow : false});
	    		},2000);
	    	} else {
          this.setState({loadingShow: true});
	    		let type = this._matchType(saleTypeList,this.state.data.common.sale_type);
	    		let data = this.state.data.customer;
	    		let req = {
	    			sale_type : type,
	    			customer:{
	    				name: data.customer_name,
	    				id: data.customer_id,
	    				sex: data.customer_sex,
	    				tel1: data.customer_tel,
	    			}
	    		};
	    		Utils.fetch( Utils.api.createcart, 'post', req)
			    .then( (res)=> {
            this.setState({loadingShow: false});
			    	if(res){
              this.setState({createSuccessShow : true});
  			    	let that = this;
  		    		timer = setTimeout(function(){
  		    			that.setState({createSuccessShow : false});
  		    		},1000);
  		    		setTimeout(function(){
  		    			Actions.pop({refresh: {data: res,onFresh:false,isFresh:false,active:false}});
  		    		},1000);
            }
			    })
	    	}
    	}
    }

    _matchType (arr,str){
    	let type = '';
    	arr.forEach(function(d,i){
    		if(d.nm == str){
    			type = d.vl;
    		}
    	})
    	return type
    }

    _customer() {
    	Actions.changeCustomer({data: this.state.data})
    }

    _addCustomer() {
	    Actions.addCustomer({data: this.state.data,back: true})
	}

    _saleType() {
    	Actions.saleType({data: this.state.data})
    }

    render() {
       let data = this.state.data.customer;
        return(
            <View style={styles.container}>
           		<Header leftPress={() => this._back()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="创建购物车" rightTitle="确认" rightPress={() => {this._save()}} />
	            <View style={{backgroundColor:'#fff',marginTop:10}}>
	            	<TouchableOpacity onPress={this._customer.bind(this)}>
			            <View style={[styles.creditBox,{height:Utils.normalize(45)}]}>
			              	<Text style={styles.creditLeft}>客户</Text>
			              	<Text style={styles.creditRight}>{data.customer_name ? data.customer_name : '请选择'}</Text>
			              	<Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
			            </View>
			        </TouchableOpacity>
			        <TouchableOpacity onPress={this._addCustomer.bind(this)}>
			            <View style={[styles.creditBox,{height:Utils.normalize(45),backgroundColor:'#efefef'}]}>
			              	<Image style={styles_create.add} source={Assets.icons.addloop} /><Text style={[styles.creditLeft,{color:'#387ff5'}]}>增加新客户...</Text>
			            </View>
			        </TouchableOpacity>
			        <TouchableOpacity onPress={this._saleType.bind(this)}>
			            <View style={[styles.creditBox,{height:Utils.normalize(45)}]}>
			              	<Text style={styles.creditLeft}>销售渠道</Text>
			              	<Text style={styles.creditRight}>{this.state.data.common.sale_type ? this.state.data.common.sale_type : '请选择'}</Text>
			              	<Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
			            </View>
			        </TouchableOpacity>
	            </View>
	              {
                    this.state.cusTipsIsShow ?
                    <Tip type='miss_tips' name='请选择客户'></Tip>
                    : null
                }
                {
                    this.state.saleTipsIsShow ?
                    <Tip type='miss_tips' name='请选择销售渠道'></Tip>
                    : null
                }
                {
                	this.state.loadingShow ?
                	<Tip type="loading" name="请求中..."/>
                	: null
                }
                {
                	this.state.createSuccessShow ?
                	<Tip name="购物车创建成功"/>
                	: null
                }
            </View>
        )
    }
}

const styles_create = StyleSheet.create({
	add: {
		width: 19.5,
		height: 19,
		marginRight: 5,
	}
})

export default createCart
