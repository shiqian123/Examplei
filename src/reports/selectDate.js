/**
* @Author: yanke
* @Date:   2016-10-24T12:42:56+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   yanke
* @Last modified time: 2016-11-14T17:29:05+08:00
*/

'use strict'
import React, { Component } from 'react';
import {
    Alert,
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    Linking,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header, Loading, Tip} from '../components'
import Calendar from '../components/Calendar'
import lodash from 'lodash';

let checkDate;//选中的日期
let constCheckDate;//选中的日期
let flag = 0;//用于解决快速双击返回两次

class SelectDate extends Component{
  constructor(props){
    super(props);
    checkDate = Utils.toDisDate(this.props.data.check,'DAY');
    constCheckDate = checkDate;
    this.state = {
      display: this.props.data.type || 'DAY',
      loadingShow: true
    }
  }

  componentDidMount(){
    if(this.props.data.type == 'DAY'){
      setTimeout(()=>{
        this.setState({loadingShow: false})
      },(Device.iOS ? 1500 : 1000))
    } else {
      this.setState({loadingShow: false})
    }
  }

  //按日、按月切换
  _onChangeTyped(type){
    if(type != 'DAY'){
      checkDate = '1000/01/01';
      this.setState({display: type});
    } else {
      checkDate = constCheckDate;
      this.setState({loadingShow: true});
      setTimeout(()=>{
        this.setState({display: type});
      },0)
      setTimeout(()=>{
        this.setState({loadingShow: false})
      },(Device.iOS ? 1500 : 1000))
    }
  }

  _back(){
    setTimeout( ()=> {
      if(flag == 0){
        Actions.pop()
        flag = 1;
        setTimeout(() => {
          flag = 0;
        },250)
      }
    },0)
  }
  //选择日期后执行的方法
  _press(date,type){
    if(type == 'DAY'){
      date = Utils.toMinDate(date);
      setTimeout( ()=> {
        if(flag == 0){
          Actions.pop({refresh: {date: date,type: type}});
          flag = 1;
          setTimeout(() => {
            flag = 0;
          },250)
        }
      },0)
    } else {
      date = date + '/01';
      date = Utils.toMinDate(date);
      setTimeout( ()=> {
        if(flag == 0){
          Actions.pop({refresh: {date: date,type: type}});
          flag = 1;
          setTimeout(() => {
            flag = 0;
          },250)
        }
      },0)
    }
  }

  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={this._back.bind(this)} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="日期选择" />
        <View style={sele_styles.lightOverlay}>
          <View style={styles.changeDisplayTyped}>
            <TouchableOpacity onPress={() => this._onChangeTyped('DAY')} style={this.state.display === 'DAY' ? styles.changeButtonWapperCurrent : styles.changeButtonWapper}><Text style={[this.state.display === 'DAY' ? styles.changeButtonCurrent : styles.changeButton,{borderBottomWidth:0}]}>按日</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => this._onChangeTyped('MONTH')} style={this.state.display === 'MONTH' ? styles.changeButtonWapperCurrent : styles.changeButtonWapper}><Text style={[this.state.display === 'MONTH' ? styles.changeButtonCurrent : styles.changeButton,{borderBottomWidth:0}]}>按月</Text></TouchableOpacity>
          </View>
        </View>

        <Calendar
          touchEvent = {this._press}
          timeType = {this.state.display}
          checkData = {checkDate}
          startTime = {this.props.startYear}
        />
        {
          this.state.loadingShow ?
          <Loading/>
          : null
        }
      </View>
    )
  }
}

var sele_styles = StyleSheet.create({
  lightOverlay: {
    backgroundColor: 'rgba(221, 221, 221, 0.3)',
    // backgroundColor: 'red',
    flexDirection: 'column',
    alignItems: 'center',
  },
})

export default SelectDate;
