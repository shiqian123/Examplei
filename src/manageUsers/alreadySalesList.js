/**
 * Created by shiqian on 16/12/29.
 */
'use strict'

import React, { Component } from 'react';
import {
    Alert,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicator,
    ScrollView,
    ListView,
    RefreshControl,
    Modal,
    View,
    Image,
    StatusBar,
    Text,
    Animated,
    TextInput,
    StyleSheet,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import {Utils, Assets, Device,_} from "../base";
import lodash from 'lodash';
import {Header, Loading, Button, Developing, Tip,SearchTitle} from '../components';

export default class AlreadySalesList  extends Component{
  constructor(props){
    super(props)
    let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state={
       dataSource,
       sales:[],
       _salesArr:[]
    }
  }
  componentDidMount(){
    this._onRefresh()
  }
  componentWillReceiveProps(nextPage){
   this.setState({dataSource:this.state.dataSource.cloneWithRows(nextPage.sales),sales:nextPage.sales,_salesArr:[]})
  }
  _onRefresh(listPage){
   this.setState({dataSource:this.state.dataSource.cloneWithRows(this.props.sales),sales:this.props.sales})
  }
  delete(rowData){
    let a = _.cloneDeep(  this.state.sales);
    for (var i = 0; i <   a.length; i++) {
      if(rowData.id == a[i].id){
        a.splice(i,1);
        this.setState({dataSource:this.state.dataSource.cloneWithRows(a),sales:a,_salesArr:a})
        return
      }
    }
  }
  addSales(){
    if(this.props.canEdit){
      Actions.addSales({sales:this.state._salesArr.length==0?this.state.sales:this.state._salesArr})
    }
  }
  _goBack(){
    Actions.pop({refresh:{sales:this.state._salesArr.length==0?this.state.sales:this.state._salesArr}})
  }
  _renderRow(rowData,selec,rowID){
    return(
      <View  underlayColor={'#f2f2f2'}  style={{backgroundColor:'#fff'}}>
          <View style={[styles.fullSonButtonGroup,{marginLeft: 16}]}>
            <View style={{flexDirection:'row'}}>
                <Text style={{width:Utils.width*0.3}}> {rowData.name}
                </Text>
                <Text style={[styles.fullSonButtonText,{width:Utils.width*0.55}]}> {rowData.org_name}
                </Text>
                {this.props.canEdit?
                  <TouchableOpacity style={{width:Utils.width*0.15}} onPress={()=>this.delete(rowData)}>
                     <Icon name='ios-trash-outline' size={24} color="#ccc"></Icon>
                  </TouchableOpacity>:
                  null}

            </View>
          </View>
      </View>
    )
  }
  render(){
   return(
     <View style={styles.container}>
       <Header rightTitle={this.props.canEdit?"添加":''} rightPress={()=>this.addSales()} leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="所属销售顾问"/>
       <ListView
         ref="_listView"
         scrollEnabled={this.state.scrollEnabled}
         style={{height:Device.height,backgroundColor:'#fff'}}
         dataSource={this.state.dataSource}
         renderRow={(rowData, sectionID, rowID)=>this._renderRow(rowData, sectionID, rowID)}
         enableEmptySections = {true}
         removeClippedSubviews={true}
         scrollEventThrottle={0}
         pageSize={20}
         renderFooter={()=>{
           return(
           <View>
             {(this.state.dataSource._dataBlob!=null&&this.state.dataSource._dataBlob.s1.length==0)?
               <View style={{height: 30,justifyContent: 'center'}}>
                 <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多客户--</Text></View>
               : <View></View>
             }
           </View>
           )
         }}
       />
     </View>

   )
  }
}
