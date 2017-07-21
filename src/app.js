/**
* @Author: Shen
* @Date:   2016-10-24T11:52:48+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-10-26T15:30:40+08:00
*/

'use strict';

import React, { Component }from 'react';
import { AppRegistry ,Text} from 'react-native';
import { HotUpdate} from './base'
import moment from 'moment';
moment.locale('zh-cn');
import Entry from './common/entry'


Text.defaultProps.allowFontScaling = false;
console.disableYellowBox = true

class swift_horse extends Component {

  // 使用Code-Push 启用即可
  // componentWillMount() {
  //   HotUpdate.listenToAppState();
  // }
  // componentDidMount() {
  //   HotUpdate.sync();
  // }
  // componentWillUnmount() {
  //   HotUpdate.unlistenToAppState();
  // }

  render() {
    return (< Entry/> )
  }
}

AppRegistry.registerComponent('aaa', () => swift_horse)
