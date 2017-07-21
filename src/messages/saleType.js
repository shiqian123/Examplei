/**
* @Author: yanke
* @Date:   2016-08-15T17:46:13+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   yanke
* @Last modified time: 2016-10-09T11:27:05+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    Linking,
    TextInput
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'
import Storage from 'react-native-storage'

let flag = 0;

class SaleType extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data,
      saleType: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    }
  }
  componentDidMount() {
    Utils.fetch( Utils.api.load, 'post', {keys: 'cart_type'})
    .then( (res)=> {
      this.setState({ saleType : this.state.saleType.cloneWithRows(res.cart_type) })

    })
  }
  _changeStatus(nm){
    this.state.data.common.sale_type = nm;
    setTimeout( ()=> {
      if(flag == 0){
        Actions.pop({refresh: {data: this.state.data}})
        flag = 1;
        setTimeout(() => {
          flag = 0;
        },250)
      }
    },0)
  }
  _renderRow(row) {
    return (
      <TouchableHighlight underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(row.nm)}>
        <View style={[styles.fullSonButtonGroup,{marginLeft:0}]}>
          <Text style={[styles.fullSonButtonText, {marginLeft: 20}]}> {row.nm}</Text>
          {this.state.data.common.sale_type === row.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
        </View>
      </TouchableHighlight>

    );
  }
  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={ () => { Actions.pop({refresh: {message: 'nii'}}) } } leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="销售渠道"/>
        <View>
          <ListView dataSource={this.state.saleType} renderRow={this._renderRow.bind(this)} />
        </View>
      </View>
    )
  }
}

export default SaleType;
