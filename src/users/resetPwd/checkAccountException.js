'use strict';

import React, {Component, PropTypes} from 'react';

import {
  View,
  Text,
  TextInput,
  StyleSheet
} from 'react-native';
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'

import commonStyles from '../../common/styles'
import {Device, Utils} from "../../base";
import {Header, Button} from '../../components'

export default class CheckAccountException extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
  }

  _onPressConfirm() {
    Actions.login({type: 'replace', exit: true})
  }

  render() {
    return (
      <View style={commonStyles.container}>
        <Header 
          title="重置密码" 
          leftPress={() => Actions.pop()}
          leftIcon={{name: Device.iOS ? "ios-arrow-back" : "md-arrow-back", size: 23}} />

        <View style={[commonStyles.viewContainer, styles.viewContainer]}>
          <Icon
              name='ios-close-circle-outline'
              size={60} 
              color="#4F8EF7" 
              fontWeight='800'
              style={styles.iconClose} /> 

          <Text style={[commonStyles.text, styles.notifyText]}>{this.props.text}</Text>

          <Button
              value="确定" 
              shutdownInteractive={false} 
              pattern={{outLine: "fullButton", text: "nextText"}} 
              onPress={this._onPressConfirm} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },

  iconClose: {
    marginTop: Utils.normalize(30)
  },

  notifyText: {
    width: Utils.normalize(250),
    marginTop: Utils.normalize(10),
    marginBottom: Utils.normalize(24),
    textAlign: 'center',
    color: '#000',
    fontSize: Utils.normalize(16),
  }
})