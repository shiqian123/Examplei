/**
* @Author: yanke
* @Date:   2016-09-19T16:24:03+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T18:15:26+08:00
*/

/**
 * Created by shiqian on 16/8/24.
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
  ListView,
  Animated,
  TouchableHighlight
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Box,Button,Tip} from '../components';
let timer;
class ShopDetail extends Component{
  // 构造
    constructor(props) {
      super(props);
      // 初始状态
      var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
      this.state = {
        dataSource,
        carColorDefault:'',
        colorArr:'',
        neishiDefault:'',
        itemCount:0,//购物车数量
        isAddCart:true,
        success:false,
        readyAdd:false,//当已经加入购物车是,点击提示
        isLoading:false,
        showCartList:false,//是否显示购物车列表
        showColorList:false,//是否显示内饰颜色界面
        ani:new Animated.Value(Utils.height),
        aniList:new Animated.Value(Utils.height),
        item:'' ,//当前新车的数据
        cartId:'',
        neishiArr:[],
        stockColorArr:[],
        zeroarr:[],
        nowStockNum:0
      };
    }

  componentWillReceiveProps(nextprops) {
    if(nextprops.carColorDefault!=undefined){
      this.setState({carColorDefault:nextprops.carColorDefault,neishiDefault:nextprops.neishiDefault})
    }else{
      let _tempCartid = this.props.param.cartId==''?this.state.cartId:this.props.param.cartId
    if(_tempCartid!=''){
      Utils.fetch(Utils.api.get,'post',{id:_tempCartid}).then(
        (res)=>{
          //判断是否是主销售单
          this.setState({itemCount:res.common['item_count']})
          if(res.common['master_cart']==null){
            if(this.props.item.flag==res.items['1']){
              if(this.props.item.flag==res.items['1'][0]['class_id']){
                this.setState({isAddCart:false})
                this.setState({itemCount:res.common['item_count']})
              }
            }else{
              this.setState({isAddCart:true})
              this.setState({itemCount:res.common['item_count']})
            }

          }
        }
      )
    }
    }
  }
  componentDidMount() {
    let stockColorArr = Object.keys(this.props.item.arr)
    let zeroarr = (this.props.item.zeroarr!=undefined)?Object.keys(this.props.item.zeroarr):[]

    this.setState({
      stockColorArr:stockColorArr,
      zeroarr:zeroarr
    })
    //存放全部数组的key值用于遍历比较
    var allData=[];
    var messageArr = [];
    //内饰数组
    var neishiArr =[];
    //当库存为0的时候选择预定的第一辆车信息
    if(this.props.item.arr.length==0){
      _.forIn(this.props.item.zeroarr, function(value, key) {
        value.flag=key;
        messageArr.push(value)
      });
      this.setState({carColorDefault:messageArr[0],colorArr:messageArr})
    }else{
      _.forIn(this.props.item.arr, function(item, key) {
            var newData = {
              nm:key,
              neishi:item
            };
        messageArr.push(newData);
        //得到对象的饰品信息
        _.forIn(item, function(_value, _key) {
          if(key!='nm'){
            var newData = {
              nm:_key,
              number:_value.length
            };
            neishiArr.push(newData)
          }
        });
      });
      this.setState({carColorDefault:messageArr[0],colorArr:messageArr,neishiDefault:neishiArr[0]})
      setTimeout(()=>{
          this._getSelectNeiShi(messageArr[0].nm,true,neishiArr[0]);
      },100)

    }
     _.forIn(this.props.allData,function (v,k) {
       _.forIn(v.arr,function (v1,k1) {
         allData.push(k1)
       })
     })
     if(this.props.param.cartId!=''){
       Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
         (res)=>{
           //判断是否是主销售单
           this.setState({itemCount:res.common['item_count']})
           if(res.items){
             if(res.common['master_cart']==null){
                 if(this.props.item.flag==res.items['1'][0]['class_id']){
                   this.setState({isAddCart:false})
                 }
             }
           }else{
              this.setState({isAddCart:true})
           }

         }
       )
     }
    let that = this;
    this.subscription = RCTDeviceEventEmitter.addListener('updateNewCar',function (data) {
      that.setState({carColorDefault:data.carColorDefault,neishiDefault:data.neishiDefault})
    });
    this.subscription1 = RCTDeviceEventEmitter.addListener('update',function () {
      Utils.fetch(Utils.api.get,'post',{id: that.props.param.cartId==''?that.state.cartId:that.props.param.cartId}).then(
        (res)=>{
          //判断是否是主销售单
          if(res.common['master_cart']==null){
            if(res.item){
              if(that.props.item.flag==res.items['1']){
                if(that.props.item.flag==res.items['1'][0]['class_id']){
                  that.setState({isAddCart:false})
                  that.setState({itemCount:res.common['item_count']})
                }
              }else{
                that.setState({isAddCart:true})
                that.setState({itemCount:res.common['item_count']})
              }
            }else{
              that.setState({isAddCart:true})
              that.setState({itemCount:res.common['item_count']})
            }


          }
        }
      )
    });
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
  }
  componentWillUnmount() {
    RCTDeviceEventEmitter.emit('update',this.props.param.cartId==''?this.state.cartId:this.props.param.cartId)
  }
  componentWillUnmount(){
    this.subscription.remove();
    this.subscription1.remove();
  };
  _addCart(item,noTip){
    this.setState({
      showCartList:true,
      showColorList:true,
      item:item
    })
    if(noTip){
       this._openColor();
       return
    }
    //没有购物车时界面提示
      if(this.props.param.cartId==''&&this.state.dataSource._dataBlob.s1.length==0){
        Alert.alert('提示','请先创建购物车',[{
          text:'确认',
          onPress:()=>{
            Actions.popTo('chooseNewCar')
          }
        }])
        return
      }
   this._openColor();
  }

  //调用购物车接口方法
  _fetchBuy(item,cartId){
   let _tempCart = (this.props.param.cartId=='')?cartId:this.props.param.cartId;
    this.setState({isLoading: true});
      let param ={
         cart_id:_tempCart,
         category:"1",
         item:{
           category:"1",
           class_id:item.flag,
           goods_name:item.mnm,
           goods_param:this.state.carColorDefault.nm||'',
           ext_param:this.state.neishiDefault.nm,
           num:1,
           sale_price:item.prc,
         }
      }
     Utils.fetch(Utils.api.buying,'Post',param,()=>{Actions.pop()}).then(
       (res)=>{
         if(res!=null){
           clearTimeout(timer);
           this._closeList()
           this.setState({hasBuy: true,success: true,isAddCart:false})
           let that = this;
           this.setState({
             cartId:_tempCart,
           })
           this._closeList();
           this._closeColor()
           timer = setTimeout(function(){
             that.setState({success: false,isLoading: false});
             that._goBack();
           },1500);

           Utils.fetch(Utils.api.get,'post',{id:_tempCart}).then(
             (res)=>{
               this.setState({itemCount:res.common['item_count']})
             }
           );
         }else {
           this.setState({isLoading: false});
         }

       }
     )
  }
  _addCartTip(){
    this.setState({readyAdd: true});
    clearTimeout(timer);
    let that = this;
    timer = setTimeout(function(){
      that.setState({readyAdd: false});
      Actions.pop()
    },1500);
  }
  //限价
  _limitPrice(){
    if(this.props.param.cartId==''){
      this.setState({isLoading:true,})
      let that = this;
      Utils.fetch(Utils.api.priceLimit,'post',{category:1,class_id:this.props.item.flag}).then(
        (res)=>{
            that.setState({isLoading:false})
            let _param = {owner_limit:(typeof res=='string')?res:res.data}
           Actions.limitPrice({msg:_param,salesman:''})
        }
      );
      return
    }
    Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
      (res)=>{
        if(res.items&&res.items[1][0]){
             Actions.limitPrice({msg:res.items[1][0],salesman:res.salesman})
        }else {
          let that = this;
          Utils.fetch(Utils.api.priceLimit,'post',{category:1,class_id:this.props.item.flag}).then(
            (res)=>{
                that.setState({isLoading:false})
                let _param = {owner_limit:(typeof res=='string')?res:res.data}
               Actions.limitPrice({msg:_param,salesman:''})
            }
          );
        }

      }
    );
  }
  _openList(item){
    //没有购物车时界面提示
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
  _openColor(){
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
  //前往颜色切换界面
  _goColor(){
    this.setState({
      showColorList:true
    })
    this._openColor()
  }
  _goBack(){
    setTimeout( ()=> {
      Actions.pop({refresh: {cartId:this.state.cartId}})
    },0)
  }
  rowAddCart(data,flag){
    this._fetchBuy(this.state.item,data.common.id)
  }
  _changeStatus(item,flag){
    let _carColorDefault = _.cloneDeep(this.state.carColorDefault);
    _carColorDefault.nm = item;
    if(!flag){
      this.setState({
        nowStockNum:0,
      })
    }
    this.setState({
      carColorDefault:_carColorDefault,
    })
    this._getSelectNeiShi(item,flag,this.state.neishiDefault);
  }
  _getSelectNeiShi(item,flag,_neishiDefault){
    let neishiArr =[]
      let that = this;
       if(this.state.colorArr.length!=0){
         _.forEach(this.state.colorArr,(d,k)=>{
           if(d.nm==item){
             _.forIn(d.neishi, function(value, key) {
                 var newData = {
                   nm:key,
                   number:value.length
                 };
                 neishiArr.push(newData)
                 that.setState({
                   nowStockNum:neishiArr[0].number
                 })
             });
           }
         })
         this.setState({
           neishiArr:neishiArr,
           neishiDefault:neishiArr.length==0?'':neishiArr[0]
         })
       }

  }
  _changeNeiShiStatus(item){
    let _neishiDefault = _.cloneDeep(this.state.neishiDefault);
    _.forEach(this.state.neishiArr,(d,k)=>{
      if(d.nm == item.nm){
        this.setState({
          neishiDefault:item,
          nowStockNum:item.number
        })
      }
    })
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
    let item = this.props.item;
    let neishiDefault = this.state.neishiDefault;
    return(
      <View style={[styles.container,{backgroundColor: '#fafafa'}]}>
        <Header title="商品详情" leftPress={()=>this._goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <ScrollView style={{marginBottom:38}}>
        <View style={{width:Utils.width,paddingBottom:4,backgroundColor:'#fff'}}>
          <View style={{flexDirection: 'column'}}>
            <Text style={[sd_styles.label]} >{item.mnm}</Text>
            <View style={[sd_styles.row]}>
              <Text style={[sd_styles.grayColor]}>指导价:</Text>
              <Text style={[sd_styles.redColor]}>￥{item.prc/10000}万</Text>
              <Text style={[sd_styles.grayColor,{paddingLeft:56}]}>库存:</Text>
              <Text>{item.mc}</Text>
              <View style={{flex: 1,justifyContent:'flex-end',flexDirection: 'row',paddingRight:12}}>
                <Button value="限价" pattern={{outLine:'smallBorderYellowBtn',text:'smallBorderYellow'}}  style={{right:0,}}  onPress={()=>{this._limitPrice()}}></Button>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={{backgroundColor:'#fff',marginTop:12}} onPress={()=>this._addCart(item,true)}>
          <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
            <Text style={[styles.md_itemsTextCar,{fontSize:Utils.normalize(16)}]}>请选择颜色</Text>
            <Text style={[styles.md_itemsTextCarR,{fontSize:Utils.normalize(16),flex:2}]}>车身:{this.state.carColorDefault.nm} {this.state.neishiDefault==''?'':'内饰:'}{neishiDefault.nm=='unlimited'?'未填写':neishiDefault.nm}</Text>
            <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
          </View>
        </TouchableOpacity>
        <View style={[styles.itemTitle,{marginTop:12}]}>
          <Text style={[styles.rect,{color:'#ffb400'}]}>{'|'}</Text>
          <Text style={styles.sectitle}>参数配置</Text>
        </View>
        <View style={{backgroundColor:'#fff'}}>
          <Box left={'级别'} right={item.dt.grade_name} style={{marginLeft:12,backgroundColor:'#FFF'}}/>
          <Box left={'产地'} right={item.dt.madeby_name} style={{marginLeft:12}}/>
          <Box left={'变速'} right={item.dt.biansu_name} style={{marginLeft:12}}/>
          <Box left={'驱动'} right={item.dt.qudong_name} style={{marginLeft:12}}/>
          <Box left={'车厢'} right={item.dt.cheshen} style={{marginLeft:12}}/>
          <Box left={'座位'} right={item.dt.zuowei} style={{marginLeft:12}}/>
          <Box left={'选项'} right={item.dt.havepropty_name} style={{marginLeft:12}}/>
          <Box left={'详细情况'} right={item.dt.desc} listLast={true} style={{marginLeft:12}}/>
        </View>
        </ScrollView>
        {this.state.isAddCart?
          <TouchableOpacity style={[styles.buttonshadow]} onPress={()=>this._addCart(item)}>
            <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>加入购物车</Text>
          </TouchableOpacity>:
          <TouchableOpacity style={[styles.buttonshadow]} onPress={()=>this._addCartTip()} >
            <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>已选购</Text>
          </TouchableOpacity>}
        {
          this.state.readyAdd ?
            <Tip type='miss_tips' name='当前购物车已存在该新车'></Tip>
            : null
        }
        {
          this.state.success ?
            <Tip name="添加成功"/>
            : null
        }
        {this.props.param.cartId!=''||this.state.cartId!=''? <Cart itemCount={this.state.itemCount}  id={(this.props.param.cartId=='')?this.state.cartId:this.props.param.cartId}/>:null}
          {this.state.showColorList?
            <Animated.View style={{position:'absolute',top:this.state.ani,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}   >
              <View onStartShouldSetResponder={() => this._closeColor()} style={{height: Utils.height*0.4,width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>
                <View style={{backgroundColor:'#fff',height:84,paddingLeft:12,paddingTop:12,height:Utils.height*0.6,}}>
                  <View style={{flexDirection:'column',borderBottomColor:'#ccc'}}>
                  <Text style={{color:'red',fontSize:20,paddingBottom:4}}>￥{item.prc/10000}万</Text>
                  <Text style={{paddingBottom:4}}>库存{this.state.nowStockNum}件</Text>
                  <Text style={{color:'#878787'}}>请选择 车身颜色 内饰颜色</Text>
                  </View>
                  <View style={{backgroundColor:'#ccc',marginTop:12,marginBottom:12,marginLeft:-12,height:0.5}}></View>
                  <TouchableOpacity onPress={()=>this._closeColor()} style={{position:'absolute',right:0,top:8,width :24,height:24}}>
                    <Icon name='ios-close' size={28}  style={{color:'#999'}}/>
                  </TouchableOpacity>
                  <ScrollView style={{marginBottom:54}}>
                  <View style={{flexDirection:'row',flexWrap: 'wrap'}}>
                    {
                      this.state.stockColorArr.map((item, key)=>{
                        return(
                          <TouchableOpacity  numberOfLines={1} key={key} onPress={()=>this._changeStatus(item,true)} style={[styles.paramBox,(this.state.carColorDefault.nm == item)?{borderColor:'#387ff5'}:null]}>
                              <Text style={{textAlign:'center'},(this.state.carColorDefault.nm == item)?{color:'#387ff5'}:null}>{item}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                    {
                      this.state.zeroarr.map((item, key)=>{
                        return(
                          <TouchableOpacity key={key} onPress={()=>this._changeStatus(item,false)} style={[styles.paramBox,(this.state.carColorDefault.nm == item)?{borderColor:'#387ff5'}:null]}>
                              <Text numberOfLines={1} style={{textAlign:'center',fontSize:12},(this.state.carColorDefault.nm == item)?{color:'#387ff5'}:null}>{item}
                                  <Text style={{color:'red'}}>
                                  <Text style={(this.state.carColorDefault.nm == item)?{color:'#387ff5',fontSize:12}:{color:'#000',fontSize:12}}>(</Text>
                                    预定
                                      <Text style={(this.state.carColorDefault.nm == item)?{color:'#387ff5',fontSize:12}:{color:'#000',fontSize:12}}>)</Text>
                                  </Text>
                              </Text>
                              {/* {this.state.active.nm === item.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null} */}
                          </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                  {
                      this.state.neishiArr.length!=0?
                     <View style={{marginBottom:12}}>
                        <Text style={{fontSize:14}}>内饰颜色</Text>
                     </View>:null
                  }
                  <View style={{flexDirection:'row',flexWrap: 'wrap'}}>
                  {
                    this.state.neishiArr.length!=0?this.state.neishiArr.map((item, key)=>{
                      return(
                          <TouchableOpacity key={key} onPress={()=>this._changeNeiShiStatus(item)} style={[styles.paramBox,this.state.neishiDefault.nm==item.nm?{borderColor:'#387ff5'}:null]}>
                              <Text  numberOfLines={1} style={{textAlign:'center',fontSize:12},this.state.neishiDefault.nm==item.nm?{color:'#387ff5'}:null}> {item.nm=='unlimited'?'未填写':item.nm}
                              </Text>
                              {/* {this.state.neishiActive.nm === item.nm ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null} */}
                          </TouchableOpacity>
                      )
                    }):null
                  }
                  </View>
                  <View style={{marginTop:24}}>
                    <Text style={{fontSize:14}}>
                    购买数量
                    </Text>
                    <View style={{position:'absolute',right:Utils.normalize(60)}}>
                    <Text style={{fontSize:14,top:-16}}>
                      1
                    </Text>
                    </View>
                  </View>
                  </ScrollView>
                  {this.state.isAddCart?
                    <TouchableOpacity style={[styles.buttonshadow,{marginLeft:-12}]} onPress={()=>this._openList(item)}>
                        <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>加入购物车</Text>
                    </TouchableOpacity>:
                    <TouchableOpacity style={[styles.buttonshadow]} onPress={()=>this._addCartTip()} >
                      <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>已选购</Text>
                    </TouchableOpacity>}


                </View>
            </Animated.View>
            :null}
            {this.state.showCartList?
              <Animated.View style={{position:'absolute',top:this.state.aniList,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}>
                <View onStartShouldSetResponder={() => this._closeList()} style={{height: Utils.height*0.40,width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>
                <View style={{backgroundColor:'rgba(0, 0, 0, 0.4)'}}>
                  <View style={{backgroundColor:'#fff',justifyContent:'center',alignItems:'center',height:50}}>
                    <Text style={{fontSize:14}}>
                      请选择您要加入的购物车
                    </Text>
                    <TouchableOpacity onPress={()=>this._closeList()} style={{position:'absolute',right:0,top:8,width :24,height:24}}>
                      <Icon name='ios-close' size={28}  style={{color:'#999'}}/>
                    </TouchableOpacity>
                  </View>
                  <View style={{backgroundColor:'#ccc',marginLeft:-12,height:0.5}}></View>

                <ListView style={{height:Utils.height/2+Utils.normalize(20),backgroundColor:'#fff'}}
                    dataSource={this.state.dataSource}
                    enableEmptySections = {true}
                    initialListSize={10}
                    pageSize={10}
                    renderRow={this._renderRow.bind(this)}
                />
                </View>
              </Animated.View>
              :null}
          {this.state.isLoading ? <Loading></Loading>: null}
      </View>
    )

  }
}
const sd_styles = StyleSheet.create({
  row:{
    flexDirection: 'row',
    marginTop:Utils.normalize(10),
    marginLeft:Utils.normalize(12),
  },
  label:{
    marginTop:Utils.normalize(10),
    marginLeft:Utils.normalize(12),
    fontSize:Utils.normalize(16)
  },
  redColor:{
    color:'red',
    paddingLeft:12,
    fontSize:Utils.normalize(16),

  },
  grayColor:{
    color:'#999999',
    fontSize:Utils.normalize(14)
  },
  list:{
    alignItems:'center',
    flexDirection:'row',
    paddingLeft:3,
    paddingRight:15,
    height:Utils.normalize(45),
    borderBottomWidth:1,
    borderBottomColor:'#ddd',
  }
});
export default ShopDetail
