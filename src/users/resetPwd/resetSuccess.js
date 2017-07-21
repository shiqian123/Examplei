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

export default class ResetSucceed extends Component {
  static propTypes = {
    account: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
  }

  _onPressConfirm() {
    Actions.login({type: 'replace', exit: true, account: this.props.account})
  }

  render() {
    return (
      <View style={commonStyles.container}>
        <Header title="重置密码" />

        <View style={[commonStyles.viewContainer, styles.viewContainer]}>
          <Icon
              name='ios-checkmark-circle-outline'
              size={60} 
              color="#4F8EF7"
              style={styles.iconClose} /> 

          <Text style={[commonStyles.text, styles.notifyText]}>密码设置成功</Text>

          <Button
              value="完成" 
              shutdownInteractive={false} 
              pattern={{outLine: "fullButton", text: "nextText"}} 
              onPress={this._onPressConfirm.bind(this)} />
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
    marginBottom: Utils.normalize(50),
    textAlign: 'center',
    fontSize: Utils.normalize(16),
    color: '#000'
  }
})