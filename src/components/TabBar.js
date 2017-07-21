/**
* @Author: shiqian
* @Date:   2016-09-29T10:44:01+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-09-29T13:56:01+08:00
*/

/**
 * Created by shiqian on 16/8/18.
 */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  ListView,
  RefreshControl,
  Modal,
  View,
  Image,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";

class  TabBar extends  Component{
  // 构造
    constructor(props) {
      var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
      super(props);
      // 初始状态
      this.state = {
        dataSource:ds.cloneWithRows(this.props.dataSource),
        active:this.props.active

      };
    }

  componentDidMount() {
  }
  static propTypes = {
    data:React.PropTypes.array,
    barPress:React.PropTypes.func,
  };

  static defaultProps = {
    active:0
  };
  checkStatus(msg,rowId){
    var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
    this.setState({active:rowId,dataSource:ds.cloneWithRows(this.props.dataSource)});
    this.props.checkClick(rowId)
  }
  _renderRow(msg,sectionID,rowId){
    return(

      <TouchableOpacity style={styles_tab.tabbarCard} onPress={()=>this.checkStatus(msg,rowId)}>
        <View  style={[styles_tab.rowView,(rowId==this.state.active)?{borderBottomWidth:2,borderBottomColor:'#387ff5'}:{}]}>
          <Text style={[(rowId==this.state.active)?{color: '#387ff5'}:{},{fontSize:Utils.normalize(15)}]}>{msg}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  render(){
    return(
      <View style={styles_tab.container}>
        <ListView horizontal={true} style={styles_tab.tabbar} dataSource={this.state.dataSource} showsHorizontalScrollIndicator={false} enableEmptySections={true}
                  renderRow={(msg,sectionID,rowId)=>this._renderRow(msg,sectionID,rowId)}>
        </ListView>
      </View>

    )
  }
}
const styles_tab = StyleSheet.create({

  "rowView":{
    height:Device.iOS?Utils.normalize(44):Utils.normalize(42),
    paddingTop:14,
    paddingLeft:16,
    paddingRight:16,

  },
  "container":{
    height:Utils.normalize(44),
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
  },
  "tabbar":{
    height:Utils.normalize(44),
    flex:1,
    backgroundColor:'#FFF',
    paddingLeft:8,

  },
  "tabbarcard":{
    height:Utils.normalize(44),
    flex:1
  }
})

export default TabBar;
