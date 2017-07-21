'use strict';

import React, {Component, PropTypes} from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native'

import {Utils} from '../../base'
import NetUtil from "../../base/netUtil"

export default class GetCaptchaButton extends Component {

  static propTypes = {
    onSendSuccess: PropTypes.func.isRequired,
    onDayLimit: PropTypes.func,
    onSendFail: PropTypes.func,
    account: PropTypes.string.isRequired,
    phoneNum: PropTypes.string.isRequired,
  }

  static defaultProps = {
    interval: 60, // 倒计时总时长
    clock: 1000, // 按秒计时
    unit: 's',
    disable: false, // 
  }

  constructor(props) {
    super(props)

    this.state = {
      status: 'init', // init、sending、again
      count: '',
    }
  }

  _onPressSend() {
    if (this.state.status == 'sending') {
      return;
    }
    
    let option = {
      autoSetToken: false,
      autoHandleLogicError: false
    }

    NetUtil.postJson(Utils.api.apply, {telephone: this.props.phoneNum, account: this.props.account}, option)
    .then(res => {
      this.setState({status: 'sending'}, this._startTimer)
      this.props.onSendSuccess.call(null, res.token);
    }).catch(err => {
      this.setState({isLoading: false})

      if (!err || !err.message) {return ;}

      // 达到每天最大限制
      if (err.message.status == 1201) {
        return this._onDayLimit()
      }

      // 1200 - 请求太频繁
      // 1202 - 短信服务异常
      if (err.message.status == 1202 || err.message.status == 1200) {
        return this.props.onSendFail && this.props.onSendFail()
      }
    }) 
  }

  _clearTimer() {
    this.state.timer && clearTimeout(this.state.timer);
  }

  _sendAgain() {
    this.setState({status: 'again'})
  }

  _startTimer() {
    let totalCount = this.props.interval
    let worker = () => {
      if (totalCount < 0) {
        this._clearTimer()
        this._sendAgain()
        return;
      }

      this.setState({count: totalCount--})

      let timer = setTimeout(() => {
        worker()
      }, this.props.clock)
      this.setState({timer: timer})
    }

    worker() // 启动倒计时
  }

  componentWillUnmount() {
    this._clearTimer()
  }

  _onDayLimit() {
    this.setState({disable: true})
    this.props.onDayLimit && this.props.onDayLimit()
  }

  _renderInit() {
    return (
      <View>
        {
          !this.state.disable ?
          <TouchableOpacity onPress={this._onPressSend.bind(this)}>
            <View style={[styles.view, styles.initView]}>
              <Text style={styles.text}>获取验证码</Text>
            </View>
          </TouchableOpacity>
          :
          <View style={[styles.view, styles.initView, styles.disableView]}>
            <Text style={[styles.text, styles.disableText]}>获取验证码</Text>
          </View>
        }
      </View>
    )
  }

  _renderCount() {
    return (
      <View style={[styles.view, styles.countView]}>
        <Text style={styles.text}>{this.state.count + this.props.unit}</Text>
      </View>
    )
  }

  _renderAgain() {
    return (
      <View>
        {
          !this.state.disable ?
            <TouchableOpacity onPress={this._onPressSend.bind(this)}>
              <View style={[styles.view, styles.againView]}>
                <Text style={styles.text}>再次发送</Text>
              </View>
            </TouchableOpacity>
          :
            <View style={[styles.view, styles.againView, styles.disableView]}>
              <Text style={[styles.text, styles.disableText]}>再次发送</Text>
            </View>
        }
      </View> 
    )
  }

  render() {
    return (
      <View>
        {
          this.state.status == 'init' ? this._renderInit()
          : this.state.status == 'sending' ? this._renderCount()
          : this._renderAgain()
        }
      </View>
    )
  }
}

const styles = {
  view: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fec900',
    borderRadius: Utils.normalize(3),
    height: Utils.normalize(33)
  },

  text: {
    color: '#fa8c01',
    fontSize: Utils.normalize(12),
  },

  initView: {
    width: Utils.normalize(73),
  },

  againView: {
    width: Utils.normalize(63),
  },

  countView: {
    width: Utils.normalize(55)
  },

  disableView: {
    borderColor: '#ccc'
  },

  disableText: {
    color: '#ccc'
  }
}

