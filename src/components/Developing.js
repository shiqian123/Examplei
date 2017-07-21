/**
</> * Created by shiqian on 16/7/7.
 */
"use strict";

import React, {Component} from 'react';
import {
  View,
  Image,
} from 'react-native';
import {Assets,Utils} from "../base"
class Developing extends Component {
    // 构造
  constructor(props) {
    super(props);
   }

  render() {
    return (
      <View>
        <View style={{alignSelf:'center',marginTop:Utils.height>=640?56:24}}>
          <Image source={Assets.developing} style={{width: 320, height: 400}}/>
        </View>
        <View style={{alignSelf:'center',marginTop:Utils.height>=640?42:32}}>
          <Image source={Assets.developTips}style={{width: 320, height: 50}}/>
        </View>
      </View>
    )
  }
}
export default Developing
