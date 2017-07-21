/**
* @Author: shiqian
* @Date:   2016-10-12T14:29:28+08:00
* @Email:  15611555640@163.com
* @Last modified by:   shiqian
* @Last modified time: 2016-10-14T17:08:09+08:00
*/

/**
 * Created by shiqian on 16/8/29.
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
  Animated
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card,Button} from '../components';
let flag = 0;
class Subdivision extends Component{
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {};
  }
  defaultProps = {
    itemCount:0
  }

  _changeStatus(item,s){
      if(flag==0){
          Actions.pop({refresh: {zerostkDefault:item}})
          flag=1
        setTimeout( ()=> {
         flag = 0
        },250)
      }
  }

  render(){
     let zerostk = this.props.data
     let stkArr = this.props.stkArr
    return(
      <View>
        <Header title="选择颜色" leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <ScrollView>
          {
            stkArr.length==0?null:
            stkArr.map((item, key)=>{
              return(
                <TouchableHighlight key={key} underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(item.name,true)} style={{backgroundColor:'#fff'}}>
                  <View style={[styles.fullSonButtonGroup,{marginLeft: 16}]}>
                    <Text style={[styles.fullSonButtonText]}> {item.name}({item.number})
                    </Text>
                    {this.props.zerostkDefault === item.name ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                  </View>
                </TouchableHighlight>
              )
            })
          }
          {
            zerostk.map((item, key)=>{
              return(
                <TouchableHighlight key={key} underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(item,true)} style={{backgroundColor:'#fff'}}>
                  <View style={[styles.fullSonButtonGroup,{marginLeft: 16}]}>
                    <Text style={[styles.fullSonButtonText]}> {item}(预定)
                    </Text>
                    {this.props.zerostkDefault === item ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                  </View>
                </TouchableHighlight>
              )
            })
          }

        </ScrollView>
      </View>
    )
  }
}
const s_styles =StyleSheet.create({
  container:{
    width:60,
    height:60,
    position:'relative',
    bottom:Utils.normalize(80),
    left:Utils.normalize(24),
    backgroundColor:'transparent'
  },
  circle:{
    position:'absolute',
    backgroundColor:"#ff9000",
    top:Utils.normalize(8),
    right:Utils.normalize(8),
    width:Utils.normalize(20),
    height:Utils.normalize(20),
    borderTopLeftRadius:Utils.normalize(10),
    borderTopRightRadius:Utils.normalize(10),
    borderBottomLeftRadius:Utils.normalize(10),
    borderBottomRightRadius:Utils.normalize(10)
  },
  number:{
    position:'absolute',
    top:Utils.normalize(8),
    right:Utils.normalize(14),
    color:'#fff'

  }
})
export default Subdivision
