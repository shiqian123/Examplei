"use strict";
import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Alert
} from 'react-native';

import styles from '../common/styles'
import {Utils,Device,Assets} from "../base";
import {Header, Button, Loading} from '../components'

import Icon from 'react-native-vector-icons/Ionicons'
import {Actions} from 'react-native-router-flux'
import lodash from 'lodash';

// 菜单栏权限传值ops={}
export default class Item extends Component {
    constructor(props){
        super(props);
    }
    filterName( mName, tName){
      mName = mName.trim();
      let a = mName.replace( new RegExp("^" + tName + ""), '')
      return a;
    }
    render(){
        const {data, ops} = this.props;
        // 调拨按钮和锁定按钮的显示和样式控制
        let transferButton = {
          display: false,
          pattern: {}
        };
        let lockButton = {
          display: false,
          pattern: {},
          value: ''
        }
        let color = '#fd7878'
        // 通过状态和权限判断菜单按钮样式
        switch(data.status){
            case "0":
              if(ops === undefined) {break;}
              transferButton = {
                display: ops.allot ? true : false,
                pattern: {outLine: 'smallBorderBtnnRadius',text: 'smallBorderBlue'}
              };
              lockButton = {
                display: ops.lock ? true : false,
                pattern: {outLine: 'smallBorderBtnnRadius', text: 'smallBorderBlue'},
                value: '锁定'
              };
              color = '#2eb2fd';
              break;
            case "2":
              if(ops === undefined) {break;}
              transferButton = {
                display: ops.allot ? true : false,
                pattern: {outLine: 'smallBorderBtnnRadius',text: 'smallBorderBlue'}
              };
              lockButton = {
                display: ops.unlock ? true : false,
                pattern: {outLine: 'smallBorderRedBtnnRadius', text: 'smallBorderRed'},
                value: '解锁'
              };
              color = '#fd7878'
              break;
            case "6":
              if(ops === undefined) {break;}
              transferButton = {
                display: ops.allot ? true : false,
                pattern: {outLine: 'unAvailableBordernRadius',text: 'unAvailableText'},
              };
              lockButton = {
                display: false,
              };
              color = '#ffb400'
              break;
        }
        return(
            <View style={{flex:1, overflow: 'hidden'}}>
              <TouchableHighlight onPress={this.props.press} onLongPress={this.props.longPress} style={{backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f5f5f5' >
                <View style={localStyles.msgBlock}>
                  <View style={{flex: 1}}>
                    <View style={localStyles.msgRow}>
                      <Text numberOfLines={1} style={localStyles.msgName}>{data.type_name}</Text>
                      <View style={[localStyles.statusBtn,{borderColor: color, backgroundColor: color}]}>
                        <Text style={{fontSize: Utils.normalize(10),color: 'white',fontWeight: '500'}}>{data.status_name}</Text>
                      </View>
                    </View>
                    <View style={localStyles.msgRow}>
                      <Text numberOfLines={1} style={localStyles.msgName}>车型：{ this.filterName(data.model_name, data.type_name) }</Text>
                    </View>
                    <View style={localStyles.msgRow}>
                      <Text numberOfLines={1} style={localStyles.msgName} >车架号：{data.vin}</Text>
                    </View>
                    <View style={localStyles.msgRow}>
                      <Text numberOfLines={1} style={[localStyles.msgName,{flex: 1}]} >车身颜色：{data.color_name}</Text>
                      <Text numberOfLines={1} style={[localStyles.msgTime,{flex: 1}]} >内饰颜色：{data.inner_color}</Text>
                    </View>
                    <View style={localStyles.msgRow}>
                      <Text numberOfLines={1} style={[localStyles.msgName,{flex: 1}]} >仓库：{data.warehouse_name}</Text>
                      <Text numberOfLines={1} style={[localStyles.msgTime,{flex: 1}]} >总在库时间：{data.stockDay === undefined ? data.inwar_time : data.stockDay}</Text>
                    </View>
                  </View>
                  <View style={{width: 30, alignItems: 'center', justifyContent: 'center'}}>
                    <Icon style={{color: '#ccc', backgroundColor: 'transparent'}} color='#cccccc' name='ios-arrow-forward' size={23}/>
                  </View>
                </View>
              </TouchableHighlight>
              <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#fff'}}></View>
            </View>
        )
    }
}
const localStyles = StyleSheet.create({
  transferButton: {
    marginTop: 8,
    marginBottom: 8,
    marginRight: 12,
  },
  msgBlock: {
    flexDirection: 'row',
    paddingLeft:Utils.normalize(15),
    paddingTop: Utils.normalize(4),
    paddingBottom: Utils.normalize(4),
  },
  msgRow: {
    flexDirection: 'row',
    height: Utils.normalize(31),
    alignItems: 'center',
  },
  msgName: {
    fontSize: Utils.normalize(14),
    color: '#000',
    flex: 1
  },
  msgTime: {
    fontSize: Utils.normalize(14),
    flex: 1,
    marginRight: 10
  },
  statusBtn: {
    width: Utils.normalize(30),
    height: Utils.normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    marginLeft: 9,
    borderRadius: 4
  }
})
