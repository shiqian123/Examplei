'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    Linking,
    TextInput
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'

class BillLog extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data
    }
  }
  _save(){
    this.state.cart.common.des = this.state.des;
    let token;
    storage.load({
      key: "User"
    }).then(res => {
      token = res.token;
      let params = {
        cart:this.state.cart,
        ns:true,
        token:token
      }
      Utils.fetch(Utils.api.save,'post',params)
      .then((res)=>{
        Actions.pop();
      })
    });
  }
  render(){
    let data = this.state.data;
    let listCompent = data.ext.oprec.map((item,key)=>{
      return(
        <View key={key} style={[styles.row,{height:Utils.normalize(62),backgroundColor:'#fff'}]}>
          <View style={{width:Utils.normalize(17),marginLeft:Utils.normalize(15)}}>
            {key+1==data.ext.oprec.length?<View style={styles.ballLine}></View>:null}
            <View style={key==0?styles.ballLine:styles.ballLineL}></View>
            <View style={key==0?styles.ballRed:styles.ballGray}></View>
          </View>
          <View style={{flex:1,borderBottomWidth:1,borderColor:'#cccccc'}}>
            <View style={{height:Utils.normalize(28),marginTop:Utils.normalize(7),justifyContent:'center'}}>
              <Text style={[key==0?{color:'#ff0012'}:'',{fontSize:Utils.normalize(13)}]}>{item.who[3]}{' '+item.who[1]+' '}{item.oprec[3]}</Text>
            </View>
            <View style={{height:Utils.normalize(18),justifyContent:'center'}}>
              <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>{item.when}</Text>
            </View>
          </View>
        </View>
      )
    });
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:23}} title="单据日志"/>
        <ScrollView>
          <View style={styles.md_itemTitleBox}>
            <Text style={styles.md_itemTitle}>单据编号：{this.state.data.ref_id}</Text>
          </View>
          <View style={{paddingBottom:60,backgroundColor:'#fff'}}>
            {listCompent}
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default BillLog
