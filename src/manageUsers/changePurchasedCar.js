/**
 * Created by shiqian on 17/1/17.
 */
'use strict'

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
    StatusBar,
    Text,
    Animated,
    TextInput,
    StyleSheet,
    DatePickerAndroid,
    DatePickerIOS
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import {Utils, Assets, Device,_} from "../base";
import lodash from 'lodash';
import {Header, Loading, Button, Developing, Tip,SearchTitle} from '../components';

export default class ChangePurchasedCar  extends Component{
  constructor(props){
    super(props)
    this.state={
     showDatePicker:false,
     nowdate: Utils.moment(this.props.item.buytime?this.props.item.buytime:new Date()).format('YYYY-MM-DD'),
     date:new Date(),
     item:'',
     loading:false,
     changeStatu:false,
     changeName:''
    }
    let item  = this.props.item
    this.params = {
      custcar:{
        id:item.id,
        cust_id:item.cust_id,
        vin:item.vin,
        model_id:item.model_id,
        color_id:item.color_id,
        color_name:item.color_name,
        car_cardno:item.car_cardno,
        buytime:item.buytime,
        relate_id:item.relate_id,
        des:item.des,
        mileage:item.mileage,
        buyprice:item.buyprice
      }
    }
  }
  componentDidMount(){
    this.setState({item:this.props.item})
  }
  _tip(content,goback){
  this.setState({changeStatu:true,changeName:content})
  setTimeout(()=>{
    this.setState({changeStatu:false,loading:false})
    if(goback){
      Actions.pop({refresh:{}})
    }
  },1000)
  }
  _save(){
    this.setState({loading:true})
    if(this.params.custcar.model_name==''||this.params.custcar.vin==''){
      this._tip('有必填项没有填写')
      return
    }
    Utils.fetch(Utils.api.updateCar,'post',this.params).then((res) => {
      this.setState({loading:false})
      this._tip('变更成功',true)
    })
  }
  _goBack(){
   Actions.pop()
  }
  _textChanged(ref,text) {
    let ObjTemp = {};
    this.params.custcar[ref] = text
    if (text && text.length > 0 && this.refs[ref].isFocused()) {
      ObjTemp[ref] = true
    }else {
      ObjTemp[ref] = false
    }
    this.setState(ObjTemp)
  }
  _clear(ref) {
    this._textChanged(ref, '');
    this.refs[ref].clear();
  }
  _changeDate(){
    let selectObj = _.cloneDeep(this.state.nowdate);
    Device.iOS ? selectObj = Utils.moment(selectObj).format('YYYY-MM-DD') : null;
    this.setState({showDatePicker: !this.state.showDatePicker,nowdate:selectObj});
    setTimeout(() => {
      if(this.state.showDatePicker && Device.isAndroid){
        DatePickerAndroid.open({
          date: this.state.date,
          maxDate:new Date()
        })
        .then((result) => {
            this._onDateChange(result);
        });
      }
    },20)
  }
  //改变时间
  _onDateChange(date){
    let selectObj = lodash.cloneDeep(this.state.nowdate);
    if(Device.iOS){
      selectObj = Utils.moment(date).format('YYYY-MM-DD');
      this.setState({nowdate:selectObj,date:date})
      this.params.custcar.buytime  = selectObj;
    }else if(Device.isAndroid){
      this.setState({showDatePicker:false})
      if(date.action=='dismissedAction'){
         return
      }
      let tempDate = new Date(date.year,date.month,date.day);
      selectObj = date.year + '-' + (date.month+1) + '-' + date.day;
      this.setState({nowdate:selectObj,date:tempDate});
      this.params.custcar.buytime  = selectObj;

    }
  }
  render(){
    let _item = this.state.item;
   return(
     <View style={styles.container}>
       <Header  rightTitle="确认" rightPress ={()=>{this._save()}} leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="变更"/>
       {/* 车型名称 */}
       <View style={_styles.box}>
        <View style={{width:102,flexDirection: 'row',}}>
          <Text style={[ {marginLeft: 15,fontSize:Utils.normalize(16)} ]}>车型名称 <Text style={{color:'#ff3a2b',fontSize:Utils.normalize(16),fontWeight: 'bold'}}>*</Text></Text>
        </View>
        <View style={_styles.inputBox}>
          <TextInput
            underlineColorAndroid="transparent"
            placeholderTextColor='#ccc'
            ref="model_name"
            defaultValue={_item.model_name}
            style={_styles.input}
            onBlur={() => this.setState({model_name: false})}
            onFocus={() => this.setState({model_name: _item.model_name ? true : false})}
            onChangeText={this._textChanged.bind(this,"model_name")}
            />
            {this.state.model_name ? <Icon onPress={() => {this._clear("model_name")}} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{paddingTop:6,right:0}]} /> : null }
        </View>
       </View>
       <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#EDECED'}}></View>
       {/* 车架号 */}
       <View style={_styles.box}>
        <View style={{width:102,flexDirection: 'row',}}>
          <Text style={[ {marginLeft: 15,fontSize:Utils.normalize(16)} ]}>车架号 <Text style={{color:'#ff3a2b',fontSize:Utils.normalize(16),fontWeight: 'bold'}}>*</Text></Text>
        </View>
        <View style={_styles.inputBox}>
          <TextInput
            underlineColorAndroid="transparent"
            placeholderTextColor='#ccc'
            ref="vin"
            style={_styles.input}
            defaultValue={_item.vin}
            onBlur={() => this.setState({vin: false})}
            onFocus={() => this.setState({vin: _item.vin ? true : false})}
            onChangeText={this._textChanged.bind(this,'vin')}
            />
            {this.state.vin ? <Icon onPress={() => {this._clear("vin")}} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{paddingTop:6,right:0}]} /> : null }
        </View>
       </View>
       <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#EDECED'}}></View>
       {/* 车牌号 */}
       <View style={_styles.box}>
        <View style={{width:102,flexDirection: 'row',}}>
          <Text style={[ {marginLeft: 15,fontSize:Utils.normalize(16)} ]}>车牌号 </Text>
        </View>
        <View style={_styles.inputBox}>
          <TextInput
            underlineColorAndroid="transparent"
            placeholderTextColor='#ccc'
            style={_styles.input}
            ref="car_cardno"
            onBlur={() => this.setState({car_cardno: false})}
            onFocus={() => this.setState({car_cardno: _item.car_cardno ? true : false})}
            defaultValue={_item.car_cardno?_item.car_cardno:''}
            onChangeText={this._textChanged.bind(this,'car_cardno')}
            />
            {this.state.car_cardno ? <Icon onPress={() => {this._clear("car_cardno")}} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{paddingTop:6,right:0}]} /> : null }
        </View>
       </View>
       <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#EDECED'}}></View>
       {/* 购买时间 */}
       <TouchableOpacity onPress={() => this._changeDate()}>
         <View style={_styles.detailBox}>
           <Text style={_styles.detailLeft}>预期到达时间 </Text>
           { this.state.showDatePicker ?
             <Text style={[_styles.detailRight,{color:'#ff3b30'}]}>{this.state.nowdate != '' ? this.state.nowdate : '选择时间'}</Text>
             :
             <Text style={_styles.detailRight}>{this.state.nowdate != '' ? this.state.nowdate : '选择时间'}</Text>
           }
           <Icon style={_styles.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
         </View>
       </TouchableOpacity>
       <View style={{marginLeft:15,height:0.5,backgroundColor:'#cccccc',borderLeftWidth:0}}></View>
       {/* 时间控件 */}
       {this.state.showDatePicker && Device.iOS ?
           <DatePickerIOS  mode="date" date={this.state.date} maximumDate={new Date()} onDateChange={(date) => this._onDateChange(date)}/>
         : <View></View>}
        <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#EDECED'}}></View>
       {/* 公里数 */}
       <View style={_styles.box}>
        <View style={{width:102,flexDirection: 'row',}}>
          <Text style={[ {marginLeft: 15,fontSize:Utils.normalize(16)} ]}>公里数 </Text>
        </View>
        <View style={_styles.inputBox}>
          <TextInput
            underlineColorAndroid="transparent"
            placeholderTextColor='#ccc'
            defaultValue={_item.mileage}
            ref="mileage"
            onBlur={() => this.setState({mileage: false})}
            onFocus={() => this.setState({mileage: _item.vin ? true : false})}
            style={_styles.input}
            onChangeText={this._textChanged.bind(this,'mileage')}
          />
          {this.state.mileage ? <Icon onPress={() => {this._clear("mileage")}} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{paddingTop:6,right:0}]} /> : null }
        </View>
       </View>
       <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#EDECED'}}></View>
       {/* 购买价格 */}
       <View style={_styles.box}>
        <View style={{width:102,flexDirection: 'row',}}>
          <Text style={[ {marginLeft: 15,fontSize:Utils.normalize(16)} ]}>购买价格 </Text>
        </View>
        <View style={_styles.inputBox}>
          <TextInput
            underlineColorAndroid="transparent"
            placeholderTextColor='#ccc'
            style={_styles.input}
            defaultValue={String(_item.buyprice)}
            onChangeText={this._textChanged.bind(this,'buyprice')}
            ref="buyprice"
            onBlur={() => this.setState({buyprice: false})}
            onFocus={() => this.setState({buyprice: _item.buyprice ? true : false})}
            />
            {this.state.buyprice ? <Icon onPress={() => {this._clear("buyprice")}} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{paddingTop:6,right:0}]} /> : null }
        </View>
       </View>
       <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#EDECED'}}></View>
       {this.state.loading?<Loading></Loading>:null}
       {this.state.changeStatu?<Tip type='miss_tips' name={this.state.changeName}></Tip>:null}
     </View>
   )
  }
}
const _styles = StyleSheet.create({
  box:{
    height:Utils.normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
  },
  input:{
    borderWidth: 0,
    height: Utils.normalize(40),
    fontSize: Utils.normalize(16),
  },
  inputBox: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#387ff5',
    height: Utils.normalize(34),
    marginRight: Utils.normalize(15),
    paddingRight:Utils.normalize(6)
  },
  detailLeft: {
    flex: 1,
    color: '#000000',
    fontSize: Utils.normalize(16),
    fontWeight: '400',
  },
  detailCenter: {
    flex: 2,
    color: '#000000',
    fontSize: Utils.normalize(14),
    fontWeight: '400',
  },
  detailRight: {
    textAlign: 'right',
    marginRight: 35,
    color: '#999999',
    fontSize: Utils.normalize(16),
    fontWeight: '400',
  },
  detailBox: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Utils.normalize(49.5),
    justifyContent: 'center',
    backgroundColor: '#EDECED',
    paddingLeft: 15
  },
  icon:{
    color: '#ccc',
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 15,
    top: Utils.normalize(Device.iOS ? 13 : 15)
  },
})
