/**
* @Author: meteor
* @Date:   2016-08-11T17:01:41+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-09-02T18:16:04+08:00
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
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'

class RemarkDetail extends Component{
  constructor(props){
    super()
    this.state = {
      des: props.des === null ? '' : props.des,
      oldDes: props.des === null ? '' : props.des,
      save:props.save
    }
  }
  _change(text){
    this.setState({des:text})
  }
  _back(){
    if(this.state.oldDes != this.state.des){
      Alert.alert(
        '确认放弃此次编辑',
        '',
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
      <View  style={styles.container}>
        <View>
          <Header leftPress={this._back.bind(this)} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} rightTitle={this.state.save ? '保存' : null} rightPress={this.props._save.bind(this, this.state.des)} title={this.props.title}/>
          <View>
            <TextInput
              placeholder={"点击输入"+this.props.title}
              placeholderTextColor='#ccc'
              multiline={true}
              editable={this.state.save}
              numberOfLines={6}
              style={{height:Utils.normalize(110),backgroundColor:'#fff',marginTop:10,marginLeft:10,marginRight:10,borderRadius:5,padding:12,fontSize:Utils.normalize(14),textAlignVertical:'top'}}
              onChangeText={this._change.bind(this)}
              defaultValue={this.state.des}
            />
          </View>
        </View>
    </View>)
  }
}

export default RemarkDetail
