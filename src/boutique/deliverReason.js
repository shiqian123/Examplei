
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
}from 'react-native'

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';


export default class diliverReason extends Component{
    constructor(props){
        super(props);
        this.state = {
            reason:this.props.reason,    //只是名字
        }
    }
    componentDidMount(){
      if(this.props.reason){
        this.setState({reason:this.props.reason})
      }else{
        this.setState({reason:this.props.loadData.nc_deliver_reason[0].nm})
      }
    }
    _reasonChosed(data) {
        this.setState({reason:data.nm})
        /*
            reason_flag 表示出库原因  执行成功
         */
        Actions.pop({refresh:{reason:data,reason_flag:0}})
    }


    _backToLock(){
        Actions.pop()
    }


    render(){
        return (
            <View style={styles.container}>
                <View>
                  <Header title="出库原因" leftPress={() => this._backToLock()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}}/>
                  {
                    this.props.loadData ?
                    this.props.loadData.nc_deliver_reason.map((item,key) => {
                      return (
                        <View key = {key}>
                          <TouchableOpacity onPress={() => this._reasonChosed(item)} style={localStyles.detailBox}>
                            <Text style={[localStyles.detailLeft, {color: '#000000'}]}>{item.nm}</Text>
                            {this.state.reason === item.nm ? <Icon style={localStyles.selectRight} name='md-checkmark' size={23} color="#387ff5" /> : null}
                          </TouchableOpacity>
                          {key + 1 >= this.props.loadData.nc_deliver_reason.length ? null : <View style={localStyles.itemInsetLineR}></View>}
                        </View>
                      )
                    })
                    :
                    <View style={{height: 30,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa'}}>--数据有误--</Text></View>
                  }
                </View>
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
        borderLeftWidth: 15,
        borderLeftColor: '#fff',
        backgroundColor: '#ccc',
      },
      selectRight:{
        position: 'absolute',
        right: Utils.normalize(15),
        top: Utils.normalize(20)
      }
    })
