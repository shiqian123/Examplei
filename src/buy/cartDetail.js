
'use strict'

import React, { Component } from 'react';
import {
    Alert,
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    TouchableOpacity,
    Linking,
    Image,
    StatusBar,
    Animated
} from 'react-native'

import styles from '../common/styles'
import {Utils, Assets,Device,_} from "../base";
import Btn from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import lodash from 'lodash';
import BaiscInfo from '../messages/basicInfo'
import {Button,Header,Loading,Tip} from '../components'

let ShowLimit = 0;
let that;

class CartDetail extends Component{
  constructor(props){
    super()
    this.state = {
      isRefreshing:false,
      callStatus:false,
      dataSource: props.dataSource,
      credit: [],
      id: props.id,
      isManager:false,
      showAllowVin:2,
      me_id:null,
      suitIndex:0,
      save:false,
      LoadIcon:true,
      items_input:true,
      hasChildCart:false,
      doShop: false,
      detailIn:props.detailIn,
      ani: new Animated.Value(Utils.height),
      btns: [
        ['128','驳回', '已驳回该单据至销售','#ff0006'],
        ['512','驳回', '财务已驳回','#387ff5'],
        ['32','提交财务', '已提交至财务结算','#387ff5'],
        ['4','销售单提交', '销售单已提交至领导审核','#387ff5'],
        ['8','订单提交', '订单已提交至领导审核','#387ff5'],
        ['16','退订提交', '退订已提交至领导审核','#387ff5'],
        ['64','撤回', '已撤回领导审核状态的单据','#387ff5'],
        ['256','撤回', '已撤回提交财务的单据','#387ff5'],
        ['1024','修改', '成功修改了已经退定的定单','#387ff5'],
        ['2048','修改', '成功修改了已经结算的定单','#387ff5'],
        ['4096','修改', '成功修改了已经结算的销售单','#387ff5'],
        ['8192','删除单据','成功删除单据','#ff0006'],
        ['9999','继续选购', '','#387ff5'],
      ],
      hasBtn:false,
      isEmit:true,//判断是否发送广播
      calculateData:{
        price_sum:0,
        costSum:0,
        profit_total:0,
        rebate_total:0,
        costPrice:0,
        num:0
      },
      data:{
        car:null, //1
        product:null, //2
        insure:null, //3
        beauty:null,//4
        extInsure:null, //5
        fee:null, //6
        suit:null,//8
        //staging:{} //分期贷款
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.isFresh){
      let params = {id:this.state.id,ns:true}
      Utils.fetch(Utils.api.get,'post',params)
      .then((res)=>{
          this.setState({dataSource: res, changeAvilable: (res.common.status == 1 && this.state.isSale) })
          this._onRefresh(res);
      })
    } else {
      // this.componentWillMount()
      this._countData(this.state.dataSource)
      this._countStatData(this.state.dataSource)
      this._hasGoods(this.state.dataSource);
    }
  }

  componentWillUnmount() {
    this.subscription.remove();
    let that = this
    RCTDeviceEventEmitter.emit('update',that.state.id);
    if(this.state.isEmit&&this.state.doShop){
      RCTDeviceEventEmitter.emit('nowCartId',that.state.id);
    }
  }

  componentWillMount(){
    that = this;
    this.subscription = RCTDeviceEventEmitter.addListener('upDataCartId',function (cartId) {
      Utils.fetch(Utils.api.get,'post',params)
      .then((res)=>{
          that.setState({dataSource: res, changeAvilable: (res.common.status == 1 && that.state.isSale) })
          that._onRefresh(res);
      })
    });
    // let ShowOwnerLimit = 4; //显示销顾限价
    // let ShowMgrLimit = 8; //显示主管销售限价
    //判断销售
    storage.load({key: 'User'}).then((res) => {
      this.setState({isSale: res.isSale, saleLevel3: res.saleLevel3});
    });
    setTimeout(() => {
      ShowLimit = this.state.isSale ? 4 : 8;
    }, 0);

    let params = {id:this.state.id,ns:true}
    this.setState({'LoadIcon': true})
    Utils.fetch(Utils.api.get,'post',params,()=>{Actions.pop()})
    .then((res)=>{
      if(!res) return false;
      setTimeout(()=> {
        this.setState({dataSource: res,LoadIcon: false, changeAvilable: (res.common.status == 1 && this.state.isSale) })
        this._onRefresh(res);
        Utils.fetch(Utils.api.cartcicate,'post',{})
        .then((credit) => {
          if(credit){
              this.setState({credit: credit})
          }

        })

        storage.load({
          key: "User"
        }).then(res => {
          this.setState({me_id: res.me_id})
        })
      },250)
    })
    // 对网络状态进行判断
    setTimeout(()=>{
        this.setState({LoadIcon: false})
    },5000)
  }
  _onRefresh(dataSource){
    var OPSave = 2; //保存购物车
    if(OPSave & dataSource.common.allow_op){
      this.setState({save:true});
    }else{
      this.setState({items_input:false})
    }
    var data = dataSource.items;
    //是否为销售经理
    if(dataSource.common.user_power & 4){
      this.setState({isManager:true})
    }
    //是否为销售经理
    else if(dataSource.common.user_power & 2){
      this.setState({isSale:true})
    }
    this._getCarts(dataSource);
    this._countData(dataSource);
    this._countStatData(dataSource);
    this._hasGoods(dataSource);
  }
  //计算单类总金额 总送总价
  _countStatData(dataSource){
    // if(!dataSource.items) return;
    var data = dataSource.items;
    let statData = {
      carData : this._statDataSum(data ? data[1] : []),
      productData : this._statDataSum(data ? data[2] : []),
      insureData : this._statDataSum(data ? data[3] : []),
      beautyData : this._statDataSum(data ? data[4] : []),
      extInsureData : this._statDataSum(data ? data[5] : []),
      feeData : this._statDataSum(data ? data[6] : []),
      suitData : this._statDataSum(data ? data[8] : [] , 8)
    }
    this.setState({statData:statData});
  }
  //计算统计总金额 总毛利。。。
  _countData(dataSource){
    var data = dataSource.items;
    let sum = 0,//总金额
        profit = 0,//总毛利
        rebate = 0,//总折扣金额
        cost = 0,//赠送总价
        num = 0,
        costPrice = 0;//赠送总成本
    for(let k in data){
      for(let k1 in data[k]){
        data[k][k1].sale_price = data[k][k1].sale_price  ? data[k][k1].sale_price : 0;
        if(data[k][k1].sale_price == 0){
          cost += data[k][k1].cost*data[k][k1].num;
          costPrice += data[k][k1].price * data[k][k1].num;
        }
        sum += data[k][k1].sale_price * data[k][k1].num;
        num += data[k][k1].num;
        if (!isNaN(parseFloat(data[k][k1].sale_price)) && !isNaN(parseFloat(data[k][k1].cost))) {
          profit += (data[k][k1].sale_price - data[k][k1].cost) * data[k][k1].num;
        }
        if (!isNaN(parseFloat(data[k][k1].sale_price)) && !isNaN(parseFloat(data[k][k1].rebate))) {
          profit += (data[k][k1].sale_price * data[k][k1].rebate) * data[k][k1].num;
        }
        if( parseFloat(data[k][k1].price) > 0){
          rebate += (parseFloat(data[k][k1].price) - parseFloat(data[k][k1].sale_price)) * parseFloat(data[k][k1].num);
        }
      }
    }
    var installment = this.state.dataSource.installment;
    //如果存在分期贷款
    if(installment){
      sum +=  installment.deposit ? parseFloat(installment.deposit) : 0;
      sum += installment.service_fee ? parseFloat(installment.service_fee) : 0;
      sum += installment.renewal_money ? parseFloat(installment.renewal_money) : 0;
      sum += installment.interest_pay ? parseFloat(installment.interest_pay) : 0;
      profit += installment.service_fee ? parseFloat(installment.service_fee) : 0;
    }
    this.setState(
    {
      calculateData:
      {
        price_sum:sum,
        costSum:cost,
        profit_total:profit,
        rebate_total:rebate,
        costPrice:costPrice,
        num: num
      },
      data:data?{
        car: data[1] ? data[1] : [],
        product: data[2] ? data[2] : [],
        insure: data[3] ? data[3] : [],
        beauty: data[4] ? data[4] : [],
        extInsure: data[5] ? data[5] : [],
        fee: data[6] ? data[6] : [],
        suit: data[8] ? data[8] : []
      }:{
        car: [],
        product: [],
        insure: [],
        beauty: [],
        extInsure: [],
        fee: [],
        suit: []
      }
    });
  }
  _statDataSum(data , itemKey){
    let obj = {price:0, cost:0}
    for(let key in data){
      if(itemKey == 8 ){
        // data[key].sale_price = data[key].sale_price ? data[key].sale_price : data[key].price;
        data[key].sale_price = !isNaN(data[key].sale_price) ? data[key].sale_price : data[key].price;
      }
      obj.price = obj.price + data[key].sale_price  * data[key].num;
      obj.cost += data[key].sale_price == 0 ? data[key].price * data[key].num : 0
    }
    return obj;
  }
  _callMode(tel){
    if(tel){
      this.setState({
        callStatus:true
      })
    }else{
      let message = this.state.isSale ? '系统中未录入该客户电话号码，请先完善客户信息，方便以后联系。' : '系统中未录入该销售顾问电话号码，请联系系统管理员录入，方便以后联系。'
      Utils.showMsg('',message)
    }
  }
  _call(tel){
    Linking.openURL('tel:'+tel);
    this.setState({
      callStatus:false
    })
  }
  _changeVin(class_id,vin,goods_param,inner_color){
    // 车身颜色goods_param, 选择车架号传goods_param，更改车架号不传
    this.setState({LoadIcon:true})
    let params = {
      shop_id:this.state.dataSource.common.shop_id,
      class_id:class_id,
      owner_id:this.state.dataSource.salesman.owner_id,
    }
    if(inner_color && inner_color != "unlimited"){
      params.inner_color = inner_color
    }
    if(vin){
      params.vin = vin;
    }
    if(goods_param){
      params.goods_param = goods_param;
    }
    Utils.fetch(Utils.api.allowvin,'post',params)
    .then((res)=>{
      if(res){
        this.setState({LoadIcon:false})
        Actions.changeVin({msg:res,listMsg:params,cart:this.state.dataSource,vin:vin});
      }
    })
  }
  _saleReference(){
    Actions.saleReference({msg:this.state.dataSource.items[1]});
  }
  _remarkDetail(des){
    Actions.textarea(
      { title:"单据备注",
        des:des,
        save:this.state.save,
        _save: this._save.bind(this)
      }
    );
  }
  _save(des){
    that.state.dataSource.common.des = des;
    let params = {
      cart:that.state.dataSource,
      ns:true,
    }
    Utils.fetch(Utils.api.save,'post',params)
    .then((res)=>{
      Actions.pop({refresh: {message: 'des changed'}});
    })
  }
  _log(){
    if(this.state.LoadIcon) {return;}
    this.setState({LoadIcon:true})
    let params = {
      refid: this.state.id,
      type:1
    }
    Utils.fetch(Utils.api.getextinfo,'post',params)
    .then((res)=>{
      if(res.ext){
        Actions.billLog({data:res});
        setTimeout(() => {
          this.setState({LoadIcon:false})
        }, 100);
      } else {
        Utils.showMsg('','暂无单据日志');
        setTimeout(() => {
          this.setState({LoadIcon:false})
        }, 100);
      }
     })
  }
  _installmentCredit(credit){
    Actions.installmentCredit({bill_info: this.state.dataSource, credit:credit,installment:this.state.dataSource.installment,carPrice:this.state.dataSource.items[1][0]['sale_price']})
  }
  _usedCar(){
    Actions.usedCar({bill_info: this.state.dataSource});
  }
  _basicInfo(){
    Actions.basicInfo({data: this.state.dataSource})
  }
  _sonPageBack(){
    Animated.timing(
      this.state.ani,
      {
        toValue: Utils.height,
        duration: 250
      }
    ).start();
  }
  _limitPrice(item,salesman){
    Actions.limitPrice({msg:item,salesman:salesman})
  }
  _tipShow() {
    switch (this.state.tipShow) {
      case 'loading':
        return <Loading/>
        break;
      case 'success':
        return <Tip name="保存成功" />
        break;
      case 'delete':
        return <Tip name="删除成功" />
        break;
      case 'failed':
        return <Tip name="保存失败" type="failed" />
        break;
      default:
        return null
    }
   }

  _submit(opcode){
    //订金结算完 单据中没有新车
    if(this.state.dataSource.subscription.subscription_ok && this.state.dataSource.items && !this.state.dataSource.items[1]&&opcode!='9999'){
      Utils.showMsg("","订金已结算，请在单据中添加车辆");
      return false;
    }
    if(opcode=='9999'){
       this._goShopping()
    }else{
      this.setState({LoadIcon:true})
      if(opcode == '8192'){
        let params = { id: this.state.dataSource.common.id};
        Utils.fetch(Utils.api.delete, 'post', params)
        .then((res)=>{
          if(res){
            this.setState({LoadIcon:false, tipShow:'delete'})
            Actions.popTo('chooseNewCar');
            setTimeout(()=>{
              Actions.refresh({onFresh: true,isFresh:false,active:false});
            },250)
          }
        })
      }else{
        let params = {
          opcode:opcode,
          cart:this.state.dataSource,
        }
        //有新车  没有选择车架号
        if(params.cart.items && params.cart.items[1] && params.cart.items[1][0]['vin'] == null){
          //不含预付订金    或    （订金已结算  且  （不含退订订金  或  不含追加订金） ）
          if(!params.cart.subscription.subscription_has || ( params.cart.subscription.subscription_ok && !params.cart.unsubscription.unsubscription_has && !params.cart.appendsubscription.appendsubscription_has)){
            Utils.showMsg('','请选择车架号');
            this.setState({LoadIcon: false});
            return false;
          }
        }
        Utils.fetch(Utils.api.submit,'post',params)
        .then(res=>{
          this.setState({LoadIcon:false})
          Actions.popTo('chooseNewCar');
          Actions.refresh({onFresh: true,isFresh:false,active:false});
        })
      }
    }


  }
  _reapeatSuit(obj,index,key,show,type){
    if(!obj) return;
    return obj.map((items,keys)=>{
      items.num = items.num ? items.num : 1;
      items.stock_num = items.stock_num ? items.stock_num : 0;
      return (
        <View key={keys} style={{flexDirection:'row',height:25,alignItems:'center',marginLeft:15}}>
          <Text style={{fontSize:12}}>{(++index.index) + '、' + (items.goods_info?items.goods_info+'-':'') + items.goods_name + '*' + items.num}</Text>
          <Text style={styles.md_rebate}>{items.stock_num !== undefined && type === 'goods' ? '（库存：'+items.stock_num+'）' : ''}</Text>
          {!show&&items.is_out&&this.state.data.suit[key].finance_ok?<View style={[styles.redBtn,{marginLeft: 10}]}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已出库</Text></View>:null}
        </View>
      )
    })
  }

  _goShopping(){
    this.setState({doShop: true});
    let that = this;
    let _tempTabBarData =[];
    storage.load({
      key: "User"
    }).then(res => {
      _.forEach(res.menu,function (d,k) {
        if(d.code =='sale'){
          _.forEach(d.sale,function (d1,k1) {
            _tempTabBarData.push(d1.name)
          })
          Actions.shoping({cartId : that.state.id,tabBarData:_tempTabBarData,page:'cartDetail'});
        }
      })
    }).catch(err => {
    })
  }

  _getCarts(data){
    if( !data.common.master_cart && data.common.has_slave > 0 ){
      let params = {
        employee_id : data.salesman.owner_id,
        master_cart : data.common.id
      }
      Utils.fetch(Utils.api.carts,'post',params)
      .then((res)=>{
        res.list.pop()
        this.setState({
          carts : res.list
        })
      })
    }
  }

  _carts(){
    return this.state.carts ? this.state.carts.map( (item,key) => {
      if(!item) return (<View></View>)
      return (
        <TouchableHighlight underlayColor='#f2f2f2' style={{backgroundColor:'#fff'}} key={key} onPress={()=>{this._childCartDetail(item)}}>
          <View style={[styles.row,{paddingLeft:15,paddingRight:15,height:Utils.normalize(50),justifyContent:'center',alignItems:'center',borderTopWidth:0.5,borderColor:'#cccccc'}]} >
            <Text style={{ flex:3,fontSize:14 }}>{item.common.id}</Text>
            <Text  style={{ flex : 6}}>
              {item.count && item.count.product_num > 0 ? "精品 " : ""}
              {item.count && item.count.beauty_num > 0 ? "美容 " : ""}
              {item.count && item.count.insurance_num > 0 ? "保险 " : ""}
              {item.count && item.count.warranty_num > 0 ? "延保 " : ""}
              {item.count && item.count.fee_num > 0 ? "其它 " : ""}
              {item.count && item.count.suit_num > 0 ? "套装" : ""}
            </Text>
            <Text numberOfLines={1} style={{ flex : 2 }}>{item.common.item_count}</Text>
            {!this.state.detailIn ? <Icon style={[styles.md_lineChevren,{top: Utils.normalize(13)}]} color='#bbbbbb' name='ios-arrow-forward' size={23}/> : null }
          </View>
        </TouchableHighlight>
      )
    }) : null
  }
  _childCartDetail(item){
    if(this.state.detailIn) return false;
    Actions.billDetail({
      detailIn:true,
      id: item.common.id
    });
  }
  _masterCart(master_cart){
    Actions.billDetail({
      detailIn: true,
      id: master_cart
    });
  }
  _childCart(){
    this.setState({hasChildCart:!this.state.hasChildCart})
  }
  _editNewCar(item, data, items_input) {
    Actions.editNewCar({car_info: item, bill_info: data, items_input: this.state.items_input, saleLevel3: this.state.saleLevel3, changeAvilable: this.state.changeAvilable});
  }
  _car(){
    let car = this.state.data.car;
    return car ? car.map((item,key) => {
      let data = this.state.dataSource;
      return (
        <TouchableHighlight key={key} style={styles.bd_Bar} underlayColor='#f2f2f2' onPress={this.state.changeAvilable && !item.finance_ok ? () => this._editNewCar(item, data, this.state.items_input) : null}>
          <View style={[styles.md_itemsItem, {flexDirection: 'row'}]}>
            <View style={{flex: 1, paddingRight: Utils.normalize(5)}}>
              <View style={[{alignItems: 'center',flexDirection: 'row',paddingTop:9,paddingBottom:9}]}>
                <Text style={styles.md_itemsText}>{(item.goods_info?item.goods_info+'-':'')+item.goods_name}<Text style={{fontSize:12}}>（车身：{item.goods_param} {item.ext_param && item.ext_param != "unlimited"?<Text>,内饰：{item.ext_param})</Text>:')'} </Text></Text>
              </View>
              <View style={[styles.md_itemsTextBox,{alignItems:'center'}]}>
                <Text style={[styles.md_itemsText,{flex:1,alignItems:'center'}]}>车架号：{(item.vin ? item.vin : '未填写') + ' '}
                  {item.status == 2 && item.vin ? <FontAwesome name="lock" size={16} color="#000"/>:null}
                  {item.status != 2 && item.status != null &&item.vin ? <FontAwesome name="unlock" size={16} color="#000"/>:null}
                  {item.status == null && item.vin ? <FontAwesome name="truck" size={16}  color="#000"/>:null}
                </Text>
                {
                  this.state.saleLevel3 ?
                  <View>
                    {(data.items[1] && !data.items[1][0].finance_ok && data.common.allow_op && this.state.showAllowVin && data.common.show_options) && this.state.items_input && this.state.changeAvilable && !item.vin  ?
                      <Button value='选择VIN' pattern={{outLine:'smallBorderBtn',text:'smallBorderBlue'}} style={{}} onPress={()=>this._changeVin(item.class_id, item.vin, item.goods_param, item.ext_param)}></Button>
                      :null
                    }
                  </View>
                  :
                  <View>
                    {(data.items[1] && !data.items[1][0].finance_ok && data.common.allow_op && this.state.showAllowVin && data.common.show_options) && this.state.items_input && (this.state.changeAvilable || this.state.isManager)  ?
                      <Button value={item.vin?'更改VIN':'选择VIN'} pattern={{outLine:'smallBorderBtn',text:'smallBorderBlue'}} style={{}} onPress={()=>this._changeVin(item.class_id, item.vin, item.goods_param, item.ext_param)}></Button>
                      :null
                    }
                  </View>
                }

              </View>
              <View style={[styles.md_itemsTextBox,{alignItems:'center'}]}>
                <Text style={{marginLeft:15,fontSize:Utils.normalize(14)}}>
                  指导价：<Text style={styles.md_itemsText}>¥{Utils.oFixed(item.price,2,true)}</Text>
                </Text>
              </View> 
              <View style={[styles.md_itemsTextBox,{alignItems:'center'}]}>
                <Text style={{marginLeft:15,fontSize:Utils.normalize(14)}}>
                  售价：<Text style={styles.textYellow}>¥{Utils.oFixed(item.sale_price,2,true)}</Text>
                  <Text style={styles.md_rebate}>（折扣：¥{Utils.oFixed((item.price - item.sale_price)*item.num,2,true)}）</Text>
                </Text>
                {item.is_out?<View style={styles.blueBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10) }}>已结算出库</Text></View>:null}
                {!item.is_out&&item.finance_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                <View style={{flex:1,justifyContent:'flex-end',flexDirection:'row', marginLeft: 10}}>
                  {(data.common.show_options & ShowLimit && !item.finance_ok)?<Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}} onPress={()=>{this._limitPrice(item,data.salesman)}}></Button>:null}
                </View>
              </View>
              {
                data.common.status != 2 || (data.common.show_options & ShowLimit ) ?
                <View style={[styles.row,{marginLeft:15,marginRight:15,marginBottom:Utils.normalize(13),marginTop:Utils.normalize(10)}]}>
                  {
                    item.avg_earn && item.avg_key && item.avg_time ?
                      <View style={{flex:1,flexDirection:'row'}}>
                        <Button value="销售参考" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}} onPress={this._saleReference.bind(this)}></Button>
                      </View>
                    : null
                  }
                  {
                    // <View style={{flex:1,justifyContent:'flex-end',flexDirection:'row'}}>
                    //   {(data.common.show_options & ShowLimit || data.common.show_options & ShowLimit)?<Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right:15}}  onPress={()=>{this._limitPrice(item,data.salesman)}}></Button>:null}
                    // </View>
                  }
                </View>
                : null
              }
              <View style={[styles.row,{alignItems:'center'}]}>
                {(this.state.isSale && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
                {(this.state.isManager && (item.sale_price < (item.manager_limit ? item.manager_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
                {(this.state.isManager && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<' + data.salesman.owner_name + '的限价'}</Text></View> : null}
              </View>
            </View>
            {
              this.state.changeAvilable && !item.finance_ok ?
                <View style={{width: Utils.normalize(28), backgroundColor: 'transparent', justifyContent: 'center'}}>
                  <Icon style={{textAlign: 'left'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                </View>
              : <View></View>
            }

          </View>
        </TouchableHighlight>)
    }):null;
  }
  _customerCar(){
    let data = this.state.dataSource;
    return (
      <TouchableHighlight style={styles.bd_Bar} underlayColor='#f2f2f2'>
        <View style={styles.md_itemsItem}>
          <View style={styles.md_itemsTextBox}>
            <Text style={styles.md_itemsText}>{data.customer_car.car_type}</Text>
          </View>
          <View style={styles.md_itemsTextBox}>
            <Text style={styles.md_itemsText}>车牌号：{data.customer_car.car_license}</Text>
          </View>
          <View style={styles.md_itemsTextBox}>
            <Text style={styles.md_itemsText}>车架号：{data.customer_car.car_vin}</Text>
          </View>
          <View style={styles.md_itemsTextBox}>
            <Text style={styles.md_itemsText}>购买时间：{data.customer_car.car_time && data.customer_car.car_time.substr(0,10)}</Text>
          </View>
          <View style={styles.md_itemsTextBox}>
            <Text style={styles.md_itemsText}>行程里数：{data.customer_car.car_mileage}</Text>
          </View>
          <View style={styles.md_itemsTextBox}>
            <Text style={styles.md_itemsText}>购买价格：{Utils.oFixed(data.customer_car.car_price, 2, true)}元</Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
  _editProduct(item, data){
    Actions.editProduct({item: item,data: data})
  }
  _product(){
    let data = this.state.dataSource;
    let product = this.state.data.product;
    // let ShowOwnerLimit = 4; //显示销顾限价
    // let ShowMgrLimit = 8; //显示主管销售限价
    return product ? product.map((item,key) => {
      return (
        <TouchableHighlight key={key} style={styles.bd_Bar} underlayColor='#f2f2f2' onPress={this.state.changeAvilable && !item.finance_ok ? this._editProduct.bind(this,item,data) : null}>
          <View style={styles.row}>
            <View style={[styles.md_itemsItem,{flex: 1, paddingRight: Utils.normalize(5)}]}>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>{(item.goods_info ? item.goods_info + '-' : '') + item.goods_name + (item.goods_param ? '(' + item.goods_param + ')' : '') }</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={[styles.md_itemsText,{flex: 0}]}>单价：¥{Utils.oFixed(item.sale_price,2,true)}</Text>
                <Text style={[styles.md_itemsText,{flex: 0}]}>x{item.num}<Text style={styles.md_rebate}>（库存：{item.stock_num}）</Text></Text>
                <View style={{flex: 1}} />
              </View>
              <View style={[styles.row,{alignItems:'center'}]}>
                {(this.state.isSale && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
                {(this.state.isManager && (item.sale_price < (item.manager_limit ? item.manager_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
                {(this.state.isManager && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<' + data.salesman.owner_name + '的限价'}</Text></View> : null}
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={[styles.md_itemsText,,{flex:0}]}>
                  小计：<Text style={styles.textYellow}>¥{Utils.oFixed(item.sale_price*item.num,2,true)}</Text>
                  <Text style={styles.md_rebate}>（折扣：¥{Utils.oFixed((item.price - item.sale_price)*item.num,2,true)}）</Text>
                </Text>
                {item.is_out?<View style={styles.blueBtn}><Text style={{color:'#fff',fontSize:10}}>已结算出库</Text></View>:null}
                {!item.is_out&&item.finance_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                <View style={{flex:1,justifyContent:'flex-end',flexDirection:'row', marginLeft: 10}}>
                  {(data.common.show_options & ShowLimit && !item.finance_ok)?<Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}} onPress={()=>{this._limitPrice(item,data.salesman)}}></Button>:null}
                </View>
              </View>
              {this.state.data.product.length==key+1?null:<View style={[styles.itemInsetLineR,{width: Device.width,marginTop: Utils.normalize(9)}]}></View>}
            </View>
            {
              this.state.changeAvilable && !item.finance_ok ?
              <View style={{width: Utils.normalize(28), backgroundColor: 'transparent', justifyContent: 'center'}}>
                <Icon style={{textAlign: 'left'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </View>
              : <View></View>
            }
          </View>
        </TouchableHighlight>
      )
    }):null;
  }
  _editCategory(cate,item,data){
    let key, title;
    switch (cate) {
      case 'insure':
        key = 3;
        title = '保险'
        break;
      case 'beauty':
        key = 4;
        title = '汽车美容';
        break;
      case 'extInsure':
        key = 5;
        title = '延长质保';
        break;
      case 'fee':
        key = 6;
        title = '其它';
        break;
    }
    Actions.editCategory({
      cate: key,
      item: item,
      data: data,
      title: title
    })
  }
  _category(cate){
    let data = this.state.dataSource;
    // let ShowOwnerLimit = 4; //显示销顾限价
    // let ShowMgrLimit = 8; //显示主管销售限价
    return this.state.data[cate]?this.state.data[cate].map((item,key) => {
      //insureData.price += item.sale_price*item.num ;
      //insureData.cost += item.sale_price == 0 ? item.price*item.num : 0;
      return (
        <TouchableHighlight key={key} style={styles.bd_Bar} onPress={this.state.changeAvilable && !item.finance_ok ? this._editCategory.bind(this,cate,item,data) : null} underlayColor='#f2f2f2'>
          <View style={styles.row}>
            <View style={[styles.md_itemsItem,{flex: 1, paddingRight: Utils.normalize(5)}]}>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>{(item.goods_name + (item.goods_info ? '-' + item.goods_info:''))}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={[styles.md_itemsText,{flex:0}]}>
                  售价：<Text style={styles.textYellow}>¥{Utils.oFixed(item.sale_price,2,true)}</Text>
                  <Text style={styles.md_rebate}>（折扣：¥{Utils.oFixed((item.price - item.sale_price)*item.num,2,true)}）</Text>
                </Text>
                {item.is_out?<View style={styles.blueBtn}><Text style={{color:'#fff',fontSize:10}}>已结算出库</Text></View>:null}
                {!item.is_out&&item.finance_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                <View style={{flex: 1}}>
                  {(data.common.show_options & ShowLimit && !item.finance_ok) ? <Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right: Utils.normalize(0), position:'absolute',top: Utils.normalize(-10)}}  onPress={()=>{this._limitPrice(item,data.salesman)}}></Button>:null}
                </View>
              </View>
              <View style={[styles.row,{alignItems:'center'}]}>
                {(this.state.isSale && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
                {(this.state.isManager && (item.sale_price < (item.manager_limit ? item.manager_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<您的限价'}</Text></View> : null}
                {(this.state.isManager && (item.sale_price < (item.owner_limit ? item.owner_limit : 0))) ? <View style={[{marginLeft:15,height:31,alignItems:'center'},styles.row]}><Icon name="ios-alert" color="#ff0012" size={18}/><Text style={{color:'#ff0012',marginLeft:5}}>{'售价<' + data.salesman.owner_name + '的限价'}</Text></View> : null}
              </View>
              {this.state.data[cate].length==key+1?null:<View style={[styles.itemInsetLineR,{width: Device.width,marginTop: Utils.normalize(9)}]}></View>}
            </View>
            {
              this.state.changeAvilable && !item.finance_ok ?
              <View style={{width: Utils.normalize(28), backgroundColor: 'transparent', justifyContent: 'center'}}>
                <Icon style={{textAlign: 'left'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </View>
              : <View></View>
            }
          </View>
        </TouchableHighlight>
      )
    }):null;
  }

  _editSuit(key, item, list, data) {
    Actions.editsuit({item_key: key, suit_info: item, currentSuit: list, bill_info: data})
  }

//判断items里是否有数据
  _hasGoods(dataSource){
    if(dataSource.items){
      for(let key in dataSource.items){
        for(let sonKey in dataSource.items[key]){
          this.setState({hasGoods: true});
          return true;
        }
      }
    }
    this.setState({hasGoods: false});
    return false;
  }

  _suit(){
    let data = this.state.dataSource;
    // let ShowOwnerLimit = 4; //显示销顾限价
    // let ShowMgrLimit = 8; //显示主管销售限价
    return this.state.data.suit?this.state.data.suit.map((item,key) => {
      let obj = {index:0}
      let list;
      for(let key in data.suits){
        if(data.suits[key].class_id == item.class_id){
          list = data.suits[key];
        }
      }
      if(!list) return;
      let product = list.goods['2'],insure = list.goods['3'],beauty = list.goods['4'],extInsure = list.goods['5'],fee = list.goods['6'];
      return (
        <TouchableHighlight key={key} style={styles.bd_Bar} underlayColor='#f2f2f2' onPress={this.state.changeAvilable && !item.finance_ok ? () => this._editSuit(key, item, list, data) : null}>
          <View style={{flexDirection: 'row'}}>
            <View style={[styles.md_itemsItem, {flex: 1, paddingRight: Utils.normalize(5)}]}>
              <View style={[styles.md_itemsTextBox,{alignItems:'center'}]}>
                <Text style={styles.md_itemsText}>{(item.goods_info?item.goods_info+'-':'')+(item.goods_name ? item.goods_name : '')}</Text>
              </View>
              <View>
                {this._reapeatSuit(product,obj,key,item.is_out,'goods')}
                {this._reapeatSuit(insure,obj,key,item.is_out)}
                {this._reapeatSuit(beauty,obj,key,item.is_out)}
                {this._reapeatSuit(extInsure,obj,key,item.is_out)}
                {this._reapeatSuit(fee,obj,key,item.is_out)}
              </View>
              <View style={[styles.md_itemsTextBox, {marginTop:1}]}>
                <Text style={[styles.md_itemsText,{flex: 0}]}>单价：¥{Utils.oFixed(item.sale_price,2,true)}</Text>
                <Text style={[styles.md_itemsText,{flex: 0}]}>x{item.num}<Text style={styles.md_rebate}>{item.stock_num === null ? null : ('（库存：' + item.stock_num +'）')}</Text></Text>
                <View style={{flex: 1}} >
                  {(data.common.show_options & ShowLimit && !item.finance_ok)?<Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right: Utils.normalize(0),position: 'absolute', top: Utils.normalize(-10)}}  onPress={()=>{this._limitPrice(item,data.salesman)}}></Button>:null}
                </View>
              </View>
              <View style={[styles.row,{height:Device.iOS ? Utils.normalize(30) : Utils.normalize(25),marginLeft: 15,alignItems: 'center'}]}>
                <Text>小计：<Text style={styles.textYellow}>¥{Utils.oFixed(item.sale_price*item.num,2,true)}</Text></Text>
                <Text style={styles.md_rebate}>（折扣：¥{Utils.oFixed((item.price - item.sale_price)*item.num,2,true)}）</Text>
                {!item.is_out&&item.finance_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                {item.is_out?<View style={styles.blueBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10) }}>已结算出库</Text></View>:null}
              </View>
              {this.state.data.suit.length==key+1?null:<View style={[styles.itemInsetLineR,{width: Device.width, marginTop: Utils.normalize(9)}]}></View>}
            </View>
            {
              this.state.changeAvilable && !item.finance_ok ?
              <View style={{width: Utils.normalize(28), backgroundColor: 'transparent', justifyContent: 'center'}}>
                <Icon style={{textAlign: 'left'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </View>
              : <View></View>
            }
          </View>
        </TouchableHighlight>
      )
    }):null;
  }
  _subscription() {
    Actions.subscription({bill_info: this.state.dataSource});
  }
  _boughtCar(){
    Actions.boughtCar({data: this.state.dataSource});
  }
  _changBought(){
    Actions.changeBought({data: this.state.dataSource});
  }
  _addNewCar(){
    Actions.addNewCar({data: this.state.dataSource});
  }
  _goBack(){
    this.setState({isEmit:false})
    this.state.doShop ? Actions.pop({refresh: {active: true, cartId: this.state.id, onFresh: false, isFresh: false}}) :
      Actions.pop()
  }
  render(){
    var data = this.state.dataSource;
    //无数据时返回加载页
    if( !data || !this.state.statData){
    return (
      <View style={styles.container}>
        <View>
          <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" onPress={this.props.barPress} />
          <View style={[styles.navbar]}>
            <Text style={[styles.navLeftButton]} onPress={Actions.pop}><Icon name={Device.iOS ? "ios-arrow-back" : "md-arrow-back"} size={23} color='#fff' /></Text>
            <Text style={[styles.navTitle,{textAlign : Device.isAndroid ? 'left' : 'center'}]}>单据详情</Text>
            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginRight: 10}}>
              <Icon style={{marginTop: 4}} onPress={()=>this._callMode(contact_tel)} name="ios-call-outline" size={28} color='#fff' />
              <Btn onPress={this._log.bind(this)}><Image style={{width:19,height:21,marginLeft:16}} source={Assets.icons.log} /></Btn>
            </View>
            {Device.isAndroid ?  <Image source={Assets.androidBar} opacity={0.8} style={{width: 0.5, height: Utils.normalize(25),position:'absolute',left: Utils.normalize(35),top:Utils.andr21Normalize(33)}}/> : null}
          </View>
        </View>
        {this.state.LoadIcon ? <Loading/> : <View></View>}
      </View>
    );}

    // 联系电话
    let contact_tel = this.state.isSale ? data.customer.customer_tel : data.salesman.owner_tel;
    // 联系人
    let contact_name = this.state.isSale ? data.customer.customer_name : data.salesman.owner_name;

    let {carData,productData,insureData,beautyData,extInsureData,feeData,suitData} = this.state.statData;
    var credit;
    for(var key in this.state.credit){
      if(data && data.installment && this.state.credit[key] && this.state.credit[key].class_id == data.installment.installment_classid){
        credit = this.state.credit[key];
      }
    }
    let btns = [];
    let stateBtn = lodash.cloneDeep(this.state.btns)
    for(key in stateBtn){
      if( data.common.allow_op & this.state.btns[key][0]){
        btns.push(stateBtn[key]);
      }
    }
    btns = btns.map((item,key)=>{
      if(!this.state.hasGoods && item[0] != '8192'&& item[0] != '9999'){
        return null;
      }
      if(item[0] == '8'){
        //是否勾选预先支付订金 是否为订单
        if(data.subscription.subscription_has){
          //是否为待提交状态
          if(data.common.status !== 1){
            item[1] = '提交领导审核';
          }
        }else{
          //不为订单  不添加订单提交按钮
          return null;
        }
      }
      else if(data.common.status != 1 && item[0] == '4'){
        //不为待提交状态时
        item[1] = '提交领导审核';
      }
      else if(data.common.status == 1 && item[0] == '4'){
        //待提交状态有定金时   销售单提交按钮不要
        if(data.subscription.subscription_has){
          return null;
        }
      }
      else if(item[0] == '16'){
        if(data.appendsubscription.appendsubscription_has) {
            item[0] = '131072';  //追加订单 opcode
            item[1] = '订单提交';
        }else if(data.unsubscription.unsubscription_has){
            item[0] = '16';
            item[1] = '退订提交';
        }else{
            item[0] = '4';
            item[1] = '订单提交';
        }
        if(data.subscription.subscription_has && this.state.isManager){
          //订单   并且是销售经理时   退订订单
            item[1] = '提交领导审核';
        }
      }
      if((data.common&&data.common.allow_op) & item[0]){
        return(
          <View key={key} style={{flex:1,height:Utils.normalize(49),flexDirection:'row',alignItems:'center'}}>
            <TouchableHighlight style={[{height:Utils.normalize(49),alignItems:'center',justifyContent:'center',flex:1}]} underlayColor='#f2f2f2' onPress={()=>this._submit(item[0])}><Text style={{textAlign:'center',color:item[3],fontSize:Utils.normalize(15)}}>{item[1]}</Text></TouchableHighlight>
            <View style={{height:Utils.normalize(18),backgroundColor:'#999999',width:1,position:'relative',left:1}}></View>
          </View>
        )
      }
    });
    for(let key = btns.length - 1; key >= 0; key--){
      if( btns[key] == null){
        btns.splice(key,1)
      }
    }
    return (
      <View style={styles.container}>
        <View>
          <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" onPress={this.props.barPress} />
          <View style={[styles.navbar]}>
            <Text style={[styles.navLeftButton]} onPress={()=>this._goBack()}><Icon name={Device.iOS ? "ios-arrow-back" : "md-arrow-back"} size={23} color='#fff' /></Text>
            <Text style={[styles.navTitle,{textAlign : Device.isAndroid ? 'left' : 'center'}]}>单据详情</Text>
            <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',marginRight: 10}}>
              <Icon style={{marginTop: 4}} onPress={()=>this._callMode(contact_tel)} name="ios-call-outline" size={28} color='#fff' />
              <Btn onPress={this._log.bind(this)}><Image style={{width:19,height:21,marginLeft:16}} source={Assets.icons.log} /></Btn>
            </View>
            {Device.isAndroid ?  <Image source={Assets.androidBar} opacity={0.8} style={{width: 0.5, height: Utils.normalize(25),position:'absolute',left: Utils.normalize(35),top:Utils.andr21Normalize(33)}}/> : null}
          </View>
        </View>
        <ScrollView>
            {data.customer?
              <View>
                <View style={styles.lineLebel}>
                  <Text style={{fontSize:Utils.normalize(14)}}>{this.state.dataSource.common.title}</Text>
                </View>
                <View>
                  <View style={styles.md_itemTitleBox}>
                    <Text style={styles.md_itemTitle}>基本信息</Text>
                  </View>
                  <View style={styles.md_item}>
                    <TouchableHighlight style={styles.bd_Bar} underlayColor='#f2f2f2' onPress={()=>this._basicInfo()}>
                      <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{flex: 1}}>
                          <View style={styles.md_itemsTextBox}>
                            <Text style={styles.md_itemsText}>创建时间：{data.common.create_time}</Text>
                            {data.common.master_cart && !this.state.detailIn?<Button value="主销售单" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right:0}}  onPress={()=>{this._masterCart(data.common.master_cart)}}></Button> : null}
                            {this.state.carts ? <Button value={"追加销售单(" + this.state.carts.length + ")"} pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right:0}}  onPress={()=>{this._childCart()}}></Button> : null}
                          </View>
                          <View style={styles.md_itemsTextBox}>
                            <Text style={styles.md_itemsText}>客户：{data.customer.customer_name}</Text>
                          </View>
                          <View style={styles.md_itemsTextBox}>
                            <Text style={styles.md_itemsText}>联系电话：{data.customer.customer_tel}</Text>
                          </View>
                          {
                            this.state.isSale ?
                            <View></View>
                            :
                            <View style={styles.md_itemsTextBox}>
                              <Text style={styles.md_itemsText}>销售顾问：{data.salesman.owner_name}</Text>
                            </View>
                          }
                        </View>
                        <View style={{width: Utils.normalize(28),justifyContent: 'center'}}>
                          <Icon color='#cccccc' name='ios-arrow-forward' size={23}/>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
                {
                  this.state.hasGoods ?
                  <View>
                    <View style={styles.md_itemTitleBox}>
                      <Text style={styles.md_itemTitle}>统计</Text>
                    </View>
                    <View style={[styles.md_items,{paddingTop: 6,paddingBottom: 6}]}>
                        <View style={[styles.row,styles.mditemsBox]}>
                          <Text style={[styles.md_itemsText,{flex: 0}]}>商品数量：</Text>
                          <Text style={[styles.md_itemsRow,{marginRight:14}]}>{this.state.calculateData.num}</Text>
                        </View>
                        <View style={[styles.row,styles.mditemsBox]}>
                          <Text style={[styles.md_itemsText,{flex: 0}]}>总折扣金额：</Text>
                          <Text style={styles.md_itemsRow}>{Utils.oFixed(this.state.calculateData.rebate_total,2,true)}<Text style={{color:'#000'}}>元</Text></Text>
                        </View>
                        <View style={[styles.row,styles.mditemsBox]}>
                          <Text style={[styles.md_itemsText,{flex: 0}]}>总金额：</Text>
                          <Text style={styles.md_itemsRow}>{Utils.oFixed(this.state.calculateData.price_sum,2,true)}<Text style={{color:'#000'}}>元</Text></Text>
                        </View>

                        <View style={[styles.row,styles.mditemsBox]}>
                          <Text style={[styles.md_itemsText,{flex: 0}]}>赠品总价：</Text>
                          <Text style={styles.md_itemsRow}>{Utils.oFixed(this.state.calculateData.costPrice,2,true)}<Text style={{color:'#000'}}>元</Text></Text>
                        </View>
                        {
                          this.state.isManager&&data.ops.cost ? <View style={[styles.row,styles.mditemsBox]}>
                            <Text style={[styles.md_itemsText,{flex: 0}]}>总毛利：</Text>
                            <Text style={styles.md_itemsRow}>{Utils.oFixed(this.state.calculateData.profit_total,2,true)}<Text style={{color:'#000'}}>元</Text></Text>
                          </View>:null
                        }
                        {
                            this.state.isManager ? <View style={[styles.row,styles.mditemsBox]}>
                              <Text style={[styles.md_itemsText,{flex: 0}]}>赠品总成本：</Text>
                              <Text style={styles.md_itemsRow}>{Utils.oFixed(this.state.calculateData.costSum,2,true)}<Text style={{color:'#000'}}>元</Text></Text>
                            </View>:null
                        }

                    </View>
                  </View>
                  : <View></View>
                }

                {
                (this.state.dataSource.items  && this.state.data.car.length) || this.state.dataSource.subscription.subscription_ok ?
                 <View>
                   <View style={styles.md_itemTitleBox}>
                     <Text style={styles.md_itemTitle}>订金</Text>
                   </View>
                    <TouchableHighlight underlayColor='#f2f2f2' style={[styles.md_item, { paddingTop: 12, paddingBottom: 6, flexDirection: 'row', backgroundColor: '#fff'}]} onPress={this.state.changeAvilable ? () => {this._subscription()} : null}>
                     <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                       <View style={{flex: 1}}>
                         <View style={{flexDirection: 'row', marginBottom: Utils.normalize(3)}}>
                           <Text style={{marginLeft: 15, fontSize: Utils.normalize(14)}}>预先支付订金：{ !data.subscription.subscription_has ? '' : Utils.oFixed(data.subscription.subscription_money,2,true)+'元'} </Text>
                           {data.subscription.subscription_ok?<View style={[styles.redBtn, {marginTop: 0}]}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                           <Text  style={[styles.md_itemsTextCarR,{marginRight:8,marginTop:1}]}>{ !data.subscription.subscription_has  ? '未填写' : ''}</Text>
                         </View>
                         {
                           data.appendsubscription.appendsubscription_has ?
                             <View style={styles.md_itemsTextBox}>
                               <Text style={styles.md_itemsText}>追加：{data.appendsubscription.appendsubscription_money === null ? '未填写' : Utils.oFixed(data.appendsubscription.appendsubscription_money,2,true) + '元'} </Text>
                               {data.appendsubscription.appendsubscription_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                             </View>
                           : null
                         }
                         {
                           data.unsubscription.unsubscription_has ?
                             <View style={styles.md_itemsTextBox}>
                               <Text style={{marginLeft: 15}}>退订：{data.unsubscription.unsubscription_money === null ? '未填写' : Utils.oFixed(data.unsubscription.unsubscription_money,2,true) + '元'} </Text>
                               {data.unsubscription.unsubscription_ok?<View style={styles.redBtn}><Text style={{color:'#fff',fontSize:Utils.normalize(10)}}>已结算</Text></View>:null}
                             </View>
                           : null
                         }
                       </View>
                       {
                         this.state.changeAvilable ?
                         <View style={{width: Utils.normalize(28), backgroundColor: 'transparent', justifyContent: 'center'}}>
                           <Icon style={{textAlign: 'left'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                         </View>
                         : <View style={{width: 15}}></View>
                       }
                     </View>
                   </TouchableHighlight>
                 </View>
                 : <View></View>
                }

                {//判断是否是子单据
                  data.common.master_cart?
                      <View>
                        {//判断是否有商品
                          this.state.hasGoods ?
                          <View>
                            <View style={styles.md_itemTitleBox}>
                              <Text style={styles.md_itemTitle}>新车</Text>
                            </View>
                            {this._customerCar()}
                          </View>
                          :
                          <View style={[{height: Utils.normalize(320), alignItems: 'center'}]}>
                              <View style={[styles.row,{marginTop: Utils.normalize(60)}]}>
                                <Image style={{width: Utils.normalize(21), height: Utils.normalize(21), alignSelf: 'flex-end'}} source={Assets.icons.shop_cart}/>
                                <Text style={{color: '#99a6ad',marginLeft: Utils.normalize(10),alignSelf: 'flex-end'}}>暂无商品</Text>
                              </View>
                              <View style={{marginTop: 20}}>
                                <Button pattern={{outLine:'smallBorderBtn',text:'smallLongBorderBlue'}} onPress={()=>this._goShopping()}  value="去选购"></Button>
                              </View>
                          </View>
                        }
                      </View>
                      :
                      <View>
                        {//判断是否有商品
                          this.state.hasGoods ?
                            <View>
                              {//是否有新车   有新车展现新车  无新车可选择已购车辆或录入车辆
                                this.state.data.car.length?
                              <View>
                                <View style={styles.md_itemTitleBox}>
                                  <Text style={styles.md_itemTitle}>新车</Text>
                                </View>
                                <View style={styles.md_item}>
                                  {this._car()}
                                  <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                                  <View style={{borderBottomWidth:0.5,borderColor:'#ccc'}}>
                                    <TouchableHighlight style={{backgroundColor:'#fff'}} underlayColor='#f2f2f2' onPress={()=>this._installmentCredit(this.state.credit)}>
                                      <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
                                        <Text style={styles.md_itemsTextCar}>分期贷款</Text>
                                        <Text style={styles.md_itemsTextCarR}>{credit?credit.goods_name:''}{credit?<Text style={{fontSize:Utils.normalize(14)}}>●</Text>:null}{credit?credit.supplier_name:'未填写'}</Text>
                                        <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                                      </View>
                                    </TouchableHighlight>
                                  </View>
                                  <View>
                                    <TouchableHighlight style={{backgroundColor:'#fff'}} underlayColor='#f2f2f2' onPress={()=>this._usedCar(this)}>
                                      <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
                                        <Text style={styles.md_itemsTextCar}>二手车置换</Text>
                                        <Text style={styles.md_itemsTextCarR}>{data.usedcar.cost || data.usedcar.cost === 0 ? '收购价：' + Utils.oFixed(data.usedcar.cost,2,true) + '元' : '未填写' }</Text>
                                        <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                                      </View>
                                    </TouchableHighlight>
                                  </View>
                                </View>
                              </View>

                              :

                              <View>
                                {this.state.changeAvilable ||  this.state.dataSource.customer_car && this.state.dataSource.customer_car.car_type?
                                  <View>
                                    <View style={styles.md_itemTitleBox}>
                                      <Text style={styles.md_itemTitle}>新车</Text>
                                    </View>
                                    <TouchableHighlight underlayColor='#f2f2f2' onPress={this.state.dataSource.customer_car && this.state.dataSource.customer_car.car_type && this.state.changeAvilable ? this._boughtCar.bind(this) : null}>
                                      <View style={[styles.md_item]}>
                                        {
                                          this.state.dataSource.customer_car && this.state.dataSource.customer_car.car_type ?
                                          <View style={{flexDirection: 'row'}}>
                                            <View style={{flex: 1}}>
                                              <View style={[styles.md_itemsTextBox,{marginTop: Utils.normalize(7)}]}>
                                                <Text style={[styles.md_itemsText,{flex: 0}]}>{this.state.dataSource.customer_car.car_type}</Text>
                                              </View>
                                              <View style={[styles.md_itemsTextBox]}>
                                                <Text style={[styles.md_itemsText,{flex: 0}]}>车架号：{this.state.dataSource.customer_car.car_vin}</Text>
                                              </View>
                                            </View>
                                            {this.state.changeAvilable ?
                                              <View style={{width: Utils.normalize(28), backgroundColor: 'transparent', justifyContent: 'center'}}>
                                                <Icon style={{textAlign: 'left'}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                                              </View> : <View></View>
                                            }
                                          </View>
                                          : <View></View>
                                        }
                                        {
                                          this.state.changeAvilable && !data.subscription.subscription_ok ?
                                          <View style={[styles.row,{paddingTop: Utils.normalize(14),paddingBottom: Utils.normalize(14)}]}>
                                            <View style={{flex: 1,flexDirection: 'row',marginLeft: Utils.normalize(43)}}>
                                              <Button pattern={{outLine:'smallBorderBtn',text:'smallLongBorderBlue'}} onPress={this._changBought.bind(this)} value="查看已购车辆"></Button>
                                            </View>
                                            <View style={{flex: 1,flexDirection: 'row',marginRight: Utils.normalize(43),justifyContent: 'flex-end',}}>
                                              <Button pattern={{outLine:'smallBorderBtn',text:'smallLongBorderBlue'}} onPress={()=>this._addNewCar()} value="录入新车辆"></Button>
                                            </View>
                                          </View>
                                          :
                                          <View>
                                            <View>
                                              <TouchableHighlight style={{backgroundColor:'#fff'}} underlayColor='#f2f2f2' onPress={()=>this._usedCar(this)}>
                                                <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
                                                  <Text style={styles.md_itemsTextCar}>二手车置换</Text>
                                                  <Text style={styles.md_itemsTextCarR}>{data.usedcar.cost || data.usedcar.cost === 0 ? '收购价：' + Utils.oFixed(data.usedcar.cost,2,true) + '元' : '未填写' }</Text>
                                                  <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                                                </View>
                                              </TouchableHighlight>
                                            </View>
                                          </View>

                                        }

                                        </View>
                                      </TouchableHighlight>
                                  </View>

                                  :

                                   <View></View>
                                }
                              </View>
                              }
                            </View>
                          :
                          <View style={[{height: Utils.normalize(320), alignItems: 'center'}]}>
                            <View style={[styles.row,{marginTop: Utils.normalize(60)}]}>
                              <Image style={{width: Utils.normalize(21), height: Utils.normalize(21), alignSelf: 'flex-end'}} source={Assets.icons.shop_cart}/>
                              <Text style={{color: '#99a6ad',marginLeft: Utils.normalize(10),alignSelf: 'flex-end'}}>暂无商品</Text>
                            </View>
                            <View style={{marginTop: 20}}>
                              <Button pattern={{outLine:'smallBorderBtn',text:'smallLongBorderBlue'}} onPress={()=>this._goShopping()}  value="去选购"></Button>
                            </View>
                          </View>
                        }

                      </View>
                    }

                {this.state.data.suit.length > 0?
                <View>
                  <View style={styles.md_itemTitleBox}>
                    <Text style={styles.md_itemTitle}>套装</Text>
                  </View>
                  <View style={styles.md_item}>
                    {this._suit()}
                    <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={styles.md_itemsPrice}>
                      <Text style={styles.md_itemPriceitem}>总金额：<Text style={styles.priceRed}>¥{Utils.oFixed(suitData.price,2,true)}</Text></Text>
                      <Text style={styles.md_itemPriceitem}>赠品总价：<Text style={styles.priceRed}>¥{Utils.oFixed(suitData.cost,2,true)}</Text></Text>
                    </View>
                  </View>
                </View>:null}

                {this.state.data.fee.length > 0?
                <View>
                  <View style={styles.md_itemTitleBox}>
                    <Text style={styles.md_itemTitle}>其它</Text>
                  </View>
                  <View style={styles.md_item}>
                    {this._category('fee')}
                    <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={styles.md_itemsPrice}>
                      <Text style={styles.md_itemPriceitem}>总金额：<Text style={styles.priceRed}>¥{Utils.oFixed(feeData.price,2,true)}</Text></Text>
                      <Text style={styles.md_itemPriceitem}>赠品总价：<Text style={styles.priceRed}>¥{Utils.oFixed(feeData.cost,2,true)}</Text></Text>
                    </View>
                  </View>
                </View>:null}

                {this.state.data.product.length > 0?
                <View>
                  <View style={styles.md_itemTitleBox}>
                    <Text style={styles.md_itemTitle}>精品</Text>
                  </View>
                  <View style={styles.md_item}>
                    {this._product()}
                    <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={styles.md_itemsPrice}>
                      <Text style={styles.md_itemPriceitem}>总金额：<Text style={styles.priceRed}>¥{Utils.oFixed(productData.price,2,true)}</Text></Text>
                      <Text style={styles.md_itemPriceitem}>赠品总价：<Text style={styles.priceRed}>¥{Utils.oFixed(productData.cost,2,true)}</Text></Text>
                    </View>
                  </View>
                </View>:null}

                {this.state.data.insure.length > 0?
                <View>
                  <View style={[styles.md_itemTitleBox,{flexDirection:'row', justifyContent:'flex-start',paddingTop:6}]}>
                    <Text style={styles.md_itemTitle}>保险</Text>
                    <View style={{marginTop:5,marginLeft:1,marginRight:1,width:4,height:4,borderRadius:2,backgroundColor:'#999',overflow: 'hidden'}}></View>
                    <Text  style={[styles.md_itemTitle, {marginLeft:0}]}>{ Number(data.common.renew_insure)==0?'新保':'续保'}</Text>
                  </View>
                  <View style={styles.md_item}>
                    {this._category('insure')}
                    <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={styles.md_itemsPrice}>
                      <Text style={styles.md_itemPriceitem}>总金额：<Text style={styles.priceRed}>¥{Utils.oFixed(insureData.price,2,true)}</Text></Text>
                      <Text style={styles.md_itemPriceitem}>赠品总价：<Text style={styles.priceRed}>¥{Utils.oFixed(insureData.cost,2,true)}</Text></Text>
                    </View>
                  </View>
                </View>:null}

                {this.state.data.beauty.length > 0?
                <View>
                  <View style={styles.md_itemTitleBox}>
                    <Text style={styles.md_itemTitle}>汽车美容</Text>
                  </View>
                  <View style={styles.md_item}>
                    {this._category('beauty')}
                    <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={styles.md_itemsPrice}>
                      <Text style={styles.md_itemPriceitem}>总金额：<Text style={styles.priceRed}>¥{Utils.oFixed(beautyData.price,2,true)}</Text></Text>
                      <Text style={styles.md_itemPriceitem}>赠品总价：<Text style={styles.priceRed}>¥{Utils.oFixed(beautyData.cost,2,true)}</Text></Text>
                    </View>
                  </View>
                </View>:null}

                {this.state.data.extInsure.length > 0?
                <View>
                  <View style={styles.md_itemTitleBox}>
                    <Text style={styles.md_itemTitle}>延长质保</Text>
                  </View>
                  <View style={styles.md_item}>
                    {this._category('extInsure')}
                    <View style={{height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={styles.md_itemsPrice}>
                      <Text style={styles.md_itemPriceitem}>总金额：<Text style={styles.priceRed}>¥{Utils.oFixed(extInsureData.price,2,true)}</Text></Text>
                      <Text style={styles.md_itemPriceitem}>赠品总价：<Text style={styles.priceRed}>¥{Utils.oFixed(extInsureData.cost,2,true)}</Text></Text>
                    </View>
                  </View>
                </View>:null}

                <View style={{backgroundColor:'#fff',marginTop:9}}>
                  <TouchableHighlight style={{backgroundColor:'#fff'}} underlayColor='#f2f2f2' onPress={()=>{this._remarkDetail(data.common.des)}} >
                    <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
                      <Text style={[styles.md_itemsTextCar,{width:Utils.normalize(65),flex:0}]}>单据备注</Text>
                      <Text style={[{color:'#999999',marginRight:35,flex:4,textAlign:'right'},styles.md_itemsTextCar]} numberOfLines={1}>{data.common.des?data.common.des:'未填写'}</Text>
                      <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
          :<Text></Text>}
        </ScrollView>
        {this.state.carts && this.state.carts.length > 0 && this.state.hasChildCart?
        <View style={[styles.overlay]}  onStartShouldSetResponder={() => this.setState({hasChildCart: false})}>
          <View style={{backgroundColor:'#efefef',position:'absolute',bottom:btns.length>0 ? Utils.normalize(49) : 0,width:Utils.width}}>
            <View style={[{paddingLeft:15,paddingRight:15,height:Utils.normalize(50),backgroundColor:'#fff',alignItems:'center'},styles.row]}>
              <Text style={{ flex:3,color:'#939292',fontSize:11 }}>编号</Text>
              <Text style={{ flex:6,color:'#939292',fontSize:11 }}>所含商品</Text>
              <Text style={{ flex:2,color:'#939292',fontSize:11 }}>商品数量</Text>
            </View>
            {this._carts()}
            <TouchableHighlight style={{backgroundColor:'#fff',height:55,justifyContent:'center',marginTop: 10}} underlayColor='#f2f2f2' onPress={() => this.setState({hasChildCart: false})}>
              <Text style={{color: '#fe3a2e',fontSize: 17,textAlign: 'center'}}>取消</Text>
            </TouchableHighlight>
          </View>
          </View>
        : null}

        {btns.length>0?
        <View>
          <View style={{height:Utils.normalize(49)}}></View>
          <View style={[styles.row,{justifyContent:'flex-end',height:Utils.normalize(49),backgroundColor:'#fff',position:'absolute',bottom:0,width:Utils.width,alignItems:'center',borderTopWidth:1,borderColor:'#ccc'}]}>
          {btns}
          </View>

        </View>:null}
        { this.state.callStatus?
          <View style={[styles.overlay]}  onStartShouldSetResponder={() => this.setState({callStatus:false})}>
            <View style={{flex:1,justifyContent:'flex-end'}}>
              <TouchableHighlight underlayColor='#f2f2f2' onPress={()=>{this._call(contact_tel)}}  style={[styles.bigBtn,{marginBottom:10}]}><Text style={{fontSize:Utils.normalize(18),color:'#387ff5'}}>{contact_name}：{contact_tel}</Text></TouchableHighlight>
              <TouchableHighlight underlayColor='#f2f2f2' onPress={()=>{this.setState({callStatus:false})}} style={[styles.bigBtn,{marginBottom:10}]}><Text style={{fontSize:Utils.normalize(18),color:'#fe3a2e'}}>取消</Text></TouchableHighlight>
            </View>
          </View>:null}
          {this.state.LoadIcon ? <Loading/> : <View></View>}
          {this._tipShow()}
      </View>
    )
  }
  _billDetail(){
     Actions.billDetail({data:this.state});
  }
}

export default CartDetail
