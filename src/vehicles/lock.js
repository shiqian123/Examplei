/**
* @Author: MillerD
* @Date:   2016-11-17T17:34:22+08:00
* @Email:  zlw2579@gmail.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-22T17:36:49+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert
} from 'react-native';

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import API from '../base/api';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';

let reArray = ['销售锁定', '维修锁定', '其他'];
let that;

class Lock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      select: {
        reason: null,
        des: '',
        id: this.props.data.id,
        warehouse_id: this.props.data.warehouse_id,
      }
    }
  }
  componentWillMount(){
    that = this;
  }
  componentWillReceiveProps(nextProps){
      let temp_select = this.state.select;
      if (nextProps.reason_flag === 0){
          temp_select.reason = nextProps.reason;
      }
      if (nextProps.remark_flag === 1){
          temp_select.des = nextProps.des;
      }
      this.setState({select:temp_select})
  }
  _pressLockReason() {
    Actions.lockReason({reason:this.state.select.reason})
  }


  _pressDes(notes) {
    Actions.textarea({
        title:"备注",
        des:notes,
        save:true,
        _save: this._save.bind(this)
    });
  }

  _save(des) {
    that.state.select.des = des;
    that.setState({des: des});
    Actions.pop({refresh: {message: 'des changed'}});
  }


  // _rowPress(type) {
  //
  // }

  _lockConfirm() {
    if(this.state.select.reason === null){
      // Alert.alert('请选择锁定原因');
      this.setState({miss_reason: true});
      setTimeout(() => this.setState({miss_reason: false}), 2000)
    }else{
      let params = this.state.select;
      Utils.fetch(API.lock, 'post', params)
        .then((res) => {
          if (res.status === "2") {
            // this.props.lockConfirm(res);
            Actions.pop({refresh:{info_lock:res,backToDetail:1,whichPage:1}})
        }
        //   this.props.lockBack();

        })
    }
  }
  render(){
    return(
      <View style={styles.container}>
        <View>
          <Header title="锁定" leftPress={() => Actions.pop()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}
              rightTitle="确认" rightPress={this._lockConfirm.bind(this)} />
          <TouchableOpacity onPress={this._pressLockReason.bind(this)}>
            <View style={localStyles.detailBox}>
              <Text style={localStyles.detailLeft}>锁定原因</Text>
              {this.state.select.reason !== null ? <Text style={localStyles.detailRight}>{reArray[this.state.select.reason]}</Text> : <Text style={localStyles.detailRight}>选择锁定原因</Text>}
              <Icon style={localStyles.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableOpacity>
          <View style={[localStyles.itemInsetLineR, {borderLeftWidth: 0, height: 10, backgroundColor: '#efefef'}]}></View>
          <TouchableOpacity onPress={this._pressDes.bind(this, this.state.select.des)}>
            <View style={localStyles.detailBox}>
              <Text style={localStyles.detailLeft}>备注</Text>
              {this.state.select.des ? <Text style={localStyles.detailRight} numberOfLines={1}>{this.state.select.des}</Text> : <Text style={localStyles.detailRight}>添加备注</Text>}
              <Icon style={localStyles.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableOpacity>
        </View>
        {this.state.miss_reason ? <Tip name="请选择锁定原因" type="miss_tips" /> : null}
      </View>
    )
  }
}

const localStyles = StyleSheet.create({
  detailLeft: {
    flex: 1,
    color: '#000000',
    fontSize: Utils.normalize(14),
    fontWeight: '400',
  },
  detailCenter: {
    flex: 2,
    color: '#000000',
    fontSize: Utils.normalize(14),
    fontWeight: '400',
  },
  detailRight: {
    textAlign: 'right',
    marginRight: 35,
    color: '#999999',
    fontSize: Utils.normalize(14),
    fontWeight: '400',
  },
  detailBox: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Utils.normalize(49.5),
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingLeft: 15
  },
  itemInsetLineR:{
    height: 0.5,
    borderLeftWidth: 15,
    borderLeftColor: '#fff',
    backgroundColor: '#ccc',
  },
  icon:{
    color: '#ccc',
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 15,
    top: Utils.normalize(Device.iOS ? 13 : 15)
  },
})

export default Lock;
