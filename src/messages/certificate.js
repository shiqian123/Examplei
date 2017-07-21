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

class Certificate extends Component{
  constructor(props){
    super()
    this.state = {
      cust: props.cust,
      custUi: props.custUi,
      cust_ptype: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    }
  }
  componentDidMount() {
    Utils.fetch( Utils.api.load, 'post', {keys: 'cust_ptype'})
    .then( (res)=> {
      this.setState({ cust_ptype : this.state.cust_ptype.cloneWithRows(res.cust_ptype) })

    })
  }
  _changeStatus(item){
    this.state.cust.ptype = item.vl;
    this.state.custUi.ptype = item.nm;
    setTimeout( ()=> {
        Actions.pop({refresh: {cust: this.state.cust, custUi: this.state.custUi}})
    },0)
  }
  _renderRow(row) {
    return (
      <TouchableHighlight underlayColor={'#f2f2f2'} onPress={()=>this._changeStatus(row)}>
        <View style={[styles.fullSonButtonGroup,{marginLeft:0}]}>
          <Text style={[styles.fullSonButtonText, {marginLeft: 20}]}> {row.nm}</Text>
          {row.vl == this.state.cust.ptype ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null}
        </View>
      </TouchableHighlight>

    );
  }
  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={ () => { Actions.pop() } } leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="证件类别" rightTitle="取消" rightPress={this._changeStatus.bind(this,{vl:'',nm:''})}/>
        <View>
          <ListView dataSource={this.state.cust_ptype} renderRow={this._renderRow.bind(this)} />
        </View>
      </View>
    )
  }
}

export default Certificate;
