/**
* @Author: MillerD
* @Date:   2016-11-03T11:53:35+08:00
* @Last modified by:   MillerD
* @Last modified time: 2016-11-04T18:04:45+08:00
*/



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
import {Utils, Device, Assets} from "../base";
import API from '../base/api';
import {Button} from '../components';
import Item from './Item';
import LoadIcon from '../components/Loading';
import lodash from 'lodash';

import {Tip} from  "../components";
import Swipeout from '../components/react-native-swipeout';


// 关键字变化的请求timer
let timer = null;
let listPage = 1;
let currentText = '';
let currentList = [];
// 加载下一页的请求timer
let loadMoreTimer = null;
// loadmore开关,防止scrollEndReached多次调用
let loadMore = true;
//权限
let ops = null;
// 调拨数据
// let allotData = null;
// let lockData = null;
let carData = null;
let count = null;

class Search extends Component {
  constructor (props) {
    super(props);
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2) || r1.status_name !== r2.status_name})
    this.state = {
      dataSource: dataSource,
      searchClean: false,
      empty: false,
      loading: false,
      // showAllot: false,
      // showLockPage: false,
      backToTop: false,
      scrollEnabled: true
    }
  }

  // 获取权限
  componentDidMount() {
    this.refs._searchInput.focus();
    let params = {};
    Utils.fetch(API.unionquery, 'post', params)
      .then((res) => {
        if (res.ops !== undefined) {ops = res.ops;}
      });
  }

  _showTips(info){
      this.setState({
          show: true,
          alert: info
      })
    setTimeout(()=>{
      this.setState({show: false})
    },2000)
  }
  componentWillReceiveProps(nextProps){
      /*
          operate_flag 执行操作标志
          0       无操作
          1       调拨成功
          2       锁定成功
          3       解锁成功
      */
     if (nextProps.whichPage ===  0){
         switch (nextProps.info_carDetail.operate_flag) {
              case "1":
                  this._allotConfirm(nextProps.info);
                  break;
               case "2":
                  this._lockConfirm(nextProps.info);
                  break;
               case "3":
                  this._unlockConfirm(nextProps.info);
                  break;
             default:
         }
     }else if(nextProps.whichPage ===  1){
         switch (nextProps.backToDetail) {
             case 0:
                 this._allotConfirm(nextProps.info_allot);
                 this._showTips("调拨成功")
                 break;
              case 1:
                  this._lockConfirm(nextProps.info_lock);
                  this._showTips("锁定成功")
                  break;
             default:
         }
     }

  }

  scrollEndReached() {
    if(!loadMore) {
      loadMore = true;
      return;
    }else{
      loadMore = false;
    }
    // 无关键字屏蔽下一页加载
    if(currentText.length > 0 && currentList.length > 3 && currentList.length < count) {
      this.setState({loading: true})
      // 300毫秒内屏蔽下一页请求
      clearTimeout(loadMoreTimer);
      loadMoreTimer = setTimeout(() => {
        listPage++;
        let params = {...this.props.searchProps,page: listPage,vin: currentText};
        Utils.fetch(API.unionquery, 'post', params)
          .then((res) => {
            if (res.list.length > 0) {
              currentList = currentList.concat(res.list)
              this.setState({
                dataSource: this.state.dataSource.cloneWithRows(currentList),
                empty: false,
              });
            }else{
              listPage--;
            }
            this.setState({loading: false})
            loadMore = true;
          });
      }, 300)
    }else{
      clearTimeout(loadMoreTimer);
    }

  }
  _onScroll(event) {
    let contentLength = this.refs._listView.scrollProperties.visibleLength > this.refs._listView.scrollProperties.contentLength ? this.refs._listView.scrollProperties.visibleLength : this.refs._listView.scrollProperties.contentLength
    if (this.refs._listView.scrollProperties.offset + this.refs._listView.scrollProperties.visibleLength >= contentLength){
      this.scrollEndReached();
    }
    if (this.refs._listView.scrollProperties.offset > Utils.height) {
      this.setState({backToTop: true});
    }else{
      this.setState({backToTop: false});
    }
  }

  // search bar text changed
  _change(text) {
    text = text.replace(/\s/g,"")
    // 临时解决:关键字改变先滑动到list顶部，避免新关键字页面导致scroll end reached不正常调用
    if(this.refs._listView) {this.refs._listView.scrollTo({y: 0});}
    currentText = text;
    listPage = 1;
    if(text.length > 0) {
      this.setState({searchClean: true})
      // clear the last timer if type in again within 300ms
      clearTimeout(timer);
      timer = setTimeout(() => {
        let params = {...this.props.searchProps,page: listPage,vin: text};
        this.setState({loading: true})
        Utils.fetch(API.unionquery, 'post', params)
          .then((res) => {
            currentList = res.list;
            count = res.count;
            if (res.list.length > 0) {
              // total count
              this.setState({
                dataSource: this.state.dataSource.cloneWithRows(currentList),
                empty: false,
              });
            }else{
              this.setState({empty: true});
            }
            this.setState({loading: false})
            loadMore = false;
            // this.refs._listView.scrollTo({y: 0});
          });
      }, 500);
    }else{
      clearTimeout(timer);
      count = 0;
      currentList = [];
      this.setState({
        searchClean: false,
        dataSource: this.state.dataSource.cloneWithRows([]),
        empty: false
      });
    }
  }

  // clear search bar
  _searchClean() {
    this.refs._searchInput.clear();
    this._change('');
    this.setState({searchClean: false})
  }

  _renderSeparator() {
    return (
      <View style={{height: 8, width: Device.width}} />
    )
  }
  _carDetail(rowData, ops) {
    ops = ops;
    this.setState({rowData : rowData});
    Actions.carDetail({
        carData:rowData,
        ops:ops
    })
  }


  _allotPress(rowData) {
    carData = rowData;
    this.setState({androidSet: false});
     Actions.allot({data:rowData})
  }
  _lockPress(rowData) {
    carData = rowData;
    if(rowData.status === "0") {
      this.setState({androidSet: false});
      Actions.lock({data:rowData})
    }
    else if(rowData.status === "2") {
        let params = {id: rowData.id, warehouse_id: rowData.warehouse_id};
        Utils.fetch(Utils.api.unlock,'post',params)
          .then((res) => {
            var newLi = lodash.cloneDeep(currentList);
            for (let key in newLi) {
              if(newLi[key]['id'] === res.id) {
                newLi.splice(key, 1, res)
                currentList = newLi;
                break;
              }
            };
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(newLi)
            });
          })
      }
  }

  _allotConfirm(data) {
    var newDs = lodash.cloneDeep(currentList);
    for (let key in newDs) {
      if(newDs[key]['vin'] === data.vin) {
        newDs.splice(key, 1)
        currentList = newDs;
        break;
      }
    };
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newDs),
    });
  }

  _lockConfirm(info) {
    var newLi = lodash.cloneDeep(currentList);
    for (let key in newLi) {
      if(newLi[key]['id'] === info.id) {
        newLi.splice(key, 1, info)
        currentList = newLi;
        break;
      }
    };
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newLi),
    });
  }

  _unlockConfirm(res,page_flag) {
    var newLi = lodash.cloneDeep(currentList);
    for (let key in newLi) {
      if(newLi[key]['id'] === res.id) {
        newLi.splice(key, 1, res)
        currentList = newLi;
        break;
      }
    };
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newLi),
    });
    if(page_flag === 1){
      this._showTips("解锁成功")
    }
  }



  _longPress(rowData){
    if(Device.isAndroid && rowData.status != 6 && rowData.ops){
      carData = rowData;
      this.setState({androidSet: true});

    }
  }
  _constructSwipeBtn(rowData, ops) {
    let self = this;
    let lockOps = null;
    if (rowData.status == "0") {
      lockOps = ops.lock;
    }else{
      lockOps = ops.unlock;
    }
    let allotBtn = function(){
      return (
        <View style={styles_index.allotBtn}>
          {
            // <TouchableHighlight style={{borderRadius: 5, justifyContent: 'center', alignItems: 'center', height: 40, width: 40, backgroundColor: rowData.status == "6" ? 'grey' : 'blue'}}>
            //   <Icon name='ios-redo-outline' size={18} />
            // </TouchableHighlight>
          }
          <Image style={{width: Utils.normalize(36), height: Utils.normalize(36)}} source={Assets.change} />
          <Text style={{color: '#4586F3', top: Utils.normalize(8), fontSize: Utils.normalize(15)}}>{'调拨'}</Text>
        </View>
      )
    }();
    let allotFunc = function() {
      self._allotPress(rowData);
    }

    let lockBtn = function() {
      return lockOps ?
        <View style={styles_index.allotBtn}>
          {
            // <TouchableHighlight style={{borderRadius: 5, justifyContent: 'center', alignItems: 'center', height: 40, width: 40, backgroundColor: 'blue'}}>
            //   <Icon name='ios-lock-outline' size={18} />
            // </TouchableHighlight>
          }
          <Image source={rowData.status == "2" ? Assets.icons.unlock_btn : Assets.icons.lock_btn} style={{width: Utils.normalize(36), height: Utils.normalize(36)}} />
          <Text style={{color: rowData.status == "2" ? '#fd7878' : '#4586F3', top: Utils.normalize(8), fontSize: Utils.normalize(15)}}>{rowData.status == "2" ? '解锁' : '锁定'}</Text>
        </View> : <View></View>
    }();
    let lockFunc = function() {
      if (rowData.status == "0") {
        self._lockPress(rowData);
      }else if(rowData.status == "2") {
        self._unlock(1, rowData);
      }
    }
    let a_btn = {
      backgroundColor: 'transparent',
      onPress: allotFunc,
      component: allotBtn
    }
    let l_btn = {
      backgroundColor: 'transparent',
      onPress: lockFunc,
      component: lockBtn
    }
    // let swipeoutBtns = [
    //   {
    //     backgroundColor: 'transparent',
    //     onPress: allotFunc,
    //     component: allotBtn
    //   },
    //   {
    //     backgroundColor: 'transparent',
    //     onPress: lockFunc,
    //     component: lockBtn
    //   }
    // ]
    let swipeoutBtns = [];
    if (ops.allot) {
      swipeoutBtns.push(a_btn);
    }
    if (lockOps) {
      swipeoutBtns.push(l_btn);
    }

    if (rowData.status == "6") {
      swipeoutBtns = [
        // {
        //   backgroundColor: 'transparent',
        //   onPress: function() { alert('在途车辆') },
        //   component: allotBtn
        // }
      ]
    }
    return Device.iOS ? swipeoutBtns : [];
  }

  _handleSwipeout(sectionID, rowID) {
    let rows = lodash.cloneDeep(currentList);
    for (var i = 0; i < rows.length; i++) {
      if (i != rowID) rows[i].active = false;
      else rows[i].active = true;
    }
    this._updateDataSource(rows);
  }
  _updateDataSource(data) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  _allowScroll(scrollEnabled) {
    this.setState({ scrollEnabled: scrollEnabled });
  }

  _renderRow(rowData, sectionID, rowID) {
    let that = this;
    return Device.iOS ? (
      <Swipeout
        right={this._constructSwipeBtn(rowData, ops)}
        rowID={rowID}
        sectionID={sectionID}
        autoClose={true}
        backgroundColor='transparent'
        close={!rowData.active}
        onOpen={(sectionID, rowID) => that._handleSwipeout(sectionID, rowID) }
        btnWidth={Utils.width * 0.25}
        scroll={(event) => that._allowScroll(event)}>
        <Item
          data={rowData}
          ops={ops}
          press={() => this._carDetail(rowData, ops)}
          longPress={() => this._longPress(rowData)}
        />
      </Swipeout>
    ) : (
      <Item
        data={rowData}
        ops={ops}
        press={() => this._carDetail(rowData, ops)}
        longPress={() => this._longPress(rowData)}
      />
    )
  }
  _unlock(page_flag, rowData){
    let catData = rowData;
    let params = {id: carData.id, warehouse_id: carData.warehouse_id};
    Utils.fetch(Utils.api.unlock,'post',params)
      .then((res) => {
        this.setState({androidSet: false});
        this._unlockConfirm(res,page_flag);
      })
  }

  render() {
    let params = {};
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
                placeholder="以车架号搜索"
                placeholderTextColor="#999999"
                underlineColorAndroid="transparent"
                onChangeText={this._change.bind(this)}
              />
              <Icon name='ios-search' size={20} color='#999999' style={[styles.serachIcon]} />
              {this.state.searchClean ? <Icon style={{position: 'absolute',top: 5, right: 8, backgroundColor: 'transparent'}} name='ios-close-circle' size={18} color='#999999' onPress={() => this._searchClean(this)} /> : null}
            </View>
            <Text style={{color: 'white', width: 30}} onPress={() => Actions.pop()}>取消</Text>
          </View>
        </View>
        {this.state.empty ? <Text style={{marginTop: 15, marginLeft: 15, color: '#666', textAlign: 'left', backgroundColor: 'transparent', fontSize: 14}}>未搜索到车辆</Text> :
          <ListView style={{height: Device.height - 64}}
            ref="_listView"
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections={true}
            onEndReachedThreshold={0}
            onScroll={this._onScroll.bind(this)}
            removeClippedSuviews={true}
            pageSize={20}
            renderFooter={() => {
              return(
                <View>
                  {(currentList ? currentList.length : 0 ) >= (Number(count) ? count : 1)?
                    <View style={{height: 30,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多消息--</Text></View>
                    : <View></View>
                  }
                </View>
            )}}
          />}
        {this.state.backToTop ?
          <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={styles_index.backToTop}>
            <Image style={{width: 50, height: 50}} source={Assets.backToTop}/>
          </TouchableOpacity>
        : null}
        {this.state.loading ? <LoadIcon /> : null}

        {this.state.androidSet ? <View style={styles.overlay} onStartShouldSetResponder={()=>{this.setState({androidSet: false})}}>
         <View style={{width: Utils.normalize(280),position:'absolute',backgroundColor:'#fff',left: (Utils.width - Utils.normalize(280) )/2, top: (Utils.height - Utils.normalize(100))/2,borderRadius: 4}}>
           {
             carData.status == "0" ?
             <View>
               {ops.allot ? <TouchableHighlight underlayColor='#f2f2f2' onPress={this._allotPress.bind(this,carData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                 <Text style={{fontSize: 17,marginLeft: 15}}>调拨</Text>
               </TouchableHighlight> : null}
               {ops.lock ? <TouchableHighlight underlayColor='#f2f2f2'  onPress={() => this._lockPress(carData)}  style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                 <Text style={{fontSize: 17,marginLeft: 15}}>锁定</Text>
               </TouchableHighlight> : null}
             </View>
             :
             <View></View>
           }
           {
             carData.status == "2" ?
             <View>
               {ops.allot ? <TouchableHighlight underlayColor='#f2f2f2' onPress={this._allotPress.bind(this,carData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                 <Text style={{fontSize: 17,marginLeft: 15}}>调拨</Text>
               </TouchableHighlight> : null}
               {ops. unlock ? <TouchableHighlight underlayColor='#f2f2f2' onPress={() => this._unlock(1)} style={{height: Utils.normalize(50),justifyContent:'center'}}>
                 <Text style={{fontSize: 17,marginLeft: 15, color:'#fd7878'}}>解锁</Text>
               </TouchableHighlight> : null}
             </View>
             :
             <View></View>
           }
         </View>
        </View> : <View></View>}
        {this.state.show ? <Tip name={this.state.alert} /> : <View></View>}
      </View>
    )
  }
}
const styles_index = StyleSheet.create({
    tabBar:{
        flexDirection:"row",
        width:Utils.width,
        height:Utils.normalize(40),
        justifyContent:'center',
        backgroundColor:"#ffffff",
        borderColor: '#cccccc',
        borderBottomWidth: 0.5
    },
    tabText:{
        textAlign:'center',
        fontSize: Utils.normalize(14)
    },
    tabTextBlue:{
        textAlign:'center',
        color:'#387ff5',
        fontSize: Utils.normalize(14)
    },
    label:{
        width:Utils.width,
        height:Utils.normalize(30),
        justifyContent:'center',
        paddingLeft:Utils.normalize(10)
    },
    overlay:{
        position: 'absolute',
        top:Utils.andr21Normalize(64),
        bottom:0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        // backgroundColor: 'red',
        width: Utils.width,
        flex: 1,
        flexDirection: 'row',
    },
    fullSonButtonGroup:{
        height: Utils.normalize(44),
        justifyContent: 'center',
        //borderTopWidth: 0.5,
        //borderColor: '#bbb',
        borderBottomWidth: 0.5,
        borderColor: '#cccccc',
        marginLeft: Utils.normalize(15),
        flex:1,
    },
    modelBorder:{
        height: Utils.normalize(30),
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems:'center',
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: '#bbb',
        marginLeft:Utils.normalize(13),
        paddingLeft:Utils.normalize(8),
        paddingRight:Utils.normalize(8),
        marginTop: Utils.normalize(15),
        marginBottom: Utils.normalize(15)
    },
    modelBorderBlue:{
        height: Utils.normalize(30),
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems:'center',
        borderRadius: 5,
        borderColor: '#387ff5',
        marginLeft:Utils.normalize(13),
        paddingLeft:Utils.normalize(20),
        paddingRight:Utils.normalize(20),
        marginTop: Utils.normalize(15),
        marginBottom: Utils.normalize(15),
        borderWidth: 0.5
    },
    fullSonButtonText: {
      fontSize: Utils.normalize(13),
      textAlign: 'center',
      color: '#666'
    },
    fullSonButtonTextBlue: {
      fontSize: Utils.normalize(13),
      textAlign: 'center',
      color:'#387ff5'
    },
    itemActive: {
      color: '#387ff5'
    },
    itemNoActive: {
      color: '#666'
    },
    itemTitle: {
      marginLeft: 15,
      marginTop: 14,
      marginBottom: 9
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
    },
    allotBtn: {
      justifyContent: 'center',
      alignItems: 'center',
      right: 0,
      top: 0,
      bottom: 0,
      flex: 1
    },
})

export default Search;
