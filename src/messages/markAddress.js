/**
* @Author: meteor
* @Date:   2016-08-25T19:23:32+08:00
* @Last modified by:   yanke
* @Last modified time: 2016-10-10T10:54:37+08:00
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
    Alert,
    DatePickerIOS,
    DatePickerAndroid
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'
import lodash from 'lodash';

class RemarkDetail extends Component{
  constructor(props){
    super()
    this.state = {
      cust: props.cust,
      custCopy: lodash.cloneDeep(props.cust),
      custUi: props.custUi
    }
  }
  _save(){
    Actions.pop( {refresh: {cust: this.state.cust, custUi: this.state.custUi} } );
  }
  _change(text){
    this.state.cust.address = text;
  }
  _back(){
    if(this.state.cust.address != this.state.custCopy.address){
      Alert.alert(
        '',
        '确认放弃此次编辑',
        [
          {text:'取消', onPress:()=>{}},
          {text:'确定', onPress:()=>{Actions.pop()}}
        ]
      )
    }else{
      Actions.pop();
    }
  }
  render(){
    return (
        <View style={styles.container}>
          <Header leftPress={this._back.bind(this)} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="地址" rightTitle="保存" rightPress={this._save.bind(this)}/>
          <View>
            <TextInput
              placeholder="输入详细地址"
              placeholderTextColor='#ccc'
              multiline={true}
              autoFocus={true}
              style={{height:Utils.normalize(110),backgroundColor:'#fff',marginTop:10,marginLeft:10,marginRight:10,borderRadius:5,padding:12,fontSize:Utils.normalize(14),textAlignVertical:'top'}}
              onChangeText={this._change.bind(this)}
              defaultValue={this.state.cust.address}
            />
          </View>
        </View>
      )
  }
}

export default RemarkDetail
