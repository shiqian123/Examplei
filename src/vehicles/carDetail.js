/**
* @Author: MillerD
* @Date:   2016-11-18T19:38:05+08:00
* @Email:  zlw2579@gmail.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-21T15:48:06+08:00
*/

'use strict'

import React, { Component } from 'react';
import {
  ListView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Animated
} from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import {Actions} from 'react-native-router-flux';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles'
import lodash from 'lodash';

import {Tip,Box} from  "../components"

class CarDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAllot: false,
      showLockPage: false,
      carData: props.carData,
      ops: props.ops,
      ani: new Animated.Value(Utils.width)
    }
  }

  componentWillReceiveProps(nextProps){
      /*
          backToDetail  调拨／锁定
          0       调拨
          1       锁定
      */
     switch (nextProps.backToDetail) {
          case 0:
              this._allotConfirm(nextProps.info_allot);
              break;
           case 1:
              this._lockConfirm(nextProps.info_lock);
              break;
         default:
     }
  }

  _allotPress() {
    Actions.allot({data:this.state.carData})
  }

  // 锁定
  _lockPress() {
    let carData = this.state.carData;
    if(carData.status === "0") {
      /*this.setState({showLockPage: true});
      Animated.timing(
        this.state.ani,
        {
          toValue: 0,
          duration: 250
        }
      ).start()*/
      Actions.lock({
          data:this.state.carData
      })

    }else if(carData.status === "2") {
      let params = {id: carData.id, warehouse_id: carData.warehouse_id};
      Utils.fetch(Utils.api.unlock,'post',params)
        .then((res) => {
          this.setState({carData: res,show: true,alert: '解锁成功',operate_flag:"3"});
          setTimeout(()=>{
            this.setState({show: false})
          },2000)
          /*this.props.unlockConfirm(res);*/
          // var newLi = lodash.cloneDeep(currentList);
          // for (let key in newLi) {
          //   if(newLi[key]['id'] === res.id) {
          //     newLi.splice(key, 1, res)
          //     currentList = newLi;
          //     break;
          //   }
          // };
          // this.setState({
          //   dataSource: this.state.dataSource.cloneWithRows(newLi)
          // });
        })
      }
    }

    _allotConfirm(data) {
      this.setState({carData: data,show: true,alert: '调拨成功',operate_flag:"1"});
      setTimeout(()=>{
        this.setState({show: false})
      },2000)
      /*this.props.allotConfirm(data);*/
      // var newDs = lodash.cloneDeep(currentList);
      // for (let key in newDs) {
      //   if(newDs[key]['id'] === id) {
      //     newDs.splice(key, 1)
      //     currentList = newDs;
      //     break;
      //   }
      // };
      // this.setState({
      //   dataSource: this.state.dataSource.cloneWithRows(newDs)
      // });
    }

    _lockConfirm(info) {
      this.setState({carData: info,show: true,
      alert: '锁定成功',operate_flag:"2"});
      setTimeout(()=>{
        this.setState({show: false})
      },2000)
      /*this.props.lockConfirm(info);*/
      // var newLi = lodash.cloneDeep(currentList);
      // for (let key in newLi) {
      //   if(newLi[key]['id'] === info.id) {
      //     newLi.splice(key, 1, info)
      //     currentList = newLi;
      //     break;
      //   }
      // };
      // this.setState({
      //   dataSource: this.state.dataSource.cloneWithRows(newLi)
      // });
    }



  _generateButton(data, ops) {
    // ops 是针对角色的全局权限设置，data.ops是对每条数据是否有操作权限的设置，优先级高于前者
    let allotButton = {
      display: false,
      style: {},
    }
    let lockButton = {
      display: false,
      style: {},
      value: '',
    }

    switch(data.status) {
      case "0":
        if(ops === undefined) {break}
        allotButton = {
          display: ops.allot ? true : false,
          color: data.ops ? '#387ff5' : '#999',
          functional: data.ops
        }
        lockButton = {
          display: ops.lock ? true : false,
          color: data.ops ? '#387ff5' : '#999',
          value: '锁定',
          functional: data.ops
        }
        break;
      case "2":
        if(ops === undefined) {break}
        allotButton = {
          display: ops.allot ? true : false,
          color: data.ops ? '#387ff5' : '#999',
          functional: data.ops
        }
        lockButton = {
          display: ops.unlock ? true : false,
          color: data.ops ? '#ff0006' : '#999',
          value: '解锁',
          functional: data.ops
        }
        break;
      case "6":
        if(ops === undefined) {break}
        allotButton = {
          display: ops.allot ? true : false,
          color: '#999',
          functional: false
        }
        lockButton = {
          display: false,
          functional: false
        }
        break;
    }
    return [allotButton, lockButton];
  }

  _generateStatus(data) {
    if (data.status === "2") {
      return data.status_name + '(' + data.lock_reason_name.slice(0, 2) + ('cart_status' in data ? (':' + data.cart_status) : '') + ')'
    }else if (data.status === "6"){
      return data.status_name + '(' + data.reason_name + ')'
    }else{
      return data.status_name
    }
  }

  filterName( mName, tName){
    mName = mName.trim();
    let a = mName.replace( new RegExp("^" + tName + ""), '')
    return a;
  }

  _carDetailBack(){
      Actions.pop({refresh:{info:this.state.carData,info_carDetail:this.state,whichPage:0}});
  }

  render() {
    let data = this.state.carData;
    let ops = this.state.ops;
    let buttonStyle = this._generateButton(data, ops);
    let status_plus_reason = this._generateStatus(data);

    return (
      <View style={styles.container}>
        <Header leftPress={() => this._carDetailBack()} title="车辆详情" leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} />
        <ScrollView style={{position: 'absolute', backgroundColor:'#fff',width: Utils.width, top: Utils.andr21Normalize(64), bottom: Device.andrAPIBelow21 ? Utils.normalize(26) : 0}}>
          <Box left={'车系'} right={data.type_name} style={{marginLeft:12}}/>
          <Box left={'车型'} right={this.filterName(data.model_name, data.type_name)}/>
          <Box left={'车架号'} right={data.vin}/>
          <Box left={'状态'} right={status_plus_reason}/>
          <Box left={'车身颜色'} right={data.color_name}/>
          <Box left={'内饰颜色'} right={data.inner_color}/>
          <Box left={'锁定人'} right={data.lock_creater}/>
          <Box left={'锁定天数'} right={data.lock_day}/>
          <Box left={'总在库时间'} right={data.stockDay === undefined ? data.inwar_time : data.stockDay}/>
          <Box left={'仓库'} right={data.warehouse_name}/>
          <Box left={'库位'} right={data.carport}/>
          <Box left={'生产日期'} right={data.made_date} />
          <Box left={'钥匙号'} right={data.carkey} />
          <Box left={'合格证书'} right={data.certification} />
          <Box left={'入库时间'} right={data.entertime} />
          <Box left={'锁定时间'} right={data.lock_time} />
          <Box left={'锁定原因'} right={data.lock_reason_name} />
          <Box left={'锁定备注'} right={data.lock_des === "null" ? '' : data.lock_des} />
          <View style={{height: Utils.normalize(50)}}></View>
        </ScrollView>
        <View style={[{flexDirection: 'row', borderColor: '#ccc',borderTopWidth: buttonStyle[0].display === true || buttonStyle[1].display === true ? 1 : 0, width: Utils.width, height:Utils.normalize(49),alignItems:'center',justifyContent:'center',backgroundColor: 'transparent',bottom: Device.andrAPIBelow21 ? Utils.normalize(26) : 0, position: 'absolute'}]}>
          {buttonStyle[0].display ?
            <TouchableHighlight style={[{flex: 1, height:Utils.normalize(49),alignItems:'center',justifyContent:'center',backgroundColor: '#fff',bottom: 0}]} underlayColor='#f2f2f2' onPress={buttonStyle[0].functional ? ()=>this._allotPress() : null}>
              <Text style={{textAlign:'center',color: buttonStyle[0].color,fontSize:Utils.normalize(15)}}>调拨</Text>
            </TouchableHighlight> : null
          }
          {buttonStyle[0].display === true && buttonStyle[1].display === true ?
            <View style={{backgroundColor: '#fff', width: 1, height: Utils.normalize(49), alignItems: 'center', justifyContent: 'center'}}>
              <View style={{backgroundColor: '#999', width: 1, height: 18}} />
            </View> : null
          }
          {buttonStyle[1].display ?
            <TouchableHighlight style={[{flex: 1, height:Utils.normalize(49),alignItems:'center',justifyContent:'center',backgroundColor: '#fff',bottom: 0}]} underlayColor='#f2f2f2' onPress={buttonStyle[1].functional ? ()=>this._lockPress() : null}>
              <Text style={{textAlign:'center',color:buttonStyle[1].color,fontSize:Utils.normalize(15)}}>{buttonStyle[1].value}</Text>
            </TouchableHighlight> : null
          }
        </View>
        {this.state.show ? <Tip name={this.state.alert} /> : <View></View>}
      </View>
    )
  }
}
const localStyles = StyleSheet.create({
  detailLeft: {
    flex: 1,
    fontSize: Utils.normalize(14),
    fontWeight: '400',
  },
  detailRight: {
    flex: 2,
    textAlign: 'right',
    fontWeight: '400',
    color: '#999999',
    fontSize: Utils.normalize(14),
  },
  msgBox: {
    height: Utils.normalize(50),
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    alignItems:'center',
    flexDirection:'row',
    marginLeft: 15,
    marginRight: 15
  }
})

export default CarDetail;
