
/**
 * Created by shiqian on 16/7/6.
 */
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
    StyleSheet
} from 'react-native';

import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import {Utils, Assets, Device,_} from "../base";
import lodash from 'lodash';
import {Header, Loading, Button, Developing, Tip} from '../components';

let listData = [];
let timer;
class buy extends Component{
    constructor(props) {
        super();
        var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {return  JSON.stringify(r1) !== JSON.stringify(r2)}});
        this.state = {
            dataSource,
            billTypeList: [{bName:'普通销售单',vl:1},{bName:'追加销售单',vl:2}],
            billType: 1,
            billTypeUi: {
                bName: '',
            },
            billTypeIsShow: false,
            cartSuccessShow: false,
            curCartId: '',
            loadingShow: true,
            cartListLength: -1,
        }
    }

    componentDidMount() {
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
                    cartListLength: res.list.length,
                    dataSource: that.state.dataSource.cloneWithRows(res.list),
                    loadingShow: false
                });
            },200)
        },(err)=>{
          this.setState({loadingShow: false});
        });
          let that = this;
        this.subscription = RCTDeviceEventEmitter.addListener('nowCartId',function (cartId) {
          that.setState({
            curCartId:cartId,
          })
          let midData = lodash.cloneDeep(listData);
          midData.forEach((d,i)=>{
            if(d.common){
              if(d.common.id == cartId){
                  d.common.show = false;
              } else {
                  d.common.show = true;
              }
            }
          })
          that.setState({dataSource: that.state.dataSource.cloneWithRows(midData)});
        });
    }

    componentWillReceiveProps(nextPage){
        if(nextPage.onFresh){
          this.setState({loadingShow: true});
          let time = new Date().getTime();
          Utils.fetch( Utils.api.cartList, 'post', {gts: time})
          .then( (res)=> {
              listData = res.list;
              let midData = lodash.cloneDeep(listData);
              let flag = false;
              midData.forEach((d,i)=>{
                if(d.common){
                  if(d.common.id == nextPage.cartId){
                    d.common.show = false;
                    flag = true;
                  } else {
                    d.common.show = true;
                  }
                }
              })
              let that = this;
              setTimeout(()=>{
                  flag ?
                  that.setState({
                      cartListLength: midData.length,
                      dataSource: that.state.dataSource.cloneWithRows(midData),
                      loadingShow: false,
                  }) :
                  that.setState({
                      cartListLength: midData.length,
                      dataSource: that.state.dataSource.cloneWithRows(midData),
                      curCartId: '',
                      loadingShow: false,
                  })
              },200)
          });
        } else if(nextPage.active){
          this.state.curCartId = nextPage.cartId;
          let midData = lodash.cloneDeep(listData);
          midData.forEach((d,i)=>{
            if(d.common){
              if(d.common.id == nextPage.cartId){
                  d.common.show = false;
              } else {
                  d.common.show = true;
              }
            }
          })
          this.setState({dataSource: this.state.dataSource.cloneWithRows(midData)});
        } else if(nextPage.isFresh){
          return;
        } else {
          if(nextPage.data==undefined){
            return
          };
          nextPage.data.common.show = false;
          listData.forEach((d,i)=>{
            if(d.common){
              d.common.show = true;
            }
          });
          let arr = [];
          arr.push(nextPage.data);
          listData = arr.concat(listData);
          let that = this;
          setTimeout(function(){
              let midData = lodash.cloneDeep(listData);
              that.setState({dataSource: that.state.dataSource.cloneWithRows(midData),curCartId: nextPage.data.common.id});
          },10);
      }
    }
    componentWillUnmount(){
        this.subscription.remove()
    }
    _createCart() {
        this.setState({billTypeIsShow:true})
    }

    _billTypePress(item) {
        this.state.billTypeUi.bName = item.nm;
        this.setState({billType: item.vl,billTypeIsShow: false});
        if(item.vl == 1){
            Actions.createCart();
        }
        if(item.vl == 2){
            Actions.additionCart();
        }
    }

    _quitBillType() {
        this.setState({billTypeIsShow: false});
    }

    _shoppingGoods() {

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
              Actions.shoping({cartId:that.state.curCartId,tabBarData:_tempTabBarData,page:'index'});
            }
          })
        }).catch(err => {
        })
    }

    _cartDetail(msg) {
      Actions.cartDetail({
        id: msg.common.id
      });
    }

    _onActivate(id) {
        clearTimeout(timer);
        this.state.curCartId = id;
        let midData = lodash.cloneDeep(listData);
        midData.forEach((d,i)=>{
          if(d.common){
            if(d.common.id == id){
                d.common.show = false;
            } else {
                d.common.show = true;
            }
          }
        })
        this.setState({dataSource: this.state.dataSource.cloneWithRows(midData),cartSuccessShow: true});
        timer = setTimeout(()=>{
                this.setState({cartSuccessShow: false})
            },2000);
    }
    _onTouchUp(){
      this.setState({billTypeIsShow:false})
    }
    _renderRow(data,sectionID,rowId) {
        return (
            <TouchableHighlight style={{backgroundColor:'#fff', overflow: 'hidden'}} underlayColor='#f2f2f2' onPress={()=>this._cartDetail(data)}>
                <View style={[styles_index.msgBlock,{backgroundColor: !data.common.show ? '#f1f7eb' : '#fff'}]}>
                    <View style={[styles_index.msgRowContent,{borderBottomWidth :(rowId == (listData.length-1) ? 0 : 0.5)}]}>
                        <View style={styles_index.msgRow1}>
                            <Text style={styles_index.msgName}>{data.customer.customer_name}
                             <Text style={{color:'red'}}>{!data.common.show?'(当前)':null}</Text>
                            </Text>
                            <Text style={styles_index.msgTime}>{data.common.create_time}</Text>
                        </View>
                        {
                            data.customer_car.car_vin ?
                            <View style={styles_index.msgRow1}>
                                <Text style={styles_index.msgList}>主销售单车架号：{data.customer_car.car_vin}</Text>
                            </View> :
                            null
                        }
                        {
                            data.subscription.subscription_money ?
                            <View style={styles_index.msgRow1}>
                                <Text style={styles_index.msgList}>已交订金：¥{data.subscription.subscription_money} 元</Text>
                            </View> :
                            null
                        }
                         <View style={styles_index.msgRow1}>
                            <Text style={styles_index.msgList}>电话：{data.customer.customer_tel}</Text>
                        </View>
                        <View style={styles_index.msgRow1}>
                            <Text style={[styles_index.msgList,{flex:1}]}>性别：{data.customer.customer_sex}</Text>
                            <Text style={[styles_index.msgList,{flex:1,marginLeft: -50}]}>销售单编号：{data.common.id}</Text>
                        </View>
                    </View>
                    <Icon style={[styles.md_iconChevrenH,{top:45}]} color='#cccccc' name='ios-arrow-forward' size={23}/>
                </View>
            </TouchableHighlight>
        )
    }

    render() {
        return(
            <View style={styles.container}>
                <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="购物车列表"/>
                <View style={styles_index.headNav}>
                    <TouchableHighlight underlayColor='#efefef' onPress={()=>this._createCart()}>
                        <View style={styles_index.item}>
                          <Image style={styles_index.navImage} source={Assets.icons.createcart} />
                          <Text style={{marginTop:Utils.normalize(10)}}>创建购物车</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor='#efefef'  onPress={()=>this._shoppingGoods()}>
                        <View style={styles_index.item}>
                          <Image style={styles_index.navImage} source={Assets.icons.shoppinggoods} />
                          <Text style={{marginTop:Utils.normalize(10)}}>商品</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                {
                    this.state.dataSource._cachedRowCount != 0 ?
                    <View>
                        <ListView style={{height: Device.height - 170}}
                            dataSource={this.state.dataSource}
                            initialListSize={10}
                            pageSize={10}
                            renderRow={this._renderRow.bind(this)}
                        />
                    </View> :
                    null
                }
                {
                    this.state.cartListLength == 0 ?
                    <View>
                        <View style={styles_index.centerView}>
                            <Text style={[styles_index.fontSize17,{color: '#bcbcbc'}]}>您还没有购物车，去创建吧！</Text>
                            <Button pattern={{outLine:'smallBorderBtn',text:'mediumBorderBlue'}} style={{marginTop: Utils.normalize(20)}} onPress={()=>this._createCart()} value="创建购物车"></Button>
                        </View>
                    </View> :
                    null
                }
                {
                    this.state.billTypeIsShow&&Device.iOS ?
                    <View style={styles_index.overlay}>
                      <TouchableHighlight style={{height:Utils.normalize(Utils.height-165)}} onPress={this._quitBillType.bind(this)}>
                        <View></View>
                      </TouchableHighlight>
                      <View style={styles_index.sexSet}>
                        <View style={{height: Utils.normalize(110),backgroundColor: '#fff',overflow: 'hidden'}}>
                        {
                          this.state.billTypeList && this.state.billTypeList.map((item,key)=> {
                            return (
                              <View key={key}>
                                <TouchableOpacity style={{height: Utils.normalize(55),backgroundColor:'rgba(0,0,0,0)', justifyContent: 'center',borderColor: '#ccc'}} onPress={this._billTypePress.bind(this,item)}>
                                  <View style={[styles.row,{justifyContent: 'center'}]}>
                                    <Text style={{fontSize: Utils.normalize(15),color:'#387ff5'}}>{item.bName}</Text>
                                  </View>
                                </TouchableOpacity>
                                <View style={{height: (key <= this.state.billTypeList.length) ? Utils.normalize(1) : 0, backgroundColor: '#ccc'}}>
                                </View>
                              </View>
                            )
                          })
                        }
                        </View>
                        <View style={{backgroundColor:'#efefef',height: Utils.normalize(10)}}></View>
                        <TouchableOpacity onPress={this._quitBillType.bind(this)} style={{backgroundColor: '#fff', height: Utils.normalize(55),justifyContent: 'center'}}>
                          <Text style={{color: '#fe3a2e', fontSize: Utils.normalize(18), fontWeight: 'bold',textAlign: 'center'}}>取消</Text>
                        </TouchableOpacity>
                      </View>
                    </View> :
                    <View></View>
                }
              {
                this.state.billTypeIsShow&&!Device.iOS?
                  <View style={[styles_index.overlay,{ justifyContent:'center',alignItems:'center'}]}  onStartShouldSetResponder={() => this._onTouchUp()} >
                    <View style={styles_index.androidSexSet}>
                      <View style={[styles.androidSelectText]}>
                        <Text style={{fontSize: Utils.normalize(18), fontWeight: 'bold'}}>选择销售单</Text>
                      </View>
                      <View style={{height: Utils.normalize(110),backgroundColor: '#fff',overflow: 'hidden'}}>
                        {
                          this.state.billTypeList && this.state.billTypeList.map((item,key)=> {
                            return (
                              <View key={key}>
                                <TouchableOpacity style={{height: Utils.normalize(55),backgroundColor:'rgba(0,0,0,0)', justifyContent: 'center',paddingLeft: Utils.normalize(20),borderColor: '#ccc'}} onPress={this._billTypePress.bind(this,item)}>
                                  <View style={styles.row}>
                                    <Text style={{fontSize: Utils.normalize(18)}}>{item.bName}</Text>
                                  </View>
                                </TouchableOpacity>
                                <View style={{height: (key <= this.state.billTypeList.length) ? Utils.normalize(1) : 0, backgroundColor: '#ccc'}}>
                                </View>
                              </View>
                            )
                          })
                        }
                      </View>
                    </View>
                  </View>
                  : <View></View>
              }
                {this.state.cartSuccessShow ? <Tip name="激活购物车成功"/> : <View></View>}
                {
                  this.state.loadingShow ?
                  <Loading></Loading>
                  : null
                }
            </View>
        )
    }
}

