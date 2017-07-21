
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
    Text,
    Animated,
    StyleSheet,
    DatePickerIOS,
    DatePickerAndroid
} from 'react-native';
import Swipeout from '../components/react-native-swipeout';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon_FontAwesome from 'react-native-vector-icons/FontAwesome'
import {Utils, Assets, Device,_} from "../base";
import lodash from 'lodash';
import {Header, Loading, Button, Developing, Tip, Card} from '../components';
let isMounted = false,
    allBrandData = {},  //所有的品牌数据
    BrandClassData = [],  //品牌类别数据
    detailData = [],      //每个类别下的品牌数据
    allShopData = [],   //所有公司和仓库数据
    me_info = [],      //初始请求参数
    whichBrand ="",
    whichDetail = "",
    page = 1,
    searchParams,
    selectWares,   //当前选中的公司对应的普通仓库
    selectAuth,     //当前选中的公司对应的对接精品仓库
    selectShop,    //当前选中的公司的附属数据
    allware =[],       //未确定之前选定的仓库
    isAny = true;     //判断仓库是否为不限
let previousOpenedRow = null;
class TabItem extends Component{
    constructor(props){
        super(props);    //this.props.color?(color:'#387ff5'):null
    }
    render(){
        return (
            <TouchableHighlight style={{flex:1,backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f2f2f2' onPress={this.props.onPress}>
                    <View style={{flex:1,flexDirection:"row",justifyContent:'center',alignItems: 'center'}}>
                        <Text style={ this.props.whichTab || this.props.checkStatus  ? styles_local.tabTextBlue : styles_local.tabText}>{this.props.name}</Text>
                        <Text style={{marginLeft:6,backgroundColor:"transparent"}}>
                            <Icon_FontAwesome name={this.props.whichTab ? "caret-up" : "caret-down" }  size={Device.iOS?15:18} color={this.props.whichTab ? "#387ff5" : "#999999" } />
                        </Text>
                        {this.props.line?<View style={{width:0.5,height:Utils.normalize(23),backgroundColor:"#999999",position:'absolute',top:11,right:0.5}}></View>:null}
                    </View>
            </TouchableHighlight>
        )
    }
}
class SwipeoutBtns extends Component{
  constructor(props){
      super(props);    //this.props.color?(color:'#387ff5'):null
  }
}
class RenderRow extends Component{
  constructor(props){
    super(props);
  }

  render(){
    let rowData  = this.props.data
    let isComp=''
    if(rowData.comp_id==1){
      isComp = '·自采'
    }
    if(rowData.comp_id!=undefined&&rowData.comp_id!=1){
        isComp = '·精品公司'
    }
    return(
      <View style={{flex:1}}>
        <TouchableHighlight style={{backgroundColor:'#ffffff',}} underlayColor="#f5f5f5" onPress = {this.props.onPress} onLongPress={this.props.longPress}>
          <View style = {{paddingLeft:Utils.normalize(15),height: Utils.normalize(115),overflow:'hidden'}}>
            <View style={{flex:1,marginTop:Utils.normalize(12),marginBottom:Utils.normalize(12),flexDirection:'row'}}>
              <Text style = {{fontSize:Utils.normalize(15),color:'#000000'}}>
                {rowData.product_name}
              </Text>
              {rowData.des ? <View style={{marginLeft:5,marginTop:1}}><Image style={{width:17,height:17}} source={Assets.reserve} /></View> : null}
            </View>
            <View style={{flex:1}}>
              <Text style = {styles_local.font333}>
                {rowData.is_origin === "0" ? "非原装"+isComp : "原装"+isComp}
              </Text>
            </View>
            <View style={{flex:1,marginTop:Utils.normalize(4),flexDirection:'row'}}>
              <Text style={[styles_local.font333,{flex:1}]}>
                品牌:  {rowData.brand}
              </Text>
              <Text style={[styles_local.font333,{flex:1}]}>
                数量:  {rowData.num}{rowData.unit}
              </Text>
            </View>
            <View style={{flex:1,marginTop:Utils.normalize(4),marginBottom:Utils.normalize(10),flexDirection:'row'}}>
              <Text style={[styles_local.font333,{flex:1}]} numberOfLines={1}>
                供应商:  {rowData.supplier_name}
              </Text>
              <Text style={[styles_local.font333,{flex:1}]}>
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
}


export default class BoutiqueView extends Component{
  constructor(props){
    super(props);
    let boutiqueData,
        boutiqueList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)} }),
        brandList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}}),
        detailList = new ListView.DataSource({rowHasChanged: (r1,r2) => {return  true}}),
        shopList,wareList;

    this.state = {
      loadData: '',
      boutiqueData,
      boutiqueList,  //精品购买列表
      whichTab:0,    //当前哪个tab被选中
      brandList,    //品牌左侧
      detailList,  //品牌右侧
      shopList,    //公司数据
      wareList,    //仓库数据
      brandClass:'不限',
      detailClass:'不限',
      //请求参数
      shopId:'',
      shop_id:'',
      wareIds:[],       //实际的参数
      wareId:["-1"],    //选中的参数
      oldwareId:["-1"],    //上一次的样式
      auth_wareIds:[],
      whichDate:'',
      date:new Date(),
      date_start:'开始时间',
      date_end:'结束时间',
      showDatePicker:false,
      date_startClass:new Date(),
      date_endClass:new Date(),
      minDate:new Date(),
      isLoading:false,
      isRLoading:false,
      backToTop:false,
      wareLevel3:false,
      me_info:'',
      cloneData:'',
      scrollEnabled:true,
      androidSet: false,
      androidData:'',
      isFXS:false,
    }
  }
  //对每次setState进行isMounted判断
  m_setState(obj) {
    if(isMounted) {
      this.setState(obj);
    }
  }
  componentWillMount(){
    storage.load({
      key: "User"
    }).then(res => {
      this.setState({wareLevel3:res.wareLevel3});
    })
  }
  componentDidMount(){
    //初始化数据
    isMounted = true;
    this.m_setState({isLoading:true})
    whichBrand ="不限";
    whichDetail = "不限";
    let params = {keys:"wares,pdvalbmsp,pd_brand,ft,nc_enter_reason,nc_change_reason,nc_deliver_reason,shopw,me_info,me_ware"};
    Utils.fetch(Utils.api.load,'post',params)
      .then((res) => {
        this.m_setState({loadData:res});
        let detailData=[],
            wareData=[];
            if(res.me_info.shop_id==null){
              this.setState({isFXS:true})
              res.me_info.shop_id =res.shopw[0]?res.shopw[0].id:''
              let wareArr = []
              _.forEach(res.wares,(v,k)=>{
                wareArr.push(v.vl)
              })
              res.me_info.wareids = wareArr
            }
            me_info = lodash.cloneDeep(res.me_info);
            this.setState({me_info:res.me_info})
        //获取品牌的数据
        allBrandData = lodash.cloneDeep(res.pd_brand);
        BrandClassData = Object.keys(allBrandData);
        BrandClassData.unshift("不限");
        detailData = ["不限"];
        //获取仓库数据,并初始化
        allShopData = lodash.cloneDeep(res.shopw);
        for (let item of res.shopw) {
          if(item.id === me_info.shop_id){
            wareData = lodash.cloneDeep(item.wares)
            selectWares = lodash.cloneDeep(item.wares);
            if(item.auth_wares){
              wareData = wareData.concat(item.auth_wares)
              selectAuth = lodash.cloneDeep(item.auth_wares);
            }
          }
        }
        selectShop = lodash.cloneDeep(res.shopw);
        wareData.unshift({name:"不限",id:"-1"});
        //对接精品公司仓库
        this.m_setState({brandList:this.state.brandList.cloneWithRows(BrandClassData),
          detailList:this.state.detailList.cloneWithRows(detailData),
          shopList:allShopData,
          wareList:wareData,
          shop_id:res.me_info.shop_id,
          shopId:res.me_info.shop_id,
          // auth_wareIds:res.me_info.auth_wareids,
          // wareIds:res.me_info.wareids,
        });
        setTimeout(() => this._onRefresh('','first'),1000)
      })

  }
  //筛选数据
  _onRefresh(isNext,first){
    if((isNext && isNext != 'refresh') || !isNext){
      this.m_setState({'isLoading': true})    //加载
    }
    else{
      this.m_setState({'isRLoading': true});    //下拉刷新
    }
    if((!isNext || isNext == 'refresh') && isMounted){
      page = 1;
      if(this.refs._listView){
        this.refs._listView.scrollTo({y: 0, animated: true})
      }
    }
    let params = {
      page:page,
      size:20,
      od_et:1
    };
    if(this.state.shopId === me_info.shop_id){
      params.shopid = me_info.shop_id;
      params.wareids = me_info.wareids;
      params.auth_wareids = me_info.auth_wareids;
    }else{
      (this.state.wareIds).length >= 0 ?
        params.wareids = lodash.cloneDeep(this.state.wareIds) : params.wareids = [];
      (this.state.auth_wareIds).length >= 0 ?
        params.auth_wareids = lodash.cloneDeep(this.state.auth_wareIds) : params.auth_wareids = [];
    }
    if(this.state.brandClass != "不限"){
      params.bc = this.state.brandClass;
    }else{
      delete params['bc']
    }
    if(this.state.detailClass != "不限"){
      params.brand = this.state.detailClass;
    }else{
      delete params['brand']
    }
    if(this.state.shopId){
      params.shopid = this.state.shopId;
    }
    let tempData = lodash.cloneDeep(this.state.wareIds);
    if(!isAny && tempData.length >= 0 ){
      params.wareids = tempData;
    }
    if(this.state.date_start != "开始时间"){
      params.et_start = this.state.date_start;
    }else{
      if(this.state.date_end != "结束时间"){
        this.m_setState({date_start:'1900-01-01'})
        params.et_start = '1900-01-01';
      }else{
        delete params['et_start']
      }
    }
    if(this.state.date_end != "结束时间"){
      params.et_end = this.state.date_end;
    }else{
      if(this.state.date_start != "开始时间"){
        this.m_setState({date_end:this.state.date_start})
        params.et_end = this.state.date_start;
      }else{
        delete params['et_end']
      }}
      if(first!='first'){
        let _tempData = {};
        _tempData.date_end = _.cloneDeep(this.state.date_end);
        _tempData.date_start = _.cloneDeep(this.state.date_start);
        _tempData.brandClass = _.cloneDeep(this.state.brandClass);
        _tempData.brandDetail = _.cloneDeep(this.state.detailClass);
        _tempData.shopId =  _.cloneDeep(params.shopid);
        _tempData.wareIds = _.cloneDeep(params.wareids);
        this.setState({cloneData:_tempData})
      }
      if(!isAny && (this.state.auth_wareIds).length >= 0){
        params.auth_wareids = lodash.cloneDeep(this.state.auth_wareIds);
      }
      if((params['auth_wareids'] && params['auth_wareids'].length < 1) || Object.prototype.toString.call(params['auth_wareids'])[8] === "N"){
        delete params['auth_wareids']
      }
      if((params['wareids'] && params['wareids'].length < 1) || Object.prototype.toString.call(params['wareids'])[8] === "N"){
        delete params['wareids']
      }
      searchParams = params;
    Utils.fetch(Utils.api.queryBoutique,'post',params)
      .then((res) => {
        this.m_setState({isLoading:false,'isRLoading': false})
        let data = lodash.cloneDeep(res);
        //是否是分页
        if(isNext && isNext != 'refresh'){
          let tempList = lodash.cloneDeep(this.state.boutiqueData.list);
          data.list = tempList.concat(res.list);
        }
        this.m_setState({boutiqueData:data, boutiqueList:this.state.boutiqueList.cloneWithRows(data.list)})
      })
      //3后消失
      setTimeout(()=>{
        this.m_setState({isLoading: false,isRLoading: false});
      },3000)
  }
  componentWillReceiveProps(nextProps){
      this._onRefresh()
  }

  //设置品牌的详细数据
  _pushDetail(data){
      this.m_setState({brandClass:data,brandList:this.state.brandList.cloneWithRows(BrandClassData)});
      setTimeout(() => {
        //处理多对多
        if(whichBrand != this.state.brandClass){
          this.m_setState({detailClass:""})
        }else{
          this.m_setState({detailClass:whichDetail})
        }

        if(data === "不限"){
          this.m_setState({detailList:this.state.detailList.cloneWithRows(["不限"])})
        }else{
          detailData = allBrandData[data];
          if(detailData){
            if(detailData[0] != '不限'){detailData.unshift("不限")}
          }else{
            detailData = ['不限']
          }
          this.m_setState({detailList:this.state.detailList.cloneWithRows(detailData)})
        }
      },100)


  }
  //修改品牌右侧的对勾显示
  _changeDetail(data){
    whichBrand = this.state.brandClass;
    whichDetail = data;
    this.m_setState({detailClass:data,
            detailList:this.state.detailList.cloneWithRows(detailData),
            whichTab:0,
          });
    //请求数据
    setTimeout(() => {
      this._onRefresh();
    },100)
  }

  //点击上方tab
  clickTabItem(sign){
      if(this.state.whichTab != sign){
        this.m_setState({whichTab:sign});
      }else{
        this.m_setState({whichTab:0});
      }
      switch (sign) {
        case 1:
          if(this.state.cloneData==''){
            this._timeReset();
          }else {
            this._onTouchUpDate('itemTab')
          }
          this.m_setState({showDatePicker:false})
          break;
        case 2:
          //处理多对多
            if(whichBrand != this.state.brandClass){
              this.m_setState({brandClass:whichBrand,detailClass:whichDetail})
            }
            if(whichBrand=='不限'){
                this.m_setState({detailList:this.state.detailList.cloneWithRows(["不限"])})
            }else{
               this.m_setState({detailList:this.state.detailList.cloneWithRows(allBrandData[whichBrand])})
            }
          break;
        case 3:
        setTimeout(() => {
          if(this.state.whichTab === 0){ //收起
            //恢复上次样式，以及allware
            this._changeShop(this.state.shopId);
          }
        },5)

          break;
        default:
      }
  }

  //修改公司的对勾显示
  _changeShop(id){
    let wareData = [],
    tempData;
    for (let i = 0; i < allShopData.length; i++) {
      if (allShopData[i].id === id){
        selectShop = lodash.cloneDeep(allShopData[i]);
        wareData = lodash.cloneDeep(allShopData[i].wares);
        selectWares = lodash.cloneDeep(allShopData[i].wares);
        allShopData[i].auth_wares ? selectAuth = lodash.cloneDeep(allShopData[i].auth_wares) : selectAuth = [];
        wareData ? wareData = wareData.concat(selectAuth) : wareData = [];
        tempData = lodash.cloneDeep(wareData);
          if(wareData){ //判断wareData是否为null
            if(wareData.length === 0 || wareData.length > 0 && wareData[0].id != "-1"){ //避免多次添加 "不限"
              wareData.unshift({name:"不限",id:"-1"});
            }
          }else{
            wareData = [{name:"不限",id:"-1"}]
          }
      }
    }
    /*
    *  样式改变
    *  如果变为其他公司，则样式默认为不限，allware置空
    *  如果变为上次公司，则样式恢复为上次样式,allware恢复为上次请求的仓库参数(isAny是false时，才恢复)
     */
    if(id === this.state.shopId){
      this.m_setState({wareId:this.state.oldwareId});
      if(isAny){
        allware = []
      }else{
        let tempData1 = lodash.cloneDeep(this.state.wareIds),
          tempData2 = lodash.cloneDeep(this.state.auth_wareIds);
          tempData1 = tempData1.concat(tempData2);
            allware = lodash.cloneDeep(tempData1);
      }
    }else{
      allware = [];
      this.m_setState({wareId:["-1"]});
    }
    this.m_setState({shop_id:id,wareList:wareData});
  }
  //多选仓库
  _selectWare(id){
    //this.state.wareId是选中的所有仓库,只用于显示样式，不用做上传参数
    if (id === "-1" || id === -1){
      this.m_setState({wareId:['-1']})
      allware = [];
    }else{
      //增加可选不可选
      if( allware.indexOf(id) > -1){
        let tempWare = lodash.cloneDeep(allware);
        for (let i =0 ;i < tempWare.length;i++) {
          if(tempWare[i] === id){
            allware.splice(i,1);
          }
        }
      }else{
        allware.push(id);
      }
      if(allware.length > 0){
        this.m_setState({wareId:allware})
      }else{
        this.m_setState({wareId:['-1']})
      }
    }
  }

  //公司，仓库 重置按钮
  _wareReset(){
    allware = []; // 清空仓库
    this.m_setState({wareId:['-1'],shop_id:me_info.shop_id})
  }

  //公司，仓库 确定按钮
  _wareConfirm(){
    let wareArr,authArr;
    wareArr = [],authArr = [];
    if(allware.length <= 0){
      if(selectShop.wares&&selectShop.wares.length>=0){
        for (let i  of selectShop.wares) {
          wareArr.push(i.id)
        }
      }else{
        wareArr =[]
      }
      if(selectShop.auth_wares&&selectShop.auth_wares.length>=0){
        for (let j of selectShop.auth_wares) {
          authArr.push(j.id)
        }
      }else{
        authArr =[];
      }
      isAny = true;  //即仓库选择的是不限
    }else{
      //wareArr既包含普通仓库，也包括对接的仓库.
      let tempWareArr = lodash.cloneDeep(allware);
      for (let item of tempWareArr) {
        //将普通仓分离出来
        for (let wareItem of selectWares) {
          if(item === wareItem.id){
            wareArr.push(item);
          }
        }
        //将对接精品仓分离出来
        for (let authItem of selectAuth) {
          if(item === authItem.id){
            authArr.push(item);
          }
        }
      }
      isAny = false;
    }

    this.m_setState({wareIds:wareArr,auth_wareIds:authArr,shopId:this.state.shop_id,whichTab:0,
                    oldwareId:this.state.wareId})

    //请求数据
    setTimeout(() => {
      this._onRefresh();

    },100)
  }
  componentWillUnmount() {
    isMounted = false;
    allware = [];
    selectWares = [],   //当前选中的公司对应的普通仓库
    selectAuth = [],     //当前选中的公司对应的对接精品仓库
    selectShop = [];    //当前选中的公司的附属数据
    isAny = true;
  }



  //调用日历
  _changeDate(id){
    /*
    *分3层判断
    * 1. 没打开
    * 2. 打开  是文字
    * 3. 打开是时间，判断时间控件和哪一个关联
     */
    if(id === 'start'){
      if(this.state.showDatePicker === false){
        this.m_setState({date:this.state.date_startClass}) ;
        setTimeout(() => {
          Device.iOS ? this.m_setState({showDatePicker:true,date_start:Utils.moment(this.state.date).format('YYYY-MM-DD')}) : this.m_setState({showDatePicker:true})
        },10)
      }else{
        if(this.state.date_start != '开始时间'){
          this.state.whichDate === 'start' ? this.m_setState({showDatePicker:false}) : this.m_setState({date:this.state.date_startClass});
        }else{
          this.m_setState({date:new Date(),date_startClass:new Date()})
          setTimeout(() => {
            this.m_setState({date_start:Utils.moment(this.state.date).format('YYYY-MM-DD')})
          },10)
        }
      }
      this.m_setState({whichDate:'start'})
    }else if(id === 'end'){
      if(this.state.showDatePicker === false){
        this.m_setState({date:this.state.date_endClass});
        setTimeout(() => {
          this.m_setState({showDatePicker:true,date_end:Utils.moment(this.state.date).format('YYYY-MM-DD')})
        },10)
      }else{
        if(this.state.date_end != '结束时间'){
          this.state.whichDate === 'end' ? this.m_setState({showDatePicker:false}) :
            setTimeout(() => {
              this.m_setState({date:this.state.date_endClass})
            },10)
        }else{
          this.m_setState({date:new Date(),date_endClass:new Date()})
          setTimeout(() => {
            this.m_setState({date_end:Utils.moment(this.state.date).format('YYYY-MM-DD')})
          },10)
        }
      }
      this.m_setState({whichDate:'end'})
    }
    setTimeout(() => {
      if(this.state.showDatePicker && Device.isAndroid){
        let tempObj = {};
        if(this.state.whichDate === 'end'){
          tempObj = {
            date: this.state.date,
            minDate: this.state.minDate,
          }
        }else if(this.state.whichDate === 'start'){
          tempObj = {
            date: this.state.date,
            maxDate: new Date()
          }
        }
        DatePickerAndroid.open(tempObj)
        .then((result) => {
            this._onDateChange(result)
        });
      }
    },20)

  }
  //日期改变的回调函数
  _onDateChange(date){
    if(this.state.whichDate === 'start'){
      if(Device.iOS){
        this.m_setState({date_start:Utils.moment(date).format('YYYY-MM-DD'),minDate:date,date:date,date_startClass:date})
      }else if(Device.isAndroid){
        if(date.action=='dismissedAction'){
           return
        }
        let tempDate = new Date(date.year,date.month,date.day);
        this.m_setState({date_start:date.year + '-' + (date.month+1) + '-' + date.day,minDate:tempDate,date:date,date_startClass:tempDate})
      }
    }else if(this.state.whichDate === 'end'){
      if(Device.iOS){
        this.m_setState({date_end:Utils.moment(date).format('YYYY-MM-DD'),date:date,date_endClass:date})
      }else if(Device.isAndroid){
        if(date.action=='dismissedAction'){
           return
        }
        let tempDate = new Date(date.year,date.month,date.day);
        this.m_setState({date_end:date.year + '-' + (date.month+1) + '-' + date.day,date:date,date_endClass:tempDate})
      }
    }
  }
  //修改日期显示格式  YYYY-MM-DD 修改成 YYYY年MM月DD日
  _toText(date){
    if(date === '开始时间' || date === '结束时间'){
      return date
    }else{
      let tempDate = date.split('-'),
        year = tempDate[0],month,day;
        tempDate[1][0] === '0' ? month = tempDate[1][1] :  month = tempDate[1];
        tempDate[2][0] === '0' ? day = tempDate[2][1] :  day = tempDate[2];
      return  year + '年' + month + '月'+ day + '日'
    }
  }
  //日期重置
  _timeReset(){
    this.m_setState({date_start:'开始时间',date_end:'结束时间',showDatePicker:false,date:new Date(),date_startClass:new Date(),date_endClass:new Date()})
  }
  //日期确定
  _timeConfirm(){
    this.m_setState({whichTab:0})
    //请求数据
    setTimeout(() => {
      this._onRefresh();
    },100)
  }
  _onTouchUpDate(flag){
    if(flag!='itemTab'){
        this.m_setState({whichTab:0})
    }
      if(this.state.cloneData==''){
        this.m_setState({
          date_end:'结束时间',
          date_start:'开始时间',
        })
      }else {
        this.m_setState({
          date_end:this.state.cloneData.date_end,
          date_start:this.state.cloneData.date_start,
        })
      }
  }
  _onTouchUpBrand(){
    this.m_setState({whichTab:0})
    if(this.state.cloneData==''){
      this.m_setState({
        brandClass:'不限',
        detailClass:'不限',
      })
    }
  }
  //serach
    _jumpSearch(){
      /*let data = {};
      data.shop_id = me_info.shop_id;
      data.now_shop_id = this.state.shopId;
      data.date_start = this.state.date_start;
      data.date_end = this.state.date_end;
      data.wareIds = this.state.wareIds;
      data.now_wareIds = me_info.wareids;
      data.brand = this.state.brandClass;
      data.brandDetail = this.state.detailClass;*/
      if(searchParams){
        this.state.loadData.shop_id = me_info.shop_id;
        this.state.loadData.now_shop_id = this.state.shopId;
        Actions.bouSearch({searchParams:searchParams,ops:this.state.boutiqueData.ops,loadData:this.state.loadData,wareLevel3:this.state.wareLevel3});
      }
    }
  //底部
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

    if(this.state.boutiqueData.list && (this.state.boutiqueData.list).length >= this.state.boutiqueData.summary.all_num) return;
    page ++;
    this._onRefresh(true);
  }
  //品牌左侧
  _renderBrand(rowData,sectionID,rowId){
      return(
          <View style={{backgroundColor:rowData === this.state.brandClass ? '#f6f6f6' : '#fff',width:Utils.normalize(139)}}>
            <TouchableHighlight underlayColor={'transparent'} onPress={() => this._pushDetail(rowData)}>
              <View style={[styles_local.fullSonButtonGroup]}>
                <Text numberOfLines={2} style={rowData === this.state.brandClass ? styles_local.itemActive : styles_local.itemNoActive}>{rowData}</Text>
              </View>
            </TouchableHighlight>
          </View>
      )
  }
  //品牌右侧
  _renderDetail(rowData,sectionID,rowId){
      return(
          <View style={{backgroundColor:'#f6f6f6'}}>
            <TouchableHighlight underlayColor={'transparent'} onPress = {() => this._changeDetail(rowData)} >
              <View style={[styles_local.fullSonButtonGroup,{backgroundColor:'#f6f6f6'}]}>
                <Text numberOfLines={2} style={[rowData === this.state.detailClass ? styles_local.itemActive : styles_local.itemNoActive,{marginRight: 35}]}>
                  {rowData}
                </Text>
                { rowData === this.state.detailClass ?<Icon style={{position:'absolute',right:14,top:Utils.normalize(16)}} name='md-checkmark' size={20} color="#387ff5" />:null}
              </View>
            </TouchableHighlight>
          </View>
      )
  }
    //  set active swipeout item
  _handleSwipeout(sectionID, rowID) {
    let rows = _.cloneDeep(this.state.boutiqueData.list);
    for (var i = 0; i < rows.length; i++) {
      if (i != rowID) rows[i].active = false;
      else rows[i].active = true;
    }
    this._updateDataSource(rows);
  }
  _updateDataSource(data) {
    this.setState({
      boutiqueList: this.state.boutiqueList.cloneWithRows(data),
    });
  }
  //跳转进详情页
  _jumpDetail(data){
    data.shop_id = me_info.shop_id;
    data.now_shop_id = this.state.shopId;
    Actions.boutiqueStockDetail({data:data,ops:this.state.boutiqueData.ops,loadData:this.state.loadData,wareLevel3:this.state.wareLevel3})
  }
  _change(data){
    this.setState({androidSet:false});
    Actions.changeBoutique({data:data,ops:this.state.boutiqueData.ops,wareLevel3:this.state.wareLevel3})
  }
  _sellBoutique(data){
    this.setState({androidSet:false});
    Actions.deliverStorage({data:data,loadData:this.state.loadData})
  }
  _swipeoutBtns(data){
    let that = this;
    let SwipeoutBtns1 = function(){
      return (
        <View style={{marginTop: 32, marginLeft: 28}}>
          <Image style={{width: 36, height: 36}} source={ Assets.change } />
          <Text style={{color: '#387ff5', paddingTop: 4}}>变更</Text>
        </View>
      )
    }();
    let SwipeoutBtns2 = function(){
      return (
        <View style={{marginTop: 32, marginLeft: 28}}>
          <Image style={{width: 36, height: 36}} source={ Assets.outStock } />
          <Text style={{color: '#387ff5', paddingTop: 4, paddingLeft: 4}}>出库</Text>
        </View>
      )
    }();
    let btns = [
      {
        backgroundColor: '#efefef',
        component: SwipeoutBtns1,
        onPress: function() {that._change(data)}
      },
      {
        backgroundColor: '#efefef',
        component: SwipeoutBtns2,
        onPress: function() {that._sellBoutique(data)}
      },
    ]
    if(!(this.state.boutiqueData.ops instanceof Array)){
      if(data.ops&&(this.state.boutiqueData.ops.change||this.state.boutiqueData.ops.change)){
      return btns
      }else{
      return []
      }
    }else{
      return []
    }
  }

  _allowScroll(scrollEnabled) {
    this.setState({scrollEnabled: scrollEnabled});
  }

  //渲染列表
  _renderRow(rowData,sectionID,rowID){
    let that = this;
    return Device.iOS ? (
      <Swipeout right={this._swipeoutBtns(rowData)}
        rowID={rowID}
        sectionID={sectionID}
        autoClose={true}
        close={!rowData.active}
        btnWidth={Utils.width/4}
        onOpen={(sectionID, rowID) => this._handleSwipeout(sectionID, rowID) }
        scroll={(event) => that._allowScroll(event)}
        >
        <RenderRow data = {rowData} onPress ={()=>this._jumpDetail(rowData)}></RenderRow>
      </Swipeout>
    ) : (
        <RenderRow data = {rowData} onPress ={()=>this._jumpDetail(rowData)} longPress={() => this._longPress(rowData)}></RenderRow>
    )
  }
  /* 添加android 长按*/
  _longPress(rowData){
   if(Device.isAndroid){
     if(!(this.state.boutiqueData.ops instanceof Array)){
       if(rowData.ops&&(this.state.boutiqueData.ops.change||this.state.boutiqueData.ops.change)){
        this.m_setState({androidSet: true,androidData:rowData})
       }else{
         this.m_setState({androidSet: false,androidData:rowData})
       }
     }else{
        this.m_setState({androidSet: false,androidData:rowData})
     }

    }
 }

  render(){
    return(
      <View style={styles.container}>
          <Header title="精品库存" leftPress={()=>Actions.pop()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}}
              rightPress={()=>this._jumpSearch()}  rightIcon={{name:Device.iOS ? "ios-search" : "md-search",size:Device.iOS?23:28}} />
          {
            this.state.loadData != '' ?
            <View style={styles_local.tabBar}>
              <TabItem name="入库时间" line={true}  whichTab={this.state.whichTab === 1} checkStatus={this.state.date_start != "开始时间"} onPress={() => this.clickTabItem(1)}    />
              <TabItem name="品牌" line={true} whichTab = {this.state.whichTab === 2}  checkStatus={!(this.state.brandClass === '不限' && this.state.detailClass === '不限')}  onPress={() => this.clickTabItem(2)}  />
              <TabItem name="仓库" line={false}  whichTab={this.state.whichTab === 3} checkStatus={ this.state.shop_id != me_info.shop_id || this.state.wareId[0] != '-1'} onPress={() => this.clickTabItem(3)} />
            </View>
            : <View></View>
          }
          {
            this.state.boutiqueData ?
            <View style={styles_local.label}>
                {
                  this.state.boutiqueData &&this.state.boutiqueData.count&&this.state.boutiqueData.count>=0&& this.state.boutiqueData.summary.all_num >= 0 ?
                  <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>总数量{this.state.boutiqueData.summary.all_num==null?0:this.state.boutiqueData.summary.all_num}个
                    {(this.state.boutiqueData.ops.cost===1)?'，总成本'+Utils.oFixed(this.state.boutiqueData.summary.all_cost,2,true)+'元':null}
                    {(this.state.shop_id === me_info.shop_id||me_info.shop_type === 1)&&selectAuth?'(不包含精品公司)'  :null}
                  </Text>
                  :
                  <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>未搜索到精品</Text>
                }
            </View>
            : <View></View>
          }
          <ListView
            ref="_listView"
            scrollEnabled={this.state.scrollEnabled}
            style={{height:Device.height - 134}}
            dataSource={this.state.boutiqueList}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections = {true}
            onScroll={() => this._onScroll()}
            removeClippedSubviews={true}
            scrollEventThrottle={0}
            pageSize={20}
            refreshControl={
              <RefreshControl
                style={{backgroundColor:'transparent'}}
                refreshing={this.state.isRLoading}
                onRefresh={() => this._onRefresh('refresh')}
                tintColor="#ff5555"
                title="加载中..."
                colors={['#FF5555']}
                progressBackgroundColor="#fff"
            />}
            renderFooter={()=>{
              return(
              <View>
                {(this.state.boutiqueData ? (this.state.boutiqueData.list).length : 0 ) >= (this.state.boutiqueData ? this.state.boutiqueData.summary.record_cnt : 1)?
                  <View style={{height: 30,justifyContent: 'center'}}>
                    <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多精品了--</Text></View>
                  : <View></View>
                }
              </View>
              )
            }}
          />
          {
            //返回顶部按钮
          }
          {this.state.backToTop ?
            <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={styles_local.backToTop}>
            <Image style={{width: Utils.normalize(50), height: Utils.normalize(50)}} source={Assets.backToTop}/>
            </TouchableOpacity>
          : null}

          {/* 入库时间 */}
          {
            this.state.whichTab === 1 ?
            <View style={styles_local.overlay}>
                <View style={{width:Utils.width,height:this.state.showDatePicker && Device.iOS ? Utils.normalize(350) :Utils.normalize(158),backgroundColor:'#ffffff',paddingLeft:Utils.normalize(15)}}>
                  <Text style={{fontSize:Utils.normalize(13),color:'#333333',marginTop:Utils.normalize(13)}}>
                    入库时间
                  </Text>
                  <View style={{width:Utils.width,height:Utils.normalize(65),flexDirection:'row',alignItems:'center'}}>
                    <TouchableHighlight underlayColor='transparent' onPress= {() => this._changeDate('start')}>
                        <View style={{width:Utils.normalize(145),height:Utils.normalize(40),borderWidth:0.5,borderColor:'#cccccc',marginTop:Utils.normalize(15),borderRadius:Utils.normalize(8),paddingLeft:Utils.normalize(10),justifyContent:'center'}} >
                          {
                            this.state.date_start === '开始时间' ?
                              <Text style={{color:'#cccccc',fontSize:Utils.normalize(14)}}>{this._toText(this.state.date_start)}</Text>
                              :
                              <Text style={{color:'#333333',fontSize:Utils.normalize(14)}}>{this._toText(this.state.date_start)}</Text>
                          }
                        </View>
                    </TouchableHighlight>
                    <View style={{width:Utils.normalize(20),height:0.5,backgroundColor:'#333333',marginLeft:Utils.normalize(17.5),marginRight:Utils.normalize(17.5),marginTop:Utils.normalize(10)}}>
                    </View>
                    <TouchableHighlight underlayColor='transparent' onPress= {() => this._changeDate('end')}>
                      <View style={{width:Utils.normalize(145),height:Utils.normalize(40),borderWidth:0.5,borderColor:'#cccccc',marginTop:Utils.normalize(15),borderRadius:Utils.normalize(8),paddingLeft:Utils.normalize(10),justifyContent:'center'}} >
                      {
                        this.state.date_end === '结束时间' ?
                          <Text style={{color:'#cccccc',fontSize:Utils.normalize(14)}}>{this._toText(this.state.date_end)}</Text>
                          :
                          <Text style={{color:'#333333',fontSize:Utils.normalize(14)}}>{this._toText(this.state.date_end)}</Text>
                      }

                      </View>
                    </TouchableHighlight>
                  </View>
                  {/* 时间控件 */}
                  {this.state.showDatePicker && Device.iOS ?
                      <DatePickerIOS  mode="date" date={this.state.date} minimumDate={this.state.whichDate === 'end' ? this.state.minDate : null} maximumDate={this.state.whichDate === 'start' ? new Date() : null} onDateChange={(date) => this._onDateChange(date)}/>
                    : <View></View>}
                  <View style={{flexDirection:'row',width:Utils.width,height:Utils.normalize(50),borderTopWidth:0.5,borderColor:'#cccccc',position:'absolute',bottom:0,left:0,}}>
                    <TouchableHighlight  style={{flex:1, overflow: 'hidden'}} underlayColor='#f2f2f2' onPress = {() => this._timeReset()}>
                      <View style={[{flex:1,height:Utils.normalize(50),backgroundColor:'#fff'},styles.centering]}>
                        <Text style={{fontSize:Utils.normalize(15),color:'#000000'}}>
                        重置
                        </Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight  style={{flex:1, overflow: 'hidden'}} underlayColor='#f2f2f2' onPress = {() => this._timeConfirm()} >
                      <View style={[{flex:1,height:Utils.normalize(50),backgroundColor:'#387ff5'},styles.centering]}>
                        <Text style={{fontSize:Utils.normalize(15),color:'#ffffff'}}>
                         确定
                        </Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
                <View onStartShouldSetResponder={() => this._onTouchUpDate()} style={{height: Utils.height - Utils.normalize(268),width: Utils.width, backgroundColor: 'transparent'}}></View>
            </View> : null
          }

          {/* 品牌 */}
          {
            this.state.whichTab === 2 ?
             <View style={[styles_local.overlay]}>
              <View style={[styles.row, {maxHeight:Utils.height-Utils.normalize(188), overflow: 'hidden'}]}>
                <View style={{height:Utils.height-Utils.normalize(188),backgroundColor:"#ffffff"}}>
                  <ListView
                  style={{width:Utils.normalize(139),height:Utils.height-Utils.normalize(154)}}
                  dataSource={this.state.brandList}
                  enableEmptySections = {true}
                  renderRow={(rowData,sectionID,rowId)=>this._renderBrand(rowData,sectionID,rowId)}
                  />
                </View>
                <View style={{height:Utils.height-Utils.normalize(188),backgroundColor:"#f6f6f6",flex: 1}}>
                  <ListView style={{width: Utils.width - Utils.normalize(140),height:Utils.height-Utils.normalize(188)}}
                  dataSource={this.state.detailList}
                  enableEmptySections = {true}
                  renderRow={(rowData,sectionID,rowId)=>this._renderDetail(rowData,sectionID,rowId)}
                  />
                </View>
              </View>
              <View onStartShouldSetResponder={() => this._onTouchUpBrand()} style={{height: Utils.normalize(258),width: Utils.width, backgroundColor: 'transparent'}}></View>
            </View>:null
          }
          {/* 仓库 */}
          {
            this.state.whichTab === 3 ?
            <View style={[styles_local.overlay]}  onPress={() => this._onTouchUp()}>
              <View style={{maxHeight:Utils.height-Utils.normalize(188)}}>
                  <ScrollView style={{width:Utils.width,height:Utils.height - Utils.normalize(188),backgroundColor:'#fff'}}>
                    <Text  style={styles_local.itemTitle}>公司</Text>
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                      this.state.shopList.map((item, key)=>{
                        return(
                          <Card key={key}   style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3}}
                          name = {item.name}
                          id = {item.id}
                          state = {this.state.shop_id}
                          width = {item.name.length <= 4?true:false}
                          onPress = {() => this._changeShop(item.id)}
                            />
                        )
                      })
                    }
                    </View>
                    <Text  style={styles_local.itemTitle}>仓库</Text>
                    <View style={{flexDirection:'row',flexWrap:'wrap',}}>
                    {
                      this.state.wareList.map((item, key)=>{
                        return(
                          <Card key={key}  style={{backgroundColor:'#fff', width:(Utils.width - Utils.normalize(13)) / 3}}
                          name = {item.name}
                          id = {item.id}
                          state = {this.state.wareId}
                          isArray = {true}
                          width = {(item.name && item.name.length <= 4)?true:false}
                          onPress={() => this._selectWare(item.id)}
                          />
                        )
                      })
                    }
                    </View>
                    <View style={{height: Utils.normalize(70)}}></View>
                  </ScrollView>

                  <View style={{flexDirection:'row',width:Utils.width,height:Utils.normalize(50),borderTopWidth:0.5,borderColor:'#cccccc',position:'absolute',bottom:0,left:0,}}>
                    <TouchableHighlight  style={{flex:1, overflow: 'hidden'}} underlayColor='#f2f2f2' onPress = {() => this._wareReset()} >
                      <View style={[{flex:1,height:Utils.normalize(50),backgroundColor:'#fff'},styles.centering]}>
                        <Text style={{fontSize:Utils.normalize(15),color:'#000000'}}>
                        重置
                        </Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight  style={{flex:1, overflow: 'hidden'}} underlayColor='#f2f2f2' onPress = {() => this._wareConfirm()}>
                      <View style={[{flex:1,height:Utils.normalize(50),backgroundColor:'#387ff5'},styles.centering]}>
                        <Text style={{fontSize:Utils.normalize(15),color:'#ffffff'}}>
                         确定
                        </Text>
                      </View>
                    </TouchableHighlight>
                  </View>
              </View>
                <View onStartShouldSetResponder={() => this.clickTabItem(3)} style={{height: Utils.normalize(258),width: Utils.width, backgroundColor: 'transparent'}}></View>
            </View>
            :null
          }
          {this.state.androidSet ? <View style={styles.overlay} onStartShouldSetResponder={()=>{this.m_setState({androidSet: false})}}>
           <View style={{width: Utils.normalize(280),position:'absolute',backgroundColor:'#fff',left: (Utils.width - Utils.normalize(280) )/2, top: (Utils.height - Utils.normalize(100))/2,borderRadius: 4}}>
             {
               <View>
                 {this.state.wareLevel3 ? <TouchableHighlight underlayColor='#f2f2f2' onPress={() => this._change(this.state.androidData)} style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                   <Text style={{fontSize: 17,marginLeft: 15}}>变更</Text>
                 </TouchableHighlight> : null}
                 {this.state.wareLevel3 ? <TouchableHighlight underlayColor='#f2f2f2'  onPress={() => this._sellBoutique(this.state.androidData)}  style={{height: Utils.normalize(50),justifyContent:'center',borderBottomWidth:0.5,borderColor:'#cccccc'}}>
                   <Text style={{fontSize: 17,marginLeft: 15}}>出库</Text>
                 </TouchableHighlight> : null}
               </View>
             }
           </View>
          </View> : <View></View>}
          {this.state.isLoading ?<Loading/> : <View></View>}
      </View>
    )
  }
}

const styles_local = StyleSheet.create({
  tabBar:{
      flexDirection:"row",
      width:Utils.width,
      height:Utils.normalize(44),
      justifyContent:'center',
      backgroundColor:"#ffffff",
      borderColor: '#cccccc',
      borderBottomWidth: 0.5
  },
  tabText:{
      textAlign:'center',
      color:'#333333',
      fontSize: Utils.normalize(14)
  },
  tabTextBlue:{
      textAlign:'center',
      color:'#387ff5',
      fontSize: Utils.normalize(14)
  },
  label:{
      width:Utils.width,
      height:Utils.normalize(34),
      justifyContent:'center',
      paddingLeft:Utils.normalize(10),
      backgroundColor:'#efefef'
  },
  overlay:{
      position: 'absolute',
      top:Device.iOS?Utils.andr21Normalize(109):Utils.andr21Normalize(108),
      bottom:0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      width: Utils.width,
      flex: 1,
  },
  itemActive: {
    color: '#387ff5'
  },
  itemNoActive: {
    color: '#666'
  },
  fullSonButtonGroup:{
      height: Utils.normalize(44),
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#cccccc',
      marginLeft: Utils.normalize(15),
      flex:1,
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
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
    marginBottom: 9
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
