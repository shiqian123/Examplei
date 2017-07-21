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
    TextInput
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'

class SaleReference extends Component{
  constructor(props){
    super()
    this.state = {
      msg:props.msg
    }
  }
  render(){
    let data = this.state.msg[0];
    let reFerList = data['avg_key'] ? data['avg_key'].map((item,key)=>{
      return (
        <View key={key}
        style={key%2==1?{flex:1,flexDirection:'row',backgroundColor:'#fff',height:40,justifyContent:'center',alignItems:'center'}
      :{flex:1,flexDirection:'row',backgroundColor:'#f1f7fc',height:40,justifyContent:'center',alignItems:'center'}}>
          <Text style={styles.saleRefer}>{Math.round(item)}天内</Text>
          <Text style={styles.saleRefer}>{data['avg_earn'][item] || data['avg_earn'][item] === 0 ? Utils.oFixed(data['avg_earn'][item],2,true) + '元' : ''}</Text>
          <Text style={styles.saleRefer}>{data['avg_time'][item] || data['avg_time'][item] === 0 ? Math.round(data['avg_time'][item],2) + '天' : ''}</Text>
        </View>
      )
    }) : null;
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="销售参考"/>
        <View style={{backgroundColor:'#fff',height:40,justifyContent:'center', paddingLeft: Utils.normalize(15)}}>
          <Text>已选车辆 {data.vin}的总在库天数：<Text style={{color: '#ff0012'}}>{data.stockDays}</Text></Text>
        </View>
        <View style={styles.md_itemTitleBox}>
          <Text style={styles.md_itemTitle}>近期已售此车型</Text>
        </View>
        <View>
          <View style={{flex:1,flexDirection:'row',backgroundColor:'#fff',height:40,justifyContent:'center',alignItems:'center'}}>
            <Text style={styles.saleRefer}></Text>
            <Text style={styles.saleRefer}>平均售价</Text>
            <Text style={styles.saleRefer}>平均总在库天数</Text>
          </View>
          {reFerList}
        </View>
      </View>
    )
  }
}

export default SaleReference
