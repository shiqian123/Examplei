/**
 * @Author: meteor
 * @Date:   2016-08-22T15:33:03+08:00
 * @Last modified by:   meteor
 * @Last modified time: 2016-10-14T11:44:55+08:00
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
  TouchableOpacity,
  Linking,
  TextInput,
  Animated,
  Alert,
  Keyboard
} from 'react-native';
import styles from '../common/styles';
import {Utils,Device} from "../base";
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import {Header, Tip, Loading} from '../components';
import lodash from 'lodash';

//用户修改临时数据
let temp_installment = null;

class InstallmentCredit extends Component{
  //props: credit(whole list),installment, carPrice, bill_info
  constructor(props){
    super()
    this.state = {
      // credit: props.credit,
      // installment: props.installment,
      // carPrice: props.carPrice
      showInstallmentProduct: false,
      temp_first_pay: props.installment['first_pay'],
      ani: new Animated.Value(Utils.height),
      currentCredit: {},
      tipShow: false,
      isSale: null,
      finance_ok: props.bill_info.items[1][0].finance_ok
    }
  }
  componentWillMount() {
    //判断销售
    storage.load({key: 'User'}).then((res) => {
      this.setState({isSale: res.isSale});
    });

    temp_installment = lodash.cloneDeep(this.props.installment)

    for(var key in this.props.credit){
      if(temp_installment && this.props.credit[key] && this.props.credit[key].class_id == temp_installment.installment_classid){
        this.setState({currentCredit: this.props.credit[key]});
      }
    }
  }

  componentDidMount() {
    Keyboard.addListener('keyboardWillShow', this.updateKeyboardSpace.bind(this));
    Keyboard.addListener('keyboardWillHide', this.resetKeyboardSpace.bind(this));
  }

  // rowGenerator
  _rowInputGenerator(placeholder, defaultValue, ref, unit, fixed) {
    let clearButton = {};
    // console.log(temp_installment);
    // console.log(ref);
    clearButton[ref] = temp_installment[ref] ? true : false;
    return (
      <View>
        {this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok ?
          <View style={{width: Utils.normalize(210), height: Utils.normalize(34), borderBottomWidth: 0.5, borderColor: '#387ff5'}}>
            <TextInput underlineColorAndroid="transparent" style={{borderWidth: 0, height: Utils.normalize(40), fontSize: Utils.normalize(16), fontWeight: '400', color: 'black'}}
                       ref={ref}
                       numberOfLines={1}
                       keyboardType='numeric'
                       autoCorrect={false}
                       autoCapitalize='none'
                       placeholder={placeholder}
                       placeholderTextColor='#ccc'
                       defaultValue={defaultValue ? defaultValue.toString() : ( defaultValue == 0 ? '0' : '' )}
                       multiline={true}
                       onChangeText={this._inputChanged.bind(this, ref)}
                       onFocus={() => this.setState(clearButton)}
                       onBlur={() => {clearButton[ref] = false;
                             this.setState(clearButton);
                             this.resetKeyboardSpace.bind(this);
                           }}
                       onEndEditing={this.resetKeyboardSpace.bind(this)}
                       returnKeyType='next'
            />
            {this.state[ref] ? <Icon onPress={() => {this._clear(ref)}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
          </View> : <Text style={{textAlign: 'right', fontSize: Utils.normalize(16), color: '#999'}}>{defaultValue || defaultValue === 0 ? (fixed ? defaultValue : Utils.oFixed(defaultValue,2,true))  + unit : '未填写'}</Text>}
      </View>
    )
  }
  _clear(ref) {
    this._inputChanged(ref, '');
    this.refs[ref].clear();
  }
  // 保存编辑
  _save() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    cart.installment = temp_installment;
    let params = {
      cart: cart
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
  // 输入
  _inputChanged(ref, text) {

    let re1 = /^\d+(\.\d{0,100})?$/
    if (!re1.test(text)) {
      // temp_installment[ref] = null;
      // //首付款输入改变贷款金额判断
      // if (ref === 'first_pay') {
      //   this.setState({temp_first_pay: null})
      // }
      // this.refs[ref].clear();
      text = ""
      this.refs[ref].clear();
    }

    let ObjTemp = {};
    if (text && text.length > 0 && this.refs[ref].isFocused()) {
      ObjTemp[ref] = true;
    }else {
      ObjTemp[ref] = false;
    }
    this.setState(ObjTemp);

    // if (text === '') {
    //   //首付款输入改变贷款金额判断
    //   if (ref === 'first_pay') {
    //     this.setState({temp_first_pay: 0})
    //   }
    // } else {
    // text = parseFloat(text)
    // if(isNaN(text)) text = null;
    temp_installment[ref] = text;
    //首付款输入改变贷款金额判断
    if (ref === 'first_pay') {
      this.setState({temp_first_pay: parseFloat(text)})
    }
    // }

  }

  // _loanAmountCalc() {
  //   return this.props.carPrice - temp_installment['first_pay'];
  // }

  _clickOnProduct() {
    if (!this.props.credit || this.props.credit.length === 0) {
      return;
    }
    this.setState({showInstallmentProduct: true});
    Animated.timing(
      this.state.ani,
      {
        toValue: 0,
        duration: 250
      }
    ).start();
  }
  _installmentProductChosen(item) {
    this.setState({currentCredit: item});
    temp_installment.installment_has = 1;
    temp_installment.installment_classid = item.class_id;
    Animated.timing(
      this.state.ani,
      {
        toValue: Utils.height,
        duration: 250
      }
    ).start();

  }
  _back() {
    if (JSON.stringify(temp_installment) === JSON.stringify(this.props.installment)) {
      Actions.pop();
    } else {
      Alert.alert(
        '',
        '确认放弃此次编辑',
        [
          {text:'取消', onPress:()=>{}},
          {text:'确定', onPress:()=>{Actions.pop()}}
        ]
      )
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
      case 'failed':
        return <Tip name="保存失败" type="failed" />
        break;
      default:
        return null
    }
  }

  updateKeyboardSpace(frames){
    let keyboardSpace =  frames.endCoordinates.height;//获取键盘高度
    if(Device.isAndroid) keyboardSpace = 0;
    this.setState({keyboardSpace:keyboardSpace});
  }

  resetKeyboardSpace(){
    this.setState({keyboardSpace: 0});
  }
  _cacenlSet(){
    Animated.timing(
      this.state.ani,
      {
        toValue: Utils.height,
        duration: 250
      }
    ).start();
  }
  render(){
    let installment = this.props.installment;
    return (
      <View style={styles.container}>
        <Header leftPress={() => this._back()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="分期贷款" rightTitle={this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok ? "保存" : ''} rightPress={() => this._save()}/>
        <ScrollView keyboardShouldPersistTaps={true} style={{flex: 1}}>
          <View style={{backgroundColor:'#fff'}}>
            <TouchableHighlight style={styles.creditBox} underlayColor='#f2f2f2' onPress={this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok ? () => this._clickOnProduct() : null}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={styles.creditLeft}>分期贷款产品</Text>
                {this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok ?
                  <View style={[styles.row, {alignItems: 'center', width: Utils.normalize(210)}]}>
                    <Text style={[styles.creditLeft, {color: '#c7c7cd', fontSize: Utils.normalize(16), }]}>
                      {this.state.currentCredit.goods_name ? this.state.currentCredit.goods_name:''}
                      {this.state.currentCredit.goods_name?<Text style={{fontSize:10}}>{'●'}</Text>:null}
                      {this.state.currentCredit.goods_name ? this.state.currentCredit.supplier_name:'未填写'}</Text>
                    <Icon style={{textAlign: 'right'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                  </View>
                  :
                  <Text style={{textAlign: 'right', fontSize: Utils.normalize(16), color: '#999'}}>
                    {this.state.currentCredit.goods_name ? this.state.currentCredit.goods_name:''}
                    {this.state.currentCredit.goods_name?<Text style={{fontSize:10}}>{'●'}</Text>:null}
                    {this.state.currentCredit.goods_name ? this.state.currentCredit.supplier_name:'未填写'}
                  </Text>
                }
              </View>
            </TouchableHighlight>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>首付款</Text>
              {
                // <Text style={styles.creditRight}>{installment.first_pay || installment.first_pay === 0 ? Utils.oFixed(installment.first_pay,2,true)+'元':'未填写'}</Text>
              }
              {
                // this._rowInputGenerator(installment.first_pay || installment.first_pay === 0 ? Utils.oFixed(installment.first_pay,2,true)+'元' : '输入首付款', 'first_pay', installment.first_pay || installment.first_pay === 0 ? "black" : "#999")
              }
              {this._rowInputGenerator('输入首付款', installment.first_pay, 'first_pay', '元')}
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>贷款金额</Text>
              {
                // <Text style={styles.creditRight}>{installment.installment_has ? Utils.oFixed(this.state.carPrice - installment.first_pay,2,true) + '元':'未填写'}</Text>
              }
              {this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok ?
                <View style={{paddingLeft: Device.isAndroid ? 17 : 0, flexDirection: 'row', alignItems:'center', width: Utils.normalize(210), height: 34, justifyContent: 'center'}}>
                  <Text style={[styles.creditRight, {textAlign: 'left', color: '#c7c7cd', }]}>{this.state.temp_first_pay ? Utils.oFixed(this.props.carPrice - this.state.temp_first_pay,2,true) + '元':'未填写'}</Text>
                </View>
                :
                <Text style={{textAlign: 'right', fontSize: Utils.normalize(16), color: '#999'}}>{this.state.temp_first_pay ? Utils.oFixed(this.props.carPrice - this.state.temp_first_pay,2,true) + '元':'未填写'}</Text>}
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>期限</Text>
              {
                // <Text style={styles.creditRight}>{installment.months?installment.months+'月':'未填写'}</Text>
              }
              {this._rowInputGenerator('输入贷款期限', installment.months, 'months', '月', true)}
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>抵押金</Text>
              {
                // <Text style={styles.creditRight}>{installment.deposit || installment.deposit === 0 ? Utils.oFixed(installment.deposit,2,true) + '元' : '未填写'}</Text>
              }
              {this._rowInputGenerator('输入抵押金', installment.deposit, 'deposit', '元')}
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>金融服务费</Text>
              {
                // <Text style={styles.creditRight}>{installment.service_fee || installment.service_fee === 0 ? Utils.oFixed(installment.service_fee,2,true) +'元':'未填写'}</Text>
              }
              {this._rowInputGenerator('输入金融服务费', installment.service_fee, 'service_fee', '元')}
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>续保押金</Text>
              {
                // <Text style={styles.creditRight}>{installment.renewal_money || installment.renewal_money === 0 ? Utils.oFixed(installment.renewal_money,2,true) + '元' : '未填写'}</Text>
              }
              {this._rowInputGenerator('输入续保押金', installment.renewal_money, 'renewal_money', '元')}
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>提前交付利息</Text>
              {
                // <Text style={styles.creditRight}>{installment.interest_pay || installment.interest_pay === 0 ? Utils.oFixed(installment.interest_pay,2,true) + '元' : '未填写'}</Text>
              }
              {this._rowInputGenerator('输入提前交付利息', installment.interest_pay, 'interest_pay', '元')}
            </View>
          </View>
          <View style={{height: this.state.keyboardSpace}}>
          </View>
        </ScrollView>
        <Animated.View style={[styles.container, {backgroundColor: '#fff', position: 'absolute', width: Utils.width, height: Utils.height, left: 0, top: this.state.ani}]}>
          <Header title="分期贷款产品" rightTitle="取消" rightPress={()=>{this._cacenlSet()}}/>
          {this.props.credit.length && this.props.credit.map((item, key) => {
            return (
              <TouchableOpacity style={[styles.creditBox, {borderBottomWidth: 0.5, borderColor: '#ccc', marginLeft: 15, paddingLeft: 0}]} onPress={() => this._installmentProductChosen(item)}>
                <Text style={styles.creditLeft}>{item.goods_name + '  ' + item.supplier_name}</Text>
                {item.class_id === this.state.currentCredit.class_id ?
                  <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null
                }
                <View style={styles.itemInsetLineR}></View>
              </TouchableOpacity>
            )
          })}
        </Animated.View>
        {this._tipShow()}
      </View>
    )
  }
}

export default InstallmentCredit;
