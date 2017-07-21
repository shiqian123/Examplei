/**
 * Created by shiqian on 16/8/23.
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
  Image,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";

class Card extends Component{
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {};
  }
  render(){
    return(
      <View style={[this.props.style,{height: Utils.normalize(43),justifyContent:'center'}]}>
        <TouchableHighlight underlayColor={'transparent'}  style={[this.props.state === this.props.id || (this.props.isArray && this.props.state.indexOf(this.props.id) != -1) ? styles_index.modelBorderBlue:styles_index.modelBorder]} onPress={this.props.onPress}>
            <Text numberOfLines={1} style={this.props.state === this.props.id || (this.props.isArray && this.props.state.indexOf(this.props.id) != -1 ) ? styles_index.fullSonButtonTextBlue:styles_index.fullSonButtonText} >{this.props.name}</Text>
        </TouchableHighlight>
      </View>
    )
  }
}
const styles_index = StyleSheet.create({
  tabBar:{
      flexDirection:"row",
      width:Utils.width,
      height:Utils.normalize(44),
      justifyContent:'center',
      backgroundColor:"#ffffff",
      borderColor: '#cccccc',
      borderBottomWidth: 0.5
  },
  tabText:{
      textAlign:'center',
      color:'#333333',
      fontSize: Utils.normalize(14)
  },
  tabTextBlue:{
      textAlign:'center',
      color:'#387ff5',
      fontSize: Utils.normalize(14)
  },
  label:{
      width:Utils.width,
      height:Utils.normalize(34),
      justifyContent:'center',
      paddingLeft:Utils.normalize(10),
      backgroundColor:'#efefef'
  },
  overlay:{
      position: 'absolute',
      top:Device.iOS?Utils.andr21Normalize(109):Utils.andr21Normalize(108),
      bottom:0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      width: Utils.width,
      flex: 1,
  },
  itemActive: {
    color: '#387ff5'
  },
  itemNoActive: {
    color: '#666'
  },
  fullSonButtonGroup:{
      height: Utils.normalize(44),
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#cccccc',
      marginLeft: Utils.normalize(15),
      flex:1,
  },
  fullSonButtonText: {
    fontSize: Utils.normalize(13),
    textAlign: 'center',
    color: '#666'
  },
  fullSonButtonTextBlue: {
    fontSize: Utils.normalize(13),
    textAlign: 'center',
    color:'#387ff5'
  },
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
    marginBottom: 9
  },
  modelBorder:{
      height: Utils.normalize(30),
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems:'center',
      borderWidth: 0.5,
      borderRadius: 5,
      borderColor: '#bbb',
      marginLeft:Utils.normalize(13),
      marginRight: Utils.normalize(1),
      paddingLeft:Utils.normalize(8),
      paddingRight:Utils.normalize(8),
      marginTop: Utils.normalize(15),
      marginBottom: Utils.normalize(15)
  },
  modelBorderBlue:{
      height: Utils.normalize(30),
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems:'center',
      borderRadius: 5,
      borderColor: '#387ff5',
      marginLeft:Utils.normalize(13),
      marginRight: Utils.normalize(1),
      paddingLeft:Utils.normalize(20),
      paddingRight:Utils.normalize(20),
      marginTop: Utils.normalize(15),
      marginBottom: Utils.normalize(15),
      borderWidth: 0.5
  },
  font333:{
    fontSize:Utils.normalize(13),
    color:'#333333'
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
});
export default Card
