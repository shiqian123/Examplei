/**
* @Author: yanke
* @Date:   2016-09-14T16:58:49+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-15T14:09:11+08:00
*/

/**
 * Created by shiqian on 16/8/24.
 */
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
  Alert,
  StyleSheet,
  Image,
  TextInput,
  Text,
  Animated,
  DeviceEventEmitter
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Box,Button,Tip} from '../components';

let timer;
let cartData = {};
let canBuy = false;

class SuitDetail extends Component{
  // 构造
    constructor(props) {
      var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
      super(props);
      // 初始状态
      this.state = {
        dataSource,
        data: this.props.data,
        cartId: '',
        num: 1,
        aniList:new Animated.Value(Utils.height),
        allBoutique: false,
        hasBuy: false,
        buttonIsShow: false,
        success: false,
        isloading: false,
        alreadyAdd: false,
        itemCount: 0,
        showCartList:false,
        item:''
      };
    }

  componentWillReceiveProps(nextprops) {
    this.setState({allBoutique: this._isAllBoutique(this.state.data.goods)});
    if(this.props.id!=''||this.state.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id: this.props.id==''?this.state.cartId:this.props.id})
        .then((res) => {
          cartData = res;
          let _varBool = false;
          if(res.items){
            let _arr =  res.items['8'];
            let that = this;
            if(res.items['8']){
              canBuy = false;
              _arr.forEach(function(v,i){
                if(v.class_id == that.state.data.class_id){
                  _varBool = true;
                  if(that.state.allBoutique){
                    _varBool = false;
                    canBuy = true;
                  }
                }
              });
            }
            this.setState({hasBuy: _varBool,buttonIsShow: true,itemCount:res.common['item_count']});
          }
          else {
            this.setState({hasBuy: false,buttonIsShow: true,itemCount:res.common['item_count']});
          }
        })
    }

  }
  componentDidMount() {
    this.setState({
      cartId:this.props.id
    })
    this.setState({allBoutique: this._isAllBoutique(this.state.data.goods)});
    if(this.props.id==''){
      this.setState({
        isloading:true
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
                  isloading: false,
              });
          },200)
      },(err)=>{
        this.setState({isloading: false});
      });
    }
        this.setState({buttonIsShow: true});
    if(this.props.id!=''){
      Utils.fetch(Utils.api.get,'post',{id: this.props.id})
        .then((res) => {
          cartData = res;
          let _varBool = false;
          if(res.items){
            let _arr =  res.items['8'];
            let that = this;
            if(res.items['8']){
              _arr.forEach(function(v,i){
                if(v.class_id == that.state.data.class_id){
                  _varBool = true;
                  if(that.state.allBoutique){
                    _varBool = false;
                    canBuy = true;
                  }
                }
              });
            }
            this.setState({hasBuy: _varBool,buttonIsShow: true,itemCount:res.common['item_count']});
          }

        })
    }
    let that = this;
    this.subscription = DeviceEventEmitter.addListener('update',function () {
      that.setState({allBoutique: that._isAllBoutique(that.state.data.goods)});
      if(that.state.cartId==''){
        return
      }
      Utils.fetch(Utils.api.get,'post',{id: that.state.cartId})
        .then((res) => {
          cartData = res;
          let _varBool = false;
          if(res.items){
            let _arr =  res.items['8'];
            if(res.items['8']){
              canBuy = false;
              _arr.forEach(function(v,i){
                if(v.class_id == that.state.data.class_id){
                  _varBool = true;
                  if(that.state.allBoutique){
                    _varBool = false;
                    canBuy = true;
                  }
                }
              });
            }
            that.setState({hasBuy: _varBool,buttonIsShow: true,itemCount:res.common['item_count']});
          }
          else {
            that.setState({hasBuy: false,buttonIsShow: true,itemCount:res.common['item_count']});
          }
        })
    });
  }
 _getCartId(cartId,flag){
   Utils.fetch(Utils.api.get,'post',{id: cartId})
     .then((res) => {
       cartData = res;
       let _varBool = false;
       if(res.items){
         let _arr =  res.items['8'];
         let that = this;
         if(res.items['8']){
           _arr.forEach(function(v,i){
             if(v.class_id == that.state.data.class_id){
               _varBool = true;
               if(that.state.allBoutique){
                 _varBool = false;
                 canBuy = true;
               }
             }
           });
           if(flag){
              that._fetchBuy(that.state.data,cartId)
           }
         }
         else{
             that._fetchBuy(that.state.data,cartId)
         }
         this.setState({hasBuy: _varBool,buttonIsShow: true,itemCount:res.common['item_count']});
       }

     })
 }
  componentWillUnmount(){
    this.subscription.remove();
  }

  _onRreshCart(_tempCart){
    Utils.fetch(Utils.api.get,'post',{id: _tempCart})
      .then((res) => {
        cartData = res;
        this.setState({itemCount: res.common.item_count})
      })
  }

  _isAllBoutique(obj) {
    if(!obj) return false;
    let _var = true;
    _.forIn(obj,function(v,i){
      if(i != 2){
        _var = false;
      }
    });
    return _var
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

  _reapeatSuit(obj){
    if(!obj) return;
    let arr = [];
    _.forIn(obj,function(v,i){
      if(v){
        v.forEach(function(v,i){
          arr.push(v);
        })
      }
    });
    return arr.map((item,key) => {
      return (
        <Text key={key} style={{fontSize:Utils.normalize(12),color:'#333',marginBottom:10}}>{key + 1}、{item.goods_name} x {item.num}</Text>
      )
    });
  }

  _objToStr(obj){
    if(!obj) return;
    let str = '';
    _.forIn(obj,function(v,i){
      str += i + ':' + v + ';'
    });
    return str.substring(0,str.length-1);
  }

  _arrToStr(obj){
    if(!obj) return;
    let str = '';
    obj.forEach(function(v,i){
      str += v +'|';
    });
    return str.substring(0,str.length-1);
  }

  _goBack(){
    let that = this
    setTimeout( ()=> {
      Actions.pop({refresh: {cartId:that.state.cartId}})
    },0)
  }

  _addCart(item){
    if(this.state.cartId==''&&this.state.dataSource._dataBlob.s1.length==0){
      Alert.alert('提示','请先创建购物车',[{
        text:'确认',
        onPress:()=>{
          Actions.popTo('chooseNewCar')
        }
      }])
      return
    }
    this.setState({
      showCartList:true,
      item:item
    })
    if(this.state.hasBuy){
      clearTimeout(timer);
      this.setState({alreadyAdd:true});
      timer = setTimeout(()=>{
        this.setState({alreadyAdd:false})
        Actions.pop()
      },1500)
      return
    }
    if(this.state.cartId==''){
      this._openList(item)
      this.setState({isloading:false})
    }else{
      this._fetchBuy(item)
    }
  }
  _openList(data){
    if(this.state.cartId!=''){
      this._fetchBuy(data,this.state.cartId)
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
  _fetchBuy(data,cartId){
    this.setState({isloading: true});
    let _tempCart = (this.state.cartId=='')?cartId:this.state.cartId;
    this.state.data.num = this.state.num;
    if(canBuy && this.state.allBoutique){
      let _d = cartData.items['8'] ? cartData.items['8'] : [],that = this;
      _d.forEach(function(v,i){
        if(v.class_id == that.state.data.class_id){
          v.num += that.state.num;
        }
      });
      let _props = {
        cart: cartData
      }
      Utils.fetch(Utils.api.save,'post',_props,()=>{Actions.pop()})
        .then((res) => {
            this._onRreshCart(_tempCart);
            this.setState({isloading: false});
            clearTimeout(timer);
            this.setState({success: true});
            this.setState({
              cartId:_tempCart
            })
              this._closeList();
            let that = this;
            timer = setTimeout(function(){
              that.setState({success: false});
              Actions.pop({refresh: {cartId:that.state.cartId}})
            },1500);
        })
    }
    else {
      itemData = this.state.data;
      itemData['sale_price'] = this.state.data['price'];
      itemData['goods_name'] = this.state.data['name'];
      let _props = {
        cart_id: _tempCart,
        category: 8,
        item: itemData,
      }
      Utils.fetch(Utils.api.buying,'post',_props,()=>{Actions.pop()})
        .then((res) => {
            this.setState({isloading: false});
            clearTimeout(timer);
              this._closeList();
            if(res==null){
              this.setState({isloading: false,hasBuy:false});
              return
            }
            if(res.msg == '添加成功'){
              this._onRreshCart(_tempCart);
              this.setState({
                cartId:_tempCart
              })

              if(this.state.allBoutique){
                canBuy = true;
                this.setState({hasBuy: false,success: true});

                let that = this;
                timer = setTimeout(function(){
                  that.setState({success: false});
                  Actions.pop({refresh: {cartId:that.state.cartId}})
                },1500);
              }
              else {
                this.setState({hasBuy: true,success: true});
                let that = this;
                timer = setTimeout(function(){
                  that.setState({success: false});
                  Actions.pop({refresh: {cartId:that.state.cartId}})
                },1500);
              }
            }
        })
    }
  }
  rowAddCart(data){
    this._getCartId(data.common.id,true);
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
    let _d = this.state.data;
    return (
      <View style={[styles.container,{backgroundColor:'#fff'}]}>
        <Header title="商品详情" leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <ScrollView style={{marginBottom:44}}>
          <View style={stylesSu.block}>
            <View>
              <Text style={stylesSu.name}>{_d.name}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:3}}>
                <Text style={stylesSu.grayColor}>指导价：<Text style={stylesSu.redColor}>¥ {Utils.oFixed(_d.price,2,true)}</Text></Text>
              </View>
              {/* {
                this.state.allBoutique ?
                <View style={{flex:3,flexDirection: 'row'}}>
                  <Text style={stylesSu.grayColor}>数量：</Text>
                  <View style={[styles.row,{width: Utils.normalize(84), height: Utils.normalize(30),alignItems: 'center',borderRadius: Utils.normalize(30),backgroundColor: '#f9f8f6', marginTop: Utils.normalize(-8)}]}>
                    <TouchableOpacity onPress={this._numChange.bind(this,'minus')} style={[{marginLeft: Utils.normalize(7),width: Utils.normalize(20)},Device.deviceModel.indexOf('m1')>-1?{marginTop:-6}:null]}>
                      <Text style={{fontSize: Utils.normalize(25), color: this.state.num == 1 ? '#cccccc' : '#007aff',textAlign: 'center'}}>-</Text>
                    </TouchableOpacity>
                    <View style={{width: Utils.normalize(30)}}>
                      <Text style={{fontSize: Utils.normalize(16),textAlign: 'center'}}>{this.state.num}</Text>
                    </View>
                    <TouchableOpacity onPress={this._numChange.bind(this,'add')} style={[{width: Utils.normalize(20)},Device.deviceModel.indexOf('m1')>-1?{marginTop:-4}:null]}>
                      <Text style={{fontSize: Utils.normalize(25), color: '#007aff',textAlign: 'center'}}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                :
                <View style={{flex:3}}>
                  <Text style={stylesSu.grayColor}>数量：<Text style={stylesSu.redColor}>1</Text></Text>
                </View>
              } */}
              {
                this.state.allBoutique ?
                <View style={{flex:2}}>
                  <Text style={stylesSu.blueColor}>库存：{_d.stock_num}</Text>
                </View>
                : null
              }
            </View>
            <View>
              <Text style={stylesSu.name}>套装包含：</Text>
            </View>
            <View style={{paddingLeft: 36}}>
              {this._reapeatSuit(_d.goods)}
            </View>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Text style={[stylesSu.blueColor,{fontSize:Utils.normalize(13)}]}>活动时间:</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={{fontSize:Utils.normalize(13)}}>{(_d.begin_time).slice(0,10)} ~ {_d.end_time ? (_d.end_time).slice(0,10) : '不限'}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row',marginTop:Utils.normalize(8)}}>
              <View>
                <Text  style={[stylesSu.blueColor,{fontSize:Utils.normalize(13)}]}>描述:</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={{fontSize:Utils.normalize(13)}}>{_d.description ? _d.description : ''}</Text>
              </View>
            </View>
          </View>
          <View style={stylesSu.blockLineW}></View>
          {
            _d.goods['2'] ?
            _d.goods['2'].map((item,key) => {
              return (
                <View key={key}>
                  <View style={stylesSu.blockLine}></View>
                  <View style={styles.itemTitle}>
                    <Text style={[styles.rect,{color:'#ffb400'}]}>{'|'}</Text>
                    <Text style={styles.sectitle}>{item.goods_name}</Text>
                  </View>
                  <Box left={'品牌'} right={item.brand} style={{marginLeft:12}}/>
                  <Box left={'是否原装'} right={item.is_origin == 0 ? '否' : '是'} style={{marginLeft:12}}/>
                  <Box left={'库存'} right={item.stock_num} style={{marginLeft:12}}/>
                  <View style={{marginLeft:12}}>
                    <View style={stylesSu.list}>
                      <Text style={[styles.creditLeft,{flex:1}]}>规格</Text>
                      <Text style={[styles.creditRight,{flex:2}]}>{this._objToStr(item.config)}</Text>
                    </View>
                  </View>
                  <View style={{marginLeft:14}}>
                    <View style={ [{borderBottomColor:'#fff'}]}>
                      <Text style={[styles.desBox,{lineHeight:20}]} >详细情况
                        <Text  style={{color:'#999999',fontSize:Utils.normalize(16),paddingLeft:24}}> {item.des}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
            : null
          }
          {
            _d.goods['5'] ?
            _d.goods['5'].map((item,key) => {
              return (
                <View key={key}>
                  <View style={stylesSu.blockLine}></View>
                  <View style={styles.itemTitle}>
                    <Text style={[styles.rect,{color:'#ffb400'}]}>{'|'}</Text>
                    <Text style={styles.sectitle}>{item.goods_name}</Text>
                  </View>
                  <Box left={'详细'} right={item.content} style={{marginLeft:12}}/>
                  <Box left={'购买限制'} right={item.buylimit} style={{marginLeft:12}}/>
                  <Box left={'供应商'} right={item.supplier_name} style={{marginLeft:12}}/>
                  <View style={{marginLeft:14}}>
                    <View style={ [{borderBottomColor:'#fff'}]}>
                      <Text style={[styles.desBox,{lineHeight:20}]}>详细情况
                        <Text  style={{color:'#999999',fontSize:Utils.normalize(16),paddingLeft:24}}> {item.des}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
            : null
          }
          {
            _d.goods['4'] ?
            _d.goods['4'].map((item,key) => {
              return (
                <View key={key}>
                  <View style={stylesSu.blockLine}></View>
                  <View style={styles.itemTitle}>
                    <Text style={[styles.rect,{color:'#ffb400'}]}>{'|'}</Text>
                    <Text style={styles.sectitle}>{item.goods_name}</Text>
                  </View>
                  <Box left={'关联车系'} right={this._arrToStr(item.asso_type_nm)} style={{marginLeft:12}}/>
                  <View style={{marginLeft:14}}>
                    <View style={ [{borderBottomColor:'#fff'}]}>
                      <Text style={[styles.desBox,{lineHeight:20}]} >详细情况
                        <Text  style={{color:'#999999',fontSize:Utils.normalize(16),paddingLeft:24}}> {item.des}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
            : null
          }
          {
            _d.goods['6'] ?
            _d.goods['6'].map((item,key) => {
              return (
                <View key={key}>
                  <View style={stylesSu.blockLine}></View>
                  <View style={styles.itemTitle}>
                    <Text style={[styles.rect,{color:'#ffb400'}]}>{'|'}</Text>
                    <Text style={styles.sectitle}>{item.goods_name}</Text>
                  </View>
                  <View style={{marginLeft:14}}>
                    <View style={ [{borderBottomColor:'#fff'}]}>
                      <Text style={[styles.desBox,{lineHeight:20}]} >详细情况
                        <Text  style={{color:'#999999',fontSize:Utils.normalize(16),paddingLeft:24}}> {item.des}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
            : null
          }
          <View style={stylesSu.blockLine}></View>
        </ScrollView>
        {
          this.state.buttonIsShow ?
          <TouchableHighlight style={styles.buttonshadow} underlayColor='#f2f2f2' onPress={()=> this._addCart(_d)}>
            <Text style={{fontSize:Utils.normalize(16),color:'#387ff5'}}>{this.state.hasBuy ? '已选购' : '加入购物车'}</Text>
          </TouchableHighlight>
          : null
        }
        {
          this.state.alreadyAdd ?
            <Tip type='miss_tips' name='购物车已存在该商品'></Tip>
            : null
        }
        {
          this.state.success ?
          <Tip name="添加成功"/>
          : null
        }
        {
          this.state.cartId!='' ?
            <Cart itemCount={this.state.itemCount}  id={this.state.cartId} popNumLength={3}/>
            : null
        }
        {this.state.showCartList?
          <Animated.View style={{position:'absolute',top:this.state.aniList,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}>
            <View onStartShouldSetResponder={() => this._closeList()} style={{height: Utils.height*0.40,width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>
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
          this.state.isloading ?
          <Loading></Loading>
          : null
        }

      </View>

    )
  }
}

const stylesSu = StyleSheet.create({
  block: {
    backgroundColor: '#fff',
    paddingLeft: Utils.normalize(10),
    paddingRight: Utils.normalize(10),
  },
  name: {
    fontSize: Utils.normalize(16),
    marginTop: Utils.normalize(12),
    marginBottom: Utils.normalize(12),
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
  blockLine: {
    height: Utils.normalize(10),
    backgroundColor: '#efefef',
  },
  blockLineW: {
    height: Utils.normalize(10),
    backgroundColor: '#fff',
  },
  list:{
    alignItems:'center',
    flexDirection:'row',
    paddingLeft:3,
    paddingRight:15,
    height:Utils.normalize(45),
    borderBottomWidth:1,
    borderBottomColor:'#ddd',
  },
});

export default SuitDetail;
