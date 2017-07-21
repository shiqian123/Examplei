/**
* @Author: meteor
* @Date:   2016-08-17T17:44:44+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-08-24T17:07:58+08:00
*/

"use strict";

import React, { Component } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons'
import { Utils, Device, Assets} from '../base'


class Header extends Component{
  constructor(props){
    super(props)
  }
  render() {
    return (
      <View>
      <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" onPress={this.props.barPress} />
        <View style={styles.navbar}>
          <Text style={[styles.navLeftButton]} onPress={this.props.leftPress}>
            {this.props.leftTitle}
            {this.props.leftIcon?<Icon {...this.props.leftIcon} color="#fff"/>:null}
          </Text>
          <Text style={[styles.navTitle,{textAlign:Device.isAndroid&&this.props.leftIcon?'left':'center'}]} onPress={this.props.titlePress}>
            {this.props.title}
            {this.props.titleIcon?<Icon {...this.props.titleIcon} color="#fff"/>:null}
          </Text>
          <Text style={[styles.navRightButton]} onPress={this.props.rightPress}>
            {this.props.rightTitle}
            {this.props.rightIcon && this.props.rightIcon.name?<Icon {...this.props.rightIcon} color="#fff"/>:null}
            {this.props.rightImage?<Image source={this.props.rightImage.source} style={[styles[this.props.rightImage.pattern]]}/>:null}
          </Text>
          {this.props.leftIcon && Device.isAndroid ? <Image source={Assets.androidBar} opacity={0.8} style={{width: 0.5, height: Utils.normalize(25),position:'absolute',left: Utils.normalize(35),top:Utils.andr21Normalize(33)}}/> : null}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    paddingTop: Utils.andr21Normalize(20),
    // marginTop: Device.iOS ? 0 : -1,
    height: Utils.andr21Normalize(64),
    backgroundColor: '#4987EF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navLeftButton: {
    paddingLeft: Utils.normalize(10),
    flex: Device.iOS ? 1 : 0,
    width: Device.iOS ? 0 : Utils.normalize(40),
    color: '#fff',
    fontSize: Utils.normalize(18),
    left: 0,
    textAlign: 'left',
    paddingTop: 5,
  },
  navTitle: {
    flex: 5,
    color: '#fff',
    fontSize: Utils.normalize(18),
    fontWeight: 'bold',
    paddingTop: 5,
    textAlign: Device.iOS ? 'center' : 'left'
  },
  navRightButton: {
    flex: 1,
    paddingRight: Utils.normalize(10),
    fontSize: Utils.normalize(18),
    textAlign: 'right',
    color: '#fff',
    paddingTop: 5,
  },
  rightBtn:{
    width: Utils.normalize(20),
    height: Utils.normalize(20),
    top: Device.iOS? Utils.normalize(8) : 0
  }
})

export default Header
