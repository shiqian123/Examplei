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
import {Header, BasicNotify, Button, Loading, InputWithClear, Tip} from '../../components'

export default class SetNewPwd extends Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    account: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      password: '', // 新密码
      repassword: '', // 确认密码，同新密码

      showNotify: false, // 是否显示提醒
      notifyText: '', // 提醒内容
      isLoading: false,

      confirmAvailable: false // 确认按钮是否可点击
    }
  }

  _onChangePassword(text) {
    this.setState({password: text}, this._validateNotNull)
  }

  _onChangeRepassword(text) {
    this.setState({repassword: text}, this._validateNotNull)
  }

  // 两个文本框内容都不为空时，确认按钮可点击
  _validateNotNull() {
    this.setState({confirmAvailable: this.state.password.length && this.state.repassword.length})
  }

  // 校验两个文本框内容是否合法、是否一样
  _validate() {
    let pwd = this.state.password,
      repwd = this.state.repassword;

    let reg = /^[A-Za-z0-9_~!@#\$%^&\*-]{5,}$/
    if (!reg.test(pwd) || !reg.test(repwd)) {
      this._showNotify('密码格式错误')
      return false
    }

    if (pwd != repwd) {
      this._showNotify('您输入的密码不一致,请重新输入')
      return false
    }
    return true
  }

  _showNotify(text) {
    this.setState({showNotify: true, notifyText: text})
    setTimeout(() => {
      this.setState({showNotify: false})
    }, 3000)
  }

  _onPressConfirm() {
    if (!this._validate()) {
      return;
    }

    this.setState({isLoading: true})
    Utils.fetch( Utils.api.updatePwdByName, 'post', {
      pwd: this.state.password,
      repwd: this.state.repassword,
      token: this.props.token
    }).then(res => {
      this.setState({isLoading: false})
      Actions.resetSuccess({account: this.props.account})
    }).catch(err => {
      this.setState({isLoading: false})
    })  
  }

  _onPressBack() {
    Actions.login({type: 'replace', exit: true})
  }

  render() {
    return (
      <View style={commonStyles.container}>
        <Header 
          title="重置密码" 
          leftPress={this._onPressBack}
          leftIcon={{name: Device.iOS ? "ios-arrow-back" : "md-arrow-back", size: 23}} />

        {this.state.showNotify ? <Tip type='miss_tips' name={this.state.notifyText}/> : null}

        <View style={commonStyles.viewContainer}>
          
          <View style={styles.inputView}>
            <InputWithClear
                placeholder='输入新密码'
                onChangeText={this._onChangePassword.bind(this)}
                secureTextEntry={true}
                autoFocus={true} />

            <View style={commonStyles.lineM10}></View>  
          </View>

          <View style={styles.inputView}>
            <InputWithClear
                placeholder='重新输入新密码'
                onChangeText={this._onChangeRepassword.bind(this)}
                secureTextEntry={true} />
          </View>

          <View style={commonStyles.lineFull}></View>

          <View style={styles.hintView}>
            <Text style={commonStyles.text}>只能是5位以上的英文字母、数字和特殊符号:~!@#$%^&*_-</Text>
          </View>

          <View style={styles.nextContainer}>
            <Button 
              value="确认"
              shutdownInteractive={!this.state.confirmAvailable} 
              pattern={{outLine: this.state.confirmAvailable? "fullButton" : "fullButtonUnAct", text: "nextText"}} 
              onPress={this._onPressConfirm.bind(this)} />
          </View>

        </View>
      
        {this.state.isLoading ? <Loading></Loading> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputView: {
    backgroundColor: '#fff'
  },

  nextContainer: {
    marginTop: Utils.normalize(24),
    alignItems: 'center'
  },

  hintView: {
    marginTop: Utils.normalize(10),
    justifyContent: 'center',
    paddingLeft: Utils.normalize(15),
    paddingRight: Utils.normalize(15)
  }
})