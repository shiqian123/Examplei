/**
* @Author: Shen
* @Date:   2016-08-22T10:14:02+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   Shen
* @Last modified time: 2016-10-26T15:10:01+08:00
*/

'use strict';

import React, {
  PixelRatio,
  Alert,
  NetInfo,
  Linking
} from 'react-native'
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Toast from './toast';
import lodash from 'lodash';
import Dimensions from 'Dimensions'
import moment from 'moment'
import Device from './device'
import API from './api'
import Assets from './assets'
import regexp from './regexp'
import calanderSwitch from './calanderSwitch'

let WIDTH = Dimensions.get('window').width
let HEIGHT = Dimensions.get('window').height
let SCALE = WIDTH / 375
let PIXEL = parseFloat(SCALE / 2).toFixed(1)
let _temStorage = '';
const Utils = {
  pixel: SCALE,
  scale: SCALE,
  width: WIDTH,
  height: HEIGHT,
  normalize: (size: number) => {
    return  Math.round(SCALE * size)
  },
  andr21Normalize : (size :number) => {
    if(Device.andrAPIBelow21) {
      return Math.round(SCALE * (size - 20))
    }else{
      return Math.round(SCALE * size)
    }
  },
  device: Device,
  api: API,
  moment: moment,
  assets: Assets,
  icons: Assets.icons,
  regexp: regexp,
  toast: Toast,
  calanderSwitch: calanderSwitch,
  /**
   * 消息提醒
   * @param  {String} title 标题
   * @param  {String} msg   消息内容
   * @return {String or function } type  消息类型 或 回调函数
   * @param  {String} text 按钮文字
   */
  showMsg: (title, msg, type, text) => {
    Alert.alert(title, msg, [{
    	text: text || '确认',
    	onPress: () => {
    		if (type == 1) {
    			storage.load({
    				key: "System"
    			}).then( res => {
            Utils.changeStorage(['isLogin'] ,[false]);
            return res;
          }).then(res => {
    				Actions.login({type: 'replace', exit: true,remember: res.remember});
    			})
    		}
    		if (type == 'updateVersion') {
    			if (Device.iOS) {
    				Linking.openURL("https://itunes.apple.com/app/yun-shan-si-wei/id1105808070")
    			} else {
            let downUrl = API.downUrl + "/apps/index.html"
    				Linking.openURL(downUrl)
    			}
    			Actions.login({type: 'refresh'});
    		}
        if ( typeof type == 'function' ){
          type();
        }
    	},
    }])
  },

  /**
   * JSON 转换 Form Data
   * @param  {Object} 转换对象 JSON 格式
   * @return {String} 转换结果 form data 格式
   */
  toFormData(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
    for (name in obj) {
      value = obj[name];
      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this.toFormData(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this.toFormData(innerObj) + '&';
        }
      } else if (value !== undefined){
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }
    return query.length ? query.substr(0, query.length - 1) : query;
  },
  /**
   * 数据请求方法
   * @param  {String} url    请求URL
   * @param  {String} method 类型, post/get
   * @param  {Object} param  参数 post 必填
   */
  fetch(url,method,param,errFun) {
    let netCheck = NetInfo.fetch();
    let reg = /.*?(\/)(ns)(\/)/;
    let options,contentType,bodyData = null;
    let token = storage.load({ key: "User"}).then(res => { return Promise.resolve(res.token) }).catch(err => { return Promise.resolve('') });
    return new Promise((resolve, reject) => {
      netCheck.done(reach => {
        switch (reach) {
          case 'none':
            Utils.showMsg('网络错误','请检查您的网络是否连接正常');
            //改变网络标记
            this.changeStorage(["netInfo"],[false]);
            //errFun('none');
            break;
            //增加android联网状态
          case 'NONE':
             Utils.showMsg('网络错误','请检查您的网络是否连接正常');
            //改变网络标记
            this.changeStorage(["netInfo"],[false]);
          //  errFun('none');
            break;
            default:
            token.done(token => {
              if(method.toLowerCase() === 'post'){
                param === undefined ? param = {} : null;
                param['from'] = 'PHONE'
                if (param['token'] == undefined) {
                  param['token'] = token
                }
                options = {
                  method: method,
                  headers: { 'Content-Type': reg.test(url) ? 'application/json' : 'application/x-www-form-urlencoded' },
                  body: reg.test(url) ? JSON.stringify(param) : this.toFormData(param)
                }
              } else if(method.toLowerCase() === 'get') {
                const mw = /.*?(\/)(mw)(\.)/;
                url = mw.test(url) ? url : url + '?from=PHONE&token=' + token;
              }
              fetch(url, options)
                .then(response => {
                  if(response.ok){
                    return response.json()
                  } else {
                    let _result = {status:response.status, message: null, url: url,error:true}
                    switch (response.status) {
                      case 404:
                        _result.message = "找不到文件了 -_-!";
                        console.info(_result);
                        break;
                      case 500:
                        _result.message = "程序出问题了 Orz~";
                        console.info(_result);
                        break;
                    }
                  }
                })
                .then(res => {
                  if(res && res != undefined){
                    res = Utils.hasResult(res,errFun);
                    res ? resolve(res) : resolve(null)
                  }
                })
                .catch(err => { /* Utils.showMsg('系统消息', '请检查您的网络是否正常') */ })
            })
        }
      })
    })
  },
  /**
   * 修改本地缓存
   * @param  {array} param  缓存的key值
   * @param  {array} param  缓存key值的value
   * @param  {bool} param   缓存中某个存储空间下
   */
  changeStorage(data,content,key){
    let keys = key || "User";
    storage.load({
      key: keys
    }).then(res => {
      _temStorage = res;
      let remember = res.remember;
      lodash.each(data,function (_data,i) {
        _temStorage[_data] = content[i];
      });
      storage.save({
        key: keys,
        rawData: _temStorage
      });
      _temStorage = '';
    });
  },
  /**
   * 验证结果数据
   */
  hasResult(data,errFun) {
    // data.info = data.info ? data.info : '系统消息'
    // data.data = data.data ? data.data : '请检查登录信息是否正确'
    if(data.info === data.data){
      data.info = null
    }
    if (data.status === 0||data.status === 200) {
      return data.data || data;
    } else if (data.status === 1 || data.status === 7 || data.status === 8) {
      this.showMsg('', data.info, 1);
      return false;
    } else {
      this.showMsg('',data.info?data.info:data.data, errFun);
      return false;
    }
  },
  /**
   * 日起转换成页面显示格式
   */
  toDisDate(date, type) {
    let _d = moment(date).format('YYYY/MM/DD');
    if(type !== undefined && type === 'MONTH'){
      _d = moment(date).format('YYYY/MM');
    }
    return _d;
  },
  /**
   * 日起转换成数据查询格式,且可以获取之前或之后多少天日期
   * @param {[date]}
   * @param {[type]}
   * @param {[day]}
   */
  toMinDate(date, type, day, format) {
    let _r = type === 'DAY' ? moment(date).format('YYYYMMDD') : moment(date).format('YYYYMMDD')
    let _t = type === 'DAY' ? 'days' : 'months'
    let _f = type === 'MONTH' ? 'YYYYMMDD' : 'YYYYMMDD'
    if (day !== 0) {
      if (type !== undefined && type !== null && type) {
        _r = moment(date).add(day, _t).format(_f);
      } else {
        _r = moment(date).subtract(day, _t).format(_f);
      }
    }
    return _r;
  },
  transFormArray(obj){
    var arr = [];
    for(var item in obj){
        arr.push(obj[item]);
    }
    return arr;
  },
  /**
   * 计算较前一日
   * @param  {[type]} curData [description]
   * @param  {[type]} oldData [description]
   * @param  {[type]} type    [description]
   * @return {[type]}         [description]
   */
  calPrevData(curData, oldData, type) {
    curData = parseFloat(curData);
    oldData = parseFloat(oldData);
    if(isNaN(curData)) curData = 0;
    if(isNaN(oldData)) oldData = 0;
    let _r=0;
    if(type !== undefined && type == 2  && !isNaN(oldData)){
      if(oldData == 0){
        if(curData>0) _r=100;
        else if(curData==0) _r=0;
        else  _r=100;
      }else {
        _r = ((curData - oldData) / Math.abs(oldData) ) * 100;
      }
    }
    isNaN(_r) ? _r = 0 : null
    _r = _r.toFixed(0)
    // if(_r === Infinity){
    //   _r = '-';
    // } else if(_r === -Infinity){
    //   _r = '|';
    // }
    return _r;
  },
  toString(number){
    number = number.toString().replace(/^\-/g, "");
    return number;
  },

  oFixed(number, num, milli){
    let _r = parseFloat(number)
    if(!isNaN(_r)){
      _r = _r.toFixed(num)
    } else {
      _r = 0
    }
    if(milli){
      _r = this.milliFormat(_r)
    }
    return _r
  },
  milliFormat(number){
    var _m = '';
    if(number >= 0){
      _m = number && number.toString().replace(/(^|\s)\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
    }else{
      number = number.toString().slice(1);
      _m = '-' + number.replace(/(^|\s)\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
    }
    return _m
  },
  formatDate(date, friendly) {
    date = moment(date);
    if(friendly){
      return date.fromNow()
    } else {
      return date.format('YYYY-MM-DD')
    }
  },
  isValidUrl(url) {
    return /http(s*):\/\/.+/.test(url);
  },
  /**
   * 获取单据详情数量
   * **/
  cartCount(){
    fetch(API.get,'POST',{}).then(
      (res)=>{

      }
    )
  }
}
export default Utils
