/**
* @Author: meteor
* @Date:   2016-08-15T18:40:37+08:00
* @Last modified by:   yanke
* @Last modified time: 2016-10-18T12:02:59+08:00
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

let timer = null;
let flag = 0;

class ChangeCustomer extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data,
      customerData: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      saleType:  new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      serachNum: true
    }
  }
  componentDidMount() {
    Utils.fetch( Utils.api.load, 'post', {keys: 'cart_type'})
    .then( (res)=> {
      this.setState({ saleType : this.state.saleType.cloneWithRows(res.cart_type) })
    })

    storage.load({key : 'User'})
    .then( (res)=> {
      this.setState({shop_id : res.shop_id})
    })
  }
  _changeStatus(customer){
    this.state.data.customer = customer;
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
  _renderRow(row, sectionId, rowId) {
    if(!row) return(<View></View>);
    return (
      <TouchableHighlight underlayColor={'#f2f2f2'} style={{backgroundColor: '#fff'}} onPress={()=>this._changeStatus(row)}>
        <View style={[styles.fullSonButtonGroup,{marginLeft: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', borderBottomWidth: rowId == this.state.serachNum - 1 ? 0 : 0.5 }]}>
          <Text style={{flex:1}}> {row.customer_name}</Text>
          <Text style={{flex:2}}>{row.customer_tel}</Text>
        </View>
      </TouchableHighlight>
    );
  }
  _change (text){
    text = text.trim();
    if(text != '') {
      this.setState({searchClean:true})
      clearTimeout(timer);
      timer = setTimeout( () => {
        this._serach(text);
      },500);
    } else {
      clearTimeout(timer);
      this.setState({searchClean:false, customerData: this.state.customerData.cloneWithRows([]), serachNum: true});
    }
    //this._changeFun(this.state.cartStage,text);

  }
  _serach(text) {
    Utils.fetch( Utils.api.cartcust, 'post', {key: text, max: 30, shop_id: this.state.shop_id} )
    .then((res)=> {
      this.setState({customerData: this.state.customerData.cloneWithRows(res) ,serachNum: res.length })
    })
  }
  _cleanInput() {
    this.refs.searchInput.clear()
    this._change('')
  }
  _addCustomer() {
    Actions.addCustomer({data: this.state.data})
  }
  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="搜索客户" rightTitle="增加" rightPress={this._addCustomer.bind(this)}/>
        <View>
          <View style={{backgroundColor:'#fff',borderRadius:3, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
            <TextInput style={styles.msgSerach}
              ref="searchInput"
              autoCapitalize='none'
              autoCorrect={false}
              placeholder="以客户全名、手机号搜索"
              placeholderTextColor="#999999"
              onChangeText={this._change.bind(this)}
            />
            <Icon name='ios-search' size={20} color='#999999' style={[styles.serachIcon]} />
            {this.state.searchClean ? <Icon onPress={()=> this._cleanInput()} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon]} /> : <View></View> }
          </View>

          { ! this.state.serachNum > 0 ?
            <View style={styles.md_itemTitleBox}>
              <Text style={styles.md_itemTitle}>未搜索到该客户</Text>
            </View>
            :
            <ScrollView>
              <ListView dataSource={this.state.customerData}  renderRow={this._renderRow.bind(this)} enableEmptySections={true}/>
            </ScrollView>
          }
        </View>
      </View>
    )
  }
}

export default ChangeCustomer;
