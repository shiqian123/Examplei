/**
* @Author: meteor
* @Date:   2016-08-19T15:23:35+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-09-26T18:26:52+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    TextInput
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import LoadIcon from '../components/Loading'
import {Header} from '../components'

class ChangeVin extends Component{
  constructor(props) {
    super()
    this.state = {
      msg:props.msg,
      listMsg:props.listMsg,
      cart:props.cart,
      vin:props.vin,
      serachStatus:false,
      serachData:[],
      searchClean:false,
      wrongText:'',
      LoadIcon:false
    }
  }
  _change(text){
    if(text != '') {
      this.setState({searchClean:true})
    } else {
      this.setState({searchClean:false});
      this.setState({serachData:[]});
      return;
    }
    let params = {
      shop_id:this.state.listMsg.shop_id,
      class_id:this.state.listMsg.class_id,
      qvin:text
    }
    Utils.fetch(Utils.api.searchStock,'post',params)
      .then((res)=>{
        res = (res instanceof Array)? res:[];
        this.setState({serachData:res,wrongText:'未搜索到车辆'})
      })
  }
  _cleanInput() {
    this.refs.searchInput.clear();
    this._change('')
  }
  _save(vin,status){
    this.setState({LoadIcon:true});
    this.state.cart.items[1][0]['vin'] = vin;
    this.state.cart.items[1][0]['status'] = status;
    let params = {
      cart:this.state.cart,
      ns:true,
    }
    Utils.fetch(Utils.api.save,'post',params)
    .then((res)=>{
      this.setState({LoadIcon:false});
      Actions.pop({refresh: {newCarVin: vin}});
    })
  }
  componentDidMount(){
    storage.load({
      key: "User"
    }).then(res => {
      this.setState({saleLevel3: res.saleLevel3})
    })
  }
  _changeSerach(){
    this.setState({serachStatus:true,serachData:[]});
    this._change('');
  }
  _dupRem( target, original){
    for( let key in target){
      if(target[key].vin == original.vin){
        target.splice(key,1);
        break;
      }
    }
    return target;
  }
  render() {
    const slvin = this.state.msg.slvin; //已选车辆
    let gpvin, otvin, svin;
    if(slvin[0]){
      gpvin = this._dupRem(this.state.msg.gpvin, slvin[0]); //推荐车辆
      otvin = this._dupRem(this.state.msg.otvin, slvin[0]); //其它推荐
      svin = this._dupRem(this.state.serachData, slvin[0]); //搜索结果
    }else{
      gpvin = this.state.msg.gpvin; //推荐车辆
      otvin = this.state.msg.otvin; //其它推荐
      svin = this.state.serachData; //搜索结果
    }
    const serachComponent = svin.map((item,key)=>{
      if(this.state.msg.slvin && slvin[0] && item.vin == slvin[0].vin){
        return null;
      }
      return (
      <View key={key} style={{backgroundColor:'#fff'}}>
        <TouchableHighlight underlayColor='#f2f2f2' onPress={()=>{this._save(item.vin, item.status)}} style={[styles.md_item,{borderBottomWidth: 0,borderTopWidth: 0,backgroundColor:'#fff'}]}>
          <View>
          <View  style={{paddingTop:6,paddingBottom:6}}>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>{item.model_name}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车身颜色：{item.color_name}</Text>
                <Text style={styles.md_itemsText}>内饰颜色：{item.inner_color}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车架号：<Text style={{color:'#099999'}}>{item.vin}</Text></Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>库存天数：{item.inwar_time}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定人：{item.locker_name}</Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定原因：{item.lock_reason_name}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定天数：{item.lock_time}</Text>
              </View>
             </View>
             {svin.length==key+1?null:<View style={styles.itemInsetLineR}></View>}
          </View>
        </TouchableHighlight>
      </View>
      )
    });

    const otvinComponent = otvin.map((item,key)=>{
      if(this.state.msg.slvin && slvin[0] && item.vin == slvin[0].vin){
        return null;
      }
      return (
        <TouchableHighlight key={key} underlayColor='#f2f2f2' onPress={()=>{this.state.saleLevel3 ? null : this._save(item.vin, item.status)}} style={[styles.md_item,{borderBottomWidth: 0,borderTopWidth: 0,backgroundColor:'#fff'}]}>
          <View>
            <View  style={{paddingTop:6,paddingBottom:6}}>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>{item.model_name}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车身颜色：{item.color_name}</Text>
                <Text style={styles.md_itemsText}>内饰颜色：{item.inner_color}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车架号：<Text style={{color:'#099999'}}>{item.vin}</Text></Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>库存天数：{item.inwar_time}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定人：{item.locker_name}</Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定原因：{item.lock_reason_name}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定天数：{item.lock_time}</Text>
              </View>
             </View>
             {otvin.length==key+1?null:<View style={styles.itemInsetLineR}></View>}
         </View>
        </TouchableHighlight>
      )
    });
    const gpvinComponent = gpvin.map((item,key)=>{
      return (
        <TouchableHighlight key={key} underlayColor='#f2f2f2' onPress={()=>{this._save(item.vin, item.status)}} style={[styles.md_item,{borderBottomWidth: 0,borderTopWidth: 0,backgroundColor:'#fff'}]}>
          <View>
            <View  style={{paddingTop:6,paddingBottom:6}}>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>{item.model_name}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车身颜色：{item.color_name}</Text>
                <Text style={styles.md_itemsText}>内饰颜色：{item.inner_color}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车架号：<Text style={{color:'#099999'}}>{item.vin}</Text></Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>库存天数：{item.inwar_time}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定人：{item.locker_name}</Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定原因：{item.lock_reason_name}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定天数：{item.lock_time}</Text>
              </View>
             </View>
             {gpvin.length==key+1?null:<View style={styles.itemInsetLineR}></View>}
         </View>
        </TouchableHighlight>
      )
    });
    const slvinComponent = slvin.map((item,key)=>{
      return (
        <TouchableHighlight key={key} underlayColor='#f2f2f2' style={[styles.md_item,{borderBottomWidth: 0,borderTopWidth: 0,backgroundColor:'#fff'}]}>
          <View>
            <View  style={{paddingTop:6,paddingBottom:6}}>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>{item.model_name}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车身颜色：{item.color_name}</Text>
                <Text style={styles.md_itemsText}>内饰颜色：{item.inner_color}</Text>
              </View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemsText}>车架号：<Text style={{color:'#099999'}}>{item.vin}</Text></Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>库存天数：{item.inwar_time}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定人：{item.locker_name}</Text>
              </View>
              <View style={[styles.row, styles.md_itemsTextBox,{height: 24}]}>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定原因：{item.lock_reason_name}</Text>
                <Text style={[styles.md_itemsText,{color:'#8393aa'}]}>锁定天数：{item.lock_time}</Text>
              </View>
             </View>
             {gpvin.length==key+1?null:<View style={styles.itemInsetLineR}></View>}
         </View>
        </TouchableHighlight>
      )
    });
    return (
      <View style={styles.container}>
        {this.state.serachStatus?
          <View style={styles.navbar}>
            <View style={{flex: 6,backgroundColor:'#fff',borderRadius:3, height: Utils.normalize(28),marginTop:7,marginLeft:10,marginRight:10,marginBottom:7,}}>
              <TextInput style={[styles.msgSerach]}
                autoCapitalize='none'
                ref="searchInput"
                autoCorrect={false}
                autoFocus={true}
                placeholder="以车架号搜索"
                placeholderTextColor="#999999"
                onChangeText={this._change.bind(this)}
              />
            <Icon name="ios-search" size={20} color='#999999' style={[styles.serachIcon]} />
              {this.state.searchClean ? <Icon onPress={()=> this._cleanInput()} name='ios-close-circle' size={20} color='#999999' style={[styles.serachCleanIcon]} /> : null }
            </View>
            <Text style={[styles.navRightButton]} onPress={()=>{this.setState({serachStatus:false,wrongText:''})}}>取消</Text>
          </View>
        :
          <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} rightIcon={ this.state.saleLevel3 ? {} : {name: 'ios-search',size: 20}} rightPress={ !this.state.saleLevel3 ? ()=>{this._changeSerach()} : null} title="选择车架号"/>
      }
        {!this.state.serachStatus ?
        <ScrollView>
          {slvin.length > 0?
            <View>
              <View style={styles.md_itemTitleBox}>
                <Text style={styles.md_itemTitle}>已选车辆</Text>
              </View>
              <View>
                {slvinComponent}
              </View>
            </View>
            :
            <View/>
          }
          {gpvin.length > 0 ?
            <View>
              <View style={styles.md_itemTitleBox}>
                <Text style={styles.md_itemTitle}>{'推荐车辆'}</Text>
              </View>
              <View>
                {gpvinComponent}
              </View>
            </View>
            :
            <View>
              {
                slvin.length < 1 ?
                <View style={styles.md_itemsTextBox}>
                  <Text style={styles.md_itemTitle}>
                    {'该车型暂无库存'}
                  </Text>
                </View>
                :
                <View/>
              }
            </View>
          }
          {otvin.length > 0 ?
            <View>
              <View style={styles.md_itemsTextBox}>
                <Text style={styles.md_itemTitle}>其它符合车辆</Text>
              </View>
              <View style={styles.md_item}>{otvinComponent}</View>
            </View>
            :
            <View style={styles.md_itemsTextBox}>
              <Text style={styles.md_itemTitle}>
                {this.state.saleLevel3 || gpvin.length >= 1 ? '' : '如需更换车辆请搜索'}
              </Text>
            </View>
          }

        </ScrollView>
        :
        <ScrollView>
          <View>{svin.length > 0 ?
            serachComponent
            :
            <View style={styles.md_itemTitleBox}>
              <Text style={styles.md_itemTitle}>{this.state.wrongText}</Text>
            </View>}
          </View>
        </ScrollView>
        }
        {this.state.LoadIcon?<LoadIcon/>:null}
      </View>
    );
  }
}

export default ChangeVin;
