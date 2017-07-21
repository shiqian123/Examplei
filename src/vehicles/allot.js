/**
* @Author: MillerD
* @Date:   2016-11-18T17:35:17+08:00
* @Email:  zlw2579@gmail.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-22T17:42:40+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  ListView,
  Animated,
  Alert,
  TextInput,
  DatePickerIOS,
  DatePickerAndroid,
  Switch
} from 'react-native';

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import API from '../base/api';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import LoadIcon from '../components/Loading';

let timer = null;
let that = this;

class Allot extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data: props.data,
      dataSource:dataSource,
      showArriveTime: false,
      showNotes: false,
      loading: false,
      select: {
        target_ware: {nm: null, vl: null},
        notes: '',
      },
      date: new Date(),
      minDate: new Date(),
      expect_time: ''
    }
  }

  componentDidMount() {
    // 请求load接口，获取可调拨的仓库
    this._loadForMeWare();
  }
  componentWillMount() {
    that = this;
  }

  _loadForMeWare() {
    this.setState({loading:true})
    let params = {keys: "me_ware"};
    Utils.fetch(Utils.api.load, 'post', params)
      .then((res) => {
        if (res) {
          for (let key in res.me_ware) {
            if(res.me_ware[key]['vl'] === this.state.data.warehouse_id) {
              res.me_ware.splice(key, 1)
              break;
            }
          }
          this.setState({
            loading:false,
            me_ware: res.me_ware,
            dataSource: this.state.dataSource.cloneWithRows(res.me_ware),
          });
        }else{
          Alert.alert('仓库列表加载失败');
        }
      });
  }

  componentWillReceiveProps(nextProps){
      let temp_select = this.state.select;
      if (nextProps.ware_flag === 0){
          temp_select.target_ware = nextProps.ware;
      }
      if (nextProps.remark_flag === 1){
          temp_select.notes = nextProps.des;
      }

    //   foo.notes = this.state.tempNotes;
      this.setState({select:temp_select})
  }

  /*_destinationChosed(rowData) {
    var foo = this.state.select;
    foo.target_ware = rowData;
    this.setState({
      select: foo
    });
  }*/


  _warelistPress() {
    Actions.wareList({me_ware:this.state.me_ware,select:this.state.select})
  }

  _notesPress(notes) {
    // 修改为页面后，需要传入初始的备注文字
    Actions.textarea({
        title:"备注",
        des:notes,
        save:true,
        _save: this._save.bind(this)
    });
  }
  _save(des){
    that.state.select.notes = des;
    that.setState({des: des});
    Actions.pop({refresh: {message: 'des changed'}});
  }

  _onDateChange (date) {
    this.setState({date: date,expect_time: Utils.moment(date).format('YYYY-MM-DD')});
    clearTimeout(timer);
  }

  showPicker() {
    if(Device.iOS){
      this.setState({DatePicker: !this.state.DatePicker, showDatePicker: false})
    }else{
      DatePickerAndroid.open({
          date: new Date(),
          minDate: this.state.minDate
      })
      .then((result) => {
          this.setState({expect_time: result.year ? (result.year + '-' + (result.month+1) + '-' + result.day) : ''})
      });
    }
  }

  _allotConfirm() {
    if(this.state.select.target_ware.vl) {
      this.setState({loading: true});
      let params = {
        toware: this.state.select.target_ware.vl,
        des: this.state.select.notes,
        id: this.state.data.id,
        vin: this.state.data.vin,
        warehouse_id: this.state.data.warehouse_id,
        status_name: this.state.data.status_name,
        reason: 0,
      }
      Utils.fetch(API.deliver, 'post', params)
        .then(() => {
          let tp = {
            vin: params.vin
          }
          //重新请求新的car data
          Utils.fetch(API.unionquery, 'post', tp)
            .then((res) => {
              this.setState({loading: false});
              Actions.pop({refresh:{info_allot:res.list[0],backToDetail:0,whichPage:1}})
            });

        })
      // 更新搜索列表
      // go back
      // this.props.allotConfirm(this.state.data);
      // this.props.allotBack();
    }else{
      this.setState({miss_ware: true});
      setTimeout(() => this.setState({miss_ware: false}), 2000);
    }
  }
  _changeSwitch(){
    if(this.state.DatePicker){
      this.setState({expect_time: "",showDatePicker: false});
    }
    this.setState({DatePicker: !this.state.DatePicker})
  }
  render() {
    const {data} = this.state;
    return (
      <View style={styles.container}>
        <View>
          <Header title="新车调拨" leftPress={()=>Actions.pop()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}
              rightTitle="确认" rightPress={this._allotConfirm.bind(this)} />
          <View style={localStyles.detailBox}>
            <Text style={localStyles.detailLeft}>VIN号</Text>
            <Text style={localStyles.detailRight}>{data.vin}</Text>
          </View>
          <View style={localStyles.itemInsetLineR}></View>

          <View style={localStyles.detailBox}>
            <Text style={localStyles.detailLeft}>状态</Text>
            <Text style={localStyles.detailRight}>{data.status_name}</Text>
          </View>
          <View style={localStyles.itemInsetLineR}></View>

          <View style={localStyles.detailBox}>
            <Text style={localStyles.detailLeft}>调出仓库</Text>
            <Text style={localStyles.detailRight}>{data.warehouse_name}</Text>
          </View>
          <View style={localStyles.itemInsetLineR}></View>

          <TouchableOpacity onPress={this._warelistPress.bind(this)}>
            <View style={localStyles.detailBox}>
              <Text style={localStyles.detailLeft}>调入仓库</Text>
              {this.state.select.target_ware.nm ? <Text style={[localStyles.detailRight, {marginRight: 35}]}>{this.state.select.target_ware.nm}</Text> : <Text style={[localStyles.detailRight, {marginRight: 35}]}>选择目标仓库</Text>}
              <Icon style={localStyles.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableOpacity>
          <View style={localStyles.itemInsetLineR}></View>

          <TouchableOpacity  onPress={this.showPicker.bind(this)}>
            <View style={localStyles.detailBox}>
              <Text style={localStyles.detailLeft}>预期到达时间</Text>
              {
                Device.iOS ?
                <Text></Text>
                :
                <Text style={[localStyles.detailRight, {marginRight:  35}]}>{this.state.expect_time}</Text>
              }
              {Device.iOS ?
                <Switch value={this.state.DatePicker} onValueChange={()=>{this._changeSwitch()}} style={{marginRight: 15}}/>
                :
                <Icon style={localStyles.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
              }
            </View>
          </TouchableOpacity>
          {
            this.state.DatePicker && Device.iOS ?
            <View>
              <View style={localStyles.itemInsetLineR}></View>
              <TouchableOpacity onPress={()=>this.setState({showDatePicker: !this.state.showDatePicker})}>
                <View style={{height: Utils.normalize(49.5),paddingRight: 15,justifyContent:'center',backgroundColor:'#fff'}}>
                  <Text style={{textAlign:'right',color: '#387ff5'}}>{this.state.expect_time || Utils.moment(new Date()).format('YYYY-MM-DD')}</Text>
                </View>
              </TouchableOpacity>
            </View>
            : <View></View>
          }

          {this.state.showDatePicker && Device.iOS ?
            <DatePickerIOS mode="date" date={this.state.date} minimumDate={new Date()} onDateChange={this._onDateChange.bind(this)}/>
            : <View></View>}
          <View style={[styles.itemInsetLineR, {borderLeftWidth: 0, height: 10}]}></View>

          <TouchableOpacity onPress={this._notesPress.bind(this, this.state.select.notes)}>
            <View style={localStyles.detailBox}>
              <Text style={localStyles.detailLeft}>备注</Text>
              {this.state.select.notes ? <Text style={[localStyles.detailRight, {marginRight: 35, color: '#999999'}]} numberOfLines={1}>{this.state.select.notes}</Text> : <Text style={[localStyles.detailRight, {marginRight: 35}]}>添加备注</Text>}
              <Icon style={localStyles.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableOpacity>
        </View>
        {this.state.miss_ware ? <Tip type="miss_tips" name="请选择调入仓库" /> : null}
        {this.state.loading ? <LoadIcon /> : null}
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
  detailRight: {
    flex: 2,
    fontSize: Utils.normalize(14),
    fontWeight: '400',
    textAlign: 'right',
    marginRight: 15,
    color: '#999999'
  },
  detailBox: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Utils.normalize(49.5),
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingLeft: 15
  },
  ware_list: {
    flex: 1,
    fontSize: Utils.normalize(16),
    fontWeight: '400',
    color: '#000000',
  },
  icon:{
    color: '#ccc',
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 15,
    top: Utils.normalize(Device.iOS ? 13 : 15)
  },
  itemInsetLineR:{
    height: 0.5,
    borderLeftWidth: 15,
    borderLeftColor: '#fff',
    backgroundColor: '#ccc',
  }
})

export default Allot;
