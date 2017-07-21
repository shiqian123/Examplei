/**
* @Author: shiqian
* @Date:   2016-10-12T14:29:28+08:00
* @Email:  15611555640@163.com
* @Last modified by:   yanke
* @Last modified time: 2016-10-14T15:16:30+08:00
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
  StyleSheet,
  Image,
  TextInput,
  Text,
  Animated
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Box,Button} from '../components';

let flag = 0;

class SelectColor extends Component{
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {
      data:'',
      active:'',
      neishiActive:'',
      zeroArr:[],
      stockColorArr:[],
      neishiArr:[]
    };
  }
  componentDidMount() {
    //预定颜色
    let zeroArr = [];
    let _active = this.props.carColorDefault.nm;
    _.forIn(this.props.item.zeroarr, function(value, key) {
      value.flag=key;
      zeroArr.push(value)
    });
    //有库存颜色 转换成数组
    let stockColorArr = [];
    let neishiArr =[];
    _.forIn(this.props.item.arr,function (value,key) {
      value.nm=key;
      stockColorArr.push(value)
      if(key==_active){
        _.forIn(value, function(_value, _key) {
          if(_key!='nm'){
            var newData = {
              nm:_key,
              number:_value.length
            };
            neishiArr.push(newData)
          }
        });
      }

    });
    if(this.props.carColorDefault.cl!=undefined){
      neishiArr =[]
    }
    this.setState({active:this.props.carColorDefault,zeroArr:zeroArr,stockColorArr:stockColorArr,neishiActive:this.props.neishiDefault,neishiArr:neishiArr})
  }
  componentWillUnmount() {
    if(this.state.neishiArr!=''){
      RCTDeviceEventEmitter.emit('updateNewCar',{carColorDefault: this.state.active,neishiDefault:this.state.neishiActive})
    }
  }

  _changeStatus(item,s){
    this.setState({active:item});
    if(s){
      //内饰数据格式转换
      let neishiArr =[];
      _.forIn(item, function(value, key) {
        if(key!='nm'){
          var newData = {
            nm:key,
            number:value.length
          };
          neishiArr.push(newData)
        }
      });
      if(this.props.neishiDefault==''){
        this.setState({neishiActive:neishiArr[0]})
      }
      this.setState({neishiArr:neishiArr})
    }else{
      //当没有内饰颜色的时候直接返回上一级
      this.setState({neishiArr:[]});
      setTimeout( ()=> {
        if(flag == 0){
          Actions.pop({refresh: {carColorDefault: this.state.active,neishiDefault:''}})
          flag = 1;
          setTimeout(()=>{
            flag = 0;
          },250)
        }
      },0)
    }
  }
  _changeNeiShiStatus(item,s){
    this.setState({neishiActive:item});
  }
  _goBack(){
    setTimeout( ()=> {
      if(flag == 0){
        Actions.pop({refresh: {carColorDefault: this.state.active,neishiDefault:this.state.neishiActive}})
        flag = 1;
        setTimeout(()=>{
          flag = 0;
        },250)
      }
    },0)
  }
  render(){
    return(
      <View  style={styles.container}>
        <Header title="颜色" leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
          <ScrollView>
          <View style={color.title}>
            <Text style={color.tittleSize}>车身颜色</Text>
          </View>
          {
            this.state.stockColorArr.map((item, key)=>{
              return(
                <TouchableHighlight key={key} underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(item,true)} style={{backgroundColor:'#fff'}}>
                  <View style={[styles.fullSonButtonGroup,{marginLeft: 16}]}>
                    <Text style={[styles.fullSonButtonText]}> {item.nm}
                    </Text>
                    {this.state.active.nm === item.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                  </View>
                </TouchableHighlight>
              )
            })
          }
            <View  style={{borderBottomWidth:1,borderBottomColor:'#bbb'}}>
              {
                this.state.zeroArr.map((item, key)=>{
                  return(
                    <TouchableHighlight  key={key} underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(item)} style={{backgroundColor:'#fff'}}>
                      <View style={[styles.fullSonButtonGroup,(key!=this.state.zeroArr.length-1)?{marginLeft: 16}:{marginLeft: 16,borderColor:'#fff'}]}>
                        <Text style={[styles.fullSonButtonText, ]}> {item.nm}
                          <Text style={{color:'red'}}>(预定)</Text>
                        </Text>
                        {this.state.active.nm === item.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                      </View>
                    </TouchableHighlight>
                  )
                })
              }
            </View>
          <View>
            {
              this.state.neishiArr.map((item, key)=>{
                return(
                  <View key={key}>
                    {
                      key==0?
                       <View  style={color.title}>
                          <Text style={color.tittleSize}>内饰颜色</Text>
                      </View>:null
                    }
                    <TouchableHighlight onPress={()=>this._changeNeiShiStatus(item)} style={{backgroundColor:'#fff'}}>
                      <View style={[styles.fullSonButtonGroup,{marginLeft: 16}]}>
                        <Text style={[styles.fullSonButtonText]}> {item.nm=='unlimited'?'未填写':item.nm}({item.number})
                        </Text>
                        {this.state.neishiActive.nm === item.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                      </View>
                    </TouchableHighlight>
                  </View>
                )
              })
            }
          </View>
          </ScrollView>
       </View>
    )
  }
}
const color =StyleSheet.create({
 title:{
   paddingTop:10,
   paddingBottom:10,
   paddingLeft:16
 },
  tittleSize:{
    color:'#999',
    fontSize:Utils.normalize(14)
  }
})
export default SelectColor
