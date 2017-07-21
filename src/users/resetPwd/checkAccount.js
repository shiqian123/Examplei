'use strict';

import React, { Component } from 'react';

import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import {Actions} from 'react-native-router-flux'

import commonStyles from '../../common/styles'
import {Device, Utils} from "../../base";
import {Header, BasicNotify, Button, Loading, InputWithClear} from '../../components'

export default class CheckAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      account: '', // 用户名

      availableToNext: false, // 下一步按钮是否可用
      showNotify: false,
      isLoading: false
    }
  }

  _onChangeAccount(text) {
    this.setState({account: text, availableToNext: text.length > 0})
  }

  _onPressNext() {
    this.setState({isLoading: true})
    Utils.fetch( Utils.api.checkAccount, 'post', {account: this.state.account})
      .then((res)=> {
        this.setState({isLoading: false})
        if (res && res.account_exist) {
          this._userExist(res)
        } else {
          this._userNotExist()
        }
      }).catch((err) => {
        this.setState({isLoading: false})
      })  
  }

  _userExist(res) {
    if (!res.tel) {
      Actions.checkAccountException({text: '系统中尚未添加手机号码,请联系该店的系统管理员添加'})
      return ;
    }
    if (res.tel && !res.formate) {
      Actions.checkAccountException({text: '系统中手机号码格式不正确,请联系该店的系统管理员修改'});
      return;
    }
    Actions.getCaptcha({phoneNum: res.phone_num, account: this.state.account})
  }

  _userNotExist() {
    this.setState({showNotify: true})
  }

  render() {
    return (
      <View style={commonStyles.container}>
        <Header 
          title="重置密码" 
          leftPress={() => Actions.pop()}
          leftIcon={{name: Device.iOS ? "ios-arrow-back" : "md-arrow-back", size: 23}} />

        {this.state.showNotify ? <BasicNotify text="用户名不存在"></BasicNotify> : null}

        <View style={commonStyles.viewContainer}>
          <View style={styles.inputView}>
            <InputWithClear
                placeholder='输入用户名'
                onChangeText={this._onChangeAccount.bind(this)}
                autoFocus={true} />
          </View>

          <View style={commonStyles.lineFull}></View>

          <View style={styles.nextContainer}>
            <Button 
              value="下一步" 
              shutdownInteractive={!this.state.availableToNext} 
              pattern={{outLine: this.state.availableToNext? "fullButton" : "fullButtonUnAct", text: "nextText"}} 
              onPress={this._onPressNext.bind(this)} />
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintTitle}>温馨提示:</Text>
            <Text style={styles.hintContent}>
              您输入用户名并点击“下一步”之后，将会通过该用户名绑定的手机号码来重置密码，如果您未绑定手机号码，可以联系该店的系统管理员添加号码。
            </Text>
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
    marginTop: Utils.normalize(35),
    alignItems: 'center'
  },

  hint: {
    marginTop: Utils.normalize(25),
    justifyContent: 'flex-start',
    paddingLeft: Utils.normalize(25),
    paddingRight: Utils.normalize(25)
  },

  hintTitle: {
    fontSize: Utils.normalize(14),
    color: '#999'
  },

  hintContent: {
    fontSize: Utils.normalize(13),
    color: '#999',
    marginTop: Utils.normalize(5),
    lineHeight: Utils.normalize(16)
  }
})