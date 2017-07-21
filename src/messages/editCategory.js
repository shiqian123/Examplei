/**
* @Author: meteor
* @Date:   2016-08-31T12:07:40+08:00
* @Last modified by:   yanke
* @Last modified time: 2016-10-10T10:53:26+08:00
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
import Icon from 'react-native-vector-icons/Ionicons';


class EditCategory extends Component {
  //props: {car_info: item, bill_info: data} ---- car_info: 新车信息, bill_info: 单据信息
  constructor(props) {
    super();
    this.state = {
      tipShow: 'nothing',
      data: props.data,
      item: props.item,
      cate: props.cate,
      insureType: props.data.common.renew_insure,
      temp_saleprice: props.item.sale_price
    }
  }

  //保存
  _save() {

    let cate = this.state.cate;
    if( !isNaN(this.state.temp_saleprice) ){
      for(var key in this.state.data.items[cate]){
        if(this.state.data.items[cate][key].id == this.state.item.id){
          this.state.data.items[cate][key].sale_price = this.state.temp_saleprice;
          break;
        }
      }
      this.state.data.common.renew_insure = this.state.insureType;
      let params = {
        cart: this.state.data
      };
      this.setState({tipShow: 'loading'});
      Utils.fetch(Utils.api.save, 'post', params)
        .then((res) => {
          if (res) {
            this.setState({tipShow: 'success'});
            setTimeout(() => {
              this.setState({tipShow: 'nothing'});
              Actions.pop({refresh: {data: res.data}});
            }, 1000)
          } else {
            this.setState({tipShow: 'failed'});
            setTimeout(() => {
              this.setState({tipShow: 'nothing'});
            }, 1000)
          }
        });
    }
    else {
     Utils.showMsg('','请输入正确售价');
    }

  }
  _delete(){
    let cate = this.props.cate;
    this.setState({tipShow: 'loading'});
    for(var key in this.state.data.items[cate]){
      if(this.state.data.items[cate][key].id == this.state.item.id){
        this.state.data.items[cate].splice(key,1);
        break;
      }
    }
    let params = {
      cart: this.state.data
    };
    Utils.fetch(Utils.api.save, 'post', params)
      .then((res) => {
        if (res) {
          this.setState({tipShow: 'delete'});
          setTimeout(() => {
            this.setState({tipShow: 'nothing'});
            Actions.pop({refresh: {data: res.data}});
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

  _back() {
    if ( this.state.temp_saleprice != this.state.item.sale_price) {
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
  _numChange(type){
    switch (type) {
      case 'add':
        this.state.item.num ++;
        break;
      case 'minus':
        this.state.item.num --;
        if(this.state.item.num < 1){
          this.state.item.num = 1
        }
        break;
    }
    this.setState({shua : !this.state.shua})
  }
  _changeInsure(vl){
    this.setState({insureType: vl})
  }
  _limitPrice(item,salesman){
    Actions.limitPrice({msg:item,salesman:salesman})
  }

  _priceChange(text){
    // clear button control
    if (text && text.length > 0) {
      this.setState({searchClean: true})
    }else {
      this.setState({searchClean: false})
    }


    if( !Utils.regexp.isMate(text,'price') ){
      this.refs.price.clear();
      this.setState({temp_saleprice: '', searchClean: false})
    }else {
      this.setState({temp_saleprice : text})
    }

  }
  _clear() {
    this._priceChange('');
    this.refs.price.clear();
  }

  render() {
    let data = this.state.data;
    let item = this.state.item;
    let ShowOwnerLimit = 4; //显示销顾限价
    let ShowMgrLimit = 8; //显示主管销售限价
    if(!item || !data){ return (<Text>???</Text>)}
    return(
      <View style={[styles.container, {backgroundColor: '#efefef'}]}>
        <Header leftPress={() => this._back()} title={this.props.title} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}
          rightPress={() => this._save()} rightTitle="保存"/>
        <View style={[styles.md_itemsItem,{ backgroundColor: '#fff'}]}>
          <View style={[styles.md_itemsTextBox,{height: Utils.normalize(48)}]}>
            <Text style={[styles.md_itemsText,{fontSize: 16}]}>{(item.goods_info?item.goods_info+'-':'')+item.goods_name}</Text>
          </View>
          <View style={[styles.md_itemsTextBox,{height: Utils.normalize(48)}]}>
            <Text style={[styles.md_itemsText,{flex: 0,fontSize: 16}]}>售价</Text>
            <View style={{flex: 1,marginLeft: Utils.normalize(21),borderBottomWidth: 0.5,borderColor: '#387ff5',height: Utils.normalize(34),marginRight: Utils.normalize(5)}}>
              <TextInput
                underlineColorAndroid="transparent"
                style={{flex: 1, height: Utils.normalize(40)}}
                keyboardType="numeric"
                ref="price"
                defaultValue={item.sale_price ? item.sale_price.toString() : ( item.sale_price === 0 ? '0' : '' ) }
                onChangeText={this._priceChange.bind(this) }
                onFocus={() => this.setState({searchClean: this.state.temp_saleprice ? true : false})}
                onBlur={() => this.setState({searchClean: false})}
              />
              {this.state.searchClean ? <Icon onPress={() => {this._clear()}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
            {data.common.show_options & ShowOwnerLimit ? <Button value="限价" style={{marginRight: Utils.normalize(15)}} pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}} onPress={()=>{this._limitPrice(item,data.salesman)}}></Button> : null}
          </View>
          {
            // <View style={[styles.row,{alignItems:'center'}]}>
            //   {(this.state.isSale && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
            //   {(this.state.isManager && (item.sale_price < (item.manager_limit ? item.manager_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
            //   {(this.state.isManager && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<' + data.salesman.owner_name + '的限价'}</Text></View> : null}
            // </View>
          }

          <View style={[styles.md_itemsTextBox,{height: Utils.normalize(16)}]}>
            <Text style={[styles.md_itemsText,{flex:1,textAlign: 'right',marginRight: Utils.normalize(50)}]}>
              <Text style={styles.md_rebate}>（折扣：¥{Utils.oFixed((item.price - this.state.temp_saleprice),2,true)}）</Text>
            </Text>
            {
              // {item.is_out?<View style={styles.blueBtn}><Text style={{color:'#fff',fontSize:10}}>已结算出库</Text></View>:null}
              // {!item.is_out&&item.finance_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
            }

          </View>
          {
            this.state.cate == 3 ?
            <View style={[styles.md_itemsTextBox,{height: Utils.normalize(48)}]}>
              <Text style={[styles.md_itemsText,{flex: 0,fontSize: 16}]}>类别</Text>
              <Button value="新保"
                onPress={this._changeInsure.bind(this,'0')}
                pattern={{outLine: Number(this.state.insureType) == 0 ? 'smallBorderBtn' :'smallBorderGrayBtn',text:Number(this.state.insureType) == 0 ? 'smallBorderBlue' : 'smallBorderGray'}}
                style={{marginLeft: Utils.normalize(23), marginRight: Utils.normalize(20)}}
                ></Button>
              <Button value="续保"
                onPress={this._changeInsure.bind(this,'1')}
                pattern={{outLine:Number(this.state.insureType) == 1 ? 'smallBorderBtn' :'smallBorderGrayBtn',text:Number(this.state.insureType) == 1 ? 'smallBorderBlue' : 'smallBorderGray'}}
                style={{marginLeft: Utils.normalize(20), marginRight: Utils.normalize(20)}}
                ></Button>
            </View>
            : <View style={{height: Utils.normalize(15)}}></View>
          }


        </View>
        <TouchableOpacity onPress={this._delete.bind(this)} style={{position: 'absolute', width: Device.width, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center',height: Utils.normalize(50), backgroundColor: '#fff'}}>
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

export default EditCategory;
