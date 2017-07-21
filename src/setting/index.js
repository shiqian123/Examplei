/**
* @Author: meteor
* @Date:   2016-08-11T17:08:38+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-08-27T11:57:46+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  StatusBarIOS,
  Alert,
  Text,
  Image
} from 'react-native'
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'

import styles from '../common/styles'
import {Utils, Assets} from "../base";
import Icon from 'react-native-vector-icons/Ionicons'
import {Tip} from  "../components"

class Me extends Component {
  constructor(props) {
    super()
    this.state = {
      me: {},
      clean: false,
      show: false
    }
  }

  _cleanCache() {
    storage.clearMap()
    this.setState({show: true})
    setTimeout(()=>{
      this.setState({show: false})
    },2000)
  }
  _doLogout() {
    let _temStorage = '';
    let remember;
    storage.save({
      key: 'Guide',
      rawData: {
        show: true,
      }
    })
    storage.load({
      key: "System"
    }).then(res => {
      remember = res.remember;
      Utils.changeStorage(['isLogin'] ,[false]);
    }).then( ()=> {
      socket.close();
      socket.emit('disconnect');
      console.log(socket)
      Actions.login({type: 'replace',remember: remember});
    })
  }

  /**
   * 视图初始化
   */
  componentDidMount() {
    this._getUser()
  }
  _getUser(){
    storage.load({
      key: "User"
    }).then(res => {
      this.setState({me: res})
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={Assets.aboutBack} style={styles.meBackgroundImage}>
          <View style={styles.meInfo}>
            <View style={styles.meDetailPic}>
              <Text style={styles.meDetailTxt}>{this.state.me.username || ''}</Text>
            </View>
            <Text style={styles.meDetailTxt}></Text>
            <Text style={styles.meDetailTxt}>{this.state.me.title || ''}</Text>
          </View>
        </Image>
        <View style={[styles.viewContainer]}>
          <View style={styles.h30}></View>
          <TouchableHighlight  underlayColor='#f2f2f2' style={[styles.fullButtonGroupA ]} onPress={this._cleanCache.bind(this)}>
            <View style={[styles.row,{alignItems:'center',height: Utils.normalize(45),backgroundColor:'#fff'}]}>
              <Image style={styles.meSetIcon} source={Assets.trash}/>
              <Text style={styles.fullButtonTextLeft}>清除缓存</Text>
              <Icon style={styles.seTright} name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableHighlight>
          <View style={styles.h30}></View>
          <TouchableHighlight  underlayColor='#f2f2f2' style={[styles.fullButtonGroupA]} onPress={Actions.about}>
            <View style={[styles.row,{alignItems:'center',height: Utils.normalize(45),backgroundColor:'#fff'}]}>
              <Image style={styles.meSetIcon} source={Assets.about}/>
              <Text style={styles.fullButtonTextLeft}>关于</Text>
              <Icon style={styles.seTright} name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableHighlight>
          <View style={styles.h30}></View>
          <TouchableHighlight underlayColor='#f2f2f2' style={[styles.fullButtonGroupA]} onPress={this._doLogout}>
            <View style={[styles.row,{alignItems:'center',justifyContent:'center', height: Utils.normalize(45),backgroundColor:'#fff'}]}>
              <Text style={[styles.fullButtonText,{color:'#f00'}]}>退出登录</Text>
            </View>
          </TouchableHighlight>
        </View>
        {this.state.show ? <Tip name="清空缓存成功"/> : <View></View>}
      </View>
    )
  }
}

export default Me
