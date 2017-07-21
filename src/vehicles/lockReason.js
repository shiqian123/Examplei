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


export default class LockReason extends Component{
    constructor(props){
        super(props);
        this.state = {
            reason:props.reason,
        }
    }

    _reasonChosed(index) {
        this.setState({reason:index})
        /*
            reason_flag 表示锁定原因  执行成功
         */
        Actions.pop({refresh:{reason:index,reason_flag:0}})
    }


    _backToLock(){
        Actions.pop()
    }


    render(){
        return (
            <View style={styles.container}>
                <View>
                  <Header title="锁定原因" leftPress={() => this._backToLock()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
                  <TouchableOpacity onPress={() => this._reasonChosed(0)} style={localStyles.detailBox}>
                    <Text style={[localStyles.detailLeft, {color: '#000000'}]}>销售锁定</Text>
                    {this.state.reason === 0 ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                  </TouchableOpacity>
                  <View style={localStyles.itemInsetLineR}></View>

                  <TouchableOpacity onPress={() => this._reasonChosed(1)} style={localStyles.detailBox}>
                    <Text style={[localStyles.detailLeft, {color: '#000000'}]}>维修锁定</Text>
                    {this.state.reason === 1 ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                  </TouchableOpacity>
                  <View style={localStyles.itemInsetLineR}></View>

                  <TouchableOpacity onPress={() => this._reasonChosed(2)} style={localStyles.detailBox}>
                    <Text style={[localStyles.detailLeft, {color: '#000000'}]}>其他</Text>
                    {this.state.reason === 2 ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
                  </TouchableOpacity>
                </View>
            </View>

        )
    }
}
    const localStyles = StyleSheet.create({
      detailLeft: {
        flex: 1,
        color: '#000000',
        fontSize: Utils.normalize(14),
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
    })
