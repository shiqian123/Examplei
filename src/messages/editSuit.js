/**
* @Author: meteor
* @Date:   2016-08-18T19:21:04+08:00
* @Last modified by:   yanke
* @Last modified time: 2016-10-10T10:53:52+08:00
*/



'use strict'

import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import styles from '../common/styles';
import {Actions} from 'react-native-router-flux';
import {Header, Tip, Loading, Button} from '../components';
import {Utils,Device} from "../base";
import Icon from 'react-native-vector-icons/Ionicons';
import lodash from 'lodash';

let temp_data = null;

class EditSuit extends Component {
  constructor(props) {
    // props: {item_key, suit_info..., currentSuit..., bill_info: ...}
    super();
    this.state ={
      num: props.suit_info.num,
      price: props.suit_info.price,
      sale_price: props.suit_info.sale_price,
      tipShow: false
    }
  }
  _back() {
    if ( this.state.sale_price != this.props.suit_info.sale_price || this.state.num != this.props.suit_info.num) {
      Alert.alert(
        '',
        '确认放弃此次编辑',
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
    let key = this.props.item_key
    // let temp_items = lodash.cloneDeep(this.props.bill_info.items['8']);
    // temp_items[key].num = this.state.num;
    // temp_items[key].sale_price = this.state.sale_price;

    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    cart.items['8'][key].num = this.state.num;
    cart.items['8'][key].sale_price = this.state.sale_price;
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

  _delete() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    cart.items['8'].splice([ this.props.item_key], 1);
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

  _goodsInSuit() {
    let suit = this.props.currentSuit;
    let array = [];
    let num = 0;
    // suit.goods.map((item, key) => {
    //   console.log(item);
    //   console.log(key);
    // })

    for(let key in suit.goods) {
      array.push(suit.goods[key].map((item, item_key) => {
        return (
          <View>
            <View style={styles.row}>
              <Text style={[localStyles.textSmall, {color: '#333'}]}>{++num + '、' + item.goods_name + '  *' + item.num}</Text>
              <Text style={[localStyles.textSmall, {color: '#8d9cb0'}]}>{key == 2 ? (' (库存: ' + item.stock_num + ')') : null}</Text>
            </View>
          </View>
        )
      }))

    }
    return array;
    // return suit.goods && suit.goods.map((items, keys) => {
    //   return items.map((item, key) => {
    //     return(
          // <View>
          //   <View style={styles.row}>
          //     <Text style={[localStyles.textSmall, {color: '#333'}]}>{key+1 + '、' + item.goods_name + '  *' + item.num}</Text>
          //     <Text style={[localStyles.textSmall, {color: '#8d9cb0'}]}>{' (库存: ' + item.stock_num + ')'}</Text>
          //   </View>
          // </View>
    //     )
    //   })
    // })
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

  _priceChange(text) {
    if( !Utils.regexp.isMate(text,'price') ){
      text = ''
      this.setState({searchClean: false});
      this.refs.price.clear();
    }
    // clear button control
    if (text && text.length > 0) {
      this.setState({searchClean: true})
    }else {
      this.setState({searchClean: false})
    }

    this.setState({sale_price: text})
  }

  _numChange(type) {
    // type === 'add' ? this.setState({num: this.state.num+1}) : this.setState({num: this.state.num-1})
    if (type === 'add') {
      this.setState({num: this.state.num + 1});
    } else {
      if (this.state.num === 1) {
        return;
      } else {
        this.setState({num: this.state.num - 1})
      }
    }
  }

  _limitPrice(item,salesman){
    Actions.limitPrice({msg:item,salesman:salesman})
  }
  _clear() {
    this._priceChange('');
    this.refs.price.clear();
  }

  render() {

    let ShowLimit = 4;

    let suit = this.props.currentSuit;
    let data = this.props.bill_info;
    return(
      <View style={styles.container}>
        <Header leftPress={() => this._back()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="套装" rightTitle="保存" rightPress={() => {this._save()}} />
        <View style={styles.container}>
          <View style={{backgroundColor: 'white', paddingLeft: 15, paddingRight: 15}}>
            <Text style={{fontSize: 16, fontWeight: '400', marginTop: 15, paddingBottom: 7}}>{suit.goods_name}</Text>
            {this._goodsInSuit()}
            <View style={[styles.row, {marginTop: 7, marginBottom: 7, alignItems: 'center'}]}>
              <Text style={localStyles.textBig}>单价</Text>
              <View style={{marginLeft: 20, width: Utils.normalize(120), height: Utils.normalize(34), borderBottomWidth: 0.5, borderColor: '#387ff5'}}>
                <TextInput
                  underlineColorAndroid="transparent"
                  style={{height: Utils.normalize(40), fontSize: 16, fontWeight: '400', color: 'black'}}
                  ref="price"
                  keyboardType="numeric"                                                                          //这里原来为什么用双等号
                  defaultValue={this.state.sale_price ? this.state.sale_price.toString() : ( this.state.sale_price === 0 ? '0' : '' ) }
                  onChangeText={this._priceChange.bind(this)}
                  onFocus={() => this.setState({searchClean: this.state.sale_price ? true : false})}
                  onBlur={() => this.setState({searchClean: false})}
                />
                {this.state.searchClean ? <Icon onPress={() => {this._clear()}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
              </View>
              <View style={[styles.row,{width: Utils.normalize(84), height: Utils.normalize(30),alignItems: 'center',borderRadius: Utils.normalize(30),backgroundColor: '#f9f8f6', marginLeft: Utils.normalize(15)}]}>
                <TouchableOpacity onPress={this._numChange.bind(this,'minus')} style={{marginLeft: Utils.normalize(7),width: Utils.normalize(20)}}>
                  <Text style={{fontSize: Utils.normalize(25), color: '#007aff',textAlign: 'center'}}>-</Text>
                </TouchableOpacity>
                <View style={{width: Utils.normalize(30)}}>
                  <Text style={{fontSize: Utils.normalize(16),textAlign: 'center'}}>{this.state.num}</Text>
                </View>
                <TouchableOpacity onPress={this._numChange.bind(this,'add')} style={{width: Utils.normalize(20)}}>
                  <Text style={{fontSize: Utils.normalize(25), color: '#007aff',textAlign: 'center'}}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={{fontSize: 12, fontWeight: '400',color: '#8d9cb0', textAlign: 'right', flex: 1}}>{suit.stock_num === null ? null : (' (库存: ' + suit.stock_num + ')')}</Text>
            </View>
            <View style={[styles.row, {marginTop: 7, marginBottom: 15, alignItems: 'center'}]}>
              <Text style={localStyles.textBig}>小计</Text>
              <Text style={[localStyles.textBig, {color: '#999', marginLeft: 20}]}>{'￥' + Utils.oFixed(this.state.num * parseFloat(this.state.sale_price), 2, true)}</Text>
              <Text style={{color: '#8393aa'}}>（折扣：¥{Utils.oFixed((this.state.price - this.state.sale_price) * this.state.num,2,true)}）</Text>
              <View style={{flex: 1, alignItems: 'flex-end'}} >
                {(data.common.show_options & ShowLimit) ? <Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right: Utils.normalize(0)}}  onPress={()=>{this._limitPrice(this.props.suit_info,this.props.bill_info.salesman)}}></Button> : null}
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => this._delete()} style={{position: 'absolute', width: Device.width, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center',height: Utils.normalize(50), backgroundColor: '#fff'}}>
            <Text style={{fontSize: 16, color: 'red', }}>{'删除'}</Text>
          </TouchableOpacity>
        </View>
        {this._tipShow()}
      </View>
    )
  }
}

const localStyles = StyleSheet.create({
  textBig: {
    fontSize: 16,
    color: 'black',
    fontWeight: '400',
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '400',
    paddingTop: 7,
    paddingBottom: 7
  }
})

export default EditSuit;
