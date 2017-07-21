'use strict';

import React, {Component, PropTypes} from 'react'
import {
  View,
  StyleSheet,
  Text
} from 'react-native'

import {Utils} from "../../base";

export default class BasicNotify extends Component {
  static propTypes = {
    text: PropTypes.string
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View style={localStyle.container}>
        <Text style={localStyle.text}>{this.props.text}</Text>
      </View>
    )
  }
}

const localStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Utils.normalize(40),
    backgroundColor: '#fdf5e1',
    justifyContent: 'center',
    alignItems: 'center'
  },

  text: {
    color: '#d88c07',
    fontSize: Utils.normalize(13)
  }
})
