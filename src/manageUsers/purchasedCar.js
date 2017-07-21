/**
 * Created by shiqian on 16/12/29.
 */
'use strict'

import React, { Component } from 'react';
import {
    Alert,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicator,
    ScrollView,
    ListView,
    RefreshControl,
    Modal,
    View,
    Image,
    StatusBar,
    Text,
    Animated,
    TextInput,
    StyleSheet,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import {Utils, Assets, Device,_} from "../base";
import lodash from 'lodash';
import {Header, Loading, Button, Developing, Tip,SearchTitle} from '../components';
import Swipeout from '../components/react-native-swipeout';

let dataArr = []
export default class PurchasedCar  extends Component{
  constructor(props){
    super(props)
    let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state={
      dataSource,
      androidSet:false,
      androidData:'',
      loading:false,
      deleteStatu:false
    }
  }
  componentDidMount(){
    this._onRefresh();
  }
  componentWillReceiveProps(){
    this._onRefresh();
  }
  _onRefresh(){
    this.setState({loading:true})
    Utils.fetch(Utils.api.CustCar,'post',{cust_id:this.props.car.id}).then((res) => {
      this.setState({loading:false})
      if(res.list){
        dataArr = res.list
        this.setState({dataSource:this.state.dataSource.cloneWithRows(res.list)})
      }else{
        console.log(res);
        dataArr = []
        this.setState({dataSource:this.state.dataSource.cloneWithRows([])})
      }
    })
  }
  _listItem(data){
    return(
      <View>
        <TouchableHighlight onLongPress={()=>this.longPress(data)} style={{backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f5f5f5' >
          <View style={localStyles.msgBlock}>
            <View style={{flex: 1}}>
              <View style={localStyles.msgRow}>
                <Text numberOfLines={1} style={localStyles.msgName}>车型：{data.model_name }</Text>
              </View>
              <View style={localStyles.msgRow}>
                <Text numberOfLines={1} style={localStyles.msgName} >车架号：{data.vin}</Text>
              </View>
              <View style={localStyles.msgRow}>
                <Text numberOfLines={1} style={[localStyles.msgName,{flex: 1}]} >车牌号:{data.car_cardno?data.car_cardno:''}</Text>
                <Text numberOfLines={1} style={[localStyles.msgTime,{flex: 1}]} >行程里数:{data.mileage}</Text>
              </View>
              <View style={localStyles.msgRow}>
                <Text numberOfLines={1} style={[localStyles.msgName,{flex: 1}]} >购买时间:{ data.buytime?(data.buytime).substring(0,10):''}</Text>
                <Text numberOfLines={1} style={[localStyles.msgTime,{flex: 1}]} >购买价格:{data.buyprice}</Text>
              </View>
            </View>
          </View>
        </TouchableHighlight>
        <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#fff'}}></View>
      </View>
    )
  }
  goChangeCar(data){
    Actions.changePurchasedCar({item:data})
    this.setState({androidSet:false})
  }
  delete(data){
    Utils.fetch(Utils.api.deleteCar,'post',{id:data.id}).then((res)=>{
      this._onRefresh()
      this.setState({deleteStatu:true})
      setTimeout(()=>{
        this.setState({deleteStatu:false})
      },1500)
    })
     this.setState({androidSet:false})
  }
  longPress(rowData){
    if(Device.isAndroid&&this.props.ops.mgr){
       this.setState({androidSet: true,androidData:rowData})
     }
  }
  _constructSwipeBtn(data){
    let that  = this;
    let SwipeoutBtns2 = function(){
      return (
        <View style={localStyles.allBtn}>
          <Image style={{width: Utils.normalize(36), height: Utils.normalize(36)}} source={ Assets.change } />
          <Text style={{color: '#4586F3', paddingTop: 9, paddingLeft: 6}}>变更</Text>
        </View>
      )
    }();
    let SwipeoutBtns3 = function(){
      return (
        <View style={localStyles.allBtn}>
          <View style={localStyles.imgBg}>
            <Image  style={{width: 12, height: 14}} source={ Assets.icons.dustibn } />
          </View>
          <Text style={{color: '#FD6C6D', paddingTop: 8, paddingLeft: 5}}>删除</Text>
        </View>
      )
    }();
    let btns = [
      {
        backgroundColor: '#ECECEC',
        component: SwipeoutBtns2,
        onPress: function() {that.goChangeCar(data)}
      },
      {
        backgroundColor: '#ECECEC',
        component: SwipeoutBtns3,
        onPress: function() {that.delete(data)}
      },
    ]
    return this.props.ops.mgr?btns:[]
  }
  _handleSwipeout(sectionID, rowID) {
    let rows = _.cloneDeep(dataArr);
    for (var i = 0; i < rows.length; i++) {
      if (i != rowID) rows[i].active = false;
      else rows[i].active = true;
    }
    this._updateDataSource(rows);
  }
  _updateDataSource(data) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }
  _allowScroll(scrollEnabled){
    this.setState({scrollEnabled: scrollEnabled});
  }
  _renderRow(rowData, sectionID, rowID){
    let that = this;
    return(
      Device.iOS ? (
       <Swipeout
         right={this._constructSwipeBtn(rowData, this.state.ops)}
         rowID={rowID}
         sectionID={sectionID}
         autoClose={true}
         btnWidth={Utils.width*0.25}
         backgroundColor='transparent'
         close={!rowData.active}
         onOpen={(sectionID, rowID) => this._handleSwipeout(sectionID, rowID) }
         scroll={(event) => this._allowScroll(event)}>
         {that._listItem(rowData)}
       </Swipeout>
     ) : (
          that._listItem(rowData)
     ))
  }
  render(){
   return(
     <View style={styles.container}>
       <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="已购车辆"/>
       {dataArr.length==0?
       <Text style={{paddingLeft:15,paddingTop:15}}>暂无已有车辆信息</Text>:null
       }
       <ListView
         ref="_listView"
         scrollEnabled={this.state.scrollEnabled}
         style={{height:Device.height - 134}}
         dataSource={this.state.dataSource}
         renderRow={(rowData, sectionID, rowID)=>this._renderRow(rowData, sectionID, rowID)}
         enableEmptySections = {true}
         removeClippedSubviews={true}
         scrollEventThrottle={0}
         refreshControl={
           <RefreshControl
             style={{backgroundColor:'transparent'}}
             refreshing={this.state.loading}
             onRefresh={() => this._onRefresh('refresh')}
             tintColor="#ff5555"
             title="加载中..."
             colors={['#FF5555']}
             progressBackgroundColor="#fff"
         />}
         pageSize={20}
       />
       {this.state.androidSet ? <View style={styles.overlay} onStartShouldSetResponder={()=>{this.setState({androidSet: false})}}>
        <View style={{width: Utils.normalize(280),position:'absolute',backgroundColor:'#fff',left: (Utils.width - Utils.normalize(280) )/2, top: (Utils.height - Utils.normalize(100))/2,borderRadius: 4}}>
          {
            <View>
              <TouchableHighlight underlayColor='#f2f2f2' onPress={() => this.goChangeCar(this.state.androidData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                <Text style={{fontSize: 17,marginLeft: 15}}>变更</Text>
              </TouchableHighlight>
              <TouchableHighlight underlayColor='#f2f2f2'  onPress={() => this.delete(this.state.androidData)}  style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                <Text style={{fontSize: 17,marginLeft: 15}}>删除</Text>
              </TouchableHighlight>
            </View>
          }
        </View>
       </View> : <View></View>}
         {/* {this.state.loading?<Loading></Loading>:null} */}
          {this.state.deleteStatu?<Tip type='miss_tips' name='删除成功'></Tip>:null}
     </View>
   )
  }
}
const localStyles = StyleSheet.create({
  transferButton: {
    marginTop: 8,
    marginBottom: 8,
    marginRight: 12,
  },
  msgBlock: {
    flexDirection: 'row',
    paddingLeft:Utils.normalize(15),
    paddingTop: Utils.normalize(4),
    paddingBottom: Utils.normalize(4),
  },
  msgRow: {
    flexDirection: 'row',
    height: Utils.normalize(31),
    alignItems: 'center',
  },
  msgName: {
    fontSize: Utils.normalize(14),
    color: '#000',
    flex: 1
  },
  msgTime: {
    fontSize: Utils.normalize(14),
    flex: 1,
    marginRight: 10
  },
  statusBtn: {
    width: Utils.normalize(30),
    height: Utils.normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    marginLeft: 9,
    borderRadius: 4
  },
  allBtn:{
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    top: 0,
    bottom: 0,
    flex: 1
  },
  imgBg:{
    backgroundColor:'#FD6C6D',
    borderRadius:4,
    width: Utils.normalize(36),
     justifyContent: 'center',
      alignItems: 'center',
       height: Utils.normalize(36)
  }
})
