
'use strict';
import React, { Component } from 'react'
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import { StatusBar, View, Text, Image, Alert, BackAndroid, ToastAndroid ,AsyncStorage} from 'react-native'
// import { Scene, Reducer, Router, Switch, TabBar, Modal, Actions, ActionConst} from 'react-native-router-flux'
import {
    Scene,
    Router,
    Actions,
    Reducer,
    Modal,
    ActionConst,
} from 'react-native-router-flux';
import {Tip} from '../components'
import Storage from 'react-native-storage'
import SplashScreen from '@remobile/react-native-splashscreen'
import styles from './styles'
import {Utils, Device, Assets} from '../base'
import Icon from 'react-native-vector-icons/Ionicons'
import LandingView from '../landing/guide'
//登录
import LoginView from '../users/login'

import SalesView from '../reports/sales'
import SalesDetailView from '../reports/salesDetail'
import HorizontalDetailView from '../reports/horizontalDetail'
import SelectDate from '../reports/selectDate'

//我
import MeView from '../setting'
import AboutView from '../setting/about'

//消息
import MessageView from '../messages/index'
import MessageDetail from '../messages/messageDetail'
import BillDetail from '../messages/billDetail'
import ChangeVin from '../messages/changeVin'
import Textarea from '../components/Textarea'
import SaleReference from '../messages/saleReference'
import BillLog from '../messages/billLog'
import InstallmentCredit from '../messages/installmentCredit'
import UsedCar from '../messages/usedCar'
import BasicInfo from '../messages/basicInfo'
import LimitPrice from '../messages/limitPrice'
import SaleType from '../messages/saleType'
import ChangeCustomer from '../messages/changeCustomer'
import AddCustomer from '../messages/addCustomer'
import AddNewCar from '../messages/addNewCar'
import Certificate from '../messages/certificate'
import MarkAddress from '../messages/markAddress'
import EditNewCar from '../messages/editNewCar'
import EditProduct from '../messages/editProduct'
import Subscription from '../messages/subscription'
import EditSuit from '../messages/editSuit.js'
import EditCategory from '../messages/editCategory'
import BoughtCar from '../messages/boughtCar'
import ChangeBought from '../messages/changeBought'

//首页
import HomePage from '../index/homePage'

//车辆查找
import Vehi_select from '../vehicles/index'
import Search from '../vehicles/search'
import CarDetail from '../vehicles/carDetail'

//车辆选购
import ChooseNewCar from  '../buy/index'
import Shoping from '../buy/shoping'
import Lock from '../vehicles/lock'
import LockReason from '../vehicles/lockReason'
import Remark from '../vehicles/remark'
import Allot from '../vehicles/allot'
import WareList from '../vehicles/wareList'

//选购
import CreateCart from  '../buy/createCart'
import AdditionCart from '../buy/additionCart'
import SearchCustomer from  '../buy/searchCustomer'
import ShopDetail from '../buy/shopDetail'
import SelectColor from '../buy/selectColor'
import Boutique from '../buy/boutique'  ;// 精品
import SuitDetail from '../buy/suitDetail'  ;// 套装详情
import BoutigueDetail from '../buy/boutigueDetail'; //精品详情界面
import Subdivision from　'../buy/subdivision';//精品详情界面选择产品细分
import InsuranceDetail from '../buy/insuranceDetail';//保险选择界面
import InsureParams from  '../buy/insureParams' //保险选择参数界面
import ExtendWDetail from  '../buy/extendWDetail'  //延长质保商品选择界面
import CartDetail from  '../buy/cartDetail'  //购物车详情
let VER = Device.version + '(' + Device.buildNumber + ')';

//精品库存
import BoutiqueView from '../boutique/index'
import BouSearch from '../boutique/bouSearch'
import BoutiqueStockDetail from '../boutique/boutiqueStockDetail'
import ChangeBoutique from '../boutique/changeBoutique'
import DeliverStorage from '../boutique/deliverStorage'
import DeliverReason from '../boutique/deliverReason'
import ChangeBouName from '../boutique/changeBouName'
import SelectWare from '../boutique/selectWare'
import SelectBouParams from '../boutique/selectBouParams' //精品库存变更产品细分选择参数界面
// 重置密码
import CheckAccount from '../users/resetPwd/checkAccount'
import CheckAccountException from '../users/resetPwd/checkAccountException'
import ResetSuccess from '../users/resetPwd/resetSuccess'
import GetCaptcha from '../users/resetPwd/getCaptcha'
import SetNewPwd from '../users/resetPwd/setNewPwd'
//管理用户
import UserIndex from '../manageUsers/userIndex'
import AddUser from '../manageUsers/addUser'
import AddSales from '../manageUsers/addSales'
import PurchasedCar from '../manageUsers/purchasedCar'
import AlreadySalesList from '../manageUsers/alreadySalesList'
import UserDetail from '../manageUsers/userDetail'
import ChangePurchasedCar from '../manageUsers/changePurchasedCar'
let storage = new Storage({
  storageBackend: AsyncStorage,
  // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
  defaultExpires: null
})
global.storage = storage

