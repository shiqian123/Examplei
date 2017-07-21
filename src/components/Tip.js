/**
* @Author: yanke
* @Date:   2016-08-15T17:46:13+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   yanke
* @Last modified time: 2016-10-09T12:25:47+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  StatusBarIOS,
  Alert,
  Text,
  Image,
  StyleSheet
} from 'react-native'
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'

import {Utils, Assets} from "../base";
import Icon from 'react-native-vector-icons/Ionicons'

class Tip extends Component{
  constructor(props) {
    super()
  }
  render() {
    if (this.props.type === 'miss_tips') {
      return (
        <View style={styles.container}>
          <View style={styles.miss_tips}>
            <Text style={{color:'#fff'}}>{this.props.name}</Text>
          </View>
        </View>
      )
    }else if(this.props.type === 'loading') {
      return (
        <View style={styles.tips}>
          <Icon name="ios-pulse-outline" size={30 * Utils.pixel} color="#fff" />
          <Text style={{color:'#fff'}}>{this.props.name}</Text>
        </View>
      )
    }else if(this.props.type === 'failed') {
      return (
        <View style={styles.tips}>
          <Icon name="ios-close-outline" size={30 * Utils.pixel} color="#fff" />
          <Text style={{color:'#fff'}}>{this.props.name}</Text>
        </View>
      )
    }
    return (
      <View style={styles.tips}>
        <Icon name="ios-checkmark-circle-outline" size={30 * Utils.pixel} color="#fff" />
        <Text style={{color:'#fff'}}>{this.props.name}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    width: Utils.width,
    height: Utils.height,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tips: {
    position: 'absolute',
    top: (Utils.height / 2) - (100 * Utils.pixel),
    left: (Utils.width / 2) - (128 * Utils.pixel / 2),
    width: 128 * Utils.pixel,
    height: 100 * Utils.pixel,
    backgroundColor: '#666',
    borderRadius: 12 * Utils.pixel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miss_tips: {
    height: 35 * Utils.pixel,
    paddingLeft: Utils.normalize(14),
    paddingTop: Utils.normalize(10),
    paddingRight: Utils.normalize(14),
    paddingBottom: Utils.normalize(10),
    backgroundColor: '#666',
    borderRadius: 5 * Utils.pixel,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default Tip
