/**
* @Author: meteor
* @Date:   2016-08-11T17:08:38+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-09-02T18:09:12+08:00
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
    TextInput
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'
import Storage from 'react-native-storage'

class LimitPrice extends Component{
  constructor(props){
    super()
    this.state = {
      msg: props.msg,
      salesman: props.salesman
    }
  }
  componentDidMount() {
    // 读取storage
    storage.load({key: 'User'}).then((res) => {
      this.setState({isSale: res.isSale});
    });
  }
  render(){
    let data = this.state.msg;
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="限价"/>
        <View style={styles.md_itemTitleBox}>
          <Text style={styles.md_itemTitle}>此商品限价</Text>
        </View>
        <View style={{backgroundColor:'#fff'}}>
          {this.state.isSale ?
          <View style={styles.creditBox}>
            <Text style={styles.creditLeft}>您的限价为：{' '+(data.owner_limit&&data.owner_limit!=null ?Utils.oFixed(data.owner_limit,2,true)+'元':'无')}</Text>
          </View>
            :
          <View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>{this.state.salesman.owner_name}的限价为：{' '+(data.owner_limit ?Utils.oFixed(data.owner_limit,2,true)+'元':'无')}</Text>
            </View>
            <View style={styles.itemInsetLineR}></View>
            <View style={styles.creditBox}>
              <Text style={styles.creditLeft}>您的限价为：{' '+(data.manager_limit ?Utils.oFixed(data.manager_limit,2,true)+'元':'无')}</Text>
            </View>
          </View>
          }
        </View>
      </View>
    )
  }
}

export default LimitPrice;
