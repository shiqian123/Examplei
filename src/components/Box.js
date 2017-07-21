/**
* @Author: shiqian
* @Date:   2016-10-25T14:43:32+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   callback
* @Last modified time: 2016-11-07T18:02:47+08:00
*/

/**
 * Created by shiqian on 16/8/24.
 */
import React, { Component } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  ListView,
  RefreshControl,
  Modal,
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  TextInput
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";

class Box extends Component{
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {
      focused: false
    };
  }
  static defaultProps = {
    leftGray:false
  };
  _changeText(ref,text){
    if(this.props.price){
      let re1 = /^\d+(\.\d{0,100})?$/
      if (!re1.test(text)) {
        text = ""
        this.refs[this.props.inputBox.ref].clear();
      }
    }
    this.props.inputBox.onChangeText(text);
  }
  render(){
    return(
      <View style={[this.props.style,{marginLeft:12}]}>
        {
          this.props.inputBox ?
          <View style={[box.list,{borderBottomWidth: this.props.listLast ? 0 : 0.5}]}>
            <View style={box.inputLeft}>
              <Text style={[ {marginLeft: 0,fontSize: 16} ]}>{this.props.left}</Text>
              {this.props.important ? <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text> : null}
            </View>
            <View style={box.inputBox}>
              <TextInput
                style={box.input}
                {...this.props.inputBox}
                placeholderTextColor='#ccc'
                underlineColorAndroid="transparent"
                onFocus={()=>{this.setState({focused: true});}}
                onBlur={()=>{this.setState({focused: false});}}
                onChangeText={this._changeText.bind(this, this.props.inputBox.ref)}
                />
              {(this.props.hasIcon || this.props.inputBox.value) && this.state.focused ?
                <Icon onPress={()=>{this.refs[this.props.inputBox.ref].clear();this.props.iconPress()}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} />
              :null}
            </View>
          </View>
          :
          <View style={[box.list,{borderBottomWidth: this.props.listLast ? 0 : 0.5}]}>
            <Text style={[ {marginLeft: 0,fontSize: 16} ]}>{this.props.left}</Text>
            {this.props.important ? <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text> : null}
            <Text style={[styles.creditRight,this.props.isDefine?{flex:2}:{}]}>{this.props.right || (this.props.changeAble ? '未填写' : '')}</Text>
            {this.props.changeAble?<Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/> : <Text></Text>}
          </View>
        }
      </View>
    )
  }
}
const box = StyleSheet.create({
  label:{
    marginTop:Utils.normalize(10),
    marginLeft:Utils.normalize(12),
  },
  redColor:{
    color:'red',
    paddingLeft:12,
    fontSize:Utils.normalize(16),

  },
  grayColor:{
    color:'#999999',
    fontSize:Utils.normalize(14)
  },
  list:{
    alignItems:'center',
    flexDirection:'row',
    paddingLeft:3,
    paddingRight:15,
    minHeight:Utils.normalize(45),
    borderBottomColor:'#ddd'
  },
  inputLeft:{
    width: 102,
    flexDirection: 'row'
  },
  inputBox: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#387ff5',
    height: Utils.normalize(34),
    // marginRight: Utils.normalize(15)
  },
  input:{
    borderWidth: 0,
    height: Utils.normalize(40),
    fontSize: Utils.normalize(16),
  }
});
export default Box
