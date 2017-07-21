/**
* @Author: yanke
* @Date:   2016-09-12T17:53:09+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-15T12:31:37+08:00
*/

'use strict'

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
  StyleSheet,
  Image,
  TextInput,
  Text,
  Animated
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device,API, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card} from '../components';

class Suit extends Component{
  // 构造
    constructor(props) {
      var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
      super(props);
      // 初始状态
      this.state = {
        dataSource: ds.cloneWithRows(this.props.dataSource),
        cartId: '',
        backToTop:false,
      };
    }

    componentDidMount() {
      if(this.props.param.cartId!=''){
        Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
          (res)=>{
            this.setState({itemCount:res.common['item_count'],cartId:this.props.param.cartId})
          }
        );
      }
    }

    componentWillReceiveProps(next) {
      this.setState({dataSource:this.state.dataSource.cloneWithRows(next.dataSource),cartId:next.param.cartId});
    }

    _goDetail(item){
      Actions.suitDetail({data: item,id:this.props.param.cartId!=''?this.props.param.cartId:this.state.cartId});

    }
    _renderRow(msg,sectionID,rowId){
      if(msg!='Su'){
        return(
          <View>
            <TouchableOpacity onPress={()=>this._goDetail(msg,rowId)}>
              <View style={style_suit.renderView}>
                <View>
                  <Image source={(msg.image == undefined) ?{uri:API.url+'/pub/img/pd/pd_blank.jpg'}: {uri:(msg.image).substr(0, 1) == '/' ? API.url + msg.image : msg.image}}
                         style={style_suit.image} />
                </View>
                <View style={{borderBottomWidth:0.5,borderBottomColor:'#ccc',flex:1,flexDirection: 'row',paddingBottom:12}}>
                  <View style={{flex:1,flexDirection: 'column'}}>
                    <Text style={[style_suit.label,{fontSize: Utils.normalize(15)}]} >{msg.name}</Text>
                    <View style={[style_suit.label,{flexDirection: 'row'}]}>
                      <View style={{flexDirection: 'row',flex:3}}>
                        <Text style={[style_suit.grayColor,{fontSize:Utils.normalize(13)}]}>指导价:</Text>
                        <Text style={[style_suit.redColor,{paddingLeft:12,fontSize:Utils.normalize(13)}]}>¥ {Utils.oFixed(msg.price,2,true)}</Text>
                      </View>
                      <View style={{flexDirection: 'row',flex:2}}>
                        <Text style={[style_suit.grayColor]}>库存:</Text>
                        <Text style={[style_suit.redColor,{paddingLeft:12}]}>{msg.stock_num}</Text>
                      </View>
                    </View>
                    <View style={[style_suit.label,{flex:1}]}>
                      <Text style={{fontSize:Utils.normalize(13)}}>活动时间: {(msg.begin_time).slice(0,10)} -- {msg.end_time ? (msg.end_time).slice(0,10) : '不限'}</Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row',justifyContent:'flex-end',alignItems:'center',paddingRight:Utils.normalize(16)}}>
                    <Icon  color='#cccccc' name={ "ios-arrow-forward"} size={23} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
      }else{
        return(null)
      }
    }

    _onScroll() {
      if (this.refs._listView.scrollProperties.offset > Utils.height) {
        this.setState({backToTop: true});
      }else{
        this.setState({backToTop: false});
      }
    }

    render(){
      return(
        <View>
          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            style={[style_suit.listContainer,(Object.keys(this.state.dataSource._dataBlob.s1).length==1?{backgroundColor:'#EFEFEF'}:{})]}
            onScroll={this._onScroll.bind(this)}
            ref ='_listView'
            renderRow={(msg,sectionID,rowId)=>this._renderRow(msg,sectionID,rowId)}
            renderFooter={() => {
              let _result =
              this.props.foot ?
                (<View>
                   <View style={{height: 40,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa',paddingTop:10,paddingBottom:10}}>--没有更多商品了--</Text>
                     </View>
                </View>)
              :(null);
              return _result
              }}
            >
          </ListView>
          {this.state.backToTop ?
            <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={style_suit.backToTop}>
              <Image style={{width: 50, height: 50}} source={Assets.backToTop}/>
            </TouchableOpacity>
            : null}
        </View>
      )
    }
}

const style_suit = StyleSheet.create({
  backToTop: {
    position: 'absolute',
    right: 10,
    bottom: 60,
    width: Utils.normalize(52),
    height: Utils.normalize(52),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'transparent'
  },
  listContainer:{
    marginTop:Utils.normalize(36),
    flex:1,
    height:Utils.height-Utils.normalize(140),
    paddingLeft:Utils.normalize(8),
    backgroundColor:"#fff"
  },
  renderView:{
    flex:1,
    flexDirection: 'row',
    paddingTop:8,
  },
  label:{
    marginTop:Utils.normalize(10),
    marginLeft:Utils.normalize(12),
  },
  redColor:{
    color:'#f40b0b',
    fontSize:Utils.normalize(13),
  },
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
    marginBottom: 9
  },
  overlay:{
    position: 'absolute',
    top:Utils.andr21Normalize(104),
    bottom:0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: Utils.width,
    flex: 1,
  },
  grayColor:{
    color:'#999999',
    fontSize:Utils.normalize(14)
  },
  image: {
    width: 70,
    height: 55,
    marginTop: 15,
  }
});

export default Suit;
