'use strict'
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native'
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'

import Swiper from 'react-native-swiper'
import {Utils} from "../base";

export default class LandingSwiper extends Component {
  constructor(props) {
    super(props)
  }
  _navigateToSubview() {
    storage.save({
      key: 'Guide',
      rawData: {
        show: false
      }
    })
    Actions.login()
  }
  render() {
    return (
      <Swiper style={styles.wrapper} showsPagination={false} loop={false}>
        <View style={styles.slide1}>
          <Text style={styles.text}>ONE</Text>
        </View>

        <View style={styles.slide2}>
          <Text style={styles.text}>TWO</Text>
        </View>

        <View style={styles.slide3}>
          <View style={styles.slideText}>
            <Text style={styles.text}>TREE</Text>
          </View>
          <View style={styles.buttons}>
            <View style={styles.rightButton}>
              <Text style={styles.skipButton} onPress={this._navigateToSubview.bind(this)}>立刻体验</Text>
            </View>
          </View>
        </View>
      </Swiper>
    )
  }
}

const styles = StyleSheet.create({
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4D91EE',
  },

  slideText: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Utils.height,
  },

  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EE4D4D',
  },

  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A14DEE',
  },

  skipButton: {
    backgroundColor: '#3BC1FF',
    color: '#fff',
    textAlign: 'center',
    width: Utils.width / 1.3,
    padding:15,
    bottom:60
  },

  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
})
