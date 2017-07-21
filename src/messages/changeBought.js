/**
* @Author: meteor
* @Date:   2016-08-18T18:30:19+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-08-31T18:33:18+08:00
*/



'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    TextInput
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import LoadIcon from '../components/Loading'
import {Header, Tip, Loading} from '../components'

class ChangeBought extends Component{
  constructor(props) {
    super()
    this.state = {
      data: props.data
    }
  }
  componentWillMount(){
    let params = {cust_id: this.state.data.customer.customer_id};
    Utils.fetch(Utils.api.car, 'post', params)
    .then((res)=>{
      this.setState({carList: res.list})
    })
  }
  _save(item){
    this.state.data.customer_car = {
      car_id: item.id,
      car_license: item.car_cardno,
      car_mileage: item.mileage,
      car_price: item.buyprice,
      car_time: item.buytime,
      car_type: item.model_name,
      car_vin: item.vin
    }
    let params = {
      cart: this.state.data
    };
    Utils.fetch(Utils.api.save, 'post', params)
      .then((res) => {
        if (res) {
          this.setState({tipShow: 'success'});
          setTimeout(() => {
            this.setState({tipShow: 'nothing'});
            Actions.pop({refresh: {message: 'changed sale_price'}});
          }, 1000)
        } else {
          this.setState({tipShow: 'failed'});
          setTimeout(() => {
            this.setState({tipShow: 'nothing'});
          }, 1000)
        }
      });
  }
  _tipShow() {
    //  if (this.state.tipShow === 'loading') {
    //    <Tip name="请求中..." type="loading" />
    //  } else if (this.state.tipShow === 'success') {
    //    <Tip name="保存成功" />
    //  } else if (this.state.tipShow === 'failed') {
    //    <Tip name="保存失败" type="failed" />
    //  } else {
    //    null;
    //  }
    switch (this.state.tipShow) {
      case 'loading':
        return <Loading/>
        break;
      case 'success':
        return <Tip name="保存成功" />
        break;
      case 'delete':
        return <Tip name="删除成功" />
        break;
      case 'failed':
        return <Tip name="保存失败" type="failed" />
        break;
      default:
        return null
    }
   }
  render() {
    const carList = this.state.carList;
    const car =  carList && carList.map((item,key)=>{
      return (
        <TouchableHighlight key={key} underlayColor='#f2f2f2' onPress={()=>{this._save(item)}} style={[styles.md_item,{backgroundColor:'#fff'}]}>
          <View  style={{paddingTop:6,paddingBottom:6}}>
            <View style={styles.md_itemsTextBox}>
              <Text style={styles.md_itemsText}>{item.model_name}</Text>
            </View>
            <View style={styles.md_itemsTextBox}>
              <Text style={styles.md_itemsText}>车架号：<Text style={{color:'#099999'}}>{item.vin}</Text></Text>
            </View>
            <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
              <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>车牌号：{item.car_cardno}</Text>
              <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>购买时间：{item.buytime && item.buytime.split(' ')[0]}</Text>
            </View>
            <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
              <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>行程里数：{item.mileage}</Text>
              <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>购买价格：{item.buyprice}</Text>
            </View>
            {this.state.data.customer_car.car_id == item.id ? <Icon style={{position:'absolute',right:15,top:50}} name='md-checkmark' size={20} color="#387ff5" /> : <View></View>}
           </View>
        </TouchableHighlight>
      )
    });
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}  title="已购车辆"/>
      {
        !this.state.carList ?
        <View style={{backgroundColor:'#fff',paddingTop:8,paddingBottom:8,paddingLeft:10}}><Text style={{color:'#999'}}>没有已购车辆</Text></View>
        : null
      }
      <ScrollView>
          <View>
            <View style={[{borderColor: '#cccccc', borderTopWidth: 0.5,}]}>{car}</View>
          </View>
        </ScrollView>
        {this._tipShow()}
      </View>
    );
  }
}

export default ChangeBought;
