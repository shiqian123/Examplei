
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
  page =1;

export default class bouChangeName extends Component{
  constructor(props){
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) =>r1 !== r2})
    super(props);
    this.state = {
     dataSource: dataSource,
     data:'',
     noData:false,
     searchClean:false,
     isLoading:false,
     resData:{},
     backToTop:false,
    }
  }
  _change(text){
     if(text==null||text==''){
       clearTimeout(timer);
       this.setState({
        dataSource: this.state.dataSource.cloneWithRows([]),
        resData:{},
        searchClean:false,
        noData:false,
       })
       return
     }else{
       this.setState({searchClean:true,nm:text})
       clearTimeout(timer);
       timer = setTimeout(() => {
         page = 1;
         this._onRefresh(text);
       },500)
     }

  }
  _onRefresh(text){
    let params ={
      key:text,
      page:page,
      size:30,
      shop_id:this.state.data.shop_id,
      cate:2,
      sc_stock:true
    };
   this.setState({
     isLoading:true,
     searchClean:true
   })
    Utils.fetch(Utils.api.queryCates, 'post', params)
      .then((res) => {
        if(res.list!=null){
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
            noData:false,resData:tempResData,
            isLoading:false,
            dataSource: this.state.dataSource.cloneWithRows(tempData),
          });
        }else{
          this.setState({
            isLoading:false,
            dataSource: this.state.dataSource.cloneWithRows([]),
            noData:true,
            resData:{}
          });
        }
      });
  }
  componentDidMount(){
    page:1;
    this.setState({data:this.props.data})
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
  _goBack(data){
    setTimeout( ()=> {
      Actions.pop({refresh: {data:data,from:'bouName'}})
    },0)
  }
  _renderRow(rowData, sectionID, rowID){
    return(
      <View style={[styles_bou.item]}>
        <TouchableOpacity onPress={()=>this._goBack(rowData)} style={{borderBottomColor:'#efefef',borderBottomWidth:1,  flex:1,paddingBottom:12}}>
          <Text>{rowData.name}  {rowData.supplier_id_nm}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  render(){
    return (
    <View style={styles.container}>
      <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}} title="搜索精品"/>
      <View style={[styles.navbar, {justifyContent: 'flex-start',backgroundColor: '#efefef',height:42,paddingTop: Utils.andr21Normalize(0)}]}>
        <View style={{backgroundColor:'#fff',borderRadius:3,flex:1, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
        <TextInput style={[styles.msgSerach, {flex: 1, marginLeft: 0, marginRight: 0}]}
          ref="_searchInput"
          autoCapitalize='none'
          numberOfLines={1}
          autoCorrect={false}
          placeholder="以精品名称搜索"
          placeholderTextColor="#999999"
          onChangeText={this._change.bind(this)}
          underlineColorAndroid="transparent"
        />
        <Icon name='ios-search' size={20} color='#999999' style={styles.serachIcon} />
        {this.state.searchClean? <Icon style={{position: 'absolute', top: Utils.andr21Normalize(6), right: 8, backgroundColor: 'transparent'}} name='ios-close-circle' size={18} color='#999999' onPress={() => this._searchClean(this)} /> : null}
        </View>
      </View>
      {this.state.noData?
        <View style={styles_bou.label}>
          <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>未搜索到精品</Text>
        </View>:null}
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
        : null}
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
  label:{
      width:Utils.width,
      height:Utils.normalize(34),
      justifyContent:'center',
      paddingLeft:Utils.normalize(10),
      backgroundColor:'#efefef'
  },
  item:{
    flex:1,
    flexDirection:"row",
    backgroundColor:'#ffffff',
    paddingTop:12,
    paddingLeft:12,
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
