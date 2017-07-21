"use strict"
import React, { Component } from 'react';
import {
  View,
  Text,
  Image
} from 'react-native'

import {Utils, Assets} from "../base";
import styles from './styles'

class NetworkError extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    return (
      <View style={styles.container}>
        <View style={styles.netErrBox}>
          <Image style={styles.netErrImage} source={Assets.networkError}/>
          <Text style={styles.netErrText}>{this.props.message || '网络不给力，请检查您的网络设置'}</Text>
          <Text style={styles.netErrbutton}>{this.props.button_text || '刷新'}</Text>
        </View>
      </View>
    )
  }
}

export default NetworkError
