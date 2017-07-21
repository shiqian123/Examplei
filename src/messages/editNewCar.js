/**
* @Author: meteor
* @Date:   2016-08-19T15:23:35+08:00
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T19:46:32+08:00
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
import {Header, Button, Loading, Tip} from '../components'
import { Actions } from 'react-native-router-flux';
import {Utils, Device, Assets} from "../base";
import Icon from 'react-native-vector-icons/Ionicons'

//售价
//本页面仅限销顾查看，固定为4
let ShowLimit = 4;

class EditNewCar extends Component {
  //props: {car_info: item, bill_info: data, items_input: ...} ---- car_info: 新车信息, bill_info: 单据信息
  constructor(props) {
    super();
    this.state = {
      tipShow: 'nothing',
      showAllowVin:2,
      temp_saleprice: props.car_info.sale_price,
      changeAvilable: props.changeAvilable
    }
  }

  componentWillReceiveProps(props) {
    if (props.newCarInfo) {

    }
  }
  // 售价改变
  _change(text) {
    if (text && text.length > 0) {
      this.setState({searchClean: true})
    }else {
      this.setState({searchClean: false})
    }

    //价格输入格式判断
    let re1 = /^\d+(\.\d{0,100})?$/
    if (!re1.test(text)) {
      text = '';
      this.setState({searchClean: false});
      this.refs._salePriceInput.clear();
    }

    this.setState({temp_saleprice: text})

  }
  _clear(ref) {
    this._change('');
    this.refs[ref].clear();
  }
  //保存
  _save() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    cart.items[1][0].sale_price = parseFloat(this.state.temp_saleprice);
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
      case 'delete':
        return <Tip name="删除成功" />
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

  _back() {
    if (this.state.temp_saleprice.toString() !== this.props.car_info.sale_price.toString()) {
      Alert.alert(
        '',
        '确认放弃此次编辑',
        [
          {text:'取消', onPress:()=>{}},
          {text:'确定', onPress:()=>{
              this.refs._salePriceInput.blur();
              Actions.pop();
            }
          }
        ]
      )
    } else {
      Actions.pop();
    }
  }
  _delete() {
    this.setState({tipShow: 'loading'});
    let cart = this.props.bill_info;
    delete cart.items['1'];
    cart.installment = {}
    let params = {
      cart: cart
    };
    Utils.fetch(Utils.api.save, 'post', params)
      .then((res) => {
        if (res) {
          this.setState({tipShow: 'delete'});
          setTimeout(() => {
            this.setState({tipShow: 'nothing'});
            Actions.pop({refresh: {message: 'changed sale_price',isFresh:false}});
          }, 1000)
        } else {
          this.setState({tipShow: 'failed'});
          setTimeout(() => {
            this.setState({tipShow: 'nothing'});
          }, 1000)
        }
      });
  }
  _changeVin(class_id,vin,goods_param){
    this.setState({LoadIcon:true})
    let params = {
      shop_id:this.props.bill_info.common.shop_id,
      class_id:class_id,
      owner_id:this.props.bill_info.salesman.owner_id,
      vin:vin,
      goods_param:goods_param}
    Utils.fetch(Utils.api.allowvin,'post',params)
    .then((res)=>{
      this.setState({LoadIcon:false})
      Actions.changeVin({msg:res,listMsg:params,cart:this.props.bill_info,vin:vin});
    })
  }
  _limitPrice(item,salesman){
    Actions.limitPrice({msg:item,salesman:salesman})
  }

  render() {
    let car_info = this.props.car_info;
    let data = this.props.bill_info;
    //temp_saleprice = car_info.sale_price;
    return(
      <View style={[styles.container, {backgroundColor: '#efefef'}]}>
        <Header leftPress={() => this._back()} title="新车" leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}
          rightPress={() => this._save()} rightTitle="保存"/>
        <View style={{backgroundColor: '#fff', paddingLeft: 15, paddingRight: 15}}>
          <Text numberOfLines={5} style={[localStyles.text, {marginTop: 15, paddingBottom: 15}]}>{car_info.car_type + '  ' + car_info.goods_name.replace(car_info.car_type, '') + ' (车身:' + car_info.goods_param + ')'}</Text>
          <View style={localStyles.rowBox}>
            <Text style={localStyles.textTitle}>{'车架号'}</Text>
            <Text style={[localStyles.text, {left: 16, color: '#999', flex: 1}]}>{car_info.vin ? car_info.vin : '未填写'}</Text>
            {
            this.state.saleLevel3 ?
            <View>
              {(data.items[1] && !data.items[1][0].finance_ok && data.common.allow_op && this.state.showAllowVin && data.common.show_options) && this.state.items_input && this.state.changeAvilable && !car_info.vin  ?
                <Button value='选择VIN' pattern={{outLine:'smallBorderBtn',text:'smallBorderBlue'}} style={{}} onPress={()=>this._changeVin(car_info.class_id,car_info.vin,car_info.goods_param)}></Button>
                :null
              }
            </View>
            :
            <View>
              {(data.items[1] && !data.items[1][0].finance_ok && data.common.allow_op && this.state.showAllowVin && data.common.show_options) && this.state.items_input && this.state.changeAvilable  ?
                <Button value={car_info.vin?'更改VIN':'选择VIN'} pattern={{outLine:'smallBorderBtn',text:'smallBorderBlue'}} style={{}} onPress={()=>this._changeVin(car_info.class_id,car_info.vin,car_info.goods_param)}></Button>
                :null
              }
            </View>
            }
          </View>
          <View style={localStyles.rowBox}>
            <Text style={localStyles.textTitle}>{'指导价'}</Text>
            <Text style={[localStyles.text, {left: 16, color: '#999', flex: 1}]}>{'￥' + Utils.oFixed(car_info.price, 2, true)}</Text>
            <View style={{flex:1,justifyContent:'flex-end',flexDirection:'row'}}>
              {(data.common.show_options & ShowLimit) ? <Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right:15}}  onPress={()=>{this._limitPrice(car_info,data.salesman)}}></Button>:null}
            </View>
          </View>
          <View style={[localStyles.rowBox, {paddingTop: 0}]}>
            <Text style={localStyles.textTitle}>{'售价'}</Text>
            <View style={{height: Utils.normalize(40), flex: 1, marginRight: 15, left: 16, borderBottomWidth: 0.5, borderColor: '#387ff5'}}>
              <TextInput underlineColorAndroid="transparent" style={[localStyles.text, {height: Utils.normalize(40), position: 'relative'}]}
                ref="_salePriceInput"
                numberOfLines={1}
                keyboardType='numeric'
                autoCorrect={false}
                defaultValue={ car_info.sale_price ? car_info.sale_price.toString() : ( car_info.sale_price === 0 ? '0' : '' ) }
                onChangeText={this._change.bind(this)}
                onFocus={() => this.setState({searchClean: this.state.temp_saleprice ? true : false})}
                onBlur={() => this.setState({searchClean: false})}
              />
              {this.state.searchClean ? <Icon onPress={() => {this._clear("_salePriceInput")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
          <View style={{position: 'relative', top: -8, flex: 1, height: 28, justifyContent: 'center', alignItems: 'flex-end'}}>
            <Text style={{fontSize: 12, color: '#999', right: Utils.normalize(12)}}>{'(折扣: ￥' + Utils.oFixed((car_info.price - parseFloat(this.state.temp_saleprice)), 2, true) + ')'}</Text>
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
    paddingTop: 15,
    paddingBottom: 15
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
  },
  textTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    width: 48,
  },
});

export default EditNewCar;
