/**
* @Author: MillerD
* @Date:   2016-11-17T17:34:22+08:00
* @Email:  zlw2579@gmail.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-18T18:03:53+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  ListView,
  Animated,
  Alert,
  TextInput,
  DatePickerIOS,
  DatePickerAndroid,
  Switch
} from 'react-native';

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import API from '../base/api';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import LoadIcon from '../components/Loading';

export default class wareList extends Component {
    constructor(props){
      super(props);
      var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {
          dataSource:dataSource,
          target_ware:props.select.target_ware,
          me_ware:props.me_ware,
      }
    }

    componentDidMount() {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.me_ware),
      });
    }

    _destinationChosed(rowData){
      this.setState({target_ware:rowData})
      /*
              ware_flag 表示选择仓库执行成功
       */
      Actions.pop({refresh:{ware:rowData,ware_flag:0}})

    }

    _renderRow(rowData, sectionID, rowId) {
      return (
        <View>
          <TouchableOpacity onPress={() => this._destinationChosed(rowData)}>
            <View style={localStyles.detailBox}>
              <Text style={localStyles.ware_list}>{rowData.nm}</Text>
              {this.state.target_ware['vl'] === rowData.vl ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
            </View>
          </TouchableOpacity>
          <View style={{backgroundColor: '#c8c7cc',height: 0.5, borderLeftWidth: 15,borderColor:'#fff'}}></View>
        </View>
      )
    }

    _renderSeparator(sectionID, rowId) {
      return (
        <View key={`${sectionID}-${rowId}`} style={{height: 0.5, width: Device.width}} />
      )
    }

    render(){
      return(
        <View style={styles.container}>
          <Header title="选择目标仓库" leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} leftPress={()=>Actions.pop()}/>
            <ListView style={{height: Utils.height - Utils.normalize(64),backgroundColor: '#fff'}}
              dataSource={this.state.dataSource}
              renderRow={this._renderRow.bind(this)}
              enableEmptySections={true}
              renderSeparator={this._renderSeparator.bind(this)}
            />
        </View>
      )
    }
}

const localStyles = StyleSheet.create({
  detailBox: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Utils.normalize(49.5),
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingLeft: 15
  },
  ware_list: {
    flex: 1,
    fontSize: Utils.normalize(16),
    fontWeight: '400',
    color: '#000000',
  },
})
