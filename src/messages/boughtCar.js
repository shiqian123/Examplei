/**
* @Author: meteor
* @Date:   2016-08-18T16:59:41+08:00
* @Last modified by:   MillerD
* @Last modified time: 2016-10-10T17:29:17+08:00
*/



import React, {Component} from 'react';
import {
  View,
  Alert,
  TextInput,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import styles from '../common/styles';
import {Header, Button, Loading} from '../components'
import { Actions } from 'react-native-router-flux';
import {Utils, Device, Assets} from "../base";
import {Tip} from  "../components";


class BoughtCar extends Component {
  //props: {car_info: item, bill_info: data} ---- car_info: 新车信息, bill_info: 单据信息
  constructor(props) {
    super();
    this.state = {
      data: props.data,
      tipShow: 'nothing'
    }
  }
  _tipShow() {
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

  _back() {
    Actions.pop();
  }
  _delete() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.data;
    cart.customer_car = {};
    let params = {
      cart: cart
    };
    Utils.fetch(Utils.api.save, 'post', params)
      .then((res) => {
        if (res) {
          this.setState({tipShow: 'delete'});
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

  render() {
    let car_info = this.state.data.customer_car

    return(
      <View style={[styles.container, {backgroundColor: '#efefef'}]}>
        <Header leftPress={() => this._back()} title="新车" leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <View style={{backgroundColor: '#fff', paddingLeft: 15, paddingRight: 15,paddingTop: Utils.normalize(11),paddingBottom: Utils.normalize(11)}}>
          <Text numberOfLines={5} style={[localStyles.text, {marginTop: Utils.normalize(6),marginBottom: Utils.normalize(6)}]}>{car_info.car_type}</Text>
          <View style={[localStyles.rowBox,{paddingTop: Utils.normalize(9),paddingBottom: Utils.normalize(9)}]}>
            <Text style={[localStyles.text]}>车架号：{car_info.car_vin}</Text>
          </View>
          <View style={localStyles.rowBox}>
            <Text style={[localStyles.grayText]}>车牌号：{car_info.car_license}</Text>
          </View>
          <View style={localStyles.rowBox}>
            <Text style={[localStyles.grayText]}>行程公里数：{car_info.car_mileage}</Text>
          </View>
          <View style={localStyles.rowBox}>
            <Text style={[localStyles.grayText]}>购买时间：{car_info.car_time && car_info.car_time.split(' ')[0]}</Text>
          </View>
          <View style={localStyles.rowBox}>
            <Text style={[localStyles.grayText]}>购买价格：{Utils.oFixed(car_info.car_price, 2, true) }{car_info.car_price?'元':null}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => this._delete()} style={{position: 'absolute', width: Device.width, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center',height: Utils.normalize(50), backgroundColor: '#fff'}}>
          <Text style={{fontSize: 16, color: 'red', }}>{'删除'}</Text>
        </TouchableOpacity>
        {this._tipShow()}
      </View>
    )
  }
}
const localStyles = StyleSheet.create({
  rowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Utils.normalize(6),
    paddingBottom: Utils.normalize(6)
  },
  text: {
    fontSize: 15,
    fontWeight: '400',
    color: 'black',
  },
  grayText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8393aa',
  },
  textTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    width: 48,
  },
});

export default BoughtCar;
