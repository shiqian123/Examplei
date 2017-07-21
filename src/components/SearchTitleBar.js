/**
* @Author: shiqian
* @Date:   2016-09-29T14:46:39+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-09-29T23:14:39+08:00
*/

/**
 * Created by shiqian on 16/8/19.
 */
/**
 * Created by shiqian on 16/8/18.
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
  TextInput,
  StatusBar,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";

class  SearchBar extends  Component{
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {};
  }
  static propTypes = {
    leftPress:React.PropTypes.func,
    rightPress:React.PropTypes.func,
    textChange:React.PropTypes.func,
    textDefault:React.PropTypes.string,
    rightShow:React.PropTypes.bool,

  };

  static defaultProps = {
    textDefault:'以新车名称搜索'
  };
  render(){
    return(
      <View>
        <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" />
        <View style={styles.navbar}>
          <TouchableOpacity style={[search_tab.leftPress]}  onPress={this.props.leftPress}  >
            <Icon   name={Device.iOS ? "ios-arrow-back" : "md-arrow-back"} size={23 }  color='#fff'/>
          </TouchableOpacity>
          <View style={{flex: 6,backgroundColor:'#fff',borderRadius:3, height: Utils.normalize(28),marginTop:7,marginRight:10,marginBottom:7,}}>
              <TextInput style={[styles.msgSerach]}
                         autoCapitalize='none'
                         ref="searchInput"
                         autoCorrect={false}
                         onChangeText ={(text)=>this.props.changeText(text)}
                         placeholder={this.props.textDefault}
                         placeholderTextColor="#999999"
                         underlineColorAndroid="transparent"
                         onFocus = {()=> this.props.onFocus()}
              />
          </View>
        <Icon name="ios-search" size={18} color='#999999' style={[styles.serachIcon,{top: Device.iOS?Utils.normalize(34):Utils.andr21Normalize(34), left: Device.iOS?54:58}]} />
          {
            this.props.rightShow ?
              <TouchableOpacity style={{paddingLeft:12,paddingTop:4,paddingRight:8}}  onPress={this.props.rightPress}>
                <Image source={Assets.icons.filter} style={{width: 21, height: 19}}  />
              </TouchableOpacity> :
              <View style={{paddingLeft:12}}>
                <View style={{width: 24, height: 24}}></View>
              </View>
          }
        </View>
      </View>

    )
  }
}
const search_tab = StyleSheet.create({
  leftPress:{
    paddingTop: 4,
    paddingLeft: 10,
    paddingRight: 24,
  },
  input:{
    flex:6,
    textAlign:'left',
    height:Utils.normalize(40),
    paddingLeft:4,
    fontSize:14,
    overflow:'hidden'
  }
})

export default SearchBar;
