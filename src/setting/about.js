'use strict'

import React, { Component } from 'react';
import {
  View,
  Text,
  Image
} from 'react-native'
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'

import styles from '../common/styles'
import Icon from 'react-native-vector-icons/Ionicons'
import {Utils, Device, Assets} from "../base";
import {Header} from '../components'

class About extends Component {
  constructor(props) {
    super()
  }

  render() {
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="关于"/>
        <View style={styles.viewContainer}>
          <View style={styles.aboutContent}>
            <View style={styles.aboutLogoBlack}><Image source={Assets.logo} style={styles.aboutLogo} /></View>
            <Text style={styles.text}></Text>
            <Text style={styles.text}>云杉思维</Text>
            <Text style={styles.text}></Text>
            <Text style={styles.text}>v{Device.version}({Device.buildNumber})</Text>
          </View>
        </View>
      </View>
    )
  }
}

export default About
