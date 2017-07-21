/**
* @Author: shiqian
* @Date:   2016-09-29T10:29:26+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-07T14:41:36+08:00
*/

/**
 * Created by shiqian on 16/8/30.
 */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  ListView,
  RefreshControl,
  Modal,
  View,
  StyleSheet,
  Image,
  TextInput,
  Text,
  Animated,
  PanResponder,
  DeviceEventEmitter
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _,API} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card,Button} from '../components';

//新车
class NewCar extends Component{
  // 构造
  constructor(props) {
    var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
    super(props);
    // 初始状态
    this.state = {
      dataSource:ds.cloneWithRows(this.props.dataSource),
      itemCount:'',
      backToTop:false,
      isRefreshing:false,
      ani: new Animated.Value(Utils.height)
    };
  }

  componentWillReceiveProps(next) {
    this.setState({dataSource:this.state.dataSource.cloneWithRows(next.dataSource)});

  }
  componentDidMount() {

  }
  componentWillMount() {

}
  _checkStatus(msg,rowId){
    this.props.param.searchTwoOpen = false;
    msg.active = !msg.active;
    var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
    this.setState({dataSource:ds.cloneWithRows(this.props.dataSource)});
  }
  _goDetail(item){
    Actions.shopDetail({
      item:item,
      param:this.props.param,
      allData:this.props.dataSource,
      ani: new Animated.Value(0)
    })
  }
  _onScroll() {
    if(this.refs._listView.scrollProperties.offset<8){
      DeviceEventEmitter.emit('refresh',true)
    }else{
        DeviceEventEmitter.emit('refresh',false)
    }
    if (this.refs._listView.scrollProperties.offset > Utils.height) {
      this.setState({backToTop: true});
    }else{
      this.setState({backToTop: false});
    }
  }
  _onRefresh() {
    Animated.timing(
      this.state.ani,
      {
        toValue: 0,
        duratiion: 250
      }
    ).start();
    this.setState({isRefreshing: true})
    let params = {}
    Utils.fetch( Utils.api.queryNC, 'post', {}).
    then((res)=>{
      if(res){
        this.setState({isRefreshing: false})
      }
    });
  }
  _renderRow(msg,sectionID,rowId){
    if(msg!='NC'){
      if(this.props.param.searchTwoOpen){
        msg.active = true
      }
      var messageArr = [];
      _.forIn(msg.arr, function(value, key) {
        value.flag=key;
        messageArr.push(value)
      });
      return(
        <View >
          <TouchableOpacity onPress={()=>this._checkStatus(msg,rowId)}>
            <View style={[nc_styles.renderView,{paddingLeft:Utils.normalize(8),paddingTop:Utils.normalize(8)}]}>
              <Image source={ (msg.pics==undefined)?{uri:API.url+'/pub/img/che.png'}:msg.pics[0].href.indexOf('http')>-1?{uri:msg.pics[0].href}:{uri:API.url+msg.pics[0].href}}
                     style={{width: 100, height: 60}} />
                   <View style={{ flexDirection: 'column',borderBottomWidth:0.5, borderBottomColor:'#ccc',marginLeft:8}}>
                <Text style={[nc_styles.label,{fontSize:Utils.normalize(15)}]} >{msg.tnm}</Text>
                <View style={[nc_styles.label,{flexDirection: 'row',paddingBottom:14}]}>
                  <Text style={[nc_styles.grayColor]}>指导价:</Text>
                  <Text style={[nc_styles.orangeColor,{paddingLeft:Utils.normalize(12)}]}>￥{msg.min/10000}万-￥{msg.max/10000}万</Text>
                </View>
              </View>
              <View style={{flex:1,flexDirection: 'row',justifyContent:'flex-end',alignItems:'center',borderBottomWidth: 0.5, borderBottomColor:'#ccc',paddingRight:(Device.height<665&&Device.iOS)?Utils.normalize(4):Utils.normalize(16)}}>
                {
                  msg.active?
                    <Icon  color='#cccccc' name={"ios-arrow-up"} size={23}  />:
                    <Icon  color='#cccccc' name={ "ios-arrow-down"} size={23}  onPress={()=>this._checkStatus(msg,rowId)}/>
                }
              </View>
            </View>
          </TouchableOpacity>
          {msg.active?
            <View style={{marginBottom:8}}>
              {
                messageArr.map((item, key)=>{
                  return(
                    <TouchableOpacity key={key} onPress={()=>this._goDetail(item)} >
                      <View style={[nc_styles.itemBox,(key==0)?{paddingTop:8}:{}]}>
                        <View style={{flex:9,flexDirection: 'column'}}>
                          <Text style={[nc_styles.label,(key==0)?{marginTop:2}:null,{fontSize:Utils.normalize(14)}]} >{item.mnm}</Text>
                            <View style={[nc_styles.label,{flex:1,flexDirection: 'row'}]}>
                              <View style={[{flex:5,flexDirection: 'row'}]}>
                                <Text style={[nc_styles.grayColor,styles.f13]}>指导价:</Text>
                                <Text style={[nc_styles.redColor,styles.f13,{paddingLeft:12}]}>￥{item.prc/10000}万</Text>
                              </View>
                              <View w style={[{flex:4,flexDirection: 'row'}]}>
                                <Text style={[nc_styles.grayColor,styles.f13]}>库存:</Text>
                                <Text style={[nc_styles.redColor,styles.f13,{paddingLeft:12,width:100}]} >{item.mc}</Text>
                              </View>
                            </View>
                        </View>
                        <View style={{flex:1,flexDirection: 'row',justifyContent:'flex-end',alignItems:'center',paddingRight:(Device.height<665&&Device.iOS)?Utils.normalize(14):Utils.normalize(24)}}>
                          <Icon  color='#cccccc' name='ios-arrow-forward' size={23} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })
              }
            </View> :null
          }

        </View>

      )
    }else{
      return(null)
    }

  }
  render(){
    return(
      <View
        style={[nc_styles.listContainer,(Object.keys(this.state.dataSource._dataBlob.s1).length==1?{backgroundColor:'#EFEFEF'}:{})]}>
        <ListView

          initialListSize={20} pageSize={20}
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          onScroll={this._onScroll.bind(this)}
          ref ='_listView'
          refreshControl={
                <RefreshControl
                  enabled={false}
                  style={{backgroundColor:'transparent'}}
                  refreshing={this.state.isRefreshing}
                  onRefresh={this._onRefresh.bind(this)}
                  tintColor="#ff5555"
                  title="加载中..."
                  colors={['#FF5555']}
                  progressBackgroundColor="#fff"
              />}

          renderFooter={() => {
              let _result =
              this.props.foot ?
                (<View>
                   <View style={{height: 40,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa',paddingTop:10,paddingBottom:10}}>--没有更多商品了--</Text>
                   </View>
                </View>)
              :(null);
              return _result

            }}
          onEndReachedThreshold={40}
          scrollRenderAheadDistance={220}
          renderRow={(msg,sectionID,rowId)=>this._renderRow(msg,sectionID,rowId)}>
        </ListView>
        {this.state.backToTop ?
          <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={nc_styles.backToTop}>
            <Image style={{width: 50, height: 50}} source={Assets.backToTop}/>
          </TouchableOpacity>
          : null}
      </View>
    )
  }
}
const nc_styles = StyleSheet.create({
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
  listContainer:{
    marginTop:Utils.normalize(36),
    flex:1,
    height:Utils.height-Utils.normalize(140),
    backgroundColor:"#fff"
  },
  renderView:{
    flex:1,
    flexDirection: 'row',
  },
  itemBox:{
    flexDirection:'row',
    width:Utils.width,
    flex:1,
    borderBottomWidth: 0.5,
    borderColor:'#ccc',
    paddingBottom:4,
    backgroundColor:'#f0f1f2',
    paddingLeft:8
  },
  label:{
    marginTop:Utils.normalize(10),
  },
  orangeColor:{
    color:'#ff9000',
    fontSize:Utils.normalize(16),

  },
  redColor:{
    color:'#f40b0b',
    fontSize:Utils.normalize(14),

  },
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
  },
  overlay:{
    position: 'absolute',
    top:Utils.andr21Normalize(64),
    bottom:0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    // backgroundColor: 'red',
    width: Utils.width,
    flex: 1,
    // flexDirection: 'row',
  },
  grayColor:{
    color:'#999999',
    fontSize:Utils.normalize(14)
  },
});
export default NewCar;
