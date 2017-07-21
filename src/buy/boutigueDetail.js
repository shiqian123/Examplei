/**
* @Author: shiqian
* @Date:   2016-09-29T10:29:26+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T15:01:13+08:00
*/

/**
 * Created by shiqian on 16/8/27.
 */
import React, { Component } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
  View,
  StyleSheet,
  Text,
  Alert,
  Animated,
  ToastAndroid,
  ListView,
  DeviceEventEmitter,
  TouchableHighlight
} from 'react-native';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Box,Button,Tip} from '../components';
let timer; let stkArr=[];
class BoutigueDetail extends Component{
  // 构造
    constructor(props) {
      super(props);
      // 初始状态
        var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
      this.state = {
        dataSource,
        itemCount:'',
        cartId:'',
        coloeDefault:'红色',
        success:false,
        isloading:false,
        zerostkDefault: '', //库存默认第一位
        num:1,
        ani:new Animated.Value(Utils.height),
        aniList:new Animated.Value(Utils.height),
        isLoading:false,
        item:'',
        nowStockNum:0
      };
    }
  componentWillUnmount() {
    stkArr=[];
    this.subscription.remove();
    RCTDeviceEventEmitter.emit('update',this.props.param.cartId==''?this.state.cartId:this.props.param.cartId)
  }
  componentWillReceiveProps(next) {
    if(next.zerostkDefault!=undefined){
      this.setState({zerostkDefault:next.zerostkDefault})
    //  stkArr=[];
    }
    if(this.props.param.cartId!=''&&this.state.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId==''?this.state.cartId:this.props.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
          this.setState({isLoading:false})
        }
      )
    }
  }
  componentDidMount() {
    if(this.props.param.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
        }
      )
    }
    if(this.props.param.cartId==''){
      this.setState({
        isLoading:true
      })
      let time = new Date().getTime();
      Utils.fetch( Utils.api.cartList, 'post', {gts: time})
      .then( (res)=> {
          listData = res.list;
          listData.forEach((d,i)=>{
              d.common.show = true;
          });
          let that = this;
          setTimeout(()=>{
              that.setState({
                  dataSource: that.state.dataSource.cloneWithRows(res.list),
                  isLoading: false,
              });
          },200)
      },(err)=>{
        this.setState({isLoading: false});
      });
    }
    let that=this;
    this.subscription = DeviceEventEmitter.addListener('update',function (){
      Utils.fetch(Utils.api.get,'post',{id:that.props.param.cartId==''?that.state.cartId:that.props.param.cartId}).then(
        (res)=>{
          that.setState({itemCount:res.common['item_count']})
        }
      )
    })
    if(Object.keys(this.props.data.stk).length>1){
         this._defaultName()
    }else{
      if(Object.keys(this.props.data.stk)[0]!=''&&Object.keys(this.props.data.stk).length!=0){
        this._defaultName()
      }else{
        this.setState({zerostkDefault:this.props.data.zerostk[0]})
      }
    }
  }
  _goBack(){
    let that = this
    setTimeout( ()=> {
      Actions.pop({refresh: {cartId:that.state.cartId}})
    },0)
  }
  //打开选择车身颜色界面
  _selectParam(){
    this.setState({
      showColorList:true
    })
    this._openColor()
  }
  _openColor(){
    this.setState({
      showCartList:true
    })
    Animated.timing(
     this.state.ani,
     {
       toValue: 0,
       duration: 250,
     }
   ).start();
  }
  _closeColor(){
    Animated.timing(
     this.state.ani,
     {
       toValue: Utils.height,
       duration: 250,
     }
   ).start();
  }
  _openList(item){
    if(this.props.param.cartId==''&&this.state.dataSource._dataBlob.s1.length==0){
      Alert.alert('提示','请先创建购物车',[{
        text:'确认',
        onPress:()=>{
          Actions.popTo('chooseNewCar')
        }
      }])
      return
    }
    if(this.props.param.cartId!=''||this.state.cartId!=''){
      this._fetchBuy(item,this.props.param.cartId)
      return
    }
    Animated.timing(
     this.state.aniList,
     {
       toValue: 0,
       duration: 250,
     }
   ).start();
  }
  _closeList(){
    Animated.timing(
     this.state.aniList,
     {
       toValue: Utils.height,
       duration: 250,
     }
   ).start();
  }
  _addCart(item,noCartTip){
    this.setState({
      showCartList:true,
      showColorList:true,
      item:item
    })
    if(noCartTip){
      this._openColor();
      return
    }
    if(this.props.param.cartId==''&&this.state.dataSource._dataBlob.s1.length==0){
      Alert.alert('提示','请先创建购物车',[{
        text:'确认',
        onPress:()=>{
          Actions.popTo('chooseNewCar')
        }
      }])
      return
    }

  if(this.props.data.zerostk.length==0&&Object.keys(this.props.data.stk)[0]==''&&Object.keys(this.props.data.stk).length==1){
    if(this.props.param.cartId==''){
      this._openList(item)
    }else{
      this._fetchBuy(item)
    }
   }else {
     this._openColor()
   }
  }
  rowAddCart(data){
    this._fetchBuy(this.state.item,data.common.id)
  }
  _fetchBuy(data,cartId){
    this.setState({isLoading:true})
     let _tempCart = (this.props.param.cartId=='')?cartId:this.props.param.cartId;
    let param ={
      cart_id:_tempCart,
      category:"2",
      item:{
        category:"2",
        class_id:data.flag,
        goods_name:data.atr.nm,
        goods_param:this.state.zerostkDefault==undefined?"":this.state.zerostkDefault, //选择颜色
        num:this.state.num, //购买数量
        sale_price:data.atr.prc
      }
    }
    Utils.fetch(Utils.api.buying,'post',param)
      .then((res) => {
        this.setState({isloading: false});
        this.setState({
          cartId:_tempCart
        })
        this._closeList();
        this._closeColor();
        clearTimeout(timer);
        if(res.msg == '添加成功'){
          this.setState({hasBuy: true,success: true});
          let that = this;
          timer = setTimeout(function(){
            that.setState({success: false});
            that._goBack()
          },1500);
          Utils.fetch(Utils.api.get,'post',{id:_tempCart}).then(
            (res)=>{
              this.setState({itemCount:res.common['item_count']})
              this.setState({isLoading:false})
            }
          )
        }
      })
  }
  _defaultName(){
    _.forIn(this.props.data.stk,(v,k)=>{

      let _obj = {}
      _obj.name = k;
      _obj.number = v.num;
      if(k!=''){
        stkArr.push(_obj);
      }
    })
    this.setState({zerostkDefault:stkArr[0].name,nowStockNum:stkArr[0].number})
  }
  _numChange(type) {
    // type === 'add' ? this.setState({num: this.state.num+1}) : this.setState({num: this.state.num-1})
    if (type === 'add') {
      this.setState({num: this.state.num+1});
    } else {
      if (this.state.num === 1) {
        return;
      } else {
        this.setState({num: this.state.num-1});
      }
    }
  }
  _changeStatus(item,flag,number){
    this.setState({
      zerostkDefault:item,
    })
    if(number){
      this.setState({
        nowStockNum:number
      })
    }else {
      this.setState({
        nowStockNum:0
      })
    }
  }
  _renderRow(data,sectionID,rowId) {
      return (
        <TouchableHighlight style={{backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f2f2f2' onPress={()=>this.rowAddCart(data)}>
            <View style={[styles.buyMsgBlock,{backgroundColor: !data.common.show ? '#f1f7eb' : '#fff'}]}>
                <View style={[styles.buyMsgRowContent,{borderBottomWidth :(rowId == (listData.length-1) ? 0 : 0.5)}]}>
                    <View style={styles.buyMsgRow1}>
                        <Text style={styles.buyMsgName}>{data.customer.customer_name}</Text>
                        <Text style={styles.buyMsgTime}>{data.common.create_time}</Text>
                    </View>
                    {
                        data.customer_car.car_vin ?
                        <View style={styles.buyMsgRow1}>
                            <Text style={styles.msgList}>主销售单车架号：{data.customer_car.car_vin}</Text>
                        </View> :
                        null
                    }
                    {
                        data.subscription.subscription_money ?
                        <View style={styles.buyMsgRow1}>
                            <Text style={styles.buyMsgList}>已交订金：¥{data.subscription.subscription_money} 元</Text>
                        </View> :
                        null
                    }
                     <View style={styles.buyMsgRow1}>
                        <Text style={styles.buyMsgList}>电话：{data.customer.customer_tel}</Text>
                    </View>
                    <View style={styles.buyMsgRow1}>
                        <Text style={[styles.buyMsgList,{flex:1}]}>性别：{data.customer.customer_sex}</Text>
                        <Text style={[styles.buyMsgList,{flex:1,marginLeft: -50}]}>销售单编号：{data.common.id}</Text>
                        {/*
                            data.common.show ?
                            <Button pattern={{outLine:'mediumFullBtn',text:'mediumTextWhite'}} style={{marginRight:42,marginTop:-14}} onPress={()=>this._onActivate(data.common.id)} value="激活"></Button>
                            : <Text style={{marginRight:42,marginTop:-14,width:51}}></Text>
                        */}
                    </View>
                </View>
                <Icon style={[styles.md_iconChevrenH,{top:45}]} color='#cccccc' name='ios-arrow-forward' size={23}/>
            </View>
        </TouchableHighlight>
      )
  }
  render(){
    let data = this.props.data;
    let stk = data.stk;//库存信息
    let zerostk = data.zerostk;//预定库存信息
    let cfgArr=[];
    _.forIn(data.atr.cfg,function(v,k){
      let _obj={};
      _obj.name = k;
      _obj.value = v;
      if(k!=''){
          cfgArr.push(_obj);
      }
    })
    return(
      <View style={styles.container}>
        <Header title="商品详情" leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <ScrollView>
          <View style={b_styles.block}>
            <View>
              <Text style={b_styles.name}>{data.atr.nm}{data.stock_num==0?'(预定)':''}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3}}>
                <Text style={b_styles.grayColor}>指导价：<Text style={b_styles.redColor}>¥ {Utils.oFixed(data.atr.prc,2,true)}</Text></Text>
              </View>
              <View style={{flex:2}}>
                <Text style={b_styles.blueColor}>库存：{data.count}</Text>
              </View>
            </View>
          </View>
          {this.props.data.zerostk.length==0&&Object.keys(this.props.data.stk)[0]==''&&Object.keys(this.props.data.stk).length==1?null:
            <TouchableOpacity style={{backgroundColor:'#fff',marginTop:12}} onPress={()=>this._addCart(data,true)}>
              <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
                <Text style={[styles.md_itemsTextCar,{fontSize:Utils.normalize(16)}]}>请选择{data.atr.pnm}</Text>
                <Text style={[styles.md_itemsTextCarR,{fontSize:Utils.normalize(16)}]}>{this.state.zerostkDefault}</Text>
                <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </View>
            </TouchableOpacity>
          }

          <View style={[styles.itemTitle,{marginTop:12}]}>
            <Text style={[styles.rect,{color:'#ffb400'}]}>{'|'}</Text>
            <Text style={styles.sectitle}>详细介绍</Text>
          </View>
          <View style={{backgroundColor:'#fff'}}>
              <Box left={'品牌'} right={data.atr.brd}/>
            <Box left={'是否原装'} right={data.ior==0?'非原装':'原装'}/>
            {
              cfgArr.map((item,key)=>{
                return(
                  <Box left={item.name} key={key} right={item.value}/>
                )
              })
            }
            <View style={{marginLeft:12}}>
              <View>
                <Text style={styles.desBox} >详细情况{this.props.param.cartId!=''||this.state.cartId!=''}
                  <Text  style={styles.desText}> {data.atr.des}</Text>
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>
        <TouchableOpacity style={[styles.buttonshadow]} onPress={()=>this._addCart(data)}>
          <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>加入购物车</Text>
        </TouchableOpacity>
        {this.props.param.cartId!=''||this.state.cartId!=''? <Cart itemCount={this.state.itemCount}  id={(this.props.param.cartId=='')?this.state.cartId:this.props.param.cartId}/>:null}
        {this.state.showColorList?
          <Animated.View style={{position:'absolute',top:this.state.ani,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}   >
            <View onStartShouldSetResponder={() => this._closeColor()} style={{height: Utils.height*0.40,width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>

              <View style={{backgroundColor:'#fff',height:84,paddingLeft:12,paddingTop:12,height:Utils.height*0.75,}}>
                <View style={{flexDirection:'column',borderBottomColor:'#ccc'}}>
                <Text style={{color:'red',fontSize:20,paddingBottom:4}}>¥ {Utils.oFixed(data.atr.prc,2,true)}</Text>
                <Text style={{paddingBottom:4}}>库存{this.state.nowStockNum}件</Text>
                <Text style={{color:'#878787'}}>请选择 商品{data.atr.pnm}</Text>
                </View>
                <View style={{backgroundColor:'#ccc',marginTop:12,marginBottom:12,marginLeft:-12,height:0.5}}></View>
                <TouchableOpacity style={{position:'absolute',right:0,top:8,width :24,height:24}} onPress={()=>this._closeColor()}>
                  <Icon name='ios-close' size={28} style={{color:'#999'}}/>
                </TouchableOpacity>
                <View style={{marginBottom:12,flexDirection:'row'}}>
                   <Text style={{fontSize:14}}>商品颜色</Text>
                </View>
                <ScrollView style={Device.iOS?{}:{marginBottom:54}}>
                  <View style={{flexDirection:'row',flexWrap: 'wrap'}}>
                    {
                      stkArr.map((item, key)=>{
                        return(
                          <TouchableOpacity key={key} onPress={()=>this._changeStatus(item.name,true,item.number)} style={[styles.paramBox,(this.state.zerostkDefault == item.name)?{borderColor:'#387ff5'}:null]}>
                              <Text numberOfLines={1} style={{textAlign:'center'},(this.state.zerostkDefault == item.name)?{color:'#387ff5'}:null}>{item.name}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                    {
                      this.props.data.zerostk.map((item, key)=>{
                        return(
                          <TouchableOpacity key={key} onPress={()=>this._changeStatus(item,true)} style={[styles.paramBox,(this.state.zerostkDefault == item)?{borderColor:'#387ff5'}:null]}>
                              <Text  numberOfLines={1} style={{textAlign:'center',fontSize:12},(this.state.zerostkDefault == item)?{color:'#387ff5'}:null}>{item}
                                  <Text style={{color:'red'}}>
                                  <Text style={(this.state.zerostkDefault == item)?{color:'#387ff5',fontSize:12}:{color:'#000',fontSize:12}}>(</Text>
                                    预定
                                      <Text style={(this.state.zerostkDefault == item)?{color:'#387ff5',fontSize:12}:{color:'#000',fontSize:12}}>)</Text>
                                  </Text>
                              </Text>
                              {/* {this.state.active.nm === item.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null} */}
                          </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                  <View style={{marginTop:24}}>
                    <Text style={{fontSize:14}}>
                    购买数量
                    </Text>
                    <View style={{position:'absolute',right:Utils.normalize(12)}}>
                    <View style={[styles.row,{width: Utils.normalize(84), height: Utils.normalize(30),alignItems: 'center',borderRadius: Utils.normalize(30),backgroundColor: '#f9f8f6', marginTop: Utils.normalize(-24)}]}>
                      <TouchableOpacity onPress={this._numChange.bind(this,'minus')} style={[{marginLeft: Utils.normalize(7),width: Utils.normalize(20)},Device.deviceModel.indexOf('m1')>-1?{marginTop:-6}:null]}>
                        <Text style={[{fontSize: Utils.normalize(25), color: this.state.num == 1 ? '#cccccc' : '#007aff',textAlign: 'center',}]}>-</Text>
                      </TouchableOpacity>
                      <View style={{width: Utils.normalize(30)}}>
                        <Text style={{fontSize: Utils.normalize(16),textAlign: 'center'}}>{this.state.num}</Text>
                      </View>
                      <TouchableOpacity onPress={this._numChange.bind(this,'add')} style={[{width: Utils.normalize(20)},Device.deviceModel.indexOf('m1')>-1?{marginTop:-4}:null]}>
                        <Text style={{fontSize: Utils.normalize(25), color: '#007aff',textAlign: 'center'}}>+</Text>
                      </TouchableOpacity>
                    </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            <TouchableOpacity style={[styles.buttonshadow]}  onPress={()=>this._openList(data)}>
                <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>加入购物车</Text>
            </TouchableOpacity>
          </Animated.View>
          :null}
        {this.state.showCartList?
          <Animated.View style={{position:'absolute',top:this.state.aniList,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}>
            <View onStartShouldSetResponder={() => this._closeList()} style={{height: Utils.height*0.4,width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>
            <View style={{backgroundColor:'rgba(0, 0, 0, 0.4)'}}>
              <View style={{backgroundColor:'#fff',justifyContent:'center',alignItems:'center',height:50}}>
                <Text style={{fontSize:14}}>
                  请选择您要加入的购物车
                </Text>
                <TouchableOpacity style={{position:'absolute',right:0,top:8,width :24,height:24}} onPress={()=>this._closeList()}>
                  <Icon name='ios-close' size={28} style={{color:'#999'}}/>
                </TouchableOpacity>

              </View>
              <View style={{backgroundColor:'#ccc',marginLeft:-12,height:0.5}}></View>

            <ListView style={{height:Utils.height/2+Utils.normalize(20),backgroundColor:'#fff'}}
                dataSource={this.state.dataSource}
                initialListSize={10}
                pageSize={10}
                renderRow={this._renderRow.bind(this)}
            />
            </View>
          </Animated.View>
          :null}

          {
            this.state.success ?
              <Tip  name="添加成功"/>
              : null
          }
          {
            this.state.isloading ?
              <Tip name="请求中.." type="loading" />
              : null
          }
        {this.state.isLoading ? <Loading></Loading>: null}
      </View>

    )
  }
}
const b_styles = StyleSheet.create({
  block: {
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
  },
  name: {
    fontSize: Utils.normalize(16),
    marginTop: 12,
    marginBottom: 12,
  },
  redColor: {
    color: '#f40b0b',
    fontSize: Utils.normalize(14),
  },
  grayColor: {
    color: '#999999',
    fontSize: Utils.normalize(13),
  },
  blueColor: {
    color: '#8393aa',
    fontSize: Utils.normalize(13),
  },
  list:{
    alignItems:'center',
    paddingLeft:3,
    paddingRight:15,
    height:Utils.normalize(45),
    borderBottomWidth:1,
    borderBottomColor:'#ddd',
  }
});
export default BoutigueDetail
