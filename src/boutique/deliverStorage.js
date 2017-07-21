/**
* @Author: callback
* @Date:   2016-10-27T11:14:44+08:00
* @Email:  heuuLZP@gmail.com
* @Last modified by:   callback
* @Last modified time: 2016-11-11T11:51:05+08:00
*/
'use strict'
import React, { Component } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  Image,
  StatusBar,
  StyleSheet,
  Alert,
  Animated,
  DatePickerIOS,
  DatePickerAndroid
} from 'react-native';

import styles from '../common/styles';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import lodash from 'lodash';
import {Utils, Device, Assets} from "../base";
import {Header, Loading, Button, Developing, Tip, Box} from '../components';

let isMounted = false;
let that;
export default class deliverStorage extends Component{
  constructor(props){
    super(props);
    this.state = {
      select: {
        id:this.props.data.id,
        warehouse_id:this.props.data.warehouse_id,
        num:'1',
        toware:'',
        toshop:'',
        reason: '',
        des: '',
        expect_time:Utils.moment(new Date()).format('YYYY-MM-DD'),
        isLoading:false
      },
      reason_name:'',
      ware_name:'',
      miss_reason:'',
      showDatePicker:false,
      date:new Date(),
    }
  }
  //对每次setState进行isMounted判断
  m_setState(obj) {
    if(isMounted) {
      this.setState(obj);
    }
  }
  componentDidMount(){
    isMounted = true;
  }
  componentWillMount(){
    that = this;
  }
  componentWillReceiveProps(nextProps){
      let temp_select = lodash.cloneDeep(this.state.select),
      reason_name ='',
      shop_name = '',
      ware_name = '';
      //选择原因返回
      if(nextProps.reason_flag === 0 ){
        temp_select.reason = nextProps.reason.vl; reason_name = nextProps.reason.nm;
      }
      //选择仓库返回
      if(nextProps.ware_flag === 0){
        temp_select.toshop = nextProps.toshop.id; shop_name = nextProps.toshop.name;
        temp_select.toware = nextProps.toware.id; ware_name = nextProps.toware.name;
      }
      //填写备注返回
      nextProps.remark_flag === 1 ?  temp_select.des = nextProps.des : null;

      this.setState({select:temp_select,reason_name:reason_name,shop_name:shop_name,ware_name:ware_name})
  }
  componentWillUnmount() {
    isMounted = false;
  }
  //input内容变化
  _textDidChanged(ref,text){
    let selectObj = lodash.cloneDeep(this.state.select);
    let ObjTemp = {};
    selectObj[ref] = text;
    if (text && text.length > 0) {
      ObjTemp[ref] = true
    }else {
      ObjTemp[ref] = false
    }
    this.setState(ObjTemp)
    this.m_setState({select:selectObj})
  }
  _clear(ref) {
    this._textDidChanged(ref, '');
  }
  //确认
  _confirm(){
    this.setState({
      isLoading:true
    })
    let case_bollean;
    if (this.state.select.num &&  (this.state.select.num.indexOf('.') > -1 )) {
      this.setState({
        isLoading:false
      })
      this.setState({miss_reason: '数量必须为整数'})
      setTimeout(() => this.setState({miss_reason: '',isLoading:false}), 1000)
      return
    }
    if(Number(this.state.select.num)>Number(this.props.data.num)){
      this.setState({miss_reason: '出库数量超过库存数量'})
      setTimeout(() => this.setState({miss_reason: '',isLoading:false}), 1000)
      return
    }
    if(this.state.reason_name === '调拨'){
      case_bollean = this.state.select.reason === '' || this.state.select.num === '' || Number(this.state.select.num) < 1 || isNaN(Number(this.state.select.num)) || this.state.select.expect_time === '' || this.state.select.toware === '';
    }else{
      case_bollean = this.state.select.reason === '' || this.state.select.num === '' || Number(this.state.select.num) < 1 || isNaN(Number(this.state.select.num));
    }
    if(case_bollean){
      if(this.state.reason_name === '调拨'){
        this.state.select.expect_time ? null : this.setState({miss_reason: '请选择时间'});
        this.state.select.toware  ? null : this.setState({miss_reason: '请选择目标仓库'});
      }
      (this.state.select.num &&  Number(this.state.select.num) > 0 ) ? null : this.setState({miss_reason: '数量不可小于1'});


      ( this.state.select.num &&  isNaN(Number(this.state.select.num)) ) ? this.setState({miss_reason: '请填写数字'}) : null ;
      this.state.select.num  ? null : this.setState({miss_reason: '请填写数量'});
      this.state.select.reason  ? null : this.setState({miss_reason: '请选择出库原因'});


      setTimeout(() => this.setState({miss_reason: '',isLoading:false}), 1000)
    }else{
      let params = this.state.select;
      Utils.fetch(Utils.api.deliverStorage, 'post', params)
        .then((res) => {
          let that = this;
          this.setState({
            isLoading:false,
            miss_reason: '出库成功'
          })
          setTimeout(()=>{
            if(Number(that.state.select.num)==Number(that.props.data.num)){
                Actions.pop({refresh:{},popNum:2})
            }else{
              Actions.pop({refresh:{data:res}})
            }
          },1000)
        })
    }
  }
  //原因
  _selectReason(){
    Actions.deliverReason({reason:this.state.reason_name,loadData:this.props.loadData})
  }
  //仓库
  _selectWare(){
    Actions.selectWare({shop_name:this.state.shop_name,ware_name:this.state.ware_name,loadData:this.props.loadData})
  }
  //备注
  _describe(){
    Actions.textarea({
        title:"备注",
        des:this.state.select.des,
        save:true,
        _save: this._save.bind(this)
    });
  }
  _save(des){
    that.state.select.des = des;
    that.setState({des: des});
    Actions.pop({refresh: {message: 'des changed'}});
  }
  //调用时间控件
  _changeDate(){
    let selectObj = lodash.cloneDeep(this.state.select);
    Device.iOS ? selectObj.expect_time = Utils.moment(selectObj.expect_time).format('YYYY-MM-DD') : null;
    this.m_setState({showDatePicker: !this.state.showDatePicker,select:selectObj})
    setTimeout(() => {
      if(this.state.showDatePicker && Device.isAndroid){
        DatePickerAndroid.open({
          date: this.state.date,
          minDate: new Date(),
        })
        .then((result) => {
            this._onDateChange(result);
        });
      }
    },20)
  }
  //改变时间
  _onDateChange(date){
    let selectObj = lodash.cloneDeep(this.state.select);
    if(Device.iOS){
      selectObj.expect_time = Utils.moment(date).format('YYYY-MM-DD');
      this.m_setState({select:selectObj,date:date})
    }else if(Device.isAndroid){
      this.m_setState({showDatePicker:false})
      if(date.action=='dismissedAction'){
         return
      }
      let tempDate = new Date(date.year,date.month,date.day);
      selectObj.expect_time = date.year + '-' + (date.month+1) + '-' + date.day;
      this.m_setState({select:selectObj,date:tempDate})
    }
  }
  render(){
    return (
    <View style={styles.container}>
      <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}}
      title="精品出库" rightTitle="确认" rightPress={() => this._confirm()} />
      <View style={{backgroundColor:'#ffffff'}}   keyboardShouldPersistTaps={true}>
          <TouchableOpacity onPress={() => this._selectReason()}>
            <Box left="出库原因" right={this.state.reason_name != '' ? this.state.reason_name : '选择出库原因'} changeAble={true} important={true}/>
          </TouchableOpacity>

