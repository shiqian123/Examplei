
'use strict'

import React, { Component } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  Image,
  StatusBar,
  StyleSheet,
  Alert,
  Animated,
  ScrollView
} from 'react-native';

import styles from '../common/styles';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import lodash from 'lodash';
import {Utils, Device, Assets} from "../base";
import {Header, Loading, Button, Developing, Tip,Box} from '../components';
let isComp = '';
export default class bouChangeName extends Component{
  constructor(props){
    super(props);
    this.state = {
       isClick:false,
       data:'',
       show:false,
       wareLevel3:false
    }
  }
  componentWillMount(){
      this.setState({wareLevel3:this.props.wareLevel3,data:this.props.data});
  }
  componentDidMount(){
    if(!(this.props.ops instanceof Array)){
      if((this.props.ops.change||this.props.ops.deliver)&&this.props.data.ops){
        this.setState({isClick:true})
        // return
      }else{
        this.setState({isClick:false})
      }
    }
  }
  componentWillReceiveProps(nextProps){
    this.setState({data:nextProps.data});
    if(nextProps.data.comp_id==1){
      isComp = '·自采'
    }
    if(nextProps.data.comp_id!=undefined&&nextProps.data.comp_id!=1){
        isComp = '·精品公司'
    }
  }
  componentWillUnmount(){
    isComp = ''
  }
  _change(){
    if(!this.state.isClick){return}
    Actions.changeBoutique({data:this.state.data,wareLevel3:this.state.wareLevel3,ops:this.props.ops})
  }
  _searchClean(){
  }
  _sellBoutique(){
    if(!this.state.isClick){return}  //非本公司，不可进行出库操作
    Actions.deliverStorage({data:this.props.data,loadData:this.props.loadData})
  }
  _DetailBack(){
      Actions.pop({refresh:{}});
  }
  render(){
    let data = this.state.data;
    if(data.comp_id==1){
      isComp = '·自采'
    }
    if(data.comp_id!=undefined&&data.comp_id!=1){
        isComp = '·精品公司'
    }
    return (
    <View style={styles.container}>
      <Header leftPress={() => this._DetailBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}} title="精品详情"/>
      <ScrollView style={box.box}>
        <Box left='名称' right={data.product_name}/>
        <Box left='品牌' right={data.brand}/>
        <Box left='是否原装' right={data.is_origin==1?'原装'+isComp:'非原装'+isComp}/>
        <Box left='供应商' right={data.supplier_name}/>
        <Box left='产品细分' right={data.param_value}/>
        {this.props.ops.cost==1?  <Box left='单件成本' right={'￥'+Utils.oFixed(data.cost,2,true)}/>:null}
        <Box left='数量' right={(String(data.num)+data.unit)}  style={box.box}/>
        {this.props.ops.cost==1?<Box left='总成本' right={'￥'+Utils.oFixed(data.cost*data.num,2,true)}/>:null}
        <Box left='总在库天数' right={data.inwar_time}/>
        <Box left='入库时间' right={data.entertime}/>
        <Box left='仓库' right={data.warehouse_name}/>
        <Box left='类别' right={data.big_class}/>
        <Box left='批次号' right={data.vin}/>
        <Box left='库位' right={data.productport}/>
        <Box left='备注' right={data.des}/>
      </ScrollView>
      {
        this.state.wareLevel3 &&(this.props.data.now_shop_id == this.props.data.shop_id) ?
        <View style={{flexDirection:'row',backgroundColor:'#fff',  borderTopWidth:1,borderTopColor:'#ccc',}}>
          <Button value="变更" pattern={{outLine:"changeButtom",text:(this.state.isClick)?"changeText":"unclickText"}} onPress={() => this._change()} />
          <Button value="出库" pattern={{outLine:"changeButtom",text:(this.state.isClick)?"changeText":"unclickText"}} onPress={() => this._sellBoutique()} />
          <View style={{width:Device.iOS?0.5:1,height:Utils.normalize(18),backgroundColor:'#999',position:'absolute',top:Device.iOS ? Utils.normalize(16) : Utils.normalize(19),left:Utils.width/2}}>
          </View>
        </View>
        : null
      }

      {this.state.show ? <Tip name={this.state.alert} /> : <View></View>}
    </View>
    )
  }
}
const box = StyleSheet.create({
  box:{
    backgroundColor:'#fff',
  }
})
