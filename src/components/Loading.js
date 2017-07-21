/**
* @Author: Shen
* @Date:   2016-08-19T11:25:00+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-08-22T15:32:35+08:00
*/

"use strict";

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ProgressBarAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import { Utils, Assets, Device } from '../base'


class Loading extends Component{
  constructor(props){
    super(props)
  }
  render() {
    return (
      <View style={[styles.container, {top:this.props.top === 'hide' ? 0 : Utils.andr21Normalize(64), backgroundColor: this.props.bg || 'rgba(221, 221, 221, 0.3)'}]}>
        { Device.iOS ? <ActivityIndicator color="#E00" size="small" /> : <ProgressBarAndroid styleAttr="SmallInverse" color="#E00" /> }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    position:'absolute',
    left:0,
    width:Utils.width,
    height:Utils.height,
    alignItems:'center',
    paddingTop:120,
  }
})

export default Loading
