
/**
 * Created by shiqian on 16/8/19
 */
'use strict'

import React, { Component } from 'react';
import {
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  ListView,
  RefreshControl,
  Modal,
  View,
  StyleSheet,
  Text,
  Animated,
  DeviceEventEmitter
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import ScrollableTabView, { ScrollableTabBar, } from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card,Button} from '../components';
import Suit from "../buy/suit";
import Others from "../buy/others";
import Boutique from './boutique';
import lodash from 'lodash';
import BeautyProduct from './beautyProduct';
import NewCar from './newCar';
import moment from 'moment';
import Insurance from './insurance'
import ExtendWarranties from './extendWarranties'

let seriesLists = [];
let modelLists = [{model_name:"不限",model_id:"0"}];
let suitData = [];
let othersData = [];
let othersDataPart = [];
let curSuitSearchData;
let exData = [];
let curText = '';
let seriesId = 0;  //车系
let modelId = 0; //车型
let timer;
let serachKey = '';
class Shopping extends Component{
    // 构造
      constructor(props) {
        super(props);
        var seriesList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        var modelList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}});
        // 初始状态
        this.state = {
          newBusiness:false, //新店显示界面
          newContent:'新车',//无上架车辆显示内容
          first:true, //首次加载searchtitle 显示不同的内容
          firstLoadNC:true,
          firstLoadPd:'',
          firstLoadBy:'',
          seriesList,
          modelList,
          count:'',//
          name:'',
          isLoading:'',
          pageFlag:'',
          data:'',//选购数据
          dataPd:[],
          dataNC:[],
          dataBy:[],
          dataIe:[],
          dataEw:[],
          dataOt:[],
          dataSu:[],
          param:{
            cartId:this.props.cartId,
            searchTwoOpen:false
          },
          tabBarData:[],
          selectModelId:'0', //通过改变此值判断显示那个筛选界面
          itemCount:'0',
          searchListBianSu:[],//变速
          searchIdBianSu:'0',
          cloneSearchIdBiansu:'0',//复制一份原数据
          searchListCheShen:[], //车身数据
          searchIdCheShen:'0',
          cloneSearcherchIdCheShen:'0',
          searchListplrng:[],   //排量
          searchIdplrng:'null',//初始化默认不限,个别原因不能为0
          cloneSearcherchIdplrng:'null',
          showSearchContent:false,  //显示哪个筛选框


          searchListTypes:[],  //精品关联车系数据
          searchIdTypes:['0'],
          cloneSearchIdTypes:['0'],
          searchListSplbmsp:[],//精品类别数据
          searchIdSplbmsp:'0',
          cloneSearchIdSplbmsp:'0',
          searchNameSplbmsp:'',
          cloneSearchNameSplbmsp:'',

          searchListIe:[], //保险相关数据
          searchIdIe:'0' ,//保险相关数据
          cloneSearchIdIe:'0', //保险相关数据

          searchListEw:[],//延长质保相关数据
          searchIdEw:['0'],//延长质保相关数据
          cloneSearchIdEw:['0'],
          rightBtnShow: true, //searchBar右边按钮是否显示
          vehicleCount:0,

          searchListBy:[],//汽车美容相关数据
          searchIdBy:['0'],//汽车美容选中id
          cloneSearchIdBy:['0'],
          footShow: false,
          aniList:new Animated.Value(Utils.height),
        };
      }

  componentDidMount() {
    this.setState({isLoading:true});
    this.handleChangeTab({i:0})
    if(this.state.param.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.state.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
        }
      );
    }
    let that = this;
    this.subscription = DeviceEventEmitter.addListener('update',function (cartId) {
        if(that.state.param.cartId!=''){
           that._addListener(cartId)
        }else{
          if(cartId){
            let _param = that.state.param;
            _param.cartId = cartId;
            that.setState(
              {param:_param}
            )
            that._addListener(cartId)
          }
        }

    });
    //变速接口信息,车身接口信息,排量接口信息,类别,关联车系
    Utils.fetch(Utils.api.load,'post',{keys:'nc_p_biansu,nc_p_cheshen,nc_p_plrng,pd_types,pdsplbmsp,ie_supplier,ew_types,by_types'}).then(
      (res)=>{
        if(res){
          res['nc_p_biansu'].unshift({nm:"不限",vl: 0});
          res['nc_p_cheshen'].unshift({nm:"不限",vl: 0});
          res['nc_p_plrng'].unshift({nm:"不限",vl: 'null'});
          res['pdsplbmsp'].unshift({nm:"不限"});
          res['ie_supplier'].unshift({nm:"不限",vl: '0'});
          if(res['by_types']!=null){
            res['by_types'].unshift({name:"不限",id: '0'});
          }
          if(res['pd_types']!=null){
              res['pd_types'].unshift({name:"不限",id: '0'});
          }
          if(res['ew_types']!=null){
            res['ew_types'].unshift({name:"不限",id: '0'});
          }
          _.forEach(res['pdsplbmsp'],function (value,key) {
            value.id = key
          });
          this.setState({
            searchListBianSu:res['nc_p_biansu'],
            searchListChechen:res['nc_p_cheshen'],
            searchListplrng:res['nc_p_plrng'],
            searchListTypes:res['pd_types'],
            searchListSplbmsp:res['pdsplbmsp'],
            searchListIe:res['ie_supplier'],
            searchListEw:res['ew_types'],
            searchListBy:res['by_types']==null?[]:res['by_types']
          })
        }
      }
    );
  }
  componentWillUnmount(){
    curSuitSearchData = null;
    seriesId = 0;  //车系
    modelId = 0; //车型
    this.subscription.remove();
    if(this.state.param.cartId!=''){
      DeviceEventEmitter.emit('upDataCartId',this.state.param.cartId)
    }
  };
  componentWillReceiveProps(nextprops) {
    let _tempCart = this.state.param.cartId==''?nextprops.cartId:this.state.param.cartId;
    let _param = this.state.param;
    _param.cartId = _tempCart;
    this.setState({
      param:_param
    })
    if(_tempCart!=''){
      Utils.fetch(Utils.api.get,'post',{id:_tempCart}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
          if(this.state.selectModelId == '5'){
            let _data = _.cloneDeep(othersDataPart)
            if(res.items){
              if(res.items['6']){
                let _dataRes1 = res.items['6'];
                for(var j = 0;j < _data.length;j++){
                  let flag = false;
                  for(var i = 0;i < _dataRes1.length;i++){
                    if(_dataRes1[i].class_id == _data[j].id){
                      flag = true;
                    }
                  }
                  _data[j].active = flag;
                }

              } else {
                (_data).forEach(function(v,i){
                  _data[i].active = false;
                });
              }
            }
            _data.pageFlag = 'Ot'
            this.setState({count:res.count,data:_data})
          }
          if(this.state.selectModelId == '2'){
             let _data = _.cloneDeep(this.state.data);
            if(res.items){
              if(res.items['4']){
                let _dataRes1 = res.items['4'];
                for(var j = 0;j < _data.length;j++){
                  let flag = false;
                  for(var i = 0;i < _dataRes1.length;i++){
                    if(_dataRes1[i].class_id == _data[j].id){
                      flag = true;
                    }
                  }
                  _data[j].active = flag;
                }

              } else {
                (_data).forEach(function(v,i){
                  _data[i].active = false;
                });
              }
            }
            _data.pageFlag = 'By';
            this.setState({count:res.count,data:_data})
          }
        }
      );
    }
  }
  _addListener(cartId){
    Utils.fetch(Utils.api.get,'post',{id:cartId}).then(
      (res)=>{
        this.setState({itemCount:res.common['item_count']})
        if(this.state.selectModelId=='2'){
          this._checkClick('2')
        }
        if(this.state.selectModelId=='5'){
          this._checkClick('5')
        }
      }
    );
  }
  //返回上一级
  _goBack(){
    seriesId = 0;  //车系
    modelId = 0; //车型
    if(this.props.page=='index'){
      let that = this;
      setTimeout(function () {
        Actions.pop({refresh:{isFresh:false,onFresh:true,active:false,cartId:that.state.param.cartId}})
      },0)
    }else if(this.props.page=='cartDetail'){
      setTimeout(function () {
        Actions.pop({refresh:{isFresh:true,onFresh:false,active:false}})
      },0)
    }else {
      Actions.pop()
    }
  }
  //显示搜索界面
  _showSearch(){
    this.refs.searchInput && this.refs.searchInput.refs.searchInput.blur();
    switch (this.state.selectModelId){
      case '0':
        if(this.state.showSearchContent=='NC'){
          this._onTouchUp()
        }else{
          this.setState({showSearchContent:'NC'})
        };
        break;
      case '1':
        if(this.state.showSearchContent=='Pd'){
          this._onTouchUpPd();
        }else{
          this.setState({showSearchContent:'Pd'})
        };
        break;
      case '2':
        if(this.state.showSearchContent=='By'){
          this._onTouchUpBy();
          this.setState({showSearchContent:false})
        }else{
          this.setState({showSearchContent:'By'})
        };
        break;
      case '3':
        if(this.state.showSearchContent=='Ie'){
          this._onTouchUpIe();
        }else{
          this.setState({showSearchContent:'Ie'})
        };
        break;
      case '4':
        if(this.state.showSearchContent=='Ew'){
          this._onTouchUpEw();
        }else{
          this.setState({showSearchContent:'Ew'})
        };
        break;
      case '6':
        if(this.state.showSearchContent=='Su'){
          this.setState({showSearchContent:false})
        }else{
          this.setState({showSearchContent:'Su'})
        };
        break;
    }

  }

  // 筛选套装
  _suitSearch(){
    let _patt = curText != '' ? new RegExp(curText) : '';
    //关联车系
    let curSuitData = [];
    let _Sid = seriesId , _Mid = modelId;
    if(_Sid != 0){
      suitData.forEach(function(val,i){
        if(val.asso_types != ''){
          (val.asso_types).forEach(function(val2,j){
            if(val2.type_id == _Sid){
              curSuitData.push(val);
            }
          })
        }
      });
    } else {
      curSuitData = suitData;
    }
    //关联车型
    let curSuitData2 = [];
    if(_Mid != 0){
      curSuitData.forEach(function(val,i){
        (val.asso_types).forEach(function(val2,j){
          (val2.models).forEach(function(val3,k){
            if(val3.model_id == _Mid){
              curSuitData2.push(val)
            }
          })
        })
      })
    } else {
      curSuitData2 = curSuitData;
    }
    //输入框文字
    let curSuitData3 = [];
    if(curText != ''){
      curSuitData2.forEach(function(val,i){
        if(_patt.test(val.name)){
          curSuitData3.push(val)
        }
      })
    } else {
      curSuitData3 = curSuitData2;
    }
    curSuitData3.pageFlag = 'Su';
    this._searchType((curText == '' && _Sid == 0 && _Mid ==0) || curSuitData3.length == 0);
    if(curSuitData3.length==0 && curText == '' && _Sid == 0 && _Mid == 0){
      this.setState({newBusiness:true})
    }else{
      this.setState({newBusiness:false})
    }
    this.setState({dataSu: curSuitData3,name:'套装',count: curSuitData3.length,footShow: (curText == '' && _Sid == 0 && _Mid ==0) || curSuitData3.length == 0 ? false : true})
    //this._titleMsg(curSuitData3,'套装','Su')
  }
  // 套装关联车系
  _renderSeries(rowData){
    return(
        <View style={{backgroundColor:seriesId == rowData.type_id ? '#f6f6f6' : '#fff',width:Utils.normalize(140)}}>
          <TouchableHighlight underlayColor={'transparent'} onPress={()=>this._setSeries(rowData)}>
            <View style={[nc_styles.fullSonButtonGroup]}>
              <Text numberOfLines={2} style={seriesId == rowData.type_id ? nc_styles.itemActive: nc_styles.itemNoActive}>{rowData.type_name}</Text>
            </View>
          </TouchableHighlight>
        </View>
    )
  }

  _renderModel(rowData,sectionID,rowId){
      return(
          <View style={{backgroundColor:'#f6f6f6'}}>
            <TouchableHighlight underlayColor={'transparent'} onPress={()=>this._changeStatusSu(rowData)}>
              <View style={[nc_styles.fullSonButtonGroup,{backgroundColor:'#f6f6f6'}]}>
                <Text numberOfLines={2} style={[modelId == rowData.model_id ? nc_styles.itemActive: nc_styles.itemNoActive,{marginRight: 35}]}>
                  {rowData.model_name}
                </Text>
                {modelId == rowData.model_id ?<Icon style={{position:'absolute',right:14,top:Utils.normalize(16)}} name='md-checkmark' size={20} color="#387ff5" />:null}
              </View>
            </TouchableHighlight>
          </View>
      )
  }

  _setSeries(rowData){
    let arr = [],seriesArr = lodash.cloneDeep(seriesLists);
    if(rowData.type_id == 0){
      curSuitSearchData = null;
      modelLists = [{model_name:"不限",model_id:"0"}];
      seriesId = rowData.type_id;
      modelId = 0,
      this.setState({seriesList: this.state.seriesList.cloneWithRows(seriesArr),modelList: this.state.modelList.cloneWithRows(modelLists)});
    }
    else {
      if(rowData.models){
        curSuitSearchData = rowData;
        arr = lodash.cloneDeep(rowData.models);
        arr.unshift({model_name:"不限",model_id:"0"})
        modelLists = arr;
        seriesId = rowData.type_id;
        modelId = 0;
        this.setState({seriesList: this.state.seriesList.cloneWithRows(seriesArr),modelList: this.state.modelList.cloneWithRows(arr)});
      }
    }

    this._suitSearch();
  }

  _changeStatusSu(rowData){
    let _d = lodash.cloneDeep(modelLists);
    modelId = rowData.model_id;
    this.setState({modelList: this.state.modelList.cloneWithRows(_d),showSearchContent: false});
    this._suitSearch();
  }

  //搜索其它
  _searchOthers(){
    this.setState({isLoading:true});
    let _patt = curText != '' ? new RegExp(curText) : '';
    let curSuitData = [];
    if(curText != ''){
      othersData.forEach(function(val,i){
        if(_patt.test(val.name)){
          curSuitData.push(val)
        }
      });
      this.setState({newBusiness:false})
    } else {
      curSuitData = othersData;
      if(curSuitData.length==0){
        this.setState({newBusiness:true})
      }else{
        this.setState({newBusiness:false})
      }
    }
    if(this.state.param.cartId==''){
      curSuitData.pageFlag = 'Ot';
      this._searchType(curText == '' && curSuitData.length == 0);
      this.setState({footShow:(curText == '' && curSuitData.length == 0 ? false : true)})
      this._titleMsg(curSuitData,'其它','Ot')
    }
   if(this.state.param.cartId!=''){
     Utils.fetch(Utils.api.get,'post',{id:this.state.param.cartId}).then(
       (res1)=>{
         let _data = curSuitData;
         othersDataPart = curSuitData;
         if(res1.items){
           if(res1.items['6']){
             let _dataRes1 = res1.items['6'];
             for(var j = 0;j < curSuitData.length;j++){
               let flag = false;
               for(var i = 0;i < _dataRes1.length;i++){
                 if(_dataRes1[i].class_id == curSuitData[j].id){
                   flag = true;
                 }
               }

               _data[j].active = flag;
             }

           } else {
             (_data).forEach(function(v,i){
               _data[i].active = false;
             });
           }
         }
         _data.pageFlag = 'Ot';
         this._searchType(curText == '' || _data.length == 0);
         this.setState({footShow:(curText == '' || _data.length == 0 ? false : true)})
         this._titleMsg(_data,'其它','Ot')
       }
     );
   }

  }

  _searchWithName(text){
    clearTimeout(timer);
    serachKey = text;
    let that = this;
    timer = setTimeout(function () {
      switch (that.state.selectModelId){
        case '0':
          that._confirm(text);
          break;
        case '1':
          that._confirmPd(text);
          break;
        case '2':
          that._confirmBy(text);
          break;

        case '3':
          that._confirmIe(text);
          break;
        case '4':
          curText = text.trim();
          that._confirmEw(text);
          break;
        case '5':
          curText = text.trim();
          that._searchOthers();
          break;
        case '6':
          curText = text.trim();
          that._suitSearch();
          break;
      }
    },500);
  }
  //导航栏变化时调用接口
  _checkClick(rowId,flag){
    (this.refs.searchInput).refs.searchInput.clear();
    this.setState({isLoading:true,footShow:false});
    curText = '';
    switch(rowId)
    {
      case "0":
        this.setState({selectModelId:rowId,rightBtnShow:true});
        this._confirm();
        break;
      case "1":
        this.setState({selectModelId:rowId,rightBtnShow:true});
        this._confirmPd('',flag);
        break;
      case "2":
        this._confirmBy('',flag);
        break;
      case "3":
        this.setState({selectModelId:rowId,rightBtnShow:true});
        this._confirmIe();
        break;
      case "4":
      if(this.state.searchListEw==null){
        this.setState({selectModelId:rowId,rightBtnShow:false})
      }else {
        this.setState({selectModelId:rowId,rightBtnShow:true})
      }
        this._confirmEw();
        break;
      case "5":
        this.setState({selectModelId:rowId,rightBtnShow:false})
        Utils.fetch( Utils.api.queryOt, 'post', {}).
        then((res)=>{
          if(res){
            if (res.list) {
              othersData = res.list;
              othersDataPart = othersData;
            }
            if(othersData.length==0){
              this.setState({newBusiness:true})
            }else{
               this.setState({newBusiness:false})
            }
            this._titleMsg(res,'其它','Ot')
          }
        });
        break;
      case "6":
        this.setState({selectModelId:rowId,rightBtnShow:true})
        Utils.fetch( Utils.api.querySu, 'post', {}).
        then((res)=>{
          if(res){
            suitData = [];
            let list = [];
            if(res.types){
              if(res.types.length < 1){
                this.setState({rightBtnShow:false})
              }
              list = res.types;
              list.unshift({type_name:"不限",type_id:"0"});
              seriesLists = list;
            }
            if(res.list){
              let curTime = new Date().getTime();
              let that = this;
              _.forEach(res.list,(d,k)=>{
                let midTime = 0;
                if(d.end_time){
                  midTime = moment(d.end_time)
                }
                if(midTime > curTime || midTime == 0){
                  suitData.push(d)
                }
              });
            }
            if(curSuitSearchData){
              let arr = [],seriesArr = lodash.cloneDeep(seriesLists);
              if(curSuitSearchData.type_id == 0){
                modelLists = [{model_name:"不限",model_id:"0"}];
                this.setState({seriesList: this.state.seriesList.cloneWithRows(seriesArr),modelList: this.state.modelList.cloneWithRows(modelLists)});
              }
              else {
                if(curSuitSearchData.models){
                  arr = lodash.cloneDeep(curSuitSearchData.models);
                  arr.unshift({model_name:"不限",model_id:"0"})
                  modelLists = arr;
                  this.setState({seriesList: this.state.seriesList.cloneWithRows(seriesArr),modelList: this.state.modelList.cloneWithRows(arr)});
                }
              }
            } else {
              this.setState({seriesList: this.state.seriesList.cloneWithRows(list),modelList: this.state.modelList.cloneWithRows([{model_name:"不限",model_id:"0"}])});
            }
            if(suitData.length==0){
              this.setState({newBusiness:true})
            }else{
               this.setState({newBusiness:false})
            }
            this._titleMsg(res,'套装','Su')
          }
        });
      break
    }
  }
  //标题内容变化
  _titleMsg(res,name,pageFlag,flag){
    this.setState({isLoading:true});
    if(this.state.param.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.state.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
        }
      );
    }
    switch(pageFlag){
      case 'Pd' :
        let newData = [];
        //对数据进行格式转换
        let dataSource =res.list;
        //第一层 汽车装饰,维修保养,美容清晰 车载电器四个
        _.forIn(dataSource,function (v,k) {
          //第二层
          _.forIn(v,function (v1,k1) {
            //第三层
            _.forIn(v1,function (v2,k2) {
              //第四层取得数据
              _.forIn(v2,function (v3,k3) {
                v3.flag = k3
                newData.push(v3);
              })
            })
          })
        })
        newData.pageFlag='Pd';
        this.setState({isLoading:false,count:res.count,name:name,dataPd:newData,pageFlag:pageFlag})
        break;
      case 'By' :
      if(this.state.param.cartId!=''){
        Utils.fetch(Utils.api.get,'post',{id:this.state.param.cartId}).then(
          (res1)=>{
            var _data = _.cloneDeep(res.list)==null?{}:_.cloneDeep(res.list);
            if(res1.items){
              if(res1.items['4']){
                _.forEach(res1.items['4'],(data,key)=>{
                  _.forEach(res.list,(data1,key1)=>{
                    if(data['class_id']==data1.id){
                      _data[key1].active = true
                    }else{
                      data1.active = false;
                    }
                  })
                })
              }else{
                _.forEach(res.list,(data1,key1)=>{
                  if(_data['class_id']==data1.id){
                    _data[key1].active = true
                  }else{
                    _data[key1].active = false;
                  }
                })
              }
            }
            _data.pageFlag='By';
          this.setState({isLoading:false,countBy:res.count,name:name,dataBy:_data,pageFlag:pageFlag})
          }
        );
      }else{
          var _data = _.cloneDeep(res.list)==null?{}:_.cloneDeep(res.list);
          _data.pageFlag='By';
          this.setState({isLoading:false,count:res.count,name:name,dataBy:_data,pageFlag:pageFlag})
      }
        break;
      case 'Ie' :
      if(this.state.param.cartId!=''){
        Utils.fetch(Utils.api.get,'post',{id:this.state.param.cartId}).then(
          (res1)=>{
            if(res.list!=null){
              var _data = _.cloneDeep(res.list);
              if(res1.items&&res1.items['3']){
                _.forEach(res1.items['3'],(data,key)=>{
                  _.forEach(res.list,(data1,key1)=>{
                    if(data['class_id']==data1.id){
                      _data[key1].active = true
                    }else{
                      data1.active = false;
                    }
                  })
                })
              }
              _data.pageFlag = 'Ie';
              this.setState({showSearchContent:false,isLoading:false,count:res.count,name:name,dataIe:_data,pageFlag:pageFlag})
            }else{
              this.setState({showSearchContent:false,isLoading:false,count:res.count,name:name,dataIe:[],pageFlag:pageFlag})
            }

          }
        );
      }else {
         if (res.list!=null) {
             var _data = _.cloneDeep(res.list);
             _data.pageFlag = 'Ie';
             this.setState({showSearchContent:false,isLoading:false,count:res.count,name:name,dataIe:_data,pageFlag:pageFlag})
         }else{
           this.setState({showSearchContent:false,isLoading:false,count:res.count,name:name,dataIe:[],pageFlag:pageFlag})
         }
      }
        break;
      case 'Ot' :
      if(this.state.param.cartId!=''){
        Utils.fetch(Utils.api.get,'post',{id:this.state.param.cartId}).then(
          (res1)=>{
            let _data = _.cloneDeep(res.list)==null?{}:_.cloneDeep(res.list);
            if(res1.items){
              if(res1.items['6']){
                let _dataRes1 = res1.items['6'];
                for(var j = 0;j < res.list.length;j++){
                  let flag = false;
                  for(var i = 0;i < _dataRes1.length;i++){
                    if(_dataRes1[i].class_id == res.list[j].id){
                      flag = true;
                    }
                  }

                  _data[j].active = flag;
                }

              } else {
                if(res.list!=null){
                  (res.list).forEach(function(v,i){
                    _data[i].active = false;
                  });
                }
              }
            }
            _data.pageFlag = 'Ot'
            this.setState({pageFlag:'Ot',isLoading:false,count:res.count,name:name,dataOt:_data})
          }
        );
      }else{
          let _data = _.cloneDeep(res.list)==null?{}:_.cloneDeep(res.list);
          _data.pageFlag = 'Ot'
          this.setState({pageFlag:'Ot',isLoading:false,count:res.count,name:name,dataOt:_data})
      }

        break;
      case 'NC' :
        if(res.list==null){
          res.list={};
          res.list.pageFlag ='NC';
        }else {
            res.list.pageFlag ='NC';
        }
        this.setState({isLoading:false,count:res.count,name:name,dataNC:res.list,pageFlag:pageFlag,vehicleCount: Object.keys(res.list).length-1});
        break;
      case 'Su' :
        if(res.list==null){
          res.list={};
          res.list.pageFlag ='Su';
        }else {
            res.list.pageFlag ='Su';
        }
        this.setState({isLoading:false,name:name,pageFlag:pageFlag});
        this._suitSearch();
        break;
      case 'Ew':
        if(res.list==null){
          res.list={};
          res.list.pageFlag ='Ew';
        }else {
            res.list.pageFlag ='Ew';
        }
        this.setState({isLoading:false,count:res.count,name:name,dataEw:res.list,pageFlag:pageFlag});
      default:
        this.setState({isLoading:false,count:res.count,name:name,dataEw:res.list,pageFlag:pageFlag})

    }
  }
  //新车筛选框逻辑
  _changeStatus(rowData,rowId,other){
      switch (other){
        case 1 :
          //设置边框颜色
          let searchListBianSu = _.cloneDeep(this.state.searchListBianSu);
          this.setState({searchIdBianSu:rowData.vl.toString(), searchListBianSu:searchListBianSu})
          break
        case 2 :
          //设置边框颜色
          let searchListCheShen = _.cloneDeep(this.state.searchListCheShen);
          this.setState({searchIdCheShen:rowData.vl.toString(), searchListCheShen:searchListCheShen})
          break
        case 3 :
          //设置边框颜色
          let searchListplrng = _.cloneDeep(this.state.searchListplrng);
          this.setState({searchIdplrng:rowData.vl.toString(), searchListplrng:searchListplrng})
          break
      }

  }
  //精品筛选框逻辑
  _changeStatusPd(rowData,rowId,other){
    switch (other){
      case 1 :
        //设置边框颜色
        let searchListSplbmsp = _.cloneDeep(this.state.searchListSplbmsp);
        this.setState({searchIdSplbmsp:rowData.id.toString(), searchNameSplbmsp:rowData.nm, searchListSplbmsp:searchListSplbmsp})
        if(this.state.searchListTypes==null){
          this._confirmPd();
        }
        break
      case 2 :
        //设置边框颜色
        let  searchListTypes = _.cloneDeep(this.state.searchListTypes);
        let  searchIdTypes = _.cloneDeep(this.state.searchIdTypes);
        let  index = searchIdTypes.indexOf(rowData.id);
        //对不限与类别的操作
        if(rowData.id == '0'){
          searchIdTypes = ['0']
        } else{
          if(index === -1){
            searchIdTypes.push(rowData.id)
          }else{
            searchIdTypes.splice(index,1)
          }
          var noSetIndex = searchIdTypes.indexOf('0')
          if(noSetIndex != -1){
            searchIdTypes.splice(noSetIndex,1);
          }
        }
        if(searchIdTypes.length==0){
          searchIdTypes.push('0');
        }
        this.setState({searchIdTypes:searchIdTypes, searchListTypes:searchListTypes})
        break
    }

  }
  //保险筛选框
  _changeStatusIe(rowData,rowId){
        //设置边框颜色
        let searchListIe = _.cloneDeep(this.state.searchListIe);
        this.setState({searchIdIe:rowData.vl, searchListIe:searchListIe})
        this._confirmIe(serachKey,rowData);
  }
  //延长质保筛选框
  _changeStatusEw(rowData,rowId){
        //设置边框颜色
        let  searchListEw = _.cloneDeep(this.state.searchListEw);
        let  searchIdEw = _.cloneDeep(this.state.searchIdEw);
        let  index = searchIdEw.indexOf(rowData.id);
        //对不限与类别的操作
        if(rowData.id == '0'){
          searchIdEw = ['0']
        } else{
          if(index === -1){
            searchIdEw.push(rowData.id)
          }else{
            searchIdEw.splice(index,1)
          }
          var noSetIndex = searchIdEw.indexOf('0')
          if(noSetIndex != -1){
            searchIdEw.splice(noSetIndex,1);
          }
        }
        if(searchIdEw.length==0){
          searchIdEw.push('0')
        }
        this.setState({searchIdEw:searchIdEw, searchListEw:searchListEw})
  }
  //精品美容筛选框
  _changeStatusBy(rowData,rowId){
    //设置边框颜色
    let  searchListBy = _.cloneDeep(this.state.searchListBy);
    let  searchIdBy = _.cloneDeep(this.state.searchIdBy);
    let  index = searchIdBy.indexOf(rowData.id);
    //对不限与类别的操作
    if(rowData.id == '0'){
      searchIdBy = ['0']
    } else{
      if(index === -1){
        searchIdBy.push(rowData.id)
      }else{
        searchIdBy.splice(index,1)
      }
      var noSetIndex = searchIdBy.indexOf('0')
      if(noSetIndex != -1){
        searchIdBy.splice(noSetIndex,1);
      }
    }
    this.setState({searchIdBy:searchIdBy, searchListBy:searchListBy})
  }
  _onTouchUp() {
      this.setState({
        showSearchContent:false,
        searchIdBianSu:this.state.cloneSearchIdBiansu,
        searchIdCheShen:this.state.cloneSearcherchIdCheShen,
        searchIdplrng:this.state.cloneSearcherchIdplrng
      })
  }
  _onTouchUpPd(){
    this.setState({
      showSearchContent:false,
      searchIdTypes:this.state.cloneSearchIdTypes,
      searchIdSplbmsp:this.state.cloneSearchIdSplbmsp,
      searchNameSplbmsp:''
    })
  }
  _onTouchUpIe(){
    this.setState({
      showSearchContent:false,
      searchIdIe:this.state.cloneSearchIdIe,
    })
  }
  _onTouchUpEw(){
    this.setState({
      showSearchContent:false,
      searchIdEw:this.state.cloneSearchIdEw,
    })
  }
  _onTouchUpBy(){
    this.setState({
      showSearchContent:false,
      searchIdBy:this.state.cloneSearchIdBy,
    })
  }
  //用于判断是默认查询还是有搜索条件
  _searchType(searchType,flag){
    this.setState({first:searchType})
  }
  //新车查询条件确定
  _confirm(text){
    if(text){
      text = text.replace(/\s/g,"")
    }
      this.setState({isLoading:true});
      let searchIdplrng = [];
      let params={};
      if(this.state.searchIdBianSu!='0'){
        params.biansu = this.state.searchIdBianSu
      }
      if(this.state.searchIdCheShen!='0'){
        params.cheshen = this.state.searchIdCheShen
      }
      if(this.state.searchIdplrng!='null'){
        let strs=this.state.searchIdplrng.split(",");
        params['pl_h'] = strs[1];
        params['pl_l'] = strs[0];
      }
      this.setState({
        cloneSearchIdBiansu:this.state.searchIdBianSu,
        cloneSearcherchIdCheShen:this.state.searchIdCheShen,
        cloneSearcherchIdplrng:this.state.searchIdplrng,
      })
      let noShop = ((text == ''||typeof(text)=="undefined") && this.state.searchIdBianSu == '0' && this.state.searchIdCheShen == '0' &&this.state.searchIdplrng=='null')
      this.setState({first:noShop})
    //  this._searchType(noShop);
    if(!noShop){
      this.state.param.searchTwoOpen = true;
    }else{
      this.state.param.searchTwoOpen = false;
      }
      var searchCarCount = 0;
      Utils.fetch(Utils.api.queryNC,'Post' ,params).then(
        (res)=>{
          this.setState({showSearchContent:false,isLoading:false});
          //当为新店的时候显示‘暂无上架车辆提示’
         if(res.list==0&&this.state.searchIdBianSu==0&&this.state.searchIdCheShen==0&&this.state.searchIdplrng=='null'){
           this.setState({newBusiness:true})
         }else{
            this.setState({newBusiness:false})
         }
         //第一次筛选得到
          let test = eval('/'+text+'/i')
          _.forIn(res.list,function (value,key) {
            _.forIn(value.arr,function (value1,key1) {
              if(test!=''&&test!=undefined){
                if((!test.test(value1.mnm))&&typeof(text)!="undefined"){
                  delete value.arr[key1]
                }
              }
            })
          })
          _.forIn(res.list,function (value,key) {
            value.count = Object.keys(value.arr).length;
            if(Object.keys(value.arr).length==0){
              delete res.list[key]
            }
            searchCarCount = searchCarCount+ value.count
          })
          res.count = searchCarCount
          res.vehicleCount = Object.keys(res.list).length;
          this.setState({footShow: noShop || Object.keys(res.list).length == 0 ? false : true})
          this._titleMsg(res,'新车','NC')
          // let data = {i:0}
          // this.handleChangeTab(data)
        }
      )
  }
  //精品查询条件确定
  _confirmPd(text,flag){
    if(text){
      text = text.replace(/\s/g,"")
    }
    let that = this;
    setTimeout(function(){
      that.setState({isLoading:true})
        let params ={
          tm:1,
          tids:that.state.searchIdTypes,
          bc:that.state.searchNameSplbmsp=='不限'?'':that.state.searchNameSplbmsp
        }
     let noShop = ((text == ''||typeof(text)=="undefined") && that.state.searchIdTypes[0] == '0'&&that.state.searchIdTypes.length==1&& that.state.searchNameSplbmsp == '');
     that.setState({first:noShop})
     if(that.state.searchIdTypes.indexOf('0')<0){
           params.tm = 3
        }
        if(text!=''){
          params.name=text
        }
       that.setState({
         cloneSearchIdTypes:that.state.searchIdTypes,
         cloneSearchIdSplbmsp:that.state.searchIdSplbmsp,
         cloneSearchNameSplbmsp:that.state.searchNameSplbmsp
       })
      Utils.fetch(Utils.api.queryPd,'Post' ,params).then(
        (res)=>{
          //当为新店的时候显示‘暂无上架精品提示’
          if(Object.keys(res.list).length == 0&&that.state.searchIdTypes.length==1&&that.state.searchIdSplbmsp==0&&(text == ''||typeof(text)=="undefined")){
            that.setState({newBusiness:true})
          }else{
              that.setState({newBusiness:false})
          }
          that.setState({showSearchContent:false,isLoading:false});
          that.setState({footShow: noShop || Object.keys(res.list).length == 0 ? false : true});
          that._titleMsg(res,'精品','Pd');
        }
      )
    },100)
   }
  //保险查询条件确定
  _confirmIe(text,rowData){
    if(text){
      text = text.replace(/\s/g,"")
    }
    this.setState({isLoading:true});
    let params ={
      'supplier_id': rowData==undefined?this.state.searchIdIe:rowData.vl
    }
    let noShop = ((text == ''||typeof(text)=="undefined") && (rowData==undefined?this.state.searchIdIe:rowData.vl)=='0');
    this._searchType(noShop,'Ie');
    if(text!=''){
      params.name=text
    }
    this.setState({
      cloneSearchIdIe: rowData==undefined?this.state.searchIdIe:rowData.vl
    })
    Utils.fetch(Utils.api.queryIe,'Post' ,params).then(
      (res)=>{
        if(res.list == null&&this.state.searchIdIe==0&&(text == ''||typeof(text)=="undefined")){
          this.setState({newBusiness:true})
        }else{
          this.setState({newBusiness:false})
        }
        this.setState({footShow: noShop || res.list == null ? false : true});
        this._titleMsg(res,'保险','Ie')
      }
    )
  }
  //延长质保筛选条件
  _confirmEw(){
    let _patt = curText != '' ? new RegExp(curText) : '';
    this.setState({isLoading:true})
    let _data = [];
    let params ={
      tm:1,
      tids:this.state.searchIdEw,
    }
    let noShop = ((_patt == ''||typeof(_patt)=="undefined") && this.state.searchIdEw[0] == '0'&&this.state.searchIdEw.length==1);
    this._searchType(noShop);
    if(this.state.searchIdEw.indexOf('0')<0){
      params.tm = 3
    }
    this.setState({
      cloneSearchIdEw:this.state.searchIdEw,
    })
    Utils.fetch(Utils.api.queryEw,'Post' ,params).then(
      (res)=>{
        this.setState({showSearchContent:false,isLoading:false});
        if(res.list==null&&this.state.searchIdEw[0] == '0'&&this.state.searchIdEw.length==1){
          this.setState({newBusiness:true})
        }else{
          this.setState({newBusiness:false})
        }
        if(curText == ''){
          this._titleMsg(res,'延长质保','Ew');
        } else {
          if(res.list){
            res.list.forEach(function(val,i){
              if(_patt.test(val.name)){
                _data.push(val);
              }
            })
            _data.pageFlag = 'Ew';
            this.setState({footShow: noShop || _data.length == 0 ? false : true});
            this._titleMsg(_data,'延长质保','Ew')
          }
        }
      }
    )
  }
  //汽车美容筛选条件
  _confirmBy(text,rowData,flag){
    if(text){
      text = text.replace(/\s/g,"")
    }
    this.setState({isLoading:true})
    let params ={
      tm:1,
      tids:this.state.searchIdBy,
    }
    if(this.state.searchIdBy.indexOf('0')<0){
      params.tm = 3
    }
    this.setState({
      cloneSearchIdBy:this.state.searchIdBy,
    })
    let noShop = ((text == ''||typeof(text)=="undefined") && this.state.searchIdBy[0] == '0'&&this.state.searchIdBy.length==1);
    this.setState({first:noShop})
    Utils.fetch(Utils.api.queryBy,'Post' ,params).then(
      (res)=>{
        var _list = [];
        this.setState({showSearchContent:false,isLoading:false});
        if(res.list == null&& this.state.searchIdBy[0] == '0'&&this.state.searchIdBy.length==1){
          this.setState({newBusiness:true})
        }else{
          this.setState({newBusiness:false})
        }
        if(text){
         _.forEach(res.list,function (v,k) {
           if( v.name.indexOf(text)>=0){
            _list.push(v)
           }
         })
          res.list = _list;
          res.count = _list.length;
        }
        this.setState({footShow: noShop || res.list.length == 0 ? false : true});
        this._titleMsg(res,'汽车美容','By',flag)
      }
    )
  }
  handleChangeTab(data){
    this.setState({isLoading:true})
    this.setState({selectModelId:String(data.i)})
   if(this.state.searchListBy.length==0&&data.i==2){
      this.setState({rightBtnShow:false})
    }else {
      this.setState({rightBtnShow:true})
    }
    switch (data.i) {
      case 0:
        this._checkClick('0')
        break;
      case 1:
        this._checkClick('1')
        break;
      case 2:
        this._checkClick('2')
        break;
      case 3:
        this._checkClick('3')
        break;
      case 4:
        this._checkClick('4')
        break;
      case 5:
        this._checkClick('5')
        break;
      case 6:
        this._checkClick('6')
        break;
      default:

    }
  }
  //新车重置查询条件按钮
  _replace(){
    this.setState({
      searchIdBianSu:'0',
      searchIdCheShen:'0',
      searchIdplrng:'null',
    })
  }
  //精品查询条件重置
  _replacePd(){
    this.setState({
      searchIdTypes:['0'],
      searchIdSplbmsp:'0',
      searchNameSplbmsp:''
    })
  }
  //精品查询条件重置
  _replaceEw(){
    this.setState({
      searchIdEw:['0'],
    })
  }
  //汽车美容查询条件重置
  _replaceBy(){
    this.setState({
      searchIdBy:['0'],
    })
  }
  _openList(){
    let that =this
    setTimeout(()=>{
      Animated.timing(
       that.state.aniList,
       {
         toValue:  Utils.normalize(0),
         duration: 0,
       }
     ).start();
   },240)
  }
  _closeList(type){
    Animated.timing(
     this.state.aniList,
     {
       toValue: Utils.height,
       duration: 10,
     }
   ).start();
   if(type!=1){
     this.refs._list._closeList();
   }
  }
  _onScroll() {
  }
  changeData(value){
    this.setState({data:value})
  }
  render(){
    return(
      <View style={[styles.container]}>
        <SearchBar
           leftPress={()=>this._goBack()}
           textDefault={'以'+this.state.name+'名称搜索'}
           ref='searchInput'
           rightShow={this.state.rightBtnShow}
           rightPress = {()=>this._showSearch()}
           onFocus = {()=>this.setState({showSearchContent: ''})}
           changeText={(text)=>this._searchWithName(text)} />
           <SearchTitle count={this.state.count}  name={this.state.name} vehicleCount={this.state.vehicleCount} flag={this.state.pageFlag} first={this.state.first}/>
           <ScrollableTabView
              onChangeTab={(data)=>this.handleChangeTab(data)}
              initialPage={0}
              tabName={this.state.name}
              _onRefresh={()=> this._checkClick('0')}
              renderTabBar={() => <ScrollableTabBar style={{height:Utils.normalize(44)}} textStyle={{marginTop:Utils.normalize(-8)}} underlineStyle={{backgroundColor:'#387ff5',height:Utils.normalize(2),paddingLeft:4,paddingRight:4}}/>}
            >
            <NewCar  tabLabel='新车' dataSource={this.state.dataNC} param={this.state.param} foot={this.state.footShow}/>
            <Boutique tabLabel='精品' dataSource={this.state.dataPd} param={this.state.param} foot={this.state.footShow} />
            <BeautyProduct   ref="_list" tabLabel='汽车美容' dataSource={this.state.dataBy} param={this.state.param} openList={()=>this._openList()} closeList={()=>this._closeList(1)} foot={this.state.footShow}/>
            <Insurance  tabLabel='保险' dataSource={this.state.dataIe} param={this.state.param} foot={this.state.footShow}/>
            <ExtendWarranties  tabLabel='延长质保' dataSource={this.state.dataEw} param={this.state.param} foot={this.state.footShow} ></ExtendWarranties>
            <Others  ref="_list"  tabLabel='其它' dataSource={this.state.dataOt} param={this.state.param}  openList={()=>this._openList()} closeList={()=>this._closeList(1)} foot={this.state.footShow}/>
            <Suit tabLabel='套装' dataSource={this.state.dataSu} param={this.state.param} foot={this.state.footShow}/>
          </ScrollableTabView>
          <Animated.View
            onStartShouldSetResponder={() => this._closeList()}
            style={{position:'absolute',top:this.state.aniList, backgroundColor:'rgba(0, 0, 0, 0.4)',width:Utils.width,height:Device.iOS?Utils.normalize(109):Utils.normalize(107)}}>
          </Animated.View>
        {this.state.param.cartId!=''?
         <Cart itemCount={this.state.itemCount} id={this.state.param.cartId} popNumLength={2}/>:null}
        {
          // 新车筛选框
        }
        {this.state.showSearchContent=='NC' ?
          <View style={[nc_styles.overlay]}  onPress={() => this._onTouchUp()}>
          <ScrollView style={{width:Utils.width,maxHeight: Utils.height-Utils.normalize(188),backgroundColor:'#fff'}}>
            <Text  style={nc_styles.itemTitle}>变速</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
              {
                this.state.searchListBianSu.map((item, key)=>{
                  return(
                    <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 4, height: Utils.normalize(43)}}
                          name = {item.nm}
                          state = {this.state.searchIdBianSu}
                          id = {item.vl}
                          isArray = {true}
                          width = {(item.nm && item.nm.length <= 4)?true:false}
                          onPress={()=>this._changeStatus(item,key,1)}
                    />
                  )
                })
              }
            </View>
            <Text  style={nc_styles.itemTitle}>车身</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
              {
                this.state.searchListChechen.map((item, key)=>{
                  return(
                    <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 4, height: Utils.normalize(43)}}
                          name = {item.nm}
                          state = {this.state.searchIdCheShen}
                          id = {item.vl}
                          isArray = {true}
                          width = {(item.nm && item.nm.length <= 6)?true:false}
                          onPress={()=>this._changeStatus(item,key,2)}
                    />
                  )
                })
              }
            </View>
            <Text  style={nc_styles.itemTitle}>排量</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
              {
                this.state.searchListplrng.map((item, key)=>{
                  return(
                    <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 4, height: Utils.normalize(43)}}
                          name = {item.nm}
                          state = {this.state.searchIdplrng}
                          id = {item.vl}
                          isArray = {true}
                          width = {(item.nm && item.nm.length <= 8)?true:false}
                          onPress={()=>this._changeStatus(item,key,3)}
                    />
                  )
                })
              }
            </View>
            <View style={{height: Utils.normalize(70)}}></View>
          </ScrollView>
          <View style={{flexDirection:'row'}}>
            <Button value="重 置" pattern={{outLine:"equallyCanleButtom",text:"blockTextFont"}} onPress={() => this._replace()} />
            <Button value="确 定" pattern={{outLine:"equallyOkButtom",text:"fullText"}} onPress={() => this._confirm(serachKey)} />
          </View>
          <View onStartShouldSetResponder={() => this._onTouchUp()} style={{height: Utils.normalize(258),width: Utils.width, backgroundColor: 'transparent'}}></View>
        </View> : null}
        {
          //精品筛选框
        }
        {this.state.showSearchContent=='Pd'?
          <View style={[nc_styles.overlay]}  onPress={() => this._onTouchUp()}>
            <ScrollView style={{width:Utils.width,backgroundColor:'#fff',maxHeight: Utils.height-Utils.normalize(188)}}
                        ref="_listView"
                        onScroll={this._onScroll.bind(this)}
                        scrollEventThrottle={1}
            >
              <Text  style={nc_styles.itemTitle}>类别</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                {
                  this.state.searchListSplbmsp.map((item, key)=>{
                    return(
                      <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 4, height: Utils.normalize(43)}}
                            name = {item.nm}
                            state = {this.state.searchIdSplbmsp}
                            id = {item.id}
                            isArray = {true}
                            width = {(item.nm && item.nm.length <= 4)?true:false}
                            onPress={()=>this._changeStatusPd(item,key,1)}
                      />
                    )
                  })
                }
              </View>
              {
                  this.state.searchListTypes==null?null: <Text  style={nc_styles.itemTitle}>关联车系</Text>
              }
              <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                {
                this.state.searchListTypes==null?null:
                 this.state.searchListTypes.map((item, key)=>{
                    return(
                      <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3, height: Utils.normalize(43)}}
                            name = {item.name}
                            state = {this.state.searchIdTypes}
                            id = {item.id}
                            isArray = {true}
                            width = {(item.name && item.name.length <= 8)?true:false}
                            onPress={()=>this._changeStatusPd(item,key,2)}
                      />
                    )
                  })
                }
              </View>
              <View style={{height: Utils.normalize(30)}}></View>
            </ScrollView>
            <View style={{flexDirection:'row'}}>
              <Button value="重 置" pattern={{outLine:"equallyCanleButtom",text:"blockText"}} onPress={() => this._replacePd()} />
              <Button value="确 定" pattern={{outLine:"equallyOkButtom",text:"fullText"}} onPress={() => this._confirmPd(serachKey)} />
            </View>
            <View onStartShouldSetResponder={() => this._onTouchUpPd()} style={{height: Utils.normalize(600),width: Utils.width, backgroundColor: 'transparent'}}></View>
          </View>:null}
        {
          //保险筛选框
        }
        {this.state.showSearchContent=='Ie'?
          <View style={[nc_styles.overlay]}  onPress={() => this._onTouchUp()}>
            <ScrollView style={{width:Utils.width,backgroundColor:'#fff',maxHeight: Utils.height-Utils.normalize(188)}}>
              <Text style={nc_styles.itemTitle}>供应商</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                {
                  this.state.searchListIe.map((item, key)=>{
                    return(
                      <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 4, height: Utils.normalize(43)}}
                            name = {item.nm}
                            state = {this.state.searchIdIe}
                            id = {item.vl}
                            isArray = {false}
                            width = {(item.nm && item.nm.length <= 4)?true:false}
                            onPress={()=>this._changeStatusIe(item,key)}
                      />
                    )
                  })
                }
              </View>
              <View style={{height: Utils.normalize(30)}}></View>
            </ScrollView>
            <View onStartShouldSetResponder={() => this._onTouchUpIe()} style={{height: Utils.normalize(600),width: Utils.width, backgroundColor: 'transparent'}}></View>
          </View>:null}
        {
          //套装筛选框
        }
        {
          this.state.showSearchContent=='Su' ?
          <View style={nc_styles.hoverlay}  onPress={() => this._onTouchUp()}>
            <View style={{maxHeight: Utils.height-Utils.normalize(188)}}>
              <View style={{backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#ccc'}}>
                  <Text style={[nc_styles.itemTitle,{marginBottom:12}]}>关联车型</Text>
              </View>
              <View style={[styles.row]}>
                <View style={{backgroundColor:"#ffffff"}}>
                  <ListView
                  style={{width:Utils.normalize(140)}}
                  dataSource={this.state.seriesList}
                  enableEmptySections = {true}
                  renderRow={(rowData)=>this._renderSeries(rowData)}
                  />
                </View>
                <View style={{backgroundColor:"#f6f6f6",flex: 1}}>
                  <ListView style={{width: Utils.width - Utils.normalize(140)}}
                  dataSource={this.state.modelList}
                  enableEmptySections = {true}
                  renderRow={(rowData,sectionID,rowId)=>this._renderModel(rowData,sectionID,rowId)}
                  />
                </View>
              </View>
            </View>
            <View onStartShouldSetResponder={() => this._onTouchUp()} style={{flex: 1,width: Utils.width, backgroundColor: 'rgba(0,0,0,0.4)'}}></View>
          </View>
          : null
        }
        {
          //延长质保筛选框
        }
          {this.state.showSearchContent=='Ew'?
            <View style={[nc_styles.overlay]}  onPress={() => this._onTouchUp()}>
              <ScrollView style={{width:Utils.width,backgroundColor:'#fff', maxHeight: Utils.height-Utils.normalize(188)}}>
                <Text  style={nc_styles.itemTitle}>关联车系</Text>
                <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                  {
                    this.state.searchListEw.map((item, key)=>{
                      return(
                        <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3,height: Utils.normalize(43)}}
                              name = {item.name}
                              state = {this.state.searchIdEw}
                              id = {item.id}
                              isArray = {true}
                              width = {(item.name && item.name.length <= 8)?true:false}
                              onPress={()=>this._changeStatusEw(item,key)}
                        />
                      )
                    })
                  }
                </View>
                <View style={{height: Utils.normalize(30)}}></View>
              </ScrollView>
              <View style={{flexDirection:'row'}}>
                <Button value="重 置" pattern={{outLine:"equallyCanleButtom",text:"blockText"}} onPress={() => this._replaceEw()} />
                <Button value="确 定" pattern={{outLine:"equallyOkButtom",text:"fullText"}} onPress={() => this._confirmEw(serachKey)} />
              </View>
              <View onStartShouldSetResponder={() => this._onTouchUpEw()} style={{height: Utils.normalize(600),width: Utils.width, backgroundColor: 'transparent'}}></View>
            </View>:null}
        {
          //汽车美容筛选框
        }
        {this.state.showSearchContent=='By'?
          <View style={[nc_styles.overlay]}  onPress={() => this._onTouchUp()}>
            <ScrollView style={{width:Utils.width,backgroundColor:'#fff'}}>
              <Text  style={nc_styles.itemTitle}>关联车系</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                {
                  this.state.searchListBy.map((item, key)=>{
                    return(
                      <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3}}
                            name = {item.name}
                            state = {this.state.searchIdBy}
                            id = {item.id}
                            isArray = {true}
                            width = {(item.name && item.name.length <= 8)?true:false}
                            onPress={()=>this._changeStatusBy(item,key)}
                      />
                    )
                  })
                }
              </View>
              <View style={{height: Utils.normalize(30)}}></View>
            </ScrollView>
            <View style={{flexDirection:'row'}}>
              <Button value="重 置" pattern={{outLine:"equallyCanleButtom",text:"blockText"}} onPress={() => this._replaceBy()} />
              <Button value="确 定" pattern={{outLine:"equallyOkButtom",text:"fullText"}} onPress={() => this._confirmBy(serachKey)} />
            </View>
            <View onStartShouldSetResponder={() => this._onTouchUpBy()} style={{height: Utils.normalize(600),width: Utils.width, backgroundColor: 'transparent'}}></View>
          </View>:null}
          {this.state.isLoading ? <Loading></Loading>: null}
      </View>
    )
  }
}
const nc_styles = StyleSheet.create({
  "listContainer":{
    flex:1,
    height:Utils.height-Utils.normalize(140),
    paddingLeft:Utils.normalize(8),
    backgroundColor:"#fff"
  },
  'renderView':{
    flex:1,
    flexDirection: 'row',
    paddingBottom:8,
    paddingTop:8,
    borderBottomWidth:1,
    borderBottomColor:'#ccc'
  },
  'label':{
    marginTop:Utils.normalize(10),
    marginLeft:Utils.normalize(12),
  },
  orangeColor:{
    color:'#ff9000',
    fontSize:Utils.normalize(16),

  },
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
  },
  overlay:{
    position: 'absolute',
    top:Utils.andr21Normalize(64),
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: Utils.width,
    flex: 1,
  },
  hoverlay:{
    position: 'absolute',
    top:Utils.andr21Normalize(64),
    left: 0,
    height: Utils.normalize(Utils.height - 64),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: Utils.width,
    flex: 1,
  },
  grayColor:{
    color:'#999999',
    fontSize:Utils.normalize(14)
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
  itemActive: {
    color: '#387ff5'
  },
  itemNoActive: {
    color: '#666'
  },
});
export  default Shopping
