/**
* @Author: meteor
* @Date:   2016-08-19T11:30:03+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-09-02T18:14:23+08:00
*/
'use strict'

import React, { Component } from 'react';
import {
    Alert,
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    Linking,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    DatePickerIOS,
    DatePickerAndroid
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header,Loading} from '../components'
import Storage from 'react-native-storage'

import {Tip} from  "../components";

class AddNewCar extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data,
      date: new Date(),
      sexSwitch: false,
      dateShow: false,
      nameErr: false,
      tel1Err: false,
      pidErr: false,
      custcar: {
        cust_id: props.data.customer.customer_id
      }
    }
  }

  _onDateChange (date) {
    this.setState({date: date });
  }
  _setBirthday(){
    if(Device.iOS){
      this.setState({dateShow: true})
    }else{
      DatePickerAndroid.open({
          date: this.state.date,
          maxDate: new Date()
      })
      .then((result) => {
          this.state.custcar.buytime = result.year ? (result.year + '-' + (result.month+1) + '-' + result.day) : '';
          this.setState({shua: !this.state.shua})
      });
    }
  }
  _dateClear(){
    this.state.custcar.buytime = '';
    this.setState({dateShow: false})
  }
  _dateSure(){
    this.state.custcar.buytime = Utils.moment(this.state.date).format('YYYY-MM-DD') ;
    this.setState({dateShow: false})
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
  _save(){
    let params = {custcar: this.state.custcar};
    if( !params.custcar.model_name){
      Utils.showMsg('','请输入车系名称')
    }else if( !params.custcar.vin){
      Utils.showMsg('','请输入车架号')
    }
    else if( !Utils.regexp.isVin(params.custcar.vin) ){
      Utils.showMsg('','请输入17位车架号，只能是字母或数字')
    }else {
      Utils.fetch( Utils.api.custcaradd, 'post', params )
      .then((res)=>{
        if(res){
          let params = {
            cart: this.state.data
          };
          params.cart.customer_car = {
            car_id: this.state.custcar.cust_id,
            car_license: this.state.custcar.car_cardno,
            car_mileage: this.state.custcar.mileage,
            car_price: this.state.custcar.buyprice,
            car_time: this.state.custcar.buytime,
            car_type: this.state.custcar.model_name,
            car_vin: this.state.custcar.vin
          }
        Utils.fetch(Utils.api.save, 'post', params)
          .then((res)=>{
            if(res){
              Actions.pop({refresh: {message: 'changed sale_price'}});
            }
          })
        }
      })
    }

    return null;
  }
  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={ () => { Actions.pop() } } leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="录入新车辆" rightTitle="确认" rightPress={this._save.bind(this)}/>
        <ScrollView>
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>车系名称</Text>
                <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text>
              </View>
              <View style={localStyle.inputBox}>
                <TextInput
                  underlineColorAndroid="transparent"
                  onChangeText={(text) => this.state.custcar.model_name = text }
                  placeholder="输入车系名称"
                  placeholderTextColor='#ccc'
                  style={localStyle.input} />
              </View>
            </View>
          </View>
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>车架号</Text>
                <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text>
              </View>
              <View style={localStyle.inputBox}>
                <TextInput
                  underlineColorAndroid="transparent"
                  placeholder="输入车架号"
                  placeholderTextColor='#ccc'
                  onChangeText={(text) => this.state.custcar.vin = text}
                  style={localStyle.input} />
              </View>
            </View>
          </View>
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>车牌号</Text>
                <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
              </View>
              <View style={localStyle.inputBox}>
                <TextInput
                  underlineColorAndroid="transparent"
                  placeholder="输入车牌号"
                  placeholderTextColor='#ccc'
                  ref="tel2"
                  onChangeText={(text) => this.state.custcar.car_cardno = text}
                  style={localStyle.input} />
              </View>
            </View>
          </View>
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>购买时间</Text>
                <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
              </View>
              <TouchableOpacity onPress={this._setBirthday.bind(this)} style={localStyle.item}>
                <Text style={localStyle.itemText}>{this.state.custcar.buytime ? this.state.custcar.buytime : '选择日期'}</Text>
                <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>行程公里数</Text>
                <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
              </View>
              <View style={localStyle.inputBox}>
                <TextInput
                  underlineColorAndroid="transparent"
                  placeholder="输入行程公里数"
                  placeholderTextColor='#ccc'
                  onChangeText={(text) => this.state.custcar.mileage = text}
                  style={localStyle.input} />
              </View>
            </View>
          </View>
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup,{borderWidth: 0}]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>购买价格</Text>
                <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
              </View>
              <View style={localStyle.inputBox}>
                <TextInput
                  underlineColorAndroid="transparent"
                  placeholder="输入购买价格"
                  placeholderTextColor='#ccc'
                  onChangeText={(text) => this.state.custcar.buyprice = text}
                  style={localStyle.input} />
              </View>
            </View>
          </View>
      </ScrollView>
      {this._tipShow()}
      {this.state.dateShow && Device.iOS ?
        <View style={{width: Utils.width, position: 'absolute', bottom: Utils.normalize(Device.andrAPIBelow21 ? 20 : 0), backgroundColor: '#c9ccd3' }}>
          <View style={{backgroundColor:'#eff1f0',height: Utils.normalize(44),flexDirection: 'row', alignItems:'center'}}>
            <TouchableOpacity onPress={this._dateClear.bind(this)} style={{position: 'absolute',left: Utils.normalize(10), top: Utils.normalize(14)}}>
              <Text style={{color: '#017aff',fontWeight: 'bold',fontSize: Utils.normalize(16)}}>清除</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._dateSure.bind(this)} style={{position: 'absolute',right: Utils.normalize(10), top: Utils.normalize(14)}}>
              <Text style={{color: '#017aff',fontWeight: 'bold',fontSize:Utils.normalize(16)}}>完成</Text>
            </TouchableOpacity>
          </View>
          <DatePickerIOS mode="date" date={this.state.date} maximumDate={new Date()} onDateChange={this._onDateChange.bind(this)}/>
        </View>
        : <View></View>
      }

    </View>
    )
  }
}

const localStyle = StyleSheet.create({
  selectRight: {
    position: 'absolute',
    right: 30,
    top: 0
  },
  input:{
    borderWidth: 0,
    height: Utils.normalize(40),
    fontSize: Utils.normalize(16),
  },
  item: {
    flex: 1,
    marginRight: Utils.normalize(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  itemText: {
    color: '#999'
  },
  sexSet: {
    position: 'absolute',
    bottom: Utils.normalize(Device.andrAPIBelow21 ? 30 : 10),
    width: Utils.normalize(Utils.width - 16),
    marginLeft: Utils.normalize(8),
    height: Utils.normalize(175),
  },
  overlay:{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      height: Utils.height,
      width: Utils.width,
      flex: 1,
      // flexDirection: 'row',
  },
  fullSonButtonGroup:{
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: Utils.normalize(15)
  },
  inputBox: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#387ff5',
    height: Utils.normalize(34),
    marginRight: Utils.normalize(15)
  }
})

export default AddNewCar;
