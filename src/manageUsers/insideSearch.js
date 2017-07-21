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

export default class InsideSearch  extends Component{
  constructor(props){
    super(props)
    this.state={

    }
  }
  _change(text){
    this.props._onChange(text)
  }
  render(){
   return(
     <View style={{borderBottomWidth:0.5,borderBottomColor:'#ccc'}}>
       <View style={{backgroundColor:'#fff',borderRadius:3, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
         <TextInput style={styles.msgSerach}
           ref="searchInput"
           autoCapitalize='none'
           autoCorrect={false}
           placeholder={this.props.placeholder}
           placeholderTextColor="#999999"
           underlineColorAndroid="transparent"
           onChangeText={this._change.bind(this)}
         />
         <Icon name='ios-search' size={20} color='#999999' style={[styles.serachIcon]} />
         {this.state.searchClean ? <Icon onPress={()=> this._cleanInput()} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon]} /> : null }
       </View>
     </View>
   )
  }
}
