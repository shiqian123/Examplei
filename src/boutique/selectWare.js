
'use strict'

import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    TextInput,
    Alert,
    ScrollView
}from 'react-native'

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';

let data = [];

export default class diliverReason extends Component{
    constructor(props){
        super(props);
        this.state = {
          toware:'',
          toshop:'',
          wareData:[],
          shop_name:'',
          ware_name:'',
        }
    }
    componentDidMount(){
      // this.props.loadData
      // 仓库数据默认是第一个
      if(this.props.loadData.shopw && this.props.loadData.shopw.length > 0){
        this.setState({wareData:this.props.loadData.shopw[0].wares,toshop:this.props.loadData.shopw[0],shop_name:this.props.loadData.shopw[0].name,});
        this.props.loadData.shopw[0].wares && this.props.loadData.shopw[0].wares.length > 0 ? this.setState({toware:this.props.loadData.shopw[0].wares[0],ware_name:this.props.loadData.shopw[0].wares[0].name}) : null
      }
      if(this.props.shop_name && this.props.ware_name){
        this.setState({shop_name:this.props.shop_name})
        for (let i = 0; i < this.props.loadData.shopw.length; i++) {
          if (this.props.loadData.shopw[i].name === this.props.shop_name){
            this.setState({wareData:this.props.loadData.shopw[i].wares,toware:this.props.loadData.shopw[i].wares[0],ware_name:this.props.loadData.shopw[i].wares[0].name})
          }
        }
      }

    }
    _backToLock(){
          Actions.pop({refresh:{toshop:this.state.toshop,toware:this.state.toware,ware_flag:0,}})
    }
    _shopChosed(data){
      this.setState({toshop:data,shop_name:data.name});
      for (let i = 0; i < this.props.loadData.shopw.length; i++) {
        if (this.props.loadData.shopw[i].id === data.id){
          this.props.loadData.shopw[i].wares ?
          this.setState({wareData:this.props.loadData.shopw[i].wares,toware:this.props.loadData.shopw[i].wares[0],ware_name:this.props.loadData.shopw[i].wares[0].name})
          :
          this.setState({wareData:this.props.loadData.shopw[i].wares,toware:'',ware_name:''})
        }
      }
    }

    _wareChosed(data){
      this.setState({toware:data,ware_name:data.name})
    }

    render(){
        return (
            <View style={styles.container}>
                  <Header title="目标仓库" leftPress={() => this._backToLock()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}}/>
                  <ScrollView>
                  <View style={localStyles.label}>
                      <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>目标4s店</Text>
                  </View>
                  {
                    this.props.loadData ?
                    this.props.loadData.shopw.map((item,key) => {
                      return (
                        <View key = {key}>
                        { item.shop_type === this.props.loadData.me_info.shop_type ?
                          <View>
                          <TouchableOpacity onPress={() => this._shopChosed(item)} style={localStyles.detailBox}>
                            <Text style={[localStyles.detailLeft, {color: '#000000'}]}>{item.name}</Text>
                            {this.state.shop_name === item.name ? <Icon style={localStyles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                          </TouchableOpacity>
                          {key + 1 >= this.props.loadData.shopw.length ? null : <View style={localStyles.itemInsetLineR}></View>}
                          </View>
                          : null
                        }
                        </View>
                      )
                    })
                    :
                    <View style={{height: 30,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa'}}>--没有数据--</Text></View>
                  }
                  <View style={localStyles.label}>
                      <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>目标仓库</Text>
                  </View>
                  {
                    this.state.wareData ?
                    this.state.wareData.map((item,key) => {
                      return (
                        <View key = {key}>
                          <TouchableOpacity onPress={() => this._wareChosed(item)} style={localStyles.detailBox}>
                            <Text style={[localStyles.detailLeft, {color: '#000000'}]}>{item.name}</Text>
                            {this.state.ware_name === item.name ? <Icon style={localStyles.selectRight} name='md-checkmark' size={23} color="#387ff5" /> : null}
                          </TouchableOpacity>
                          {key + 1 >= (this.state.wareData).length ? null : <View style={localStyles.itemInsetLineR}></View>}
                        </View>
                      )
                    })
                    :
                    <View style={{height: 30,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa'}}>--没有数据--</Text></View>
                  }
                  </ScrollView>
                </View>

        )
    }
}

const localStyles = StyleSheet.create({
  detailLeft: {
    flex: 1,
    color: '#000000',
    fontSize: Utils.normalize(16),
    fontWeight: '400',
  },
  detailBox: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Utils.normalize(49.5),
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingLeft: 15
  },
  itemInsetLineR:{
    height: 0.5,
    borderLeftWidth: Utils.normalize(15),
    borderLeftColor: '#fff',
    backgroundColor: '#ccc',
  },
  label:{
      width:Utils.width,
      height:Utils.normalize(34),
      justifyContent:'center',
      paddingLeft:Utils.normalize(10),
      backgroundColor:'#efefef'
  },
  selectRight:{
    position: 'absolute',
    right: Utils.normalize(15),
    top: Utils.normalize(20)
  },
})
