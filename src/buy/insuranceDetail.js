/**
* @Author: yanke
* @Date:   2016-09-19T16:24:03+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T15:06:29+08:00
*/

/**
 * Created by shiqian on 16/9/1.
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
  TouchableHighlight,
  ListView,
  Animated
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Box,Button,Tip} from '../components';
let timer;
class insuranceDetail extends Component{
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
      var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
    this.state = {
      dataSource,
      itemCount:'',
      coloeDefault:'红色',
      success:false,
      isloading:false,
      paramRangeDefault:'', //库存默认第一位
      num:1,
      tip:false,
      isLoading:false,
      cartId:'',
      data:'',
      ani:new Animated.Value(Utils.height),
      aniList:new Animated.Value(Utils.height),
      showCartList:''
    };
  }

  componentDidMount() {
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
    if(this.props.item['param_range']){
      this.setState({paramRangeDefault:this.props.item['param_range'][0]})
    }
    if(this.props.param.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
        }
      )
    }
    let that = this;
    this.subscription = RCTDeviceEventEmitter.addListener('update',function () {
      if(that.props.param.cartId==''&&that.state.cartId==''){
        return
      }
      Utils.fetch(Utils.api.get,'post',{id:that.props.param.cartId==''?that.state.cartId:that.props.param.cartId}).then(
        (res)=>{
          if(res.items==undefined){
              that.props.item.active = false;
              that.setState({itemCount:res.common['item_count']})
              that.setState({isLoading:false})
              return
          }
          if(res.items['3']!=undefined){
            _.forEach(res.items['3'],function (d,v) {
              if(d.id ==that.props.item.id){
                that.props.item.active = true
              }else {
                that.props.item.active = false
              }
            })
          }else{
            that.props.item.active = false
          }
          that.setState({itemCount:res.common['item_count']})
          that.setState({isLoading:false})
        }
      )
    })
  }
  componentWillUnmount() {
    this.subscription.remove();
    RCTDeviceEventEmitter.emit('update',this.props.param.cartId==''?this.state.cartId:this.props.param.cartId)
  }
  componentWillReceiveProps(next) {
    if(next.selectParam!=undefined){
      this.setState({paramRangeDefault:next.selectParam})
    }
    if(this.props.param.cartId!=''||this.state.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId==''?this.state.cartId:this.props.param.cartId}).then(
        (res)=>{
          if(res.items!=undefined){
            if(res.items['3']!=undefined){
              let that = this;
              _.forEach(res.items['3'],function (d,v) {
                if(d.id ==that.props.item.id){
                  that.props.item.active = true
                }
              })
            }else{
              this.props.item.active = false
            }
          }else{
              this.props.item.active = false
          }
          this.setState({itemCount:res.common['item_count']})
          this.setState({isLoading:false})
        }
      )
    }

  }
  _goBack(){
    setTimeout( ()=> {
      Actions.pop({refresh: {cartId:this.state.cartId}})
    },0)
  }
  _selectParam(){
    Actions.insureParams({
        data:this.props.item['param_range'],
        paramDefault:this.state.paramRangeDefault
      }
    )
  }
  _addCart(data,flag){
    this.setState({
      showCartList:true,
      showColorList:true,
      data:data
    })
    if(!flag){
      this._openColor()
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

    if(data.active&&flag){
      this.setState({tip:'alreadyAdd',isLoading:false})
      let that = this;
      timer = setTimeout(function(){
        that.setState({tip: false});
        Actions.pop()
      },1500);
      return
    }
    if(this.props.item['param_range']!=null){
        this._openColor()
     }else {
       if(this.props.param.cartId==''){
        this._openList()
       }else{
         this.setState({isLoading:true})
         this._fetchBuy(data)
       }
    }
  }
  _fetchBuy(data,cartId){
    this.setState({isLoading:true})
     let _tempCart = (this.props.param.cartId=='')?cartId:this.props.param.cartId;
    let param ={
      cart_id:_tempCart,
      category:"3",
      item:{
        category:"3",
        class_id:data.id,
        goods_name:data.name,
        goods_param:this.state.paramRangeDefault, //选择颜色
        num:1, //购买数量
        sale_price:data.price
      }
    }
    Utils.fetch(Utils.api.buying,'post',param,()=>{Actions.pop()})
      .then((res) => {
        if(res!=null){
          clearTimeout(timer);
          data.active=true
          Utils.fetch(Utils.api.get,'post',{id:_tempCart}).then(
            (res)=>{
              this.setState({itemCount:res.common['item_count']})
              this.setState({isLoading:false,tip: 'success',cartId:_tempCart})
              this._closeList();
              this._closeColor();
              let that = this;
              timer = setTimeout(function(){
                that.setState({tip: false});
                that._goBack()
              },1500);
            }
          )
        }else{
          this.setState({isLoading:false})
        }

      })
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
  _changeStatus(item,flag,number){
    this.setState({
      paramRangeDefault:item,
    })
  }
  rowAddCart(data){
    this._fetchBuy(this.state.data,data.common.id)
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
     let data  = this.props.item;
    return (
      <View style={styles.container}>
        <Header title="商品详情" leftPress={()=>this._goBack()}
                leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <ScrollView>
          <View style={b_styles.block}>
            <Text style={b_styles.name}>{data.name}</Text>

            <View style={{flexDirection:'row'}}>
              <Text style={b_styles.grayColor}>指导价：</Text>
              <Text style={b_styles.redColor}>¥ {Utils.oFixed(data.price, 2, true)}</Text>
            </View>
            <View style={{flexDirection:'row',paddingTop:8}}>
              <Text style={b_styles.grayColor}>供应商: </Text>
              <Text >{data['sup_name']}</Text>
            </View>
            <View>
              <Text style={[b_styles.grayColor,{marginBottom:8,marginTop:8}]} >详细情况 :
                <Text  style={{color:'#000',lineHeight:20}}> {data.des} </Text>
              </Text>
            </View>
          </View>
          {this.props.item['param_range'] ?
            <TouchableOpacity style={{backgroundColor:'#fff',marginTop:12}} onPress={()=>this._addCart(data,false)}>
              <View style={[styles.row,{height:39,justifyContent:'center',alignItems:'center'}]}>
                <Text style={[styles.md_itemsTextCar,{fontSize:Utils.normalize(16)}]}>请选择参数</Text>
                <Text
                  style={[styles.md_itemsTextCarR,{fontSize:Utils.normalize(16)}]}>{this.state.paramRangeDefault}</Text>
                <Icon style={styles.md_lineChevren} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </View>
            </TouchableOpacity> : null
          }
        </ScrollView>
        <TouchableOpacity style={[styles.buttonshadow]} onPress={()=>this._addCart(data,true)}>
          <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>{data.active ? '已选购' : '加入购物车'}</Text>
        </TouchableOpacity>
        {this.props.param.cartId!=''||this.state.cartId!=''? <Cart itemCount={this.state.itemCount}  id={(this.props.param.cartId=='')?this.state.cartId:this.props.param.cartId}/>:null}

        {this.state.showColorList&&this.props.item['param_range']!=null?
          <Animated.View style={{position:'absolute',top:this.state.ani,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}   >
            <View onStartShouldSetResponder={() => this._closeColor()} style={{height: Utils.height*0.40,width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>
              <View style={{backgroundColor:'#fff',height:84,paddingLeft:12,paddingTop:12,height:Utils.height*0.75,}}>
                <View style={{flexDirection:'column',borderBottomColor:'#ccc'}}>
                <Text style={{color:'red',fontSize:20,paddingBottom:4}}>¥ {Utils.oFixed(data.price,2,true)}</Text>
                <Text style={{color:'#878787'}}>请选择 参数</Text>
                </View>
                <View style={{backgroundColor:'#ccc',marginTop:12,marginBottom:12,marginLeft:-12,height:0.5}}></View>
                <TouchableOpacity style={{position:'absolute',right:0,top:8,width :24,height:24}} onPress={()=>this._closeColor()}>
                  <Icon name='ios-close' size={28} style={{color:'#999'}}/>
                </TouchableOpacity>
                <View style={{marginBottom:12,flexDirection:'row'}}>
                   <Text style={{fontSize:14}}>参数</Text>
                </View>
                  <ScrollView  >
                    <View style={{flexDirection:'row',flexWrap: 'wrap'}}>
                      {
                        this.props.item['param_range'].map((item, key)=>{
                          return(
                            <TouchableOpacity key={key} onPress={()=>this._changeStatus(item)} style={[styles.paramBox,(this.state.paramRangeDefault == item)?{borderColor:'#387ff5'}:null]}>
                                <Text style={{textAlign:'center'},(this.state.paramRangeDefault == item)?{color:'#387ff5'}:null}>{item}</Text>
                            </TouchableOpacity>
                          )
                        })
                      }
                    </View>
                  </ScrollView>
              </View>
            <TouchableOpacity style={[styles.buttonshadow]}  onPress={()=>(data.active)?{}:this._openList(data)}>
                <Text style={{color:'#387ff5',fontSize:Utils.normalize(16)}}>{data.active ? '已选购' : '加入购物车'}</Text>
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
          this.state.tip == 'alreadyAdd' ?
            <Tip type='miss_tips' name='购物车已存在该商品'></Tip>
            : null
        }
        {
          this.state.tip == 'success' ?
            <Tip  name='添加成功'></Tip>
            : null
        }
        {this.state.isLoading ? <Loading></Loading> : null}
      </View>
    );
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
  grayColor: {
    color: '#999999',
    fontSize: Utils.normalize(14),
  },
  redColor: {
    color: 'red',
    fontSize: Utils.normalize(14),
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
export default insuranceDetail
