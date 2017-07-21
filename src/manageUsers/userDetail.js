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
    Linking,
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
import {Header, Loading, Button, Developing, Tip,SearchTitle,Box} from '../components';

let salesString = '',isRefresh = false;
export default class UserDetail  extends Component{
  constructor(props){
    super(props)
    this.state={
       sales:[],
       _salesArr:[],
       item:[],
       username:'',
       userId:''
    }
  }
  componentDidMount(){
    isRefresh = false;
    _.forEach(this.props.item.sale,(item,i)=>{
      salesString += item +','
    })
    this.setState({item:this.props.item})
    storage.load({
      key: "User"
    }).then(res => {
      this.setState({username:res.username,userId:res.me_id})
    })
    // this._onRefresh()
  }
  componentWillReceiveProps(nextPage){
    if(nextPage.data){
      salesString=[];isRefresh = true
      var d = nextPage.data.cust;
      _.forEach(nextPage.data.sale,(item,i)=>{
        salesString += item.name +','
      })
      d.sale = nextPage.data.sale
      this.setState({item:d})
    }

  }
  componentWillUnmount(){
    salesString = []
  }
  _onRefresh(listPage){
   this.setState({dataSource:this.state.dataSource.cloneWithRows(this.props.sales),sales:this.props.sales})
  }
  addSales(){
    Actions.addSales({sales:this.state._salesArr.length==0?this.state.sales:this.state._salesArr})
  }
  _goBack(){
    if(isRefresh){
      setTimeout(()=>{
          Actions.pop({refresh:{}})
      },0)

    }else{
        Actions.pop()
    }
  }
  _call(tel,type){
    if(type=='tel'){
      Linking.openURL('tel:'+tel);
    }else{
      Linking.openURL('smsto:'+tel);
    }

  }
  _addSales(){
    if(this.props.item.sale==0){
      return
    }else{
      Utils.fetch(Utils.api.getSale,'post',{cust_id:this.state.item.id,create_id:this.state.userId}).then((res)=>{
        Actions.alreadySalesList({sales:res.list,canEdit:false})
      })
    }
  }
  _delete(){
    Utils.fetch(Utils.api.deleteUser,'post',{id:this.state.item.id}).then((res)=>{
      Actions.pop({refresh:{}})
    })
  }
  _goAddUser(){
    Actions.addUser({item:this.state.item,ops:this.props.ops,types:'CHANGE'})
  }
  _goAlreadyCar(){
    Actions.purchasedCar({car:this.state.item,ops:this.props.ops,})
  }
  render(){
    var item = this.state.item
   return(
     <View style={styles.container,{backgroundColor:'#fff'}}>
       <Header  leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="客户详情"/>
       <ScrollView>

         {this.props.ops instanceof Array?
            <Box left="姓名" right={item.name} style={_styles.box}></Box>
           :<View>
             <View style={[_styles.name]}>
               <Text style={{fontSize:18}}>{item.name}</Text>
             </View>
             <View style={[_styles.name,{marginTop:-6}]}>
               <View style={{flex:10}}>
                 <Text style={{color:'#d3d3d3'}}>手机</Text>
                 <Text style={{paddingTop:2,fontSize:16}}>{item.tel1}</Text>
               </View>
               <TouchableOpacity style={{flex:1,paddingRight:20}} onPress={()=>this._call(item.tel1,'messagee')}>
                 <Image style={{width: Utils.normalize(25), height: Utils.normalize(20)}} source={Assets.message}/>
               </TouchableOpacity>
               <View style={{flex:1}}>
                 <Icon onPress={()=>this._call(item.tel1,'tel')} color="#39a9f4" name="ios-call-outline" size={30}></Icon>
               </View>
             </View>
             <View style={[_styles.name,{height:Utils.normalize(60),borderBottomWidth:0.5,borderBottomColor:'#cccccc',}]}>
               <View style={{flex:11,paddingRight:20,}}>
                 <Text style={{color:'#d3d3d3'}}>固话</Text>
                 <Text style={{paddingTop:2,fontSize:16}}>{item.tel2}</Text>
               </View>
               <View style={{flex:1}}>
                 <Icon onPress={()=>this._call(item.tel2,'tel')} color={item.tel2==''||item.tel2==null?"#d3d3d3":"#39a9f4"} name="ios-call-outline" size={30}></Icon>
               </View>
             </View>
           </View>}

         <Box left="性别" right={item.sex==1?"男":"女"} style={[_styles.box]}></Box>
          {this.props.ops instanceof Array?null:
            <View>
             <Box left="证件类别" right={item.ptype_name} style={_styles.box}></Box>
             <Box left="证件号" right={item.pid} style={_styles.box}></Box>
             <Box left="地址" isDefine={true} right={item.address} style={_styles.box}></Box>
             <Box left="邮编" right={item.postcode} style={_styles.box}></Box>
             <Box left="QQ" right={item.qq} style={_styles.box}></Box>
             <Box left="邮箱" right={item.email} style={_styles.box}></Box>
             <Box left="生日" right={item.birthday} style={_styles.box}></Box>
            </View>}
         <Box left="创建人" right={item.creater_name} style={_styles.box}></Box>
         <View style={{backgroundColor: '#fff'}}>
           <View style={[styles.fullSonButtonGroup, _styles.fullSonButtonGroup,{borderBottomWidth: 0}]}>
             <View style={{width: 116, flexDirection: 'row'}}>
               <Text style={[ {marginLeft: 0} ]}>所属销售顾问</Text>
               <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
             </View>
             <TouchableOpacity style={_styles.item} onPress={this._addSales.bind(this)}>
               <Text numberOfLines={1} style={_styles.itemText}>{salesString.length!=0 ? salesString : ''}</Text>
               {salesString.length!=0?
               <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
               :null}
             </TouchableOpacity>
           </View>
         </View>
       </ScrollView>
       {!this.props.ops.mgr?
         <View style={{flexDirection:'row',backgroundColor:'#fff',  borderTopWidth:1,borderTopColor:'#ccc',}}>
           <Button value="已购车辆" pattern={{outLine:"allButtom",text:"blueText"}} onPress={() => this._goAlreadyCar()} />
         </View>
          :
         <View style={{flexDirection:'row',backgroundColor:'#fff',  borderTopWidth:1,borderTopColor:'#ccc',}}>
            <View style={{width:1,zIndex:2,height:Utils.normalize(18),backgroundColor:'#999',position:'absolute',top:Device.iOS ? Utils.normalize(16) : Utils.normalize(19),left:Utils.width/3}}>
             </View>
             <View style={{width:1,zIndex:2,height:Utils.normalize(18),backgroundColor:'#999',position:'absolute',top:Device.iOS ? Utils.normalize(16) : Utils.normalize(19),left:Utils.width/3*2}}>
              </View>
            <Button value="删除" pattern={{outLine:"changeButtom3",text:"redText"}} onPress={() => this._delete()} />
            <Button value="变更" pattern={{outLine:"changeButtom3",text:"blueText"}} onPress={() => this._goAddUser()} />
            <Button value="已购车辆" pattern={{outLine:"changeButtom3",text:"blueText"}} onPress={() => this._goAlreadyCar()} />
          </View>}

     </View>

   )
  }
}
const _styles = StyleSheet.create({
  itemText: {
    color: '#999'
  },
  name:{
     height:Utils.normalize(44),
     flexDirection:'row',
     alignItems:'center',
     paddingLeft:15,
     backgroundColor:'#fff'
   },
    box:{
      backgroundColor:'#fff',
    },
    fullSonButtonGroup:{
      marginLeft: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingRight: Utils.normalize(15)
    },
    item: {
      flex: 1,
      marginRight: Utils.normalize(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
})
