/**
* @Author: shiqian
* @Date:   2016-09-29T10:29:26+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-10-10T10:15:40+08:00
*/

/**
 * Created by shiqian on 16/8/22.
 */

import React, { Component } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Modal,
  View,
  StyleSheet,
  Text,
  Animated
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar} from '../components';

class SearchTitle extends Component{
  // 构造
    constructor(props) {
      super(props);
      // 初始状态
      this.state = {};
    }
  render(){
   if(this.props.first){
     return(
       <View style={[styles_tit.rowView,(this.props.count==0)?{ borderBottomWidth:0,borderBottomColor:'#cccccc',}:{}]}>
         {this.props.count==undefined||this.props.count==0?
           <Text style={{color:'#999999',fontSize:13}}>没有符合条件的商品</Text>:
           <Text style={{color:'#999999',fontSize:13}}>共
             {this.props.flag=='NC'?<Text>{this.props.vehicleCount}种车系,</Text>:null}
             {this.props.count}{this.props.name=='其它'?'条结果':this.props.name=='新车'?'种车型':'种'+ this.props.name}
           </Text>
         }
       </View>
     )
   }else{
     return(
       <View style={[styles_tit.rowView,(this.props.count==0)?{ borderBottomWidth:0,borderBottomColor:'#cccccc',}:{}]}>
         {this.props.count==undefined||this.props.count==0?
           <Text style={{color:'#999999',fontSize:13}}>没有符合条件的商品</Text>:
           <Text style={{color:'#999999',fontSize:13}}>共搜索到符合条件的
             {this.props.flag=='NC'?<Text>{this.props.vehicleCount}种车系,</Text>:null}
              {this.props.count}{this.props.name=='其它'?'条结果':this.props.name=='新车'?'种车型':'种'+ this.props.name}
           </Text>
         }
       </View>
     )
   }

  }
}
const styles_tit = StyleSheet.create({
  rowView:{
    position:'absolute',
    width:Device.width,
    top:Utils.andr21Normalize(108),
    height:Utils.normalize(36),
    justifyContent:'center',
    borderBottomWidth:0.5,
    borderBottomColor:'#cccccc',
    paddingLeft:20,
    backgroundColor:'#efefef'
    }
})
export default SearchTitle
