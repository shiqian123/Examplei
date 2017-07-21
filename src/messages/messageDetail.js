/**
* @Author: meteor
* @Date:   2016-08-22T15:32:58+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-08-23T15:49:15+08:00
*/

'use strict'
import React, { Component } from 'react';
import {
  View,
  Text,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableHighlight,
  Animated,
  DeviceEventEmitter,
  Keyboard,
    BackAndroid
} from 'react-native'
import styles from '../common/styles'
import Btn from 'react-native-button'
import {Utils,Device} from "../base";
import {Actions} from 'react-native-router-flux'
import Storage from 'react-native-storage'
import Icon from 'react-native-vector-icons/Ionicons'

import {Header,Button} from '../components'
import LoadIcon from '../components/Loading'
class MessageDetail extends Component {
  constructor(props){

    super()
    this.state = {
      data:props.data,
      isRefreshing:false,
      text:'',
      viewBottom:new Animated.Value(0),
      LoadIcon:false
    }
    //load 读取
    storage.load({
      key: props.msg.key,
      id:props.msg.id
    }).then(ret => {
      this.setState({text:ret.content})
    }).catch(err => {
      console.log(err)
    })

  }
  componentDidMount() {
    if(Device.isAndroid) {
      SplashScreen.hide()
    }
  }

