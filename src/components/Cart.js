/**
* @Author: shiqian
* @Date:   2016-09-29T10:29:26+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-10-18T14:50:15+08:00
*/

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
  Animated,
  PanResponder
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";

class Cart extends Component{
  // 构造
    constructor(props) {
      super(props);
      // 初始状态
      this.state = {
        left:40,
        top:Utils.height-80,
      };
    }
   defaultProps = {
     itemCount:0
   }
  componentWillReceiveProps(next) {
  }
  componentWillMount() {
    this._gestureHandlers = {
      onStartShouldSetResponder: (evt) => {true},  //对触摸进行响应
      onMoveShouldSetResponder: ()=> true,  //对滑动进行响应
      onResponderGrant: ()=>{
      }, //激活时做的动作
      onResponderMove: (e)=>{
        this.setState({left:e.nativeEvent.pageX,top:e.nativeEvent.pageY})
      },  //移动时作出的动作
      onResponderRelease: (e)=>{
        this.setState({left:e.nativeEvent.pageX,top:e.nativeEvent.pageY})
      }, //动作释放后做的动作

    }
  }

  _goCart(){
    Actions.cartDetail({
      id:this.props.id,
    })
  }
  render(){

    return(
      <View {...this._gestureHandlers} style={[cart.container,{left:this.state.left-30,top:this.state.top-32}]}>
        <TouchableOpacity onPress={()=>this._goCart()}>
          <Image source={Assets.cart} style={{width:60,height:60}} />
          {this.props.itemCount==0?null:<View style={cart.circle}></View>}
          {this.props.itemCount==0?null: <Text style={(this.props.itemCount>9)?cart.number2:cart.number}>{this.props.itemCount}</Text>}
        </TouchableOpacity>
      </View>
    )
  }
}
const cart =StyleSheet.create({
  container:{
    width:60,
    height:60,
    position:'absolute',
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
    top:(Utils.height>730)?Utils.normalize(10):Utils.normalize(8),
    right:(Utils.height>730)?Utils.normalize(14.5):Utils.normalize(14),
    color:'#fff'

  },
  number2:{
    position:'absolute',
    top:(Utils.height>730)?Utils.normalize(10):Utils.normalize(8),
    right:(Utils.height>730)?Utils.normalize(11):Utils.normalize(10),
    color:'#fff'

  }
})
export default Cart
