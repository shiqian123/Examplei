/**
* @Author: shiqian
* @Date:   2016-10-08T13:05:06+08:00
* @Email:  15611555640@163.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T12:47:53+08:00
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
    TextInput,
    StyleSheet,
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'
import Storage from 'react-native-storage'

let timer = null;

class searchCustomer extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data,
      customerData: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      serachNum: false,
      searchClean: false
    }
  }
  componentDidMount() {

  }
  _changeStatus(customer){
    this.state.data = customer;
    setTimeout( ()=> {
        Actions.pop({refresh: {data: this.state.data}})
    },0)
  }
  _renderRow(row, sectionId, rowId) {
    return (
      <TouchableHighlight underlayColor={'#f2f2f2'} style={{backgroundColor: '#fff'}} onPress={()=>this._changeStatus(row)}>
        <View style={styles_search.textTr}>
          <View style={styles_search.headTd}><Text style={styles_search.textTd}>{row.customer.name}</Text></View>
          <View style={styles_search.headTd}><Text style={styles_search.textTd}>{row.comon.id}</Text></View>
          <View style={styles_search.headTdBig}><Text style={styles_search.textTd}>{row.comon.vin}</Text></View>
        </View>
      </TouchableHighlight>
    );
    if(!row.comon) return(<View></View>);
  }
  _change (text){
    if(text != '' && text != null && text != undefined) {
      this.setState({searchClean:true})
      clearTimeout(timer);
      timer = setTimeout( () => {
        this._serach(text);
      },500);
    } else {
      clearTimeout(timer);
      timer = setTimeout( () => {
        this.setState({searchClean:false,serachNum:false,customerData:this.state.customerData.cloneWithRows([])})
      },600);
    }
  }
  _serach(text) {
    Utils.fetch( Utils.api.querybill, 'post', {qkey: text} )
    .then((res)=> {
      this.setState({customerData: this.state.customerData.cloneWithRows(res) ,serachNum: res.length})
    })
  }
  _cleanInput() {
    this.refs.searchInput.clear()
    this._change('')
  }

  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="创建购物车" />
        <View>
          <View style={{height:28,justifyContent:'center',paddingLeft:15}}>
            <Text style={{fontSize:Utils.normalize(13),color:'#999',marginTop:5}}>搜索主销售单</Text>
          </View>
          <View style={{backgroundColor:'#fff',borderRadius:3,flex:1, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
            <TextInput style={[styles.msgSerach,{marginBottom:0}]}
              ref="searchInput"
              autoCapitalize='none'
              autoCorrect={false}
              placeholder='以客户全名,手机号,单据编号或VIN号搜索'
              placeholderTextColor="#999999"
              onChangeText={this._change.bind(this)}
            />
            <Icon name='ios-search' size={20} color='#999999' style={[styles.serachIcon]} />
          </View>
          {this.state.searchClean ? <Icon onPress={()=> this._cleanInput()} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{marginTop:36,paddingRight:8}]} /> : <View></View> }
          {
            !this.state.searchClean ?
            <View style={{height:1,backgroundColor:'#ccc',marginTop:7}}></View>
            : null
          }
          { this.state.serachNum === 0 ?
            (
              this.state.searchClean ?
              <View style={styles.md_itemTitleBox}>
                <Text style={styles.md_itemTitle}>未搜索到该客户</Text>
              </View>
              : null
            )
            :
            (
              this.state.serachNum === false ?
              null
              :
              <View>
                <View style={styles.md_itemTitleBox}>
                  <Text style={styles.md_itemTitle}>共搜索到<Text style={{color:'#fa4040'}}>{this.state.serachNum}</Text>条信息</Text>
                </View>
                <View style={styles_search.head}>
                  <View style={styles_search.headTd}><Text style={styles_search.textTd}>客户</Text></View>
                  <View style={styles_search.headTd}><Text style={styles_search.textTd}>单据编号</Text></View>
                  <View style={styles_search.headTdBig}><Text style={styles_search.textTd}>车架号</Text></View>
                </View>
                <ListView style={styles_search.listView} dataSource={this.state.customerData} renderRow={this._renderRow.bind(this)} />
              </View>
            )
          }
        </View>
      </View>
    )
  }
}

const styles_search = StyleSheet.create({
  head: {
    height: 36,
    backgroundColor: '#f1f7fc',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  textTr: {
    height: 54,
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor:'#ccc',
  },
  headTd: {
    flex: 2,
    alignItems: 'center',
  },
  headTdBig: {
    flex: 3,
    alignItems: 'center',
  },
  textTd: {
    fontSize: Utils.normalize(14),
    color: '#333',
  },
  listView: {
    height: Utils.height - Utils.normalize(191),
  }
})

export default searchCustomer;