  componentWillMount() {
    if (Device.isAndroid) {
      BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    storage.load({
      key: "User"
    }).then(res => {
      this.setState({isSale: res.isSale})
    })
  }
  componentWillUnmount() {
    if (Device.isAndroid) {
      BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
  }

  onBackAndroid = () => {
    try {
      storage.save({
        key: this.props.msg.key,  //注意:请不要在key中使用_下划线符号!
        id:this.props.msg.id,
        rawData: {
          content:this.state.text
        },
        expires: 1000 * 3600
      });
    } catch (e) {
      alert(e)
    }
  }
  _goBack = ()=>{
    storage.save({
      key: this.props.msg.key,  //注意:请不要在key中使用_下划线符号!
      id:this.props.msg.id,
      rawData: {
        content:this.state.text
      },
      expires: 1000 * 3600
    });
    Actions.pop();

  }
  _detail(){
    Actions.billDetail({
      id: this.state.data.msg.title[1],
    });
  }
  _change(text){
    this.setState({text:text.trim()})
  }
  _send(){
    this.refs.reply.blur()
    if(!this.state.text) return;
    let params = {
      wikey: this.state.data.msg.key,
      msg:this.state.text
    }
    Utils.fetch(Utils.api.reply,'post',params)
      .then((res)=>{
        this.setState({data:res,text:''});
      })
  }
  componentDidMount(){
    Keyboard.addListener('keyboardWillShow', this.updateKeyboardSpace.bind(this))
  }
  updateKeyboardSpace(frames){
   let keyboardSpace =  frames.endCoordinates.height//获取键盘高度
   if(Device.isAndroid) keyboardSpace = 0;
   this.setState({keyboardSpace:keyboardSpace})
  }
  scrollViewBack(){
    Animated.timing(
　　　　this.state.viewBottom,
　　　　{
　　　　　　toValue: 0,
　　　　　　duration: 250,
　　　　}
　　).start();
  }
  _focus(){
    setTimeout(() => {
      Animated.timing(
        this.state.viewBottom,
        {
     　　  toValue: Device.isAndroid ? 0 : this.state.keyboardSpace,
     　　  duration: 150,
     　　}
      ).start();
    }, 100)
  }
  render(){
    var data = this.state.data;
    return (
      <View style={styles.container}  onStartShouldSetResponder={()=>{this.refs.reply.blur();}}>
        <Header leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="消息"/>
        <ScrollView keyboardShouldPersistTaps={true} style={{flex:1,backgroundColor:'#fff'}}>
          {data?
            <View style={{flex:1,backgroundColor:'#fff',paddingBottom:20}}>
              <View>
                <View style={[styles.row,styles.bd_nameBox]}>
                  <View style={styles.md_itemL}>
                    <Text style={styles.bd_name}>{this.state.isSale ? data.msg.title[6] : data.msg.title[3]}</Text>
                  </View>
                  <View style={styles.md_itemR}>
                    <Text style={styles.bd_time}>{data.msg.time_intv}</Text>
                  </View>
                </View>
                <View style={styles.bd_Items}><Text style={[styles.bd_ItemsText,{width:Utils.normalize(70)}]}>单据编号：</Text><Text style={styles.bd_ItemsTextR}>{data.msg.title[1]}</Text></View>
                <View style={styles.bd_Items}>
                  <Text style={[styles.bd_ItemsText]}>单据类型：</Text>
                  <Text style={styles.bd_ItemsTextR}>{data.msg.title[10]}</Text>
                  <Button pattern={{outLine:'smallBorderBtn',text:'smallBorderBlue'}} onPress={()=>this._detail()} value="单据详情"></Button>
                </View>
                <View style={[styles.bd_Items]}><Text style={[styles.bd_ItemsText,{width:Utils.normalize(70)}]}>单据状态：</Text><Text style={styles.bd_ItemsTextR}>{data.msg.title[12]}</Text></View>
                <View style={styles.bd_Items}><Text style={[styles.bd_ItemsText,{width:Utils.normalize(70)}]}>部门：</Text><Text style={styles.bd_ItemsTextR}>{data.msg.title[4]}</Text></View>
                <View style={styles.bd_Items}><Text style={[styles.bd_ItemsText,{width:Utils.normalize(70)}]}>{this.state.isSale ? '销顾':'客户'}：</Text><Text style={styles.bd_ItemsTextR}>{this.state.isSale ? data.msg.title[3] : data.msg.title[6]}</Text></View>
                <View style={styles.bd_Items}>
                  <Text style={[styles.bd_ItemsText,{width:Utils.normalize(70)}]}>参与者：</Text>
                  <Text style={styles.bd_ItemsTextR} numberOfLines={2}>{data.mail.receivers_name.join('，')}
                  </Text>
                </View>
                <View style={[styles.lineFull,{marginTop:20,marginBottom:20}]}></View>
                <View>
                  {data.mail.replies.map((item,key)=>{
                    return (
                      <View key={key}>
                        <View style={[{marginLeft:Utils.normalize(20),  marginRight:Utils.normalize(20),flexDirection:'row',alignItems:'center', flex:1,}]}>
                          <View>
                            <Text style={{textAlign:'left'}}>{item.sname+'说：'}</Text>
                          </View>
                          <View style={{flex:1}}>
                            <Text>{item.what}</Text>
                          </View>
                        </View>
                        <View  style={[styles.bd_Items,{marginTop:2,flex: 0}]}>
                          <Text style={{color:'#999'}}>{item.when_st}</Text>
                        </View>
                      </View>)
                  })
                  }
                </View>
              </View>
            </View>
          :null}
        </ScrollView>
        <View style={{height:Utils.normalize(50)}}></View>
        {this.state.LoadIcon?<LoadIcon/>:null}
        <Animated.View style={[styles.bd_input,{bottom:this.state.viewBottom}]}>
          <TextInput style={styles.bd_TextInput}
            onChangeText={this._change.bind(this)}
            onFocus={this._focus.bind(this)}
            ref="reply"
            autoCapitalize='none'
            autoCorrect={false}
            placeholder="与参与者说："
            placeholderTextColor="#999999"
            multiline={true}
            defaultValue={this.state.text}
            onEndEditing={this.scrollViewBack.bind(this)}
          />
          <Btn onPress={this._send.bind(this)} style={styles.bd_Send}>发送</Btn>
        </Animated.View>
      </View>
    )
  }
  _onRefresh(){
    this.setState({isRefreshing:true})
    this.setState({isRefreshing:false})
  }
}

export default MessageDetail
