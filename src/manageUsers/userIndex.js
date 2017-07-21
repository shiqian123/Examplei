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
import InsideSearch from './insideSearch';

let listPage = 1,dataArr=[],text='';
export default class UserIndex  extends Component{
    constructor(props){
      super(props)
       let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });
      this.state = {
        searchClean:false,
        dataSource,
        backToTop:false,
        count:0,
        loading:false,
        _loading:false,
        text:'',
        scrollEnabled:true,
        ops:'',
        androidSet:false,
        androidData:''
      }
    }
    componentDidMount(){
      this._onRefresh(1,'CLEAR','HIDELOADING')
    }
    componentWillUnmount(){
      dataArr = [],
      text = ''
    }
    componentWillReceiveProps(){
      this._onRefresh(1,'CLEAR')
    }
    _cleanInput(){

    }
    _addUser(){
      if(this.state.ops.mgr){
        Actions.addUser({item:this.state.item,ops:this.state.ops,types:"ADD"})
      }
    }
    _change(content){
      text = content
      this._onRefresh(1,'CLEAR')
    }

    goPurchasedCar(data){
      this.setState({androidSet:false})
      Actions.purchasedCar({car:data,ops:this.state.ops})
    }
    goChangeUser(data){
      this.setState({androidSet:false})
     Actions.addUser({item:data,ops:this.state.ops,types:'CHANGE'})
    }
    delete(data){
      this.setState({androidSet:false})
      Utils.fetch(Utils.api.deleteUser,'post',{id:data.id}).then((res)=>{
        this._onRefresh(1,'CLEAR')
      })
    }
    _constructSwipeBtn(data){
      let that  = this;
      let SwipeoutBtns1 = function(){
        return (
          <View style={{}}>
            {that.state.ops.mgr?
            <Image style={{width: 17, height: 16,marginTop: 16, marginLeft: 32}} source={ Assets.icons.whitecar } />
            :null}
            <Text style={{color: '#fff', paddingTop: 8,paddingLeft:12}}>已购车辆</Text>
          </View>
        )
      }();
      let SwipeoutBtns2 = function(){
        return (
          <View style={{}}>
            <Image style={{width: 15, height: 15,marginTop:16, marginLeft: 28}} source={ Assets.icons.whitepen } />
            <Text style={{color: '#fff', paddingTop: 9, paddingLeft: 20}}>变更</Text>
          </View>
        )
      }();
      let SwipeoutBtns3 = function(){
        return (
          <View style={{}}>
            <Image  style={{width: 15, height: 17.5,marginTop: 16, marginLeft: 28}} source={ Assets.icons.dustibn } />
            <Text style={{color: '#fff', paddingTop: 8, paddingLeft: 22}}>删除</Text>
          </View>
        )
      }();
      let btns = [
        {
          backgroundColor: '#c7c7cc',
          component: SwipeoutBtns1,
          isDefine:true,
          width:102,
          onPress: function() {that.goPurchasedCar(data)}
        },
        {
          backgroundColor: '#387ff5',
          component: SwipeoutBtns2,
          isDefine:false,
          onPress: function() {that.goChangeUser(data)}
        },
        {
          backgroundColor: '#fd7878',
          component: SwipeoutBtns3,
          isDefine:false,
           onPress: function() {that.delete(data)}
        },
      ]
      let mgrBtn = function(){
        return (
          <View style={{paddingTop:Utils.normalize(18),alignItems:'center'}}>
            <Text style={{color: '#fff'}}>已购车辆</Text>
          </View>
        )
      }();
      let mgrBtns =[
        {
          backgroundColor: '#c7c7cc',
          component: mgrBtn,
          isDefine:true,
          width:102,
          onPress: function() {that.goPurchasedCar(data)}
        },
      ]
      return this.state.ops.mgr?btns:mgrBtns
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
    _onScroll(){
      if(this.state.isLoading) return false;
      let contentLength = this.refs._listView.scrollProperties.visibleLength > this.refs._listView.scrollProperties.contentLength ? this.refs._listView.scrollProperties.visibleLength : this.refs._listView.scrollProperties.contentLength
      if (this.refs._listView.scrollProperties.offset + this.refs._listView.scrollProperties.visibleLength >= contentLength ){
        this.scrollEndReached();
      }
      if (this.refs._listView.scrollProperties.offset > Utils.height) {
        this.setState({backToTop: true});
      }else{
        this.setState({backToTop: false});
      }
    }
    scrollEndReached() {
      if(dataArr && dataArr.length >= this.state.count) return;
      listPage ++;
      this.setState({_loading:true})
      this._onRefresh(listPage);
    }
    _onRefresh(listPage,type,ishide){
      var params = {size:20,page:listPage,range:'personal'}
      if(text!=''){
        params.querykey = text
      }
      if(Device.iOS){
        this.setState({loading:true})
      }else {
        this.setState({_loading:true})
      }
      Utils.fetch(Utils.api.queryUser,'POST',params).then((res) => {
        if(type=='CLEAR'){
          dataArr = []
        }
        var _dataArr = dataArr.concat(res.list)
            dataArr = _dataArr
        this.setState({dataSource:this.state.dataSource.cloneWithRows(_dataArr),count:res.count,loading:false,_loading:false,ops:res.ops})
      })
    }
    longPress(rowData){
      if(Device.isAndroid){
         this.setState({androidSet: true,androidData:rowData})
       }
    }
    goUserDetail(item){
      Actions.userDetail({item:item,ops:this.state.ops})
    }
    _list(item){
      if(item.birthday){
        var birthday = new Date().getFullYear() + item.birthday.slice(4);
        var year = new Date().getFullYear();
        var mouth = ((new Date().getMonth()+1).length>1?new Date().getMonth()+1:'0'+(new Date().getMonth()+1))
        var day = (new Date().getDate())>9 ?new Date().getDate():'0'+new Date().getDate()
        var todayDate = new Date(year+'-'+mouth+'-'+day)
        var isShowTip = (new Date(birthday).getTime()-todayDate.getTime())/1000/60/60/24;
      }
      return(
        <View>
          <TouchableHighlight underlayColor='#ccc' onLongPress={()=>this.longPress(item)} onPress={()=>this.goUserDetail(item)}>
            <View style={[_styles.box,this.state.ops.mgr?{}:{height:Utils.normalize(52)}]}>
              <View style={[{flex:6,flexDirection:'column',justifyContent:'center'},this.state.ops.mgr?{}:{paddingTop:10}]}>
                <Text style={{fontSize:Utils.normalize(16),paddingBottom:Utils.normalize(12)}}>{item.name}</Text>
                {this.state.ops.mgr?<Text style={{fontSize:Utils.normalize(13)}}>{item.tel1}</Text>:null}
              </View>
              <View style={[_styles.birthdayCenter,{flex:3}]}>
                {
                  0<=isShowTip&&isShowTip<=7?
                    <View style={[_styles.birthdayCenter,{flex:1}]}>
                      <Image style={{width:20,height:20}} source={Assets.birthday}/>
                      <Text style={{paddingLeft:4,paddingTop:1}}>{isShowTip==0?'今天生日':isShowTip+'天后生日'}</Text>
                    </View>
                    :null
                }
              </View>
              <View style={{flex:1,justifyContent:'center'}}>
                <Icon style={{color: '#ccc', backgroundColor: 'transparent',paddingLeft:12,paddingTop:4}} color='#cccccc' name='ios-arrow-forward' size={23}/>
              </View>
            </View>
          </TouchableHighlight>
          <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#fff'}}></View>

        </View>

      )

    }
    _renderRow(rowData,sectionID,rowID){
      let that = this;
      return(
         Device.iOS ? (
          <Swipeout
            right={this._constructSwipeBtn(rowData, this.state.ops)}
            rowID={rowID}
            sectionID={sectionID}
            autoClose={true}
            backgroundColor='transparent'
            close={!rowData.active}
            onOpen={(sectionID, rowID) => this._handleSwipeout(sectionID, rowID) }
            btnWidth={that.state.ops.mgr?78:102}
            scroll={(event) => this._allowScroll(event)}>
            {that._list(rowData)}
          </Swipeout>
        ) : (
            that._list(rowData)
        ))
    }
    render(){
      return(
        <View  style={[styles.container]}>
          <Header leftPress={Actions.pop}  rightTitle={this.state.ops.mgr?"增加":''} rightPress={()=>this._addUser()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="客户"/>
          <InsideSearch _onChange={(text)=>this._change(text)} placeholder="以姓名、联系电话搜索"/>
          <View style={[_styles.rowView,(this.props.count==0)?{ borderBottomWidth:0,borderBottomColor:'#cccccc',}:{}]}>
            {this.state.count==0?
              <Text style={{color:'#999999',fontSize:13}}>没有符合条件的客户</Text>:
              <Text style={{color:'#999999',fontSize:13}}>共{this.state.count}条结果
              </Text>
            }
          </View>
          <ListView
            ref="_listView"
            scrollEnabled={this.state.scrollEnabled}
            style={{height:Device.height - 134,backgroundColor:'#fff'}}
            dataSource={this.state.dataSource}
            renderRow={(rowData, sectionID, rowID)=>this._renderRow(rowData, sectionID, rowID)}
            enableEmptySections = {true}
            onScroll={this._onScroll.bind(this)}
            removeClippedSubviews={true}
            scrollEventThrottle={0}
            pageSize={20}
            refreshControl={
              <RefreshControl
                style={{backgroundColor:'transparent'}}
                refreshing={this.state.loading}
                onRefresh={() => this._onRefresh(1,'CLEAR','HIDELOADING')}
                tintColor="#ff5555"
                title="加载中..."
                colors={['#FF5555']}
                progressBackgroundColor="#fff"
            />}
            renderFooter={()=>{
              return(
              <View>
                {(dataArr ? dataArr.length : 0 ) >= (Number(this.state.count) ? this.state.count : 1)?
                  <View style={{height: 30,justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多消息--</Text></View>
                  : <View></View>
                }
              </View>
              )
            }}
          />
          {this.state.backToTop ?
            <TouchableOpacity activeOpacity={1} onPress={() => {this.refs._listView ? this.refs._listView.scrollTo({y: 0, animated: true}) : null}} style={_styles.backToTop}>
              <Image style={{width: Utils.normalize(50), height: Utils.normalize(50)}} source={Assets.backToTop}/>
            </TouchableOpacity>
          : null}
          {this.state.androidSet ? <View style={styles.overlay} onStartShouldSetResponder={()=>{this.setState({androidSet: false})}}>
           <View style={{width: Utils.normalize(280),position:'absolute',backgroundColor:'#fff',left: (Utils.width - Utils.normalize(280) )/2, top: (Utils.height - Utils.normalize(100))/2,borderRadius: 4}}>
             {
               <View>
                 <TouchableHighlight underlayColor='#f2f2f2' onPress={() => this.goPurchasedCar(this.state.androidData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                   <Text style={{fontSize: 17,marginLeft: 15}}>已购车辆</Text>
                 </TouchableHighlight>
                 {this.state.ops.mgr?
                   <TouchableHighlight underlayColor='#f2f2f2' onPress={() => this.goChangeUser(this.state.androidData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                     <Text style={{fontSize: 17,marginLeft: 15}}>变更</Text>
                   </TouchableHighlight>:null}
                 {this.state.ops.mgr?
                   <TouchableHighlight underlayColor='#f2f2f2'  onPress={() => this.delete(this.state.androidData)}  style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                     <Text style={{fontSize: 17,marginLeft: 15}}>删除</Text>
                   </TouchableHighlight>:null}

               </View>
             }
           </View>
          </View> : <View></View>}
          {this.state._loading?<Loading></Loading>:null}
      </View>
      )
    }
}
const _styles = StyleSheet.create({
  box:{
    flex:1,flexDirection:'row',
    height:Utils.normalize(72),
    paddingLeft:Utils.normalize(15),
    paddingTop: Utils.normalize(4),
    paddingBottom: Utils.normalize(4),
  },
  rowView:{
    width:Device.width,
    height:Utils.normalize(36),
    justifyContent:'center',
    borderBottomWidth:0.5,
    borderBottomColor:'#cccccc',
    paddingLeft:20,
    backgroundColor:'#efefef'
  },
  birthdayCenter:{
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
  },
  backToTop: {
    position: 'absolute',
    right: 10,
    bottom: 60,
    width: Utils.normalize(52),
    height: Utils.normalize(52),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'transparent'
  }
})