const reducerCreate = params=>{
    const defaultReducer = Reducer(params);
    return (state, action)=>{
        return defaultReducer(state, action);
    }
}
if(Device.iOS){
  // 设置状态栏: 参数1为白色字体，2为黑色字体
  StatusBar.setBarStyle(1)
  // StatusBarIOS.setStyle(1);
} else {
  StatusBar.setBackgroundColor('#508FF6',false)
}

class TabIcon extends Component {
    constructor(props){
        super(props);
        this.state = {
          hasRead : false,
        }
    }
    componentDidMount(){

    }
    componentWillMount(){
     console.log(3333)
    }
    componentWillUnmount(){

    }
  render(){

    const icons = {
      messages: this.props.selected ? Assets.message_on : Assets.message_off,
      home: this.props.selected ? Assets.home_on : Assets.home_off,
      setting: this.props.selected ? Assets.me_on : Assets.me_off
    }
    return (
      <View style={[styles.tabItems]}>
        <Image source={icons[this.props.name]} style={{width:24,height:24}}/>
        {//this.props.title === "消息" ? (this.props.selected&&(!this.state.hasRead) ? <View style={{width:7,height:7,borderRadius:3.5,backgroundColor:'#ff0012',position:'absolute',left:23,top:5}}></View>:null):null
        }
        {this.props.title === "消息" && this.state.hasRead ? <View style={{width:7,height:7,borderRadius:3.5,backgroundColor:'#ff0012',position:'absolute',left:23,top:5}}></View>:null
        }
        <Text style={[styles.tabItemText, {color: this.props.selected ? '#5090FD' :'#999'}]}>
          {this.props.title}
        </Text>
      </View>
    )
  }
}

function messageDetail(_msg) {
  Utils.fetch(Utils.api.msgDetail,'post',{wikey:_msg.msg.key})
    .then((res) => {
      var tempmsg = _msg.msg;
      Actions.messageDetail({
        data:res,
        msg:{
          id:tempmsg.title[1],
          key:tempmsg.key,
          time:tempmsg.time_intv,
          type:tempmsg.title[10],
          status:tempmsg.title[12],
          department:tempmsg.title[4]
        },
      });
    })
}