          {
            this.state.reason_name === '调拨' ?
            <View>
              <TouchableOpacity onPress={() => this._selectWare()}>
                <Box left="目标仓库" right={(this.state.shop_name  && this.state.ware_name ) ? this.state.shop_name + ' • ' + this.state.ware_name  : '选择目标仓库'} changeAble={true} important={true}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this._changeDate()}>
                <Box left="预期到达时间"
                  right={ this.state.showDatePicker ?
                    <Text style={[styles_local.detailRight,{color:'#ff3b30'}]}>{this.state.select.expect_time != '' ? this.state.select.expect_time : '选择时间'}</Text>
                    :
                    <Text style={styles_local.detailRight}>{this.state.select.expect_time != '' ? this.state.select.expect_time : '选择时间'}</Text>
                  }
                  changeAble={true}
                  important={true}
                  />
              </TouchableOpacity>
              {/* 时间控件 */}
              {this.state.showDatePicker && Device.iOS ?
                  <DatePickerIOS  mode="date" date={this.state.date} minimumDate={new Date()} onDateChange={(date) => this._onDateChange(date)}/>
                : <View></View>}
            </View>
             : null
          }

          <Box left="数量"
            inputBox={{
              placeholder:"输入数量",
              ref:"num",
              onChangeText: this._textDidChanged.bind(that,"num"),
              defaultValue: '1'
            }}
            important={true}
            price={true}
            iconPress={this._clear.bind(this,"num")}
            hasIcon={this.state.num}
            listLast={true}
          />
        </View>

      <View style={[styles_local.itemInsetLineR, {borderLeftWidth: 0, height: 10, backgroundColor: '#efefef'}]}></View>
      <TouchableOpacity onPress={() => this._describe()}>
        <View style={styles_local.detailBox}>
          <Text style={styles_local.detailLeft}>备注</Text>
          {this.state.select.des ? <Text style={[styles_local.detailRight,{flex:1}]} numberOfLines={1}>{this.state.select.des}</Text> : <Text style={styles_local.detailRight}>添加备注</Text>}
          <Icon style={styles_local.icon} color='#cccccc' name='ios-arrow-forward' size={23}/>
        </View>
      </TouchableOpacity>
      {this.state.miss_reason ?  <Tip name={this.state.miss_reason} type="miss_tips" /> : null}
            {this.state.isLoading ?<Loading></Loading>:null}
    </View>
    )
  }

}

const styles_local = StyleSheet.create({
  detailLeft: {
    flex: 1,
    color: '#000000',
    fontSize: Utils.normalize(16),
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
    fontSize: Utils.normalize(16),
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
  inputView:{
    width:245,
    height: Utils.normalize(35),
    marginRight:15,
    borderBottomWidth:1,
    borderBottomColor:'#387ff5'
  },
  input:{
    width:245,
    height: Utils.normalize(42),
    color: '#000000',
    fontSize: Utils.normalize(16),
    fontWeight: '400',
  }
})
