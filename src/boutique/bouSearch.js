
'use strict'

import React, { Component } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  Image,
  StatusBar,
  StyleSheet,
  Alert,
  Animated
} from 'react-native';

import styles from '../common/styles';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import lodash from 'lodash';
import {Utils, Device, Assets,API} from "../base";
import {Header, Loading, Button, Developing, Tip} from '../components';

let timer,
page = 1;
export default class bouSearch extends Component{
  constructor(props){
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) =>r1 !== r2})
    super(props);
    this.state = {
     dataSource: dataSource,
     isLoading:false,
     noData:false,
     searchClean:false,
     resData:{},
     backToTop:false,
    }
  }
  componentDidMount(){
    page = 1;
  }
  componentWillReceiveProps(nextProps){
     this._onRefresh(this.state.nm)
  }
  _change(text){
    if(text==null||text==''){
      clearTimeout(timer);
      this.setState({searchClean:false})
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows([]),noData:false,resData:{},
      });
      return
    }else {
      this.setState({searchClean:true,nm:text})
      clearTimeout(timer);
      timer = setTimeout(() => {
        page = 1;
        this._onRefresh(text)
      },500)
    }
  }
  _onRefresh(text){
    let params = this.props.searchParams;
    params.nm = text;
    params.page = page;
    this.setState({isLoading:true})
    Utils.fetch(API.queryBoutique, 'post', params)
      .then((res) => {
        this.setState({isLoading:false})
        if(res.list.length>0){
          let tempData = res.list,
            tempResData = res,
            tempList;
          //是否是分页
          if(page > 1){
            tempList = lodash.cloneDeep(this.state.resData.list),
            tempResData = lodash.cloneDeep(this.state.resData);
            tempData = tempList.concat(res.list);
            tempResData.list = tempData;
          }
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(tempData),noData:false,resData:tempResData,
          });
        }else{
          this.setState({
            noData:true,
            dataSource: this.state.dataSource.cloneWithRows([]),resData:{}
          });
        }
      });
  }
  //底部
  _onScroll(event) {
    if(this.state.isLoading) return false;
    let contentLength = this.refs._listView.scrollProperties.visibleLength > this.refs._listView.scrollProperties.contentLength ? this.refs._listView.scrollProperties.visibleLength : this.refs._listView.scrollProperties.contentLength
    if (this.refs._listView.scrollProperties.offset + this.refs._listView.scrollProperties.visibleLength >= contentLength ){
      this.scrollEndReached();
    }
    if (this.refs._listView.scrollProperties.offset > Utils.height) {
      this.setState({backToTop: true});
    }else{
      this.setState({backToTop: false});
    }
  }
  scrollEndReached() {
    if(this.state.resData && (this.state.resData.list).length >= this.state.resData.count) return;
    page ++;
    this._onRefresh(this.state.nm);
  }
  _searchClean(){
    this.refs._searchInput.clear();
    this._change('');
  }
  _goBack(rowData){
    rowData.shop_id = this.props.loadData.shop_id
    rowData.now_shop_id = this.props.loadData.now_shop_id
    Actions.boutiqueStockDetail({data:rowData,ops:this.props.ops,loadData:this.props.loadData,wareLevel3:this.props.wareLevel3})
  }
  _renderRow(rowData, sectionID, rowID){
    let isComp=''
    if(rowData.comp_id==1){
      isComp = '·自采'
    }
    if(rowData.comp_id!=undefined&&rowData.comp_id!=1){
        isComp = '·精品公司'
    }
    return(
      <View style={{flex:1}}>
        <TouchableHighlight style={{backgroundColor:'#ffffff',}} underlayColor="#f5f5f5" onPress = {()=>this._goBack(rowData)} onLongPress={this.props.longPress}>
          <View style = {{paddingLeft:Utils.normalize(15),height: Utils.normalize(115),overflow:'hidden'}}>
            <View style={{flex:1,marginTop:Utils.normalize(12),marginBottom:Utils.normalize(12),flexDirection:'row'}}>
              <Text style = {{fontSize:Utils.normalize(15),color:'#000000'}}>
                {rowData.product_name}
              </Text>
              {rowData.des ? <View style={{marginLeft:5,marginTop:1}}><Image style={{width:17,height:17}} source={Assets.reserve} /></View> : null}
            </View>
            <View style={{flex:1}}>
              <Text style = {styles_bou.font333}>
                {rowData.is_origin === "0" ? "非原装"+isComp : "原装"+isComp}
              </Text>
            </View>
            <View style={{flex:1,marginTop:Utils.normalize(4),flexDirection:'row'}}>
              <Text style={[styles_bou.font333,{flex:1}]}>
                品牌:  {rowData.brand}
              </Text>
              <Text style={[styles_bou.font333,{flex:1}]}>
                数量:  {rowData.num}{rowData.unit}
              </Text>
            </View>
            <View style={{flex:1,marginTop:Utils.normalize(4),marginBottom:Utils.normalize(10),flexDirection:'row'}}>
              <Text style={[styles_bou.font333,{flex:1}]} numberOfLines={1}>
                供应商:  {rowData.supplier_name}
              </Text>
              <Text style={[styles_bou.font333,{flex:1}]}>
                仓库:  {rowData.warehouse_name}
              </Text>
            </View>
            <View style={{width: 30, alignItems: 'center', justifyContent: 'center',position:'absolute',top:45,right:15}}>
              <Icon style={{color: '#ccc', backgroundColor: 'transparent'}} color='#cccccc' name='ios-arrow-forward' size={23}/>
            </View>
          </View>
        </TouchableHighlight>
        <View style={{backgroundColor: '#ccc',height: 0.5, borderLeftWidth: 15,borderColor:'#fff'}}></View>
      </View>
    )
  }
  render(){
    return (
      <View style={styles.container}>
        <View>
          <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" />
          <View style={[styles.navbar, {justifyContent: 'flex-start'}]}>
            <View style={{backgroundColor:'#fff',borderRadius:3,flex:1, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
              <TextInput style={[styles.msgSerach, {flex: 1, marginLeft: 0}]}
                ref="_searchInput"
                autoCapitalize='none'
                numberOfLines={1}
                autoCorrect={false}
                placeholder="以精品，供应商名称搜索"
                placeholderTextColor="#999999"
                onChangeText={this._change.bind(this)}
                underlineColorAndroid="transparent"
              />
              <Icon name='ios-search' size={20} color='#999999' style={styles.serachIcon} />
              {this.state.searchClean ? <Icon style={{position: 'absolute',top: 5, right: 8, backgroundColor: 'transparent'}} name='ios-close-circle' size={18} color='#999999' onPress={() => this._searchClean(this)} /> : null}
              </View>
              <Text style={{color: 'white', width: 30}} onPress={() => Actions.pop({refresh:{}})}>取消</Text>
          </View>
          {this.state.noData?
            <View style={styles_bou.label}>
              <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>未搜索到精品</Text>
            </View>:
            null
          }
          {this.state.resData.list ?

          <ListView style={{height:Device.height-64}}
          renderRow={this._renderRow.bind(this)}
          ref="_listView"
          dataSource={this.state.dataSource}
          onScroll={() => this._onScroll()}
          enableEmptySections={true}
          onEndReachedThreshold={0}
          removeClippedSuviews={true}
          scrollEventThrottle={0}
          pageSize={20}
          renderFooter={()=>{
            return(
            <View>
              {(this.state.resData.list ? (this.state.resData.list).length  : 0 )>= (this.state.resData.count ? this.state.resData.count : 1) ?
                <View style={{height: 30,justifyContent: 'center'}}>
                  <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多精品了--</Text></View>
                : <View></View>
              }
            </View>
            )
          }}
          >
          </ListView>
          : null
          }
        </View>
        {
          //返回顶部按钮
        }
        {this.state.backToTop ?
          <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={styles_bou.backToTop}>
          <Image style={{width: Utils.normalize(50), height: Utils.normalize(50)}} source={Assets.backToTop}/>
          </TouchableOpacity>
        : null}
          {this.state.isLoading ?<Loading/> : <View></View>}
      </View>
    )
  }

}
const styles_bou = StyleSheet.create({
  item:{
    flex:1,
    flexDirection:"row",
    backgroundColor:'#ffffff',
    paddingTop:Utils.normalize(12),
    paddingLeft:Utils.normalize(12),
  },
  label:{
      width:Utils.width,
      height:Utils.normalize(34),
      justifyContent:'center',
      paddingLeft:Utils.normalize(10),
      backgroundColor:'#efefef'
  },
  font333:{
    fontSize:Utils.normalize(13),
    color:'#333333'
  },
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
  }
})
