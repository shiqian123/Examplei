'use strict';

import React, {Component, PropTypes} from 'react'
import {
  View,
  TextInput,
  StyleSheet
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'

import commonStyles from '../../common/styles'
import {Utils} from "../../base";

/**
 * 输入框，自带清除按钮
 * 
 * 清空时，onChangeText方法会被调用，返回空文本
 * 
 * todo: 切换输入框时，文本会产生跳跃
 *
 */
export default class InputWithClear extends Component {

  static propTypes = {
    onChangeText: PropTypes.func.isRequired
  }

  static defaultProps = {
    keyboardType: 'default',
    returnKeyType: 'done',
    placeholder: '',
    underlineColorAndroid: 'transparent',

    autoCorrect: false,
    autoFocus: false,
    autoCapitalize: 'none',
    multiline: false,

    secureTextEntry: false
  }

  constructor(props) {
    super(props)
    this.state = {
      inputValue: '', // 输入值
      showClear: false, // 是否显示清除按钮
    }
  }

  _onChangeText(text) {
    this.setState({
      inputValue: text,
      showClear: text.length > 0
    })
    this.props.onChangeText.call(null, text)
  }

  _onFocus() {
    this.state.inputValue && this._showClear()
  }

  _onBlur() {
    this._hideClear()
  }

  _hideClear() {
    this.setState({showClear: false})
  }

  _showClear() {
    this.setState({showClear: true})
  }

  // 清空输入框
  _onPressClear() {
    this.refs.zinput && this.refs.zinput.clear()
    this._onChangeText('')
  }

  render() {
    return (
      <View>
        <TextInput
          {...this.props}
          ref = 'zinput'
          style = {[commonStyles.inputs, styles.textInput]}

          onFocus = {this._onFocus.bind(this)}
          onBlur = {this._onBlur.bind(this)}
          onChangeText = {this._onChangeText.bind(this)}
        />
        
        {
          this.state.showClear ? 
          <Icon 
            onPress = {this._onPressClear.bind(this)} 
            name = 'ios-close-circle' size={18} color='#999999' 
            style = {styles.clearIcon}
            /> 
          : null
        }
      </View>
    )
  }

}

const styles = {
  // textInput 默认样式，高度为50，所以不用normalize
  textInput: {
    marginLeft: 10,
    paddingLeft: 0,
    paddingRight: 0,
    width: Utils.width - 40,
    // borderWidth: 1,
    // borderColor: '#000'
  },

  clearIcon: {
    position:'absolute',
    backgroundColor:'rgba(255,255,255,0)',
    top: 16, 
    right: 10
  }
}