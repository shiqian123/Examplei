/**
* @Author: meteor
* @Date:   2016-09-01T12:13:03+08:00
* @Last modified by:   MillerD
* @Last modified time: 2016-11-14T12:16:17+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  Alert,
  ScrollView,
  RefreshControl,
  View,
  ListView,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  StatusBar
} from 'react-native'
import styles from '../common/styles'
import Btn from 'react-native-button'
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import {Utils, Device, Assets} from "../base";
import NetworkError from '../common/networkError'
import {Actions} from 'react-native-router-flux'
// import Button from 'react-native-button'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header, Button, Loading} from '../components'
import lodash from 'lodash';

let dataChecker = null;

class Messages extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
    var billStatus = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      isRefreshing: false,
      dataSource,
      billStatus,
      list:[],
      emptyData: false,
      menuStatus:false,
      cartStage: '0',
      serachText: '',
      Loading: false,
      changeSource: false,
      backToTop: false,
      newDataBanner: false,
      ani: new Animated.Value(0),
      keyFlag: 1,
    }
  }
  componentWillReceiveProps(nextProps) {
    this._onRefresh()
  }

  _onRefresh() {
    Animated.timing(
      this.state.ani,
      {
        toValue: 0,
        duratiion: 250
      }
    ).start();
    this.setState({isRefreshing: true, newDataBanner: false})
    let params = {}

    Utils.fetch(Utils.api.load,'post',{keys:'shop_fee_list,cart_proc,cart_stage'})
      .then((res) => {
        res.cart_stage = Utils.transFormArray(res.cart_stage);
        res.cart_stage.unshift({nm:'不限',vl:'0'});
        //res.cart_stage.pop();
        this.setState({billStatus: this.state.billStatus.cloneWithRows(res.cart_stage)})

        Utils.fetch(Utils.api.message, 'post', params)
          .then((res) => {
            if(res.length != 0) {
              let list = res.CART ? res.CART  : res.Msg
              if(list.name === '系统消息') {
                this.setState({dataType: 'msg'});
              }
            //   list = list.slice(0, 90) // 临时解析30条数据
              this.setState({list:list.list, emptyData: false});
              this.setState({dataSource: this.state.dataSource.cloneWithRows( lodash.cloneDeep(list.list) )})
              this._changeFun(this.state.cartStage,this.state.serachText);
            } else {
              this.setState({emptyData: true});
            }
            this.setState({isRefreshing: false})
          })
      })
      //对网络状态进行判断
      setTimeout(()=>{
          this.setState({isRefreshing: false,Loading: false})
      },3000)
      // this.NotRead()
  }

  /**
   * 视图初始化
   */
  componentDidMount() {
    storage.load({
      key: "User"
    }).then(res => {
      this.setState({isSale: res.isSale})
    })
    setTimeout(() => {
      this._onRefresh()
    }, 100)
    let self = this;
    // dataChecker = setInterval(() => this._checkData(), 120000)
    this.listener = RCTDeviceEventEmitter.addListener('MessageRefresh',function(text){
      self._onRefresh();
      self.setState({cartStage: '0'})
    });
  }

  // props 属性更改调用
  componentWillReceiveProps(props) {
    // const {msgList} = props
    // this.msgList = msgList
  }
  componentWillUnmount() {
    // clearInterval(dataChecker);
  }
  _msgDetail(msg, rowID){
    this.setState({Loading:true})
    Utils.fetch(Utils.api.msgDetail,'post',{wikey:msg.key})
    .then((res) => {
      this.setState({Loading:false})
      // check 'hasRead'
      if(this.state.list[rowID]['hasRead'] === false) {
          var newDs = lodash.cloneDeep(this.state.list);
          newDs[rowID]['hasRead'] = true;
          this.setState({
              dataSource:this.state.dataSource.cloneWithRows(newDs),
              list: newDs
          })
          // this.NotRead()
      }
      Actions.billDetail({
        id: msg.title[1]
      });
    })

  }
  _infoDetail(msg, rowID){
    if(this.state.dataType !== 'msg') {
      this.setState({Loading:true})
      Utils.fetch(Utils.api.msgDetail,'post',{wikey:msg.key})
      .then((res) => {
        this.setState({Loading:false})
        // check 'hasRead'
        if(this.state.list[rowID]['hasRead'] === false) {
            var newDs = lodash.cloneDeep(this.state.list);
            newDs[rowID]['hasRead'] = true;
            this.setState({
                dataSource:this.state.dataSource.cloneWithRows(newDs),
                list: newDs
            })
            // this.NotRead()
        }
        Actions.messageDetail({
          data:res,
          msg:{
            id:msg.title[1],
            key:msg.key,
            time:msg.time_intv,
            type:msg.title[10],
            status:msg.title[12],
            department:msg.title[4]
          },
        });
      })

      //对网络状态进行判断
      setTimeout(()=>{
          this.setState({Loading: false})
      },3000)
    }
  }
  _renderRow(msg,sectionID,rowId) {
    return (
      <TouchableHighlight style={{backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f2f2f2' onPress={()=>this._infoDetail(msg, rowId)}>
        <View style={styles.msgBlock}>
          <View style={styles.msgRowBox}>
            {msg.hasRead ? null:<View style={{width:7,height:7,borderRadius:3.5,backgroundColor:'#ff0012',position:'absolute',left:8,top:25}}></View>}
          </View>
          <View style={[styles.msgRowContent,(this.state.list.length-1==rowId)?{borderBottomWidth:0}:{}]}>
            <View style={styles.msgRow1}>
              <Text style={styles.msgName}>{this.state.dataType === 'msg' ? msg.title : (this.state.isSale ? msg.title[6] : msg.title[3]) }</Text>
              <Text style={styles.msgTime}>{msg.time_intv}</Text>
            </View>
            {this.state.dataType === 'msg' ? null :
              <View style={styles.msgRow2}>
                <Text style={[styles.msgStatus,{color:'#8393aa'}]}>状态：{msg.title[12]}</Text>
                {this.state.isSale ? <Text></Text> : <Text style={[styles.msgSale,{color:'#8393aa'}]}>客户：{msg.title[6]}</Text>}
              </View>
            }
            <View style={styles.msgRow3}>
              <Text style={styles.msgSys} numberOfLines={this.state.dataType !== 'msg' ? 1 : 5}>{msg.sender_name}说：{msg.content.replace(/[\s+\r\n]/g, '')}</Text>
              {this.state.dataType === 'msg' ? null : <Button pattern={{outLine:'smallBorderBtn',text:'smallBorderBlue'}} style={{marginRight:42}} onPress={()=>this._msgDetail(msg, rowId)} value="单据详情"></Button>}
            </View>
          </View>
          {this.state.dataType === 'msg' ? null : <Icon style={[styles.md_iconChevrenH,{top:45}]} color='#cccccc' name='ios-arrow-forward' size={23}/>}
        </View>
      </TouchableHighlight>
    )
  }
  _change (text){
    text = text.replace(/\s/g,"")
    if(text != '') {
      this.setState({searchClean:true})
    } else {
      this.setState({searchClean:false})
    }
    this._changeFun(this.state.cartStage,text);
  }
  // 过滤筛选
  _changeFun(cartStage,serachText){
    var arr = [];
    var serachText = serachText;
    var cartStage = cartStage;
    if(this.state.dataType === 'msg'){
      this.state.list.forEach((value)=>{
        if( value.content.indexOf(serachText) != -1 ){
          arr.push(value);
        }
      })
    }else{
      this.state.list.forEach((value)=>{
        // value.title[13]  车架号
        // value.title[6]   客户名称
        // value.title[11]   单据状态
        if( ((serachText == value.title[13]) || (serachText == (value.title[13]&&value.title[13].substr(11,6))) || (value.title[6].indexOf(serachText)!= -1)) && (cartStage == value.title[11] || cartStage == '0') ){
          arr.push(value)
        }
      })
    }
    this.setState({cartStage: cartStage,serachText: serachText,dataSource:this.state.dataSource.cloneWithRows(lodash.cloneDeep(arr))})
  }
  _changeStatus(vl){
    this._changeFun(vl,this.state.serachText);
    this.setState({menuStatus: !this.state.menuStatus});
  }
  _changeMenuStatus(){
    this.setState({menuStatus: !this.state.menuStatus});
    this.refs.searchInput.blur();
  }
  _renderBill(row) {
    return (
      <TouchableHighlight underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(row.vl)}>
        <View style={[styles.fullSonButtonGroup,{marginLeft:0}]}>
          <Text style={[styles.fullSonButtonText, {marginLeft: 20}]}> {row.nm}</Text>
          {this.state.cartStage === row.vl ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
        </View>
      </TouchableHighlight>

    );
  }

  _cleanInput() {
    this.refs.searchInput.clear()
    this._change('')
  }

  _onScroll() {
    if (this.refs._listView.scrollProperties.offset > Utils.height) {
      this.setState({backToTop: true});
    }else{
      this.setState({backToTop: false});
    }
  }
  _newMessageClick() {
    Animated.timing(
      this.state.ani,
      {
        toValue: 0,
        duration: 250
      }
    ).start((finished) => this.setState({newDataBanner: false}));
    setTimeout(() => {
      this._onRefresh()
    }, 100)
  }
  _newMessageClose() {
    Animated.timing(
      this.state.ani,
      {
        toValue: 0,
        duration: 250
      }
    ).start((finished) => this.setState({newDataBanner: false}));
  }

  render() {
    // <NetworkError/>
    const{ dataSource } = this.state
    return (
      <View style={styles.container} onStartShouldSetResponder={() =>{this.setState({menuStatus:false});}}>
        <View>
          <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" onPress={this.props.barPress} />
          <View style={[styles.navbar]}>
            <Text style={[styles.navLeftButton]}></Text>
            <Text style={[styles.navTitle,{textAlign: 'center'}]}>我的消息</Text>
            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
              <Btn onPress={this._changeMenuStatus.bind(this)}><Image style={{width:19,height:21,marginLeft:16}} source={Assets.filter} /></Btn>
            </View>
          </View>
        </View>
        <Animated.View style={[localStyles.newDataBanner, {height: this.state.ani}]}>
          {this.state.newDataBanner ?
            <TouchableOpacity style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}  activeOpacity={1} onPress={() => this._newMessageClick()}>
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{color: 'white', fontSize: Utils.normalize(13)}}>您有{this.state.keyFlag}条新消息,点击查看</Text>
              </View>
              <Icon style={{backgroundColor: 'transparent', right: Utils.normalize(15)}} name='ios-close-circle' size={18} color='white'onPress={() => {this._newMessageClose()}}/>
            </TouchableOpacity> : <View></View>
          }
        </Animated.View>
        <View>
          <View style={{backgroundColor:'#fff',borderRadius:3, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
            <TextInput style={styles.msgSerach}
              ref="searchInput"
              autoCapitalize='none'
              autoCorrect={false}
              placeholder="以车架号后六位、客户名称搜索"
              placeholderTextColor="#999999"
              underlineColorAndroid="transparent"
              onChangeText={this._change.bind(this)}
            />
            <Icon name='ios-search' size={20} color='#999999' style={[styles.serachIcon]} />
            {this.state.searchClean ? <Icon onPress={()=> this._cleanInput()} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon]} /> : null }
          </View>
        </View>
        <View style={{flex:1,overflow: 'hidden'}}>
        {this.state.emptyData ? <Text style={styles.title}>暂无消息</Text> :
          <View>
            <ListView style={{height: Device.height - Utils.normalize(150) - (this.state.newDataBanner ? Utils.normalize(40) : Utils.normalize(0))}}
              refreshControl={
                <RefreshControl
                  style={{backgroundColor:'transparent'}}
                  refreshing={this.state.isRefreshing}
                  onRefresh={this._onRefresh.bind(this)}
                  tintColor="#ff5555"
                  title="加载中..."
                  colors={['#FF5555']}
                  progressBackgroundColor="#fff"
              />}
              onScroll={this._onScroll.bind(this)}
              ref="_listView"
              dataSource={dataSource}
            //   renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
              initialListSize={10} pageSize={10} scrollRenderAheadDistance={500}
              renderRow={this._renderRow.bind(this)}
            />
          </View>
        }
        </View>
        {this.state.backToTop ?
          <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={localStyles.backToTop}>
            <Image style={{width: Utils.normalize(50), height: Utils.normalize(50)}} source={Assets.backToTop}/>
          </TouchableOpacity>
        : null}
        {this.state.Loading?<Loading/>:null}
        {this.state.menuStatus ? <View style={[styles.overlay,{top:Utils.andr21Normalize(64)}]}>
          <ListView dataSource={this.state.billStatus} renderRow={this._renderBill.bind(this)} />
        </View> : null}
        {Device.isAndroid && this.state.menuStatus?<View style={{borderWidth:11,borderTopColor:'rgba(0,0,0,0)',borderLeftColor:'rgba(0,0,0,0)',borderRightColor:'rgba(0,0,0,0)',borderBottomColor:'#fff',width:0,height:0,position:'absolute',right:Utils.normalize(9),top:42}}></View>:null}
      </View>
    )
  }
}

const localStyles = StyleSheet.create({
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
  },
  newDataBanner: {
    // position: 'absolute',
    // top: Utils.andr21Normalize(99),
    // left: 0,
    width: Device.width,
    backgroundColor: '#fdb54a',
    alignItems: 'center',
    justifyContent: 'center',
  }
})

export default Messages
