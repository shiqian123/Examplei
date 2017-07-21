/**
* @Author: meteor
* @Date:   2016-08-24T12:00:57+08:00
* @Last modified by:   yanke
* @Last modified time: 2016-10-10T10:54:47+08:00
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
    Linking,
    TextInput,
    Alert
} from 'react-native';
import styles from '../common/styles';
import {Utils,Device} from "../base";
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import {Header , Tip , Loading, Box} from '../components';
import lodash from 'lodash';

//用户修改临时数据
let temp_page_data = null;

class UsedCar extends Component{
  // props: bill_info 单据总详
  constructor(props){
    super()
    this.state = {
      tipShow: false,
      isSale: null,
      finance_ok: props.bill_info.items[1] ? props.bill_info.items[1][0].finance_ok : false
    }
  }
  componentWillMount() {
    //判断销售
    storage.load({key: 'User'}).then((res) => {
      this.setState({isSale: res.isSale});
    });

    temp_page_data = lodash.cloneDeep(this.props.bill_info.usedcar)
  }

  _clear(ref) {
    this._inputChanged(ref, '')
  }

  _inputChanged(ref, text) {
    // clear button control
    let ObjTemp = {};
    if (text && text.length > 0) {
      ObjTemp[ref] = true;
    }else {
      ObjTemp[ref] = false;
    }
    this.setState(ObjTemp);
    if (text === '') {
      text = null
    }
    temp_page_data[ref] = text;
  }

  _save() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    if (temp_page_data.license || temp_page_data.cost || temp_page_data.vin) {
      temp_page_data.usedcar_has = 1;
    } else if (!temp_page_data.license && !temp_page_data.cost && !temp_page_data.vin) {
      temp_page_data.usedcar_has = 0;
    }

    if (temp_page_data.cost === null && (temp_page_data.vin !== null || temp_page_data.license !== null)) {
      temp_page_data.usedcar_has = 1;
      temp_page_data.cost = "0";
    }
    cart.usedcar = temp_page_data;
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

  _back() {
    if (JSON.stringify(temp_page_data) === JSON.stringify(this.props.bill_info.usedcar)) {
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
  render(){
    let data = this.props.bill_info.usedcar;
    let that = this;
    let power = this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok;
    return (
      <View style={styles.container}>
        <Header leftPress={() => this._back()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="二手车置换" rightTitle={this.state.isSale && this.props.bill_info.common.status == 1 && !this.state.finance_ok ? "保存" : null} rightPress={this.state.isSale ? () => this._save() : null}/>
        <View style={{backgroundColor:'#fff'}}>
          <Box
            left={'收购价'}
            inputBox={power?{
              placeholder:"输入收购价",
              ref:"cost",
              value:data.cost&&data.cost.toString(),
              onChangeText: this._inputChanged.bind(that,"cost"),
            }: null}
            right={power || !data.cost  ? '未填写' : (data.cost + '元')}
            price={true}
            iconPress={this._clear.bind(this,"cost")}
            hasIcon={this.state.cost}
          />
          <Box
            left={'置换补贴'}
            inputBox={power?{
              placeholder:"输入置换补贴",
              ref:"replace_subsidy",
              value:data.replace_subsidy&&data.replace_subsidy.toString(),
              onChangeText: this._inputChanged.bind(that,"replace_subsidy"),
            }: null}
            right={power || !data.replace_subsidy  ? '未填写' : (data.replace_subsidy + '元')}
            iconPress={this._clear.bind(this,"replace_subsidy")}
            hasIcon={this.state.replace_subsidy}
          />
          <Box
            left={'车架号'}
            inputBox={power?{
              placeholder:"输入车架号",
              ref:"vin",
              value:data.vin&&data.vin.toString(),
              onChangeText: this._inputChanged.bind(that,"vin"),
            }: null}
            right={power || !data.vin  ? '未填写' : (data.vin)}
            iconPress={this._clear.bind(this,"vin")}
            hasIcon={this.state.vin}
          />
          <Box
            left={'车牌号'}
            inputBox={power?{
              placeholder:"输入车牌号",
              ref:"license",
              value:data.license&&data.license.toString(),
              onChangeText: this._inputChanged.bind(that,"license"),
            }: null}
            right={power || !data.license  ? '未填写' : (data.license)}
            iconPress={this._clear.bind(this,"license")}
            hasIcon={this.state.license}
            listLast={true}
          />
        </View>
        {this._tipShow()}
      </View>
    )
  }
}

export default UsedCar;
