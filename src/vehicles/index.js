/**
* @Author: meteor
* @Date:   2016-09-23T10:01:36+08:00
* @Email:  1056874343@qq.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-21T11:00:04+08:00
*/

'use strict';
import React ,{Component} from 'react';
import {
    TouchableOpacity,
    View,
    Image,
    Text,
    StyleSheet,
    ListView,
    TouchableHighlight,
    ScrollView,
    Animated,
    RefreshControl
} from 'react-native'

import styles from '../common/styles'
import {Utils,Device,Assets} from "../base";
import {Header, Button, Loading} from '../components'
import Item from "./Item"

import Icon_FontAwesome from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/Ionicons'
import {Actions} from 'react-native-router-flux'
import lodash from 'lodash';
import Swipeout from '../components/react-native-swipeout';

import {Tip, Card} from  "../components"

let listPage = 1;
let allotData = null;
let lockData = null;
let isMounted = false;
let searchProps = {};

class TabItem extends Component{
    constructor(props){
        super(props);    //this.props.color?(color:'#387ff5'):null
    }
    render(){
        return (
            <TouchableHighlight style={{flex:1,backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f2f2f2' onPress={this.props.onPress}>
                    <View style={{flex:1,flexDirection:"row",justifyContent:'center',alignItems: 'center'}}>
                        <Text style={this.props.checkStatus || this.props.color ? styles_index.tabTextBlue : styles_index.tabText}>{this.props.name}</Text>
                        <Text style={{marginLeft:3,backgroundColor:"transparent"}}>
                            <Icon_FontAwesome name={this.props.color ? "caret-up" : "caret-down" }  size={Device.iOS?15:18} color={this.props.color ? "#387ff5" : "#999999" } />
                        </Text>
                        {this.props.line?<View style={{width:0.5,height:Utils.normalize(23),backgroundColor:"#999999",position:'absolute',top:8,right:0.5}}></View>:null}
                    </View>
            </TouchableHighlight>


        )
    }
}

export default class Vehi_select extends Component{
    constructor(props){
        super(props);
        var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2) || r1.status_name !== r2.status_name});
        var seriesList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        var brandList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        var modelList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        var colorList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        var statusList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        this.state = {
            dataSource,
            seriesList,
            brandList,
            modelList: modelList.cloneWithRows([{nm:"不限",id:"0"}]),
            colorList: colorList.cloneWithRows([{nm:"不限",id:"0"}]),
            statusList,
            resultCount:0,
            backToTop: false,
            //是否显示品牌，车系
            brand:false,
            model:false,
            color:false,
            other:false,
            //车系原始数据
            seriesData:[{nm:"不限",id:"0"}],
            modelData:[{nm:"不限",id:"0"}],
            colorData:[{nm:"不限",id:"0"}],
            statusData:[{nm:"不限",id:""}],
            shopData:null,
            wareData:[{nm:"不限",id:"0"}],
            //请求参数
            brandId:"0", //品牌
            seriesId:"0",//车系
            modelId:"0",//车型
            colorId:"0",//颜色
            statusId:"",//
            wareId:["0"],//仓库
            shopId:"",//店名
            isLoading:false,
            isRLoading:false,
            cloneStatusId:'',//克隆状态等。用于点击其他是可以回到默认值
            cloneShopId:'',
            cloneWareData:'',
            clonewareArr:'',
            scrollEnabled:true
        }
    }

    //对每次setState进行isMounted判断
    m_setState(obj) {
      if(isMounted) {
        this.setState(obj);
      }
    }

    /**
     * 筛选数据
     */
    _onRefresh(isNext){
        //分页
        if((isNext && isNext != 'refresh') || !isNext){
          this.m_setState({'isLoading': true})
          //加载
        }
        else{
          this.m_setState({'isRLoading': true});
          //下拉刷新
        }
        if((!isNext || isNext == 'refresh') && isMounted){
          listPage = 1;
          this.refs._listView ? this.refs._listView.scrollTo({y: 0, animated: true}) : null;
        }
        var wareData = [];
        if(this.state.wareId.indexOf('0') != -1){
          for(var key in this.state.wareData){
            if(this.state.wareData[key].id != 0){
              wareData.push(this.state.wareData[key].id)
            }
          }
        }
        else{
          wareData = this.state.wareId
        }
        let params = {
          page:listPage,
          size:20,
          order:"",
          od_et:1,
          shopid:this.state.shopId,
          wareids: wareData
        };
        if(this.state.brandId != "0"){
          params.brandid = this.state.brandId;
        }else{
          delete params['brandid']
        }
        if(this.state.modelId != "0"){
          params.modelids = this.state.modelId;
        }else{
          delete params['modelids']
        }
        if(this.state.seriesId != "0"){
          params.typeids = this.state.seriesId;
        }else{
          delete params['typeids'];
        }
        if(this.state.statusId !== ""){
          params.status = this.state.statusId;
        }else{
          delete params['status']
        }
        if(this.state.colorId != "0"){
          params.colorids = this.state.colorId;
        }else{
          delete params['colorids']
        }
        searchProps = params;
        Utils.fetch(Utils.api.unionquery,'post',params)
          .then((res) => {
              this.m_setState({'isLoading': false,'isRLoading': false})
              //是否是分页
              if(isNext && isNext != 'refresh'){
                var dataList = lodash.cloneDeep(this.state.dataList);
                res.list = dataList.concat(res.list);
              }
              this.m_setState({resultCount:res.count,dataSource:this.state.dataSource.cloneWithRows(res.list),dataList: res.list,ops: res.ops});
              //更新克隆的数据
              this.m_setState({cloneStatusId:lodash.cloneDeep(this.state.statusId),cloneShopId:lodash.cloneDeep(this.state.shopId),cloneWareData:lodash.cloneDeep(this.state.wareData),clonewareArr:lodash.cloneDeep(this.state.wareId)})

          })

        //对网络状态进行判断
        setTimeout(()=>{
          this.m_setState({isLoading: false,isRLoading: false});
        },3000)
    }

    componentWillUnmount() {
      // let listPage = 1;
      // let allotData = null;
      // let lockData = null;
      // let isMounted = false;
      // let searchProps = {};
      listPage = null;
      allotData = null;
      lockData = null;
      searchProps = null;

      isMounted = null;

    }
    _showTips(info){
        this.m_setState({
            show: true,
            alert: info
        })
      setTimeout(()=>{
        this.m_setState({show: false})
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
    componentDidMount(){
        isMounted = true;
        this.m_setState({'isLoading': true});
        let params = {keys:"wares,carbtm,ncs_status,ftmodel,nc_enter_reason,nc_change_reason,nc_deliver_reason,nc_lock_reason,nc_onload_reason,shopwcar,me_info,me_ware"}
        Utils.fetch(Utils.api.load,'post',params)
          .then((res) => {
              this.m_setState({shopwcar: res.shopwcar})

              let statusData = lodash.cloneDeep(res.ncs_status);
              statusData.unshift({nm:"不限",vl:""});

              let shopData = lodash.cloneDeep(res.shopwcar);
              storage.load({
                key: "User"
              }).then(res => {
                  let data = [],wareData = [];
                  res.shop_id = res.shop_id == 1 ? shopData[0].id : res.shop_id;
                  shopData.map((item)=>{
                    if(item.id == res.shop_id){
                      data = lodash.cloneDeep(item.btm ? item.btm : []);
                      data.unshift({nm:"不限",id: 0});
                      wareData = lodash.cloneDeep(item.wares ? item.wares : []);
                      wareData.unshift({name:"不限",id:"0"});
                      return true;
                    }
                  })
                  this.m_setState({
                      brandList:this.state.brandList.cloneWithRows(data),
                      brandData: data,
                      seriesList:this.state.seriesList.cloneWithRows([{nm:"不限",id:"0"}]),
                      statusList: this.state.statusList.cloneWithRows(statusData),
                      statusData: statusData,
                      shopData: shopData,
                      wareData: wareData,
                      meWare: res.me_ware,
                      shop_id: res.shop_id,
                      shopId: res.shop_id
                  })
                //克隆数据
                this.m_setState({cloneStatusId:lodash.cloneDeep(this.state.statusId),cloneShopId:lodash.cloneDeep(this.state.shopId),cloneWareData:lodash.cloneDeep(this.state.wareData),clonewareArr:lodash.cloneDeep(this.state.wareId)})
              }).catch(err => {
              })


              setTimeout(()=>{
                this._onRefresh();
              },100)
          })
    }



  /**
     * 显示筛选条件
     */
    _changeStatus(rowData,rowId,tab,other){
        // if( (!rowData || !rowId) && this.state.other ){
        //   this.m_setState({other: false})
        //   this._otherReset();
        //   return;
        // }
        switch(tab){
            case 1:
                if(rowData){
                  setTimeout(()=>{
                    this._onRefresh();
                  },200)
                  this._setSeries(rowData,1)
                }
                this.m_setState({brand:!this.state.brand,model:false,color:false,other:false})
                break;
            case 2:
                this.m_setState({brand:false,model:!this.state.model,color:false,other:false})
                if(rowData){
                    //设置边框颜色
                    let data = lodash.cloneDeep(this.state.modelData);
                    // rowData.change = !rowData.change;
                    this.m_setState({modelId:rowData.id,modelList:this.state.modelList.cloneWithRows(data),modelData:data})
                    setTimeout(()=>{
                      this._onRefresh();
                    },200)
                }
                break;
            case 3:

              this.m_setState({brand:false,model:false,color:!this.state.color,other:false})

              if(rowData){
                    //设置边框颜色
                    let data = lodash.cloneDeep(this.state.colorData);
                    this.m_setState({colorId:rowData.id,colorList:this.state.colorList.cloneWithRows(data),colorData:data})
                    setTimeout(()=>{
                      this._onRefresh();
                    },200)
                }
                break;
          case 4:
            this.m_setState({brand:false,model:false,color:false,other: other ? this.state.other : !this.state.other})
            switch (other) {
                    case 1:
                        //设置边框颜色
                        let statusData = lodash.cloneDeep(this.state.statusData);
                        this.m_setState({statusId:rowData.vl,statusList:this.state.statusList.cloneWithRows(statusData),statusData:statusData})
                        break;
                    case 2:
                        //设置边框颜色
                        let shopData = this.state.shopData;
                        this.m_setState({shopId:rowData.id})
                        var wareData = lodash.cloneDeep(shopData[rowId].wares ? shopData[rowId].wares : []);
                        wareData.unshift({name:"不限",id:"0"});
                        this.m_setState({wareId:['0'],wareData:wareData})
                        break;
                    case 3:
                        //设置边框颜色
                        var wareData = lodash.cloneDeep(this.state.wareData);
                        var wareArr = lodash.cloneDeep(this.state.wareId);
                        var index = wareArr.indexOf(rowData.id);
                        //对不限与仓库的操作
                        if(rowData.id == '0'){
                          wareArr = ['0']
                        }else{
                          if(index === -1){
                            wareArr.push(rowData.id)
                          }else{
                            wareArr.splice(index,1)
                          }
                          var noSetIndex = wareArr.indexOf('0')
                          if(noSetIndex != -1){
                            wareArr.splice(noSetIndex,1);
                          }
                        }
                        if(wareArr.length == 0){
                          wareArr.push('0')
                        }
                        this.m_setState({wareId: wareArr,wareData:wareData})
                        break;
                    default:
                        this.m_setState({statusId:this.state.cloneStatusId,shopId:this.state.cloneShopId,wareData:this.state.cloneWareData,wareId:this.state.clonewareArr})
                }
        }
    }
    /*
    *设置车系的数据
    */
    _setSeries(rowData,rowId){
        let params, data=[];
        //选择品牌
        if (rowId === -1){
            this.m_setState({brandId:rowData.id});
            if (rowData.arr){
                data = rowData.arr;
            }else{
                data.unshift({nm:"不限",id:"0"});
            }
            if(data && data[0].id != "0"){
                data.unshift({nm:"不限",id:"0"});
            }
            //清空
            this.m_setState({
              //seriesId: '0',
              //colorId: '0',
              //modelId: '0',
              modelTab: true,
              colorTab: true,
              brandList: this.state.brandList.cloneWithRows(lodash.cloneDeep(this.state.brandData))
            })
        }
        else {
          //选择车系
          if (rowId>0){
              //车系
              data = lodash.cloneDeep(this.state.seriesData)
              // data[rowId].bor_id = '0';
              //车型
              let modelData = [],colorData = [];
              if(rowData.arr){
                modelData = lodash.cloneDeep(rowData.arr)
              }
              modelData.unshift({nm:"不限",id:"0"});
              //颜色
              if(rowData.cls){
                colorData = lodash.cloneDeep(rowData.cls)
              }
              colorData.unshift({nm:"不限",id:"0"});
              this.m_setState({
                seriesId: rowData.id,
                modelTab: true,
                colorTab: true,
                colorId: '0',
                modelId: '0',
                modelList: this.state.modelList.cloneWithRows(modelData),
                colorList: this.state.colorList.cloneWithRows(colorData),
                modelData: modelData,colorData:colorData
              })
          }else{
              //第一项，不限   分开理由：
              data = lodash.cloneDeep(this.state.seriesData)
              this.m_setState({modelTab:false,colorTab:false})
          }
        }
        this.m_setState({seriesList:this.state.seriesList.cloneWithRows(data),seriesData:data})
    }
    _handleSwipeout(sectionID, rowID) {
      let rows = lodash.cloneDeep(this.state.dataList);
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
            //   <TouchableHighlight style={{borderRadius: 5, justifyContent: 'center', alignItems: 'center', height: 40, width: 40, backgroundColor: rowData.status == "6" ? 'grey' : '#387FF5'}}>
            //     <Icon name='ios-redo-outline' size={18} />
            //   </TouchableHighlight>
            <Image style={{width: Utils.normalize(36), height: Utils.normalize(36)}} source={Assets.change} />
            }
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
              // <TouchableHighlight style={{borderRadius: 5, justifyContent: 'center', alignItems: 'center', height: 40, width: 40, backgroundColor: rowData.status == "2" ? '#fd7878' : '#387FF5'}}>
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

      if (rowData.status == "6" || rowData.ops === false) {
        swipeoutBtns = [
          // {
          //   backgroundColor: 'transparent',
          //   onPress: function() { return },
          //   component: allotBtn
          // }
        ]
      }
      return Device.iOS ? swipeoutBtns : [];
    }

    _renderRow(rowData, sectionID, rowID){
      var that = this;
      return Device.iOS ? (
        <Swipeout
          right={this._constructSwipeBtn(rowData, this.state.ops)}
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
            ops={this.state.ops}
            press={() => that._carDetail(rowData, this.state.ops)}
            longPress={() => that._longPress(rowData)}
          />
        </Swipeout>
      ) : (
        <Item
          data={rowData}
          ops={this.state.ops}
          press={() => that._carDetail(rowData, this.state.ops)}
          longPress={() => that._longPress(rowData)}
        />
      )
    }
    // 车辆详情页面
    _carDetail(rowData, ops) {
      ops = ops;
      this.m_setState({rowData : rowData});
      Actions.carDetail({
          carData:rowData,
          ops:this.state.ops
      })
    }
    _longPress(rowData){
     if(Device.isAndroid && rowData.status != 6 && rowData.ops){
        this.m_setState({androidSet: true, rowData: rowData})
      }
   }
    _lockPress(rowData) {
      if(rowData.status === "0") {
        this.m_setState({androidSet: false,rowData: rowData});
        Actions.lock({data:rowData})
      }
      else if(rowData.status === "2") {
        let params = {id: rowData.id, warehouse_id: rowData.warehouse_id};
        Utils.fetch(Utils.api.unlock,'post',params)
          .then((res) => {
            var newLi = lodash.cloneDeep(this.state.dataList);
            for (let key in newLi) {
              if(newLi[key]['id'] === res.id) {
                newLi.splice(key, 1, res);
                this.m_setState({dataSource: this.state.dataSource.cloneWithRows(newLi)})
                break;
              }
            };
          })
      }
    }
    _infoDetail(rowData) {
      Actions.carDetail({rowData: rowData});
    }
    _allotPress(rowData) {
      this.m_setState({androidSet: false,rowData: rowData});
      Actions.allot({data:rowData})
    }

    _renderBrand(rowData){
        return(
            <View style={{backgroundColor:this.state.brandId == rowData.id ? '#f6f6f6' : '#fff',width:Utils.normalize(140)}}>
              <TouchableHighlight underlayColor={'transparent'} onPress={()=>this._setSeries(rowData,-1)}>
                <View style={[styles_index.fullSonButtonGroup]}>
                  <Text numberOfLines={2} style={this.state.brandId == rowData.id ? styles_index.itemActive: styles_index.itemNoActive}>{rowData.nm}</Text>
                </View>
              </TouchableHighlight>
            </View>
        )
    }
    _renderSeries(rowData,sectionID,rowId){
        return(
            <View style={{backgroundColor:'#f6f6f6'}}>
              <TouchableHighlight underlayColor={'transparent'} onPress={()=>this._changeStatus(rowData,rowId,1)}>
                <View style={[styles_index.fullSonButtonGroup,{backgroundColor:'#f6f6f6'}]}>
                  <Text numberOfLines={2} style={[this.state.seriesId == rowData.id ? styles_index.itemActive: styles_index.itemNoActive,{marginRight: 35}]}>
                    {rowData.nm}
                  </Text>
                  {this.state.seriesId == rowData.id ?<Icon style={{position:'absolute',right:14,top:Utils.normalize(16)}} name='md-checkmark' size={20} color="#387ff5" />:null}
                </View>
              </TouchableHighlight>
            </View>
        )
    }
    _renderModel(rowData,sectionID,rowId){
        // return(
        //     <Card   style={{backgroundColor:'#fff',alignItems:'flex-start'}}
        //     name = {rowData.nm}
        //     state = {this.state.modelId}
        //     id = {rowData.id}
        //     width = {false}
        //     onPress={()=>this._changeStatus(rowData,rowId,2)}
        //       />
        // )
        return(
          <View>
            <TouchableHighlight underlayColor={'transparent'} onPress={() => this._changeStatus(rowData, rowId, 2)}>
              <View style={[styles_index.fullSonButtonGroup]}>
                <Text numberOfLines={2} style={[this.state.modelId == rowData.id ? styles_index.itemActive: styles_index.itemNoActive,{marginRight: 35}]}>
                  {rowData.nm}
                </Text>
                {this.state.modelId == rowData.id ?<Icon style={{position:'absolute',right:14,top:Utils.normalize(16)}} name='md-checkmark' size={20} color="#387ff5" />:null}
              </View>
            </TouchableHighlight>
          </View>
        )
    }
    _renderColor(rowData,sectionID,rowId){
        return(
            <Card   style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3}}
            name = {rowData.nm}
            state = {this.state.colorId}
            id = {rowData.id}
            width = {true}
            onPress={()=>this._changeStatus(rowData,rowId,3)}
              />
        )
    }
    _renderStatus(rowData,sectionID,rowId){
        return(
            <Card   style={{backgroundColor:'#fff', width: (Utils.width - Utils.normalize(13)) / 4}}
              name = {rowData.nm}
              state = {this.state.statusId}
              id = {rowData.vl}
              width = {true}
              onPress={()=>this._changeStatus(rowData,rowId,4,1)}
              />
        )
    }
    _otherSure(){
      this.m_setState({other:false})
      let data = [], wareData = [];
      this.state.shopData.map((item)=>{
        if(item.id == this.state.shopId){
          data = lodash.cloneDeep(item.btm ? item.btm : []);
          data.unshift({nm:"不限",id: 0});
          wareData = lodash.cloneDeep(item.wares ? item.wares : []);
          wareData.unshift({name:"不限",id:"0"});
          return true;
        }
      })
      let seriesData = [];
      if (this.state.shopId !== this.state.cloneShopId) {
        this.m_setState({
          brandId: "0", //品牌
          seriesId: "0",//车系
          modelId: "0",//车型
          colorId: "0",//颜色
          modelData: [{nm:"不限",id: 0}],
          modelList: this.state.modelList.cloneWithRows([{nm:"不限",id: 0}]),
          colorData: [{nm:"不限",id: "0"}],
          colorList: this.state.colorList.cloneWithRows([{nm:"不限",id: "0"}]),
          statusId: ''
        })

        if(data[0] != undefined && !data[0].arr){
          seriesData = [{nm:"不限",id: 0}];
        } else {
          seriesData = data[0].arr;
        }

      }else {
        if(data[this.state.brandId] != undefined && !data[this.state.brandId].arr){

          seriesData = [{nm:"不限",id: 0}];

        } else {
          data.map((item) => {
            if(item.id == this.state.brandId){
              seriesData = item.arr;
              seriesData.unshift({nm:"不限",id: 0})
            }
          })
        }
      }
      this.m_setState({
        wareData: wareData,
        brandData: data,
        brandList: this.state.brandList.cloneWithRows(data),
        seriesData: seriesData,
        seriesList: this.state.modelList.cloneWithRows(seriesData),
        cloneStatusId:lodash.cloneDeep(this.state.statusId),
        cloneShopId:lodash.cloneDeep(this.state.shopId),
        cloneWareData:lodash.cloneDeep(this.state.wareData),
        clonewareArr:lodash.cloneDeep(this.state.wareId)
      })
      setTimeout(()=>{
        this._onRefresh();
      },100)
    }
    _otherReset(){
      //设置边框颜色
      let statusData = lodash.cloneDeep(this.state.statusData);
      this.m_setState({statusId:"",statusList:this.state.statusList.cloneWithRows(statusData),statusData:statusData})

      //设置边框颜色
      let shopData = lodash.cloneDeep(this.state.shopData);

      // let wareData = [];
      // this.state.wareData.map((item)=>{
      //   wareData.push({ name: item.nm, id: item.vl})
      // })
      // wareData.unshift({name:"不限",id:"0"});
      let data, wareData;
      this.state.shopData.map((item)=>{
        if(item.id == this.state.shop_id){
          data = lodash.cloneDeep(item.btm ? item.btm : []);
          data.unshift({nm:"不限",id: 0});
          wareData = lodash.cloneDeep(item.wares ? item.wares : []);
          wareData.unshift({name:"不限",id:"0"});
          return true;
        }
      });

      this.m_setState({
        wareData: wareData,
        shopId: this.state.shop_id,
        statusId: "", // 状态
        wareId: ["0"] //仓库
      });
      // this._onRefresh();
    }
    _onScroll(event) {
      if(this.state.isLoading) return false;
      let contentLength = this.refs._listView.scrollProperties.visibleLength > this.refs._listView.scrollProperties.contentLength ? this.refs._listView.scrollProperties.visibleLength : this.refs._listView.scrollProperties.contentLength
      if (this.refs._listView.scrollProperties.offset + this.refs._listView.scrollProperties.visibleLength >= contentLength ){
        this.scrollEndReached();
      }
      if (this.refs._listView.scrollProperties.offset > Utils.height) {
        this.m_setState({backToTop: true});
      }else{
        this.m_setState({backToTop: false});
      }
    }
    scrollEndReached() {

      if(this.state.dataList && this.state.dataList.length >= this.state.resultCount) return;
      listPage ++;
      this._onRefresh(true);
    }
    _allotConfirm(data){
      var newDs = lodash.cloneDeep(this.state.dataList);
      for (let key in newDs) {
        if(newDs[key]['vin'] === data.vin) {
          newDs.splice(key, 1)
          break;
        }
      };
      this.m_setState({
        dataSource: this.state.dataSource.cloneWithRows(newDs),
        dataList: newDs,
      });
    }
    _lockConfirm(info) {
      var newLi = lodash.cloneDeep(this.state.dataList);
      for (let key in newLi) {
        if(newLi[key]['id'] === info.id) {
          newLi.splice(key, 1, info)
          break;
        }
      };
      this.m_setState({
        dataSource: this.state.dataSource.cloneWithRows(newLi),
        dataList: newLi,
      });
    }

    _onTouchUp() {
      if(this.state.other){
        this.m_setState({statusId:this.state.cloneStatusId,shopId:this.state.cloneShopId,wareData:this.state.cloneWareData,wareId:this.state.clonewareArr})
      }
      this.m_setState({brand:false,model:false,color:false,other: false})
    }
    /*
    解锁
     */
    _unlock(page_flag, rowData){
      let carData = rowData;
      let params = {id: carData.id, warehouse_id: carData.warehouse_id};
      Utils.fetch(Utils.api.unlock,'post',params)
        .then((res) => {
          this.m_setState({androidSet: false});
          this._unlockConfirm(res,page_flag);
        })
    }
    _unlockConfirm(res,page_flag) {
      var newLi = lodash.cloneDeep(this.state.dataList);
      for (let key in newLi) {
        if(newLi[key]['id'] === res.id) {
          newLi.splice(key, 1, res)
          break;
        }
      };
      this.m_setState({
        dataSource: this.state.dataSource.cloneWithRows(newLi),
        dataList: newLi,
      });
      if(page_flag === 1){
        this._showTips("解锁成功")
      }

    }
    render(){
        return(
            <View style={styles.container}>
                <Header title="车辆查找" leftPress={()=>Actions.pop()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}
                    rightPress={()=>Actions.vehi_filter({searchProps: searchProps})}  rightIcon={{name:Device.iOS ? "ios-search" : "md-search",size: 23}} />
                {
                  this.state.shopwcar ?
                  <View style={styles_index.tabBar}>
                    <TabItem name="车系" line={true} color={this.state.brand} checkStatus = {this.state.brandId != '0'}   onPress={()=>this._changeStatus(null,null,1)} />
                    <TabItem name="车型" line={true} color={this.state.model} checkStatus = {this.state.modelId != '0'}  onPress={()=>this._changeStatus(null,null,2)} />
                    <TabItem name="颜色" line={true} color={this.state.color} checkStatus = {this.state.colorId != '0'} onPress={()=>this._changeStatus(null,null,3)} />
                    <TabItem name="其它" line={false} color={this.state.other} checkStatus = {this.state.statusId !== '' || this.state.shopId != this.state.shop_id || this.state.wareId[0] != '0'} onPress={()=>this._changeStatus(null,null,4)}/>
                  </View>
                  : <View></View>
                }
                {
                  this.state.dataList && !this.state.isLoading?
                  <View style={styles_index.label}>
                      {
                        this.state.resultCount > 0 ?
                        <Text style={{color:'#666666',fontSize:Utils.normalize(12)}}>共搜索到{this.state.resultCount}条结果</Text>
                        :
                        <Text style={{color:'#666666',fontSize:Utils.normalize(12)}}>未搜索到车辆</Text>
                      }
                  </View>
                  : <View></View>
                }

                <ListView
                  ref="_listView"
                  scrollEnabled={this.state.scrollEnabled}
                  style={{height:Device.height - 134}}
                  dataSource={this.state.dataSource}
                  renderRow={(rowData, sectionID, rowID)=>this._renderRow(rowData, sectionID, rowID)}
                  enableEmptySections = {true}
                  onScroll={this._onScroll.bind(this)}
                  removeClippedSubviews={true}
                  scrollEventThrottle={0}
                  pageSize={20}
                  refreshControl={
                    <RefreshControl
                      style={{backgroundColor:'transparent'}}
                      refreshing={this.state.isRLoading}
                      onRefresh={this._onRefresh.bind(this,'refresh')}
                      tintColor="#ff5555"
                      title="加载中..."
                      colors={['#FF5555']}
                      progressBackgroundColor="#fff"
                  />}
                  renderFooter={()=>{
                    return(
                    <View>
                      {(this.state.dataList ? this.state.dataList.length : 0 ) >= (Number(this.state.resultCount) ? this.state.resultCount : 1)?
                        <View style={{height: 30,justifyContent: 'center'}}>
                          <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多消息--</Text></View>
                        : <View></View>
                      }
                    </View>
                    )
                  }}
                />
                {this.state.backToTop ?
                  <TouchableOpacity activeOpacity={1} onPress={() => {this.refs._listView ? this.refs._listView.scrollTo({y: 0, animated: true}) : null}} style={styles_index.backToTop}>
                    <Image style={{width: Utils.normalize(50), height: Utils.normalize(50)}} source={Assets.backToTop}/>
                  </TouchableOpacity>
                : null}

                {this.state.brand ? <View style={styles_index.overlay}>
                  <View style={[styles.row, {maxHeight: Utils.height-Utils.normalize(188), overflow: 'hidden'}]}>
                    <View style={{maxHeight:Utils.height-Utils.normalize(188),backgroundColor:"#ffffff"}}>
                      <ListView
                      style={{width:Utils.normalize(140),maxHeight:Utils.height-Utils.normalize(154)}}
                      dataSource={this.state.brandList}
                      enableEmptySections = {true}
                      renderRow={(rowData)=>this._renderBrand(rowData)}
                      />
                    </View>
                    <View style={{maxHeight:Utils.height-Utils.normalize(188),backgroundColor:"#f6f6f6",flex: 1}}>
                      <ListView style={{width: Utils.width - Utils.normalize(140),maxHeight:Utils.height-Utils.normalize(188)}}
                      dataSource={this.state.seriesList}
                      enableEmptySections = {true}
                      renderRow={(rowData,sectionID,rowId)=>this._renderSeries(rowData,sectionID,rowId)}
                      />
                    </View>
                  </View>
                  <View onStartShouldSetResponder={() => this._onTouchUp()} style={{flex: 1,width: Utils.width, backgroundColor: 'transparent'}}></View>
                </View> : null}
                {this.state.model ? <View style={styles_index.overlay}>
                <View style={{maxHeight:Utils.height-Utils.normalize(188)}}>
                  <ListView
                  style={{width:Utils.width,maxHeight:Utils.height-Utils.normalize(188),backgroundColor: '#fff'}}
                  dataSource={this.state.modelList}
                  enableEmptySections = {true}
                  renderRow={(rowData,sectionID,rowId)=>this._renderModel(rowData,sectionID,rowId)} />
                </View>
                  <View onStartShouldSetResponder={() => this._onTouchUp()} style={{flex: 1,width: Utils.width, backgroundColor: 'transparent'}}></View>
                </View> : null}

                {this.state.color ? <View style={styles_index.overlay}>
                  <View style={{maxHeight:Utils.height-Utils.normalize(188)}}>
                      <ListView
                      style={{width:Utils.width,maxHeight: Utils.normalize(Math.ceil(this.state.colorData.length/3)*58 + 20), paddingRight: Utils.normalize(13),backgroundColor:'#fff'}}
                      contentContainerStyle={{flexDirection:'row',
                      flexWrap:'wrap'}}
                      dataSource={this.state.colorList}
                      enableEmptySections = {true}
                      renderRow={(rowData,sectionID,rowId)=>this._renderColor(rowData,sectionID,rowId)} />
                  </View>
                  <View onStartShouldSetResponder={() => this._onTouchUp()} style={{flex: 1,width: Utils.width, backgroundColor: 'transparent'}}></View>
                </View> : null}

                {this.state.other ? <View style={[styles_index.overlay]}  onPress={() => this._onTouchUp()}>
                  <View style={{maxHeight:Utils.height - Utils.normalize(188)}}>
                    <ScrollView style={{width:Utils.width,maxHeight:Utils.height - Utils.normalize(188),backgroundColor:'#fff'}}>
                      <Text style={styles_index.itemTitle}>状态</Text>
                      <View>
                          <ListView
                          style={{width:Utils.width,backgroundColor:'#fff', paddingRight: Utils.normalize(13),flex: 1}}
                          contentContainerStyle={{flexDirection:'row',flexWrap:'wrap'}}
                          dataSource={this.state.statusList}
                          enableEmptySections = {true}
                          renderRow={(rowData,sectionID,rowId)=>this._renderStatus(rowData,sectionID,rowId)} />
                      </View>
                      <Text  style={styles_index.itemTitle}>公司</Text>
                      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                      {
                        this.state.shopData.map((item, key)=>{
                          return(
                            <Card key={key}   style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3}}
                            name = {item.name}
                            state = {this.state.shopId}
                            id = {item.id}
                            width = {item.name.length <= 4?true:false}
                            onPress={()=>this._changeStatus(item,key,4,2)}
                              />
                          )
                        })
                      }
                      </View>
                      <Text  style={styles_index.itemTitle}>仓库</Text>
                      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                      {
                        this.state.wareData.map((item, key)=>{
                          return(
                            <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3}}
                            name = {item.name}
                            state = {this.state.wareId}
                            id = {item.id}
                            isArray = {true}
                            width = {(item.name && item.name.length <= 4)?true:false}
                            onPress={()=>this._changeStatus(item,key,4,3)}
                              />
                          )
                        })
                      }
                      </View>
                      <View style={{height: Utils.normalize(70)}}></View>
                    </ScrollView>
                    <View style={{flexDirection: 'row',backgroundColor: '#fff',width: Utils.width,height: Utils.normalize(50),position: 'absolute',bottom: Utils.normalize(0),left: 0, borderTopWidth: 0.5,borderColor:'#cccccc'}}>
                      <TouchableHighlight underlayColor={'transparent'} onPress={this._otherReset.bind(this)} style={{flex: 1}}>
                        <View style={{height: Utils.normalize(50),justifyContent: 'center', alignItems: 'center'}}>
                          <Text style={{color:'#387ff5'}}>重置</Text>
                        </View>
                      </TouchableHighlight>
                      <TouchableHighlight style={{flex: 1}} onPress={this._otherSure.bind(this)}>
                        <View style={{height: Utils.normalize(50),justifyContent: 'center', alignItems: 'center',backgroundColor: '#387ff5'}}>
                          <Text style={{color:'#fff'}}>确定</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                  <View onStartShouldSetResponder={() => this._onTouchUp()} style={{flex: 1,width: Utils.width, backgroundColor: 'transparent'}}></View>
                </View> : null}
                 {this.state.androidSet ? <View style={styles.overlay} onStartShouldSetResponder={()=>{this.m_setState({androidSet: false})}}>
                  <View style={{width: Utils.normalize(280),position:'absolute',backgroundColor:'#fff',left: (Utils.width - Utils.normalize(280) )/2, top: (Utils.height - Utils.normalize(100))/2,borderRadius: 4}}>
                    {
                      this.state.rowData.status == "0" ?
                      <View>
                        {this.state.ops.allot ? <TouchableHighlight underlayColor='#f2f2f2' onPress={this._allotPress.bind(this,this.state.rowData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                          <Text style={{fontSize: 17,marginLeft: 15}}>调拨</Text>
                        </TouchableHighlight> : null}
                        {this.state.ops.lock ? <TouchableHighlight underlayColor='#f2f2f2'  onPress={() => this._lockPress(this.state.rowData)}  style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                          <Text style={{fontSize: 17,marginLeft: 15}}>锁定</Text>
                        </TouchableHighlight> : null}
                      </View>
                      :
                      <View></View>
                    }
                    {
                      this.state.rowData.status == "2" && this.state.ops.allot ?
                      <View>
                        {this.state.ops.allot ? <TouchableHighlight underlayColor='#f2f2f2' onPress={this._allotPress.bind(this,this.state.rowData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                          <Text style={{fontSize: 17,marginLeft: 15}}>调拨</Text>
                        </TouchableHighlight> : null}
                        {this.state.ops.unlock ? <TouchableHighlight  underlayColor='#f2f2f2' onPress={() => this._unlock(1, this.state.rowData)} style={{height: Utils.normalize(50),justifyContent:'center'}}>
                          <Text style={{fontSize: 17,marginLeft: 15, color:'#fd7878'}}>解锁</Text>
                        </TouchableHighlight> : null}
                      </View>
                      :
                      <View></View>
                    }
                  </View>
                 </View> : <View></View>}

                {this.state.isLoading ?<Loading/> : <View></View>}
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
        top:Utils.andr21Normalize(104),
        bottom:0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        // backgroundColor: 'red',
        width: Utils.width,
        flex: 1,
        // flexDirection: 'row',
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
        marginRight: Utils.normalize(1),
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
        marginRight: Utils.normalize(1),
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
});
