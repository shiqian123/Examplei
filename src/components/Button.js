/**
* @Author: meteor
* @Date:   2016-08-11T17:01:41+08:00
* @Last modified by:   shiqian
* @Last modified time: 2016-10-27T10:55:16+08:00
*/

"use strict";
import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import { Utils,Device } from '../base';

class Button extends Component{
  render() {
    let buttonProps = {
     activeOpacity: 0.8,
     onPress: this.props.onPress,
     onPressIn: this.props.onPressIn,
     onPressOut: this.props.onPressOut,
     onLongPress: this.props.onLongPress,
     //用户交互 bool
     shutdownInteractive: this.props.shutdownInteractive,
   }
   let {pattern,style} = this.props;
    return (
      <View>
        {buttonProps.shutdownInteractive ?
          <View {...buttonProps} style={style}>
            <View style={[ styles[pattern.outLine]]}>
              <Text style={styles[pattern.text]}>{this.props.value || '按 钮'}</Text>
            </View>
          </View> :
          <TouchableOpacity {...buttonProps} style={style}>
            <View style={[ styles[pattern.outLine]]}>
              <Text style={styles[pattern.text]}>{this.props.value || '按 钮'}</Text>
            </View>
          </TouchableOpacity>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  fullButton: {
    alignItems: 'center',
    width: Utils.width - 30,
    height: 40,
    backgroundColor: '#fec900',
    borderRadius: 5,
    paddingBottom:2,
  },
  fullButtonUnAct: {
    alignItems: 'center',
    width: Utils.width - 30,
    height: 40,
    backgroundColor: '#e1e1e1',
    borderRadius: 5,
    paddingBottom:2,
  },
  equallyCanleButtom:{
    alignItems: 'center',
    width: Utils.width/2,
    height: 40,
    backgroundColor: '#fff',
    borderTopWidth:1,
    borderTopColor:'#ccc',
    paddingBottom:2,
  },
  changeButtom:{
    alignItems: 'center',
    width: Utils.width/2,
    height: 48,
    backgroundColor: '#fff',
    paddingBottom:2,
  },
  changeButtom3:{
    alignItems: 'center',
    width: Utils.width/3,
    height: 48,
    backgroundColor: '#fff',
    paddingBottom:2,
  },
  allButtom:{
    alignItems: 'center',
    width: Utils.width,
    height: 48,
    backgroundColor: '#fff',
    paddingBottom:2,
  },
  changeText:{
    marginTop: 16,
    fontSize: 16,
    color: '#6da1f8',
  },
  unclickText:{
    marginTop: 16,
    fontSize: 16,
    color: '#A1A1A1',
  },
  redText:{
    marginTop: 16,
    fontSize: 16,
    color: 'red',

  },
  blueText:{
    marginTop: 16,
    fontSize: 16,
    color: '#387ff5',
  },
  equallyOkButtom:{
    alignItems: 'center',
    width: Utils.width/2,
    height: 40,
    backgroundColor: '#387ff5',
    paddingBottom:2,
  },
  smRedButtom:{
    borderRadius: 4,
    alignItems: 'center',
    width: Utils.normalize(50),
    height: 30,
    backgroundColor: '#ff4546',
    paddingBottom:2,
    overflow:'hidden'
  },
  smButtomText:{
    fontSize: 13,
    fontWeight:'bold',
    color: '#fff',
  },
  fullText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight:'bold',
    color: '#fff',
  },
  blockText:{
    marginTop: 10,
    fontSize: 16,
    fontWeight:'bold',
    color: '#999',
  },
  blockTextFont:{
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },

  smallBorderBtn:{
    // width:Utils.normalize(60),
    borderRadius:4,
    justifyContent:'center',
    alignItems:'center',
    borderColor:'#387ff5',
    borderWidth:1,
    overflow: 'hidden'
  },
  mediumFullBtn:{
    borderRadius:4,
    justifyContent:'center',
    backgroundColor:'#387ff5',
    alignItems:'center',
    height: 30,
    paddingLeft: 13,
    paddingRight: 13,
  },
  smallBorderBtnnRadius:{
    borderColor:'#387ff5',
    borderWidth:Device.isAndroid?1:0,
    justifyContent:'center',
    alignItems:'center'
  }
  ,
  smallBorderYellowBtn:{
    borderColor:'#ffb400',
    borderWidth: 1,
    borderRadius:4,
    justifyContent:'center',
    alignItems:'center',
    overflow: 'hidden'
  },
  smallBorderGrayBtn:{
    borderRadius:4,
    justifyContent:'center',
    alignItems:'center',
    borderColor:'#aaa',
    borderWidth:1,
    overflow: 'hidden'
  },
  smallBorderRedBtn:{
    borderColor:'red',
    borderWidth:Device.isAndroid?1:0,
    borderRadius:4,
    justifyContent:'center',
    alignItems:'center'
  },
  smallBorderRedBtnnRadius:{
    borderColor:'red',
    borderWidth:Device.isAndroid?1:0,
    justifyContent:'center',
    alignItems:'center'
  },
  smallBorderBlue:{
    marginLeft:8,
    marginRight:8,
    marginTop:Device.iOS ? 4 : 2,
    marginBottom:Device.iOS ? 4 : 2,
    // marginTop:Device.iOS ? 0 : 2,
    color:'#387ff5',
    fontSize:12,
  },
  smallLongBorderBlue:{
    marginLeft: 18,
    marginRight: 18,
    marginTop:Device.iOS ? 8 : 4,
    marginBottom:Device.iOS ? 8 : 4,
    color:'#387ff5',
    fontSize:14,
  },
  mediumBorderBlue:{
    marginLeft:8,
    marginRight:8,
    marginTop:Device.iOS ? 6 : 2,
    marginBottom:Device.iOS ? 6 : 2,
    borderColor:'#387ff5',
    color:'#387ff5',
    fontSize:17,
  },
  mediumTextWhite:{
    color:'#fff',
    fontSize:13,
  },
  smallBorderYellow:{
    marginLeft:8,
    marginRight:8,
    marginTop:Device.iOS ? 4 : 2,
    marginBottom:Device.iOS ? 4 : 2,
    color:'#ffb400',
    fontSize:12,
  },
  smallBorderGray:{
    marginLeft:8,
    marginRight:8,
    marginTop:Device.iOS ? 4 : 2,
    marginBottom:Device.iOS ? 4 : 2,
    // marginTop:Device.iOS ? 0 : 2,
    color:'#aaa',
    fontSize:12,
  },
  smallBorderRed:{
    paddingLeft:8,
    paddingRight:8,
    paddingTop:Device.iOS ? 4 : 1,
    paddingBottom:Device.iOS ? 4 : 1,
    borderColor:'red',
    // marginTop:Device.iOS ? 0 : 2,
    textAlign:'center',
    justifyContent:'center',
    borderWidth:1,
    color:'red',
    fontSize:12,
    borderRadius:4
  },
  smallBtnBlue:{
    backgroundColor:'#2eb2fd',
    padding:4,
    borderRadius:4,
    // marginTop:3,
    color:'#fff',
    fontSize:Utils.normalize(10)
},
  available_border:{
      paddingLeft:8,
      paddingRight:8,
      paddingTop:4,
      paddingBottom:4,
      borderColor:'#387ff5',
      borderWidth:1,
      // marginTop:Device.iOS ? 0 : 2,
      borderRadius:10,
  },
  available_text:{
      color:'#387ff5',
      fontSize:12,
      textAlign:'center',
  },
  unAvailableBorder:{
      paddingLeft:8,
      paddingRight:8,
      paddingTop:Device.iOS ? 4 : 1,
      paddingBottom:Device.iOS ? 4 : 1,
      borderColor:'transparent',
      borderWidth:1,
      borderRadius:4,
      backgroundColor: '#dcdcdc'
  },
  unAvailableBordernRadius:{
    paddingLeft:8,
    paddingRight:8,
    paddingTop:Device.iOS ? 4 : 1,
    paddingBottom:Device.iOS ? 4 : 1,
    borderColor:'transparent',
    borderWidth:1,
    backgroundColor: '#dcdcdc'
  },
  unAvailableText:{
      color:'#999999',
      fontSize:12,
      textAlign:'center',
  },
  locking_border:{
      paddingLeft:8,
      paddingRight:8,
      paddingTop:4,
      paddingBottom:4,
      borderColor:'#ff0000',
      borderWidth:1,
      // marginTop:Device.iOS ? 0 : 2,
      borderRadius:10,
  },
  locking_text:{
      color:'#ff0000',
      fontSize:12,
      textAlign:'center',
  },
  way_border:{
      paddingLeft:8,
      paddingRight:8,
      paddingTop:4,
      paddingBottom:4,
      borderColor:'#fecb45',
      borderWidth:1,
      // marginTop:Device.iOS ? 0 : 2,
      borderRadius:10,
  },
  way_text:{
      color:'#FF9933',
      fontSize:12,
      textAlign:'center',
  },
  
  nextText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight:'bold',
    color: '#fff',
  },
})

export default Button
