'use strict';

import React, {Component, PropTypes} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'

import commonStyles from '../../common/styles'
import {Device, Utils} from "../../base";
import {Header, BasicNotify, Button, Loading, GetCaptchaButton, InputWithClear, Tip} from '../../components'
import NetUtil from '../../base/netUtil'

export default class GetCaptcha extends Component {
  static propTypes = {
    phoneNum: PropTypes.string.isRequired,
    account: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      captcha: '', // 验证码
      token: '',

      availableToNext: false, // 下一步按钮是否可用
      showNotify: false, // 用户不存在的时候显示提示
      isLoading: false,

      showTip: false,
      tipText: ''
    }
  }

  // 发送验证码成功
  _onSendSuccess(token) {
    this.setState({token: token})
  }

  _onChangeCaptcha(text) {
    this.setState({captcha: text, availableToNext: text.length > 0})
  }

  _onPressNext() {
    this.setState({isLoading: true})

    let option = {
      autoSetToken: false,
      autoHandleLogicError: false
    }
    NetUtil.postJson(Utils.api.verify, {token: this.state.token, code: this.state.captcha }, option)
    .then(res => {
      this.setState({isLoading: false})
      Actions.setNewPwd({token: this.state.token, account: this.props.account})
    }).catch(err => {
      if (err) {
        this.setState({showNotify: true})
      }
      this.setState({isLoading: false})
    }) 
  }

  _onDayLimit() {
    this.setState({showTip: true, tipText: '达到每天最大发送限制'})
    setTimeout(() => {
      this.setState({showTip: false})
    }, 3000)
  }

  _onSendFail() {
    this.setState({showTip: true, tipText: '发送失败,请稍候重试'})
    setTimeout(() => {
      this.setState({showTip: false})
    }, 3000)
  }

  render() {
    let displayNum = this.props.phoneNum.substr(0, 3) + '****' + this.props.phoneNum.substr(7);
    return (
      <View style={commonStyles.container}>
        <Header 
          title="重置密码" 
          leftPress={() => Actions.pop()}
          leftIcon={{name: Device.iOS ? "ios-arrow-back" : "md-arrow-back", size: 23}} />

        {this.state.showNotify ? <BasicNotify text="验证码错误"></BasicNotify> : null}

        <View style={commonStyles.viewContainer}>
          <View style={[commonStyles.inputContainer, styles.inputContainer]}>
            <TextInput
              editable={false}
              style={[commonStyles.inputs, styles.textInput]}
              defaultValue={displayNum}
              underlineColorAndroid="transparent" />
            <View style={styles.btnContainer}>
              <GetCaptchaButton
                onSendSuccess={this._onSendSuccess.bind(this)}
                phoneNum={this.props.phoneNum}
                account={this.props.account}
                onSendFail={this._onSendFail.bind(this)}
                onDayLimit={this._onDayLimit.bind(this)} />
            </View>
            <View style={commonStyles.lineM10}></View>
          </View>

          <View style={[commonStyles.inputContainer, styles.inputContainer]}>
            <InputWithClear
                onChangeText={this._onChangeCaptcha.bind(this)}
                placeholder="输入手机短信中的验证码"
                maxLength={6} />
          </View>

          <View style={commonStyles.lineFull}></View>

          <View style={styles.nextContainer}>
            <Button 
              value="验证"
              shutdownInteractive={!this.state.availableToNext} 
              pattern={{outLine: this.state.availableToNext ? "fullButton" : "fullButtonUnAct", text: "nextText"}} 
              onPress={this._onPressNext.bind(this)} />
          </View>

        </View>
        
        {this.state.showTip ? <Tip type='miss_tips' name={this.state.tipText}/> : null}
        {this.state.isLoading ? <Loading></Loading> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#fff'
  },

  textInput: {
    paddingLeft: 10,
    paddingRight: 20,
    width: Utils.width - 20,
    color: '#ccc'
  },

  nextContainer: {
    marginTop: Utils.normalize(35),
    alignItems: 'center',
    justifyContent: 'center'
  },

  btnContainer: {
    position: 'absolute',
    right: 16,
    top: 10
  }

})