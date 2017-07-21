/**
* @Author: Shen
* @Date:   2016-08-05T12:10:46+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-08-12T17:00:19+08:00
*/

'use strict';
/**
 * @providesModule ItemCheckbox
 */

import React, { Component, PropTypes } from 'react';
import styles from '../common/styles'
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome';

export default class ItemCheckbox extends React.Component {
  static propTypes = {
    onCheck: React.PropTypes.func,
    onUncheck: React.PropTypes.func,
    icon: React.PropTypes.string,
    size: React.PropTypes.number,
    backgroundColor: React.PropTypes.string,
    borderColor:React.PropTypes.string,
    color: React.PropTypes.string,
    iconSize: React.PropTypes.string,
    checked: React.PropTypes.bool,
    circle: React.PropTypes.bool,
    default: React.PropTypes.bool,
    text:React.PropTypes.string,//选择框后面追加的字 默认为空
    label:React.PropTypes.bool //是否显示选择框后面的内容  默认为 false
  };

  static defaultProps = {
    circle:true,
    onCheck: null,
    onUncheck: null,
    icon: "check",
    size: 40,
    backgroundColor: 'white',
    color: 'grey',
    iconSize: 'normal',
    checked: false,
    borderColor:'#4987EF',
    default: false,
    text:'',
    label:false
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      checked: false,
      bg_color: this.props.backgroundColor,
    }
  }

  _getCircleCheckStyle() {
    return {
      width: this.props.size,
      height: this.props.size,
      backgroundColor: this.state.bg_color,
      borderColor: this.props.borderColor,
      borderWidth: 1,
      borderRadius: this.props.circle ?this.props.size/2 : 0,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 1,
    };
  }

  _getIconSize() {
    if (this.props.iconSize == 'small') {
      return this.props.size * 0.5;
    } else if (this.props.iconSize == 'normal') {
      return this.props.size * 0.6;
    } else {
      return this.props.size * 0.7;
    }
  }

  _getCircleIconStyle() {
    return {
      color: this.props.backgroundColor,
      width: this._getIconSize(),
      height: this._getIconSize(),
    };
  }

  _completeProgress(defaultValue) {
    if (this.state.checked) {
      this.setState({
        checked: false,
        bg_color: this.props.backgroundColor,
      });
      if (this.props.onUncheck && !defaultValue) {
        this.props.onUncheck();
      }
    } else {
      this.setState({
        checked: true,
        bg_color: this.props.color,
      });
      if (this.props.onCheck && !defaultValue) {
        this.props.onCheck();
      }
    }
  }

  _initDefault() {
    this._completeProgress(true);
  }

  componentDidMount() {
    if (this.props.checked) {
      this._completeProgress(false);
    }

    if (this.props.default) {
      this._initDefault();
    }
  }

  render() {
    var icon = this.props.icon;
    return (
    <View style={[this.props.style,{flexDirection:'row',alignItems: 'center'}]}>
        <TouchableWithoutFeedback
          onPress={this._completeProgress.bind(this, false)}
        >
          <View style={this._getCircleCheckStyle()}>
            <Icon
              name={this.props.icon}
              size={this._getIconSize()}
              color={this.props.backgroundColor}
              backgroundColor='transparent'
              style={this._getCircleIconStyle()}
            />
          </View>
        </TouchableWithoutFeedback>

        {this.props.label ?
          <TouchableWithoutFeedback
           onPress={this._completeProgress.bind(this, false)}>
           <View>
             <Text style={styles.checkText}>{this.props.text}</Text>
           </View>
         </TouchableWithoutFeedback> : null}
      </View>
    );
  }
}

module.exports = ItemCheckbox;
