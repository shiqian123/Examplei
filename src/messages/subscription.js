/**
* @Author: meteor
* @Date:   2016-09-01T12:13:03+08:00
* @Last modified by:   MillerD
* @Last modified time: 2016-09-22T15:49:10+08:00
*/

import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';

import styles from '../common/styles';
import {Actions} from 'react-native-router-flux';
import {Header , Tip, Loading, ItemCheckbox} from '../components';
import {Utils,Device} from "../base";
import Icon from 'react-native-vector-icons/Ionicons';
import lodash from 'lodash';

let temp_data = null;

class Subscription extends Component {
  //props:  bill_info--单据
  constructor(props) {
    super();
    this.state = {
      add_forbidden: !props.bill_info.appendsubscription.appendsubscription_has,
      return_forbidden: !props.bill_info.unsubscription.unsubscription_has,
      remember: false,
      //sub..
      //append..
      //unsub...
    }
  }

  componentWillMount() {
    temp_data = lodash.cloneDeep(this.props.bill_info);
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
      case 'error':
        return <Tip name="退订金额超出支付订金" type="failed" />
        break;
      default:
        return null
    }
   }

  _rowInputGenerator(defaultValue, ref, forbidden) {
    defaultValue = defaultValue ? defaultValue.toString() : ( defaultValue == 0 ? '0' : '') ;
    let clearButton = {};
    let key = ref + '_money';
    //判断金额
    clearButton[ref] = temp_data[ref][key] ? true : false;
    return (
      <View style={{justifyContent: 'center', width: Utils.normalize(210), height: Utils.normalize(34), borderBottomWidth: forbidden ? 0 : 0.5, borderColor: '#387ff5'}}>
        {forbidden ? <Text style={{width: 220, color: '#999', fontSize: Utils.normalize(16)}}>{defaultValue !== ''? Utils.oFixed(defaultValue,2,true) : ''}</Text> :
          <View>
            <TextInput underlineColorAndroid="transparent" style={{height: Utils.normalize(40), fontSize: 16, fontWeight: '400', color: 'black'}}
              ref={ref}
              numberOfLines={1}
              keyboardType={ref === 'cost' ? 'numeric' : 'default'}
              autoCorrect={false}
              onChangeText={this._inputChanged.bind(this, ref)}
              defaultValue={defaultValue}
              onFocus={() => this.setState(clearButton)}
              onBlur={() => {clearButton[ref] = false;
                             this.setState(clearButton)}}
            />
            {this.state[ref] ? <Icon onPress={() => {this._clear(ref)}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
          </View>
        }
      </View>
    )
  }
  _clear(ref) {
    this._inputChanged(ref, '');
    this.refs[ref].clear();
  }

  _inputChanged(ref, text) {
    //clear button control
    let ObjTemp = {};
    if (text && text.length > 0 && this.refs[ref].isFocused()) {
      ObjTemp[ref] = true;
    }else {
      ObjTemp[ref] = false;
    }
    this.setState(ObjTemp);

    if (text === '') {
      text = null;
    } else {
      let re1 = /^\d+(\.\d{0,100})?$/
      if (!re1.test(text)) {
        text = null;
        this.refs[ref].clear();
      }
    }

    if (ref === 'appendsubscription') {
        temp_data['appendsubscription']['appendsubscription_money'] = parseFloat(text);
    } else if (ref === 'unsubscription') {
        temp_data['unsubscription']['unsubscription_money'] = parseFloat(text);
    } else {
        text === null ? temp_data['subscription']['subscription_has'] = 0 : temp_data['subscription']['subscription_has'] = 1;
        temp_data['subscription']['subscription_money'] = parseFloat(text);
    }
  }

  _back() {
    if (JSON.stringify(temp_data) !== JSON.stringify(this.props.bill_info)) {
      Alert.alert(
        '确认放弃此次编辑',
        '',
        [
          {text:'取消', onPress:()=>{}},
          {text:'确定', onPress:()=>{
              Actions.pop();
            }
          }
        ]
      )
    } else {
      Actions.pop();
    }
  }

  _save() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    cart.appendsubscription = temp_data.appendsubscription;
    cart.unsubscription = temp_data.unsubscription;
    cart.subscription = temp_data.subscription;
    if( !cart.subscription.subscription_has && !cart.subscription.subscription_money){
      Utils.showMsg('','请输入预先支付订金');
      this.setState({tipShow: 'nothing'});
      return false;
    }
    if( cart.appendsubscription.appendsubscription_has && !cart.appendsubscription.appendsubscription_money){
      Utils.showMsg('','请输入追加订金');
      this.setState({tipShow: 'nothing'});
      return false;
    }
    if( cart.unsubscription.unsubscription_has && !cart.unsubscription.unsubscription_money){
      Utils.showMsg('','请输入退订订金');
      this.setState({tipShow: 'nothing'});
      return false;
    }
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

  _onCheck(target) {
    temp_data = lodash.cloneDeep(this.props.bill_info);
    if (target === 'add') {
      this.setState({add_forbidden: false, return_forbidden: true})
      if (this.refs._returnBox && this.refs._returnBox.state.checked) {
        this.refs._returnBox._completeProgress();
      }
      temp_data.unsubscription.unsubscription_has = 0;
      temp_data.unsubscription.unsubscription_money = null;
      temp_data.appendsubscription.appendsubscription_has = 1;
    } else {
      // temp_data = this.props.bill_info;
      this.setState({return_forbidden: false, add_forbidden: true})
      if (this.refs._addBox && this.refs._addBox.state.checked) {
        this.refs._addBox._completeProgress();
      }
      temp_data.appendsubscription.appendsubscription_has = 0;
      temp_data.appendsubscription.appendsubscription_money = null;
      temp_data.unsubscription.unsubscription_has = 1;
    }
  }

  _onUncheck(target) {
    if (target === 'add') {
      this.setState({add_forbidden: true});
      temp_data.appendsubscription.appendsubscription_has = 0;
    } else {
      this.setState({return_forbidden: true});
      temp_data.unsubscription.unsubscription_has = 0;
    }
  }

  render() {
    let bill_info = this.props.bill_info;
    let subscription = this.props.bill_info.subscription
    return(
      <View style={styles.container}>
        <Header leftPress={() => this._back()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="订金" rightTitle="保存" rightPress={() => {this._save()}} />
        <View style={[styles.creditBox, {backgroundColor: '#fff'}]}>
          <Text style={styles.creditLeft}>预先支付订金</Text>
          <View style={{justifyContent: 'center', width: Utils.normalize(210), height: 34, borderBottomWidth: subscription.subscription_ok ? 0 : 0.5, borderColor: '#387ff5'}}>
            {subscription.subscription_ok ? <Text style={{width: 220, color: '#999', fontSize: Utils.normalize(16)}}>¥{Utils.oFixed(subscription.subscription_money, 2, true)}</Text> :
              <View>
                <TextInput underlineColorAndroid="transparent" style={{height: 40, fontSize: 16, fontWeight: '400', color: 'black'}}
                  ref="subscription"
                  numberOfLines={1}
                  keyboardType='numeric'
                  autoCorrect={false}
                  defaultValue={subscription.subscription_money ? subscription.subscription_money.toString() : ( subscription.subscription_money == 0 ? '0' : '' )}
                  onChangeText={this._inputChanged.bind(this, "subscription")}
                  onFocus={() => this.setState({subscription: temp_data.subscription.subscription_money ? true : false})}
                  onBlur={() => this.setState({subscription: false})}
                />
                {this.state.subscription ? <Icon onPress={() => {this._clear('subscription')}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
              </View>
            }
          </View>
        </View>
        {bill_info.subscription.subscription_ok ?
          <View>
            {bill_info.items && bill_info.items[1] && !bill_info.items[1][0].finance_ok ? <View style={[styles.creditBox, {backgroundColor: '#fff', marginTop: Utils.normalize(10)}]}>
              <ItemCheckbox
                ref="_addBox"
                backgroundColor="#fff"
                color="blue"
                borderColor="#999"
                iconSize="normal"
                onCheck={()=>this._onCheck('add')}
                onUncheck={()=>this._onUncheck('add')}
                default={!this.state.add_forbidden}
                circle={false}
                size={20}/>
              <Text style={[styles.creditLeft, {marginLeft: 8}]}>追加</Text>
              {this._rowInputGenerator(bill_info.appendsubscription.appendsubscription_money, 'appendsubscription', this.state.add_forbidden)}
            </View> : null}
            {bill_info.common.finance_state === 0 ? <View style={[styles.creditBox, {backgroundColor: '#fff',marginTop: Utils.normalize(10)}]}>
              <ItemCheckbox
                ref="_returnBox"
                backgroundColor="#fff"
                color="blue"
                borderColor="#999"
                iconSize="normal"
                onCheck={()=>this._onCheck('return')}
                onUncheck={()=>this._onUncheck('return')}
                default={!this.state.return_forbidden}
                circle={false}
                size={20}/>
              <Text style={[styles.creditLeft, {marginLeft: 8}]}>退订</Text>
              {this._rowInputGenerator(bill_info.unsubscription.unsubscription_money, 'unsubscription', this.state.return_forbidden)}
            </View> : null}
          </View> : null}
          {this._tipShow()}
      </View>
    )
  }
}

export default Subscription;
