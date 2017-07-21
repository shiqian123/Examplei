/**
* @Author: meteor
* @Date:   2016-08-15T18:40:37+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-08-24T15:28:02+08:00
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
    TouchableOpacity
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header, Loading, Tip, Box} from '../components'
import lodash from 'lodash';

class BaiscInfo extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data,
      dataC: lodash.cloneDeep(props.data),
    }
  }
  componentDidMount() {
    storage.load({key: 'User'}).then((res) => {
      this.setState({isSale: res.isSale});
    });
  }
  componentWillReceiveProps(nextPage){
    this.setState({dataC : nextPage.data})
  }
  saleType(){
    Actions.saleType({data: this.state.dataC})
  }
  changeCustomer(){
    Actions.changeCustomer({data: this.state.dataC})
  }
  _baseSure(){
    this.setState({tipShow: 'loading'});
    Utils.fetch( Utils.api.save, 'post', {cart: this.state.dataC}).
    then((res)=>{
      if(res){
        this.state.data.common = this.state.dataC.common;
        this.state.data.customer = this.state.dataC.customer;
        this.setState({tipShow: 'success'});
        setTimeout(() => {
          Actions.pop({refresh: {message: 'customer chenged'}})
          this.setState({tipShow: 'nothing'});
        },1000)
      }
    })
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
   _back(){
     Actions.pop()
   }
  render(){
    let data = this.state.dataC.common;
    let salesman = this.state.dataC.salesman;
    let customer = this.state.dataC.customer;
    let changePower = this.state.isSale && data.status == 1;
    return (
      <View style={styles.container}>
        <Header leftPress={this._back.bind(this)} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="基本信息"  rightTitle={this.state.isSale&& data.status == 1 ? "确认" : ""} rightPress={this.state.isSale&& data.status == 1 ? this._baseSure.bind(this) : null}/>
        <View style={{backgroundColor:'#fff'}}>
          <TouchableOpacity onPress={changePower ? this.saleType.bind(this) : null}>
            <Box left={'销售渠道'} right={data.sale_type} changeAble={changePower}/>
          </TouchableOpacity>
          <Box left={'创建时间'} right={data.create_time}/>
          <TouchableOpacity onPress={changePower ? this.changeCustomer.bind(this) : null}>
            <Box left={'客户名称'} right={customer.customer_name} changeAble={changePower}/>
          </TouchableOpacity>
          <Box left={'性别'} right={customer.customer_sex}/>
          <Box left={'联系电话'} right={customer.customer_tel}/>
          <Box left={'销售顾问'} right={salesman.owner_name}/>
          <Box left={'部门'} right={salesman.org_name}/>
          <Box left={'职务'} right={salesman.owner_title}/>
        </View>
        {this._tipShow()}
      </View>
    )
  }
}

export default BaiscInfo;
