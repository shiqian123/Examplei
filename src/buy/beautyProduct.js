/**
* @Author: shiqian
* @Date:   2016-10-08T13:05:06+08:00
* @Email:  15611555640@163.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T14:46:23+08:00
*/

/**
 * Created by shiqian on 16/8/29.
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
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card,Button,Tip} from '../components';
let timer;
class BeautyProduct extends Component{
  // 构造
  constructor(props) {
    var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2});
    var dataSourceCart = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
    super(props);
    // 初始状态
    this.state = {
      dataSource:ds.cloneWithRows(this.props.dataSource),
      dataSourceCart,
      itemCount:'',
      isLoading:false,
      tip:'',
      cartId:'',
      msg:'',
      aniList:new Animated.Value(Utils.height),
      showCartList:false,//是否显示购物车列表
    };
  }

  componentWillReceiveProps(next) {
    this.setState({dataSource:this.state.dataSource.cloneWithRows(next.dataSource)});
  }
  componentDidMount() {
    if(this.props.param.cartId==''){
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
                  dataSourceCart: that.state.dataSourceCart.cloneWithRows(res.list),
                  isLoading: false,
              });
          },200)
      },(err)=>{
        this.setState({isLoading: false});
      });
    }
    if(this.props.param.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
        }
      );
    }
  }
  _addCart(msg){
    if(this.props.param.cartId==''&&this.state.dataSourceCart._dataBlob.s1.length==0){
      Alert.alert('提示','请先创建购物车',[{
        text:'确认',
        onPress:()=>{
          Actions.popTo('chooseNewCar')
        }
      }])
      return
    }
    if(this.props.param.cartId==''){
      this.setState({
        showCartList:true,
        msg:msg
      })
      this.props.openList()
      this._openList()
      return
    }
    this.setState({isLoading:true})
    if(msg.active){
       this.setState({tip:'alreadyAdd',isLoading:false})
      let that = this;
      timer = setTimeout(function(){
        that.setState({tip: false});
      },1500);
    }else{
      this._fetchBuy(msg)
    }
  }
  _openList(){
    Animated.timing(
     this.state.aniList,
     {
       toValue:  Utils.normalize(-144),
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
   this.props.closeList()
  }
  rowAddCart(data){
    this._fetchBuy(this.state.msg,data.common.id)
  }
  _fetchBuy(msg,cartId){
    this.setState({isLoading:true})
     let _tempCart = (this.props.param.cartId=='')?cartId:this.props.param.cartId;
    let param ={
      cart_id:_tempCart,
      category:"4",
      item:{
        category:"4",
        class_id:msg.id,
        goods_name:msg.name,
        num:1,
        sale_price:msg.price
      }
    }
    Utils.fetch(Utils.api.buying,'Post',param).then(
      (res)=>{
        if(res!=null){
          this._closeList();
          this.setState({tip:'success',isLoading:false});
          msg.active = true;
          var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2});
          DeviceEventEmitter.emit('update',_tempCart)
          this.setState({
            dataSource: ds.cloneWithRows(this.props.dataSource)
          });
          let that = this;
          timer = setTimeout(function(){
            that.setState({tip: false});
          },1500);
          Utils.fetch(Utils.api.get,'post',{id:_tempCart}).then(
            (res)=>{
              this.setState({itemCount:res.common['item_count']})
            }
          );
        }else{
          this.setState({isLoading: false});
        }

      })
  }
  _renderRowCart(data,sectionID,rowId) {
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
  _renderRow(msg,sectionID,rowId){
        if(msg!='By'){
          return(
            <View style={[by_styles.renderView]}>
              <View style={{ flexDirection: 'column',flex:4}}>
                <Text style={[by_styles.label,{fontSize:Utils.normalize(15)}]} >{msg.name}</Text>
                <View style={[by_styles.label,{flexDirection: 'row'}]}>
                  <Text style={[by_styles.grayColor]}>指导价:</Text>
                  <Text style={[by_styles.redColor,{paddingLeft:12}]}>￥{Utils.oFixed(msg.price,2,true)}</Text>
                </View>
                <View style={[by_styles.label,{flexDirection: 'row',width: Utils.width-88}]}>
                  <Text style={{fontSize:Utils.normalize(13),flex:3}}>详细情况:{msg.des}</Text>
                </View>
              </View>
              <View style={{flex:1,flexDirection: 'column',justifyContent:'flex-end'}}>
                <Button pattern={{outLine:'smRedButtom',text:'smButtomText'}} style={{marginTop:-14}}  onPress={()=>this._addCart(msg)} value={msg.active?'已购买':'购买'}></Button>
              </View>
            </View>
          )
        }else{
          return(null)
        }
  }
  render(){
    return(
      <View>{
        <ListView
          initialListSize={20} pageSize={20}
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          style={[by_styles.listContainer,(Object.keys(this.state.dataSource._dataBlob.s1).length==1?{backgroundColor:'#EFEFEF'}:{})]}
          renderFooter={() => {
              let _result =
              this.props.foot ?
                (<View>
                   <View style={{height: 40,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa',paddingTop:10,paddingBottom:10}}>--没有更多商品了--</Text>
                     </View>
                </View>)
              :(null);
              return _result

            }}
          renderRow={(msg,sectionID,rowId)=>this._renderRow(msg,sectionID,rowId)}>
        </ListView>
      }
      {this.state.showCartList?
        <Animated.View style={{position:'absolute',top:this.state.aniList,backgroundColor: 'transparent',width:Utils.width,height:Utils.height}}>
          <View onStartShouldSetResponder={() => this._closeList()} style={{height: Utils.height*0.4+Utils.normalize(36),width: Utils.width, backgroundColor:'rgba(0, 0, 0, 0.4)'}}></View>
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

              <ListView style={{height:Utils.height*0.6-50,backgroundColor:'#fff'}}
              dataSource={this.state.dataSourceCart}
              initialListSize={10}
              pageSize={10}
              removeClippedSubviews={false}
              renderRow={this._renderRowCart.bind(this)}
          />
          </View>
        </Animated.View>
        :null}
        <View style={{position: 'absolute',top:-144}}>
        {
          this.state.tip=='alreadyAdd' ?
            <Tip type='miss_tips' name='购物车已存在该商品'></Tip>
            : null
        }
        {
          this.state.tip=='success' ?
            <Tip  name='添加成功'></Tip>
            : null
        }
          {this.state.isLoading ? <Loading></Loading>: null}
        </View>
      </View>

    )
  }
}
const by_styles = StyleSheet.create({
  "listContainer":{
    marginTop:Utils.normalize(36),
    flex:1,
    height:Utils.height-Utils.normalize(140),
    paddingLeft:Utils.normalize(14),
    backgroundColor:"#fff"
  },
  'renderView':{
    flex:1,
    flexDirection: 'row',
    paddingBottom:10,
    paddingTop:8,
    borderBottomWidth:0.5,
    borderBottomColor:'#ccc'
  },
  'label':{
    marginTop:Utils.normalize(6),
    marginBottom:Utils.normalize(2),

  },
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
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
    // flexDirection: 'row',
  },
  grayColor:{
    color:'#999999',
    fontSize:Utils.normalize(13)
  },
  redColor:{
    color:'red',
    fontSize:Utils.normalize(13),

  },
});
export default BeautyProduct