class Entry extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showLandingPage: true,
      selectOrgs:null,
    }
    this.guide = false
  }

  componentDidMount() {
    this._checkGuide()
    if(Device.isAndroid) {
      SplashScreen.hide()
    }
  }

  componentWillMount() {
     if (Device.isAndroid) {
       BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
     }
   }
   componentWillUnmount() {
     if (Device.isAndroid) {
       BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
     }
   }

   onBackAndroid = () => {
     try {
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
          BackAndroid.exitApp()
      }else {
        ToastAndroid.show("再按一次退出程序", ToastAndroid.SHORT);
      }
      this.lastBackPressed = Date.now();
      return true;
     } catch (e) {
        ToastAndroid.show("程序异常终止", ToastAndroid.SHORT);
        return false;
     }
   }

  componentWillReceiveProps(props) {
    const {guide} = props
    this.guide = guide
  }

  _checkGuide() {
    storage.getBatchData([{
      key: 'Guide',
    },{
      key: 'User'
    }]).then(res => {
    }).catch( err => {
      this.guide = true
    })
  }
  _msgPress(){
    setTimeout(()=>{
      RCTDeviceEventEmitter.emit('MessageRefresh', true);
    },1000)
  }
  render() {
    return (
        <Router createReducer={reducerCreate}>
            <Scene key="modal" component={Modal}>
                <Scene key="root" hideNavBar={true}  direction="horizontal">
                    <Scene key="landing" initial={false} title="引导页" type="replace" component={LandingView}/>
                    <Scene key="login"  title="登录" initial={true} component={LoginView}/>
                    <Scene key="messageDetail" component={MessageDetail}/>
                    <Scene key="billDetail" component={BillDetail} />
                    <Scene key="changeVin"  component={ChangeVin} />
                    <Scene key="textarea" component={Textarea} />
                    <Scene key="saleReference" component={SaleReference} />
                    <Scene key="installmentCredit" component={InstallmentCredit} />
                    <Scene key="billLog" component={BillLog} />
                    <Scene key="usedCar"  component={UsedCar} />
                    <Scene key="basicInfo" component={BasicInfo} />
                    <Scene key="limitPrice"  component={LimitPrice} />
                    <Scene key="saleType" component={SaleType}/>
                    <Scene key="changeCustomer" component={ChangeCustomer}/>
                    <Scene key="addCustomer" component={AddCustomer}/>
                    <Scene key="markAddress" component={MarkAddress}/>
                    <Scene key="sales" component={SalesView}/>
                    <Scene key="salesDetail" component={SalesDetailView}/>
                    <Scene key="certificate" component={Certificate}/>
                    <Scene key="horizontalDetail" component={HorizontalDetailView}/>
                    <Scene key="selectDate" component={SelectDate}/>
                    <Scene key="vehi_select"  component={Vehi_select}/>
                    <Scene key="vehi_filter"  component={Search}/>
                    <Scene key="chooseNewCar" component={ChooseNewCar}/>
                    <Scene key="shoping" component={Shoping}/>
                    <Scene key="shopDetail" component={ShopDetail}/>
                    <Scene key="boutique" component={Boutique}/>
                    <Scene key="createCart" component={CreateCart}/>
                    <Scene key="additionCart" component={AdditionCart}/>
                    <Scene key="searchCustomer" component={SearchCustomer}/>
                    <Scene key="carDetail" component={CarDetail}/>
                    <Scene key="suitDetail" component={SuitDetail}/>
                    <Scene key="lock" component={Lock}/>
                    <Scene key="lockReason" component={LockReason}/>
                    <Scene key="remark" component={Remark}/>
                    <Scene key="allot" component={Allot}/>
                    <Scene key="wareList" component={WareList}/>
                    <Scene key="editNewCar" component={EditNewCar}/>
                    <Scene key="editProduct" component={EditProduct}/>
                    <Scene key="subscription"  component={Subscription}/>
                    <Scene key="editsuit" component={EditSuit}/>
                    <Scene key="editCategory" component={EditCategory}/>
                    <Scene key="boughtCar" component={BoughtCar}/>
                    <Scene key="boutigueDetail" component={BoutigueDetail}/>
                    <Scene key="cartDetail" component={CartDetail}/>
                    <Scene key="insuranceDetail" component={InsuranceDetail}/>
                    <Scene key="insureParams" component={InsureParams}/>
                    <Scene key="subdivision" component={Subdivision}/>
                    <Scene key="subdivision" component={Subdivision}/>
                    <Scene key="ChangeBought" component={ChangeBought}/>
                    <Scene key="selectColor" component={SelectColor}/>
                    <Scene key="extendWDetail" component={ExtendWDetail}/>
                    <Scene key="changeBought" component={ChangeBought}/>
                    <Scene key="addNewCar" component={AddNewCar}/>
                    <Scene key="boutiqueView" component={BoutiqueView}/>
                    <Scene key="bouSearch" component={BouSearch}/>
                    <Scene key="boutiqueStockDetail" component={BoutiqueStockDetail}/>
                    <Scene key="changeBoutique" component={ChangeBoutique}/>
                    <Scene key="deliverStorage" component={DeliverStorage}/>
                    <Scene key="deliverReason" component={DeliverReason}/>
                    <Scene key="changeBouName" component={ChangeBouName}/>
                    <Scene key="selectBouParams" component={SelectBouParams}/>
                    <Scene key="userIndex" component={UserIndex}/>
                    <Scene key="addUser" component={AddUser}/>
                    <Scene key="addSales" component={AddSales}/>
                    <Scene key="selectWare" component={SelectWare}/>
                    {/* 重置密码相关 */}
                    <Scene key="checkAccount" component={CheckAccount}/>
                    <Scene key="checkAccountException" component={CheckAccountException}/>
                    <Scene key="getCaptcha" component={GetCaptcha}/>
                    <Scene key="resetSuccess" component={ResetSuccess}/>
                    <Scene key="setNewPwd" component={SetNewPwd}/>
                    <Scene key="purchasedCar" component={PurchasedCar}/>
                    <Scene key="alreadySalesList" component={AlreadySalesList}/>
                    <Scene key="userDetail" component={UserDetail}/>
                    <Scene key="changePurchasedCar" component={ChangePurchasedCar}/>
                    <Scene key="tabbar" tabs={true}  initial={false} tabBarStyle={{borderTopWidth:Utils.normalize(1),borderTopColor: '#A0A0A0', backgroundColor: '#fff',paddingTop:1}}>
                        <Scene key="home" initial={true}  title="首页" hideNavBar={true} >
                            <Scene key="homePage" component={HomePage}/>
                        </Scene>
                        <Scene key="messages" title="消息"  onPress={()=>this._msgPress()} hideNavBar={true} >
                            <Scene key="msg" component={MessageView}/>
                        </Scene>
                        <Scene key="setting" title="我" hideNavBar={true} >
                            <Scene key="me" component={MeView}/>
                            <Scene key="about" component={AboutView}/>
                        </Scene>
                    </Scene>
                </Scene>
                <Scene key="error" component={Error}/>
            </Scene>

        </Router>
    )
  }
}

export default Entry