const styles_index = StyleSheet.create({
    headNav: {
        width: Utils.width,
        height: Utils.normalize(100),
        backgroundColor: '#fff',
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#d3d3d3',
        marginBottom: Utils.normalize(10),
    },
    navImage: {
        width:Utils.normalize(44),
        height:Utils.normalize(44),
        marginTop:Utils.normalize(15)
    },
    item: {
        width: Utils.width / 2,
        height: Utils.normalize(100),
        alignItems: 'center',
    },
    centerView: {
        marginTop:Utils.normalize(150),
        alignItems: 'center',
    },
    fontSize17: {
        fontSize: Utils.normalize(17),
    },
    sexSet: {
        position: 'absolute',
        bottom: Utils.normalize(Device.andrAPIBelow21 ? 30 : 10),
        width: Utils.width,
        height: Utils.normalize(165),
    },
    overlay:{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        height: Utils.height,
        width: Utils.width,
        flex: 1,
    },
    androidSexSet: {
      width: Utils.width - 16,
      height: Utils.normalize(175),
    },
    msgBlock:{
        position:'relative',
        flexDirection:'row',
        flex:1,
        paddingLeft:20,
        overflow: 'hidden',
    },
    msgRowContent:{
        flex:1,
        borderBottomColor:'#cccccc',
        paddingBottom:14,
    },
    msgRow1:{
        marginTop: 12,
        flexDirection:'row'
    },
    msgName:{
        fontSize:Utils.normalize(17),
        color:'#000',
        flex:1
    },
    msgTime:{
        flex:1,
        color:'#999',
        fontSize:Utils.normalize(12),
        textAlign:'right',
        marginRight:42
    },
    msgList: {
        fontSize:Utils.normalize(13),
        color:'#333',
    }
})

export default buy
