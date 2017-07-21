'use strict';

import React, {
  NetInfo
} from 'react-native'

import Utils from './utils'
import {LogicError, NetLostError} from '../base/errors'

const defaultOptions = {
  autoSetToken: true, // 自动设置token
  autoHandleLogicError: true, // 自动处理业务异常
  autoHandleNetError: true, // 自动处理网络异常
  checkNet: true, // 发送请求前检查一次网络状态
}

const NetUtil = {

  _handleNetError() {
    Utils.showMsg('网络错误','请检查您的网络是否连接正常')
    Utils.changeStorage(["netInfo"],[false])
  },

  _handleLogicError(err) {
    let msg = err.message && err.message.info || err.message.data
    Utils.showMsg(msg)
  },

  /**
   * 从本地存储中加载token
   */
  _handleToken(body) {
    return new Promise((resolve, reject) => {
      storage.load({ key: "User"})
      .then(res => { 
        body.token = res.token
        resolve(res.token)
      })
      .catch(err => {
        body.token = ''
        resolve('') 
      })
    })
  },

  /**
   * 发送请求前检查是否联网
   */
  _checkNet() {
    return new Promise((resolve, reject) => {
      NetInfo.fetch().done(reach => {
        // none 离线状态
        if (reach == 'none' || reach == 'NONE') {
          return reject(new NetLostError(''))
        }
        resolve(true)
      })
    })
  },

  _handleFetch(url, init, options) {
    let self = this
    return fetch(url, init)
      .then(res => {
        // ignore res.ok
        return res.json()
      }) 
      .then(result => {
        // console.log('post result', result)
        // http响应状态码为200-299，表示成功
        if (result.status == 0) {
          return result.data === undefined ? result : result.data
        }

        // 业务异常
        if (result.status != 0) {
          throw new LogicError(result)
        }
      })
  },


  /**
   *  发送post请求，并获取json数据
   *    options:
   *      autoSetToken: true | fales, 默认为true，是否自动设置token
   *      autoHandleLogicError: true | false, 默认为true，是否自动处理业务异常，提示信息使用后台返回的消息
   *      autoHandleNetError: true | false, 默认为true, 是否自动处理网络异常
   */
  postJson(url, body = {}, options = {}) {
    if (!url) {
      throw new TypeError('url参数不合法')
    }

    let self = this;
    options = Object.assign({}, defaultOptions, options)
    let tasks = []

    if (options.autoSetToken) {
      tasks.push(self._handleToken(body))
    }
    if (options.checkNet) {
      tasks.push(self._checkNet())
    }

    return Promise.all(tasks)
      .then(values => {
        let init = {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        }
        // console.log('post body:', init.body)
        return self._handleFetch(url, init, options)
      }).catch(err => {
        if ((err.name == 'NetLostError' || err.message == 'Network request failed') && options.autoHandleNetError) {
          self._handleNetError()
          throw null;
        }

        if (err.name == 'LogicError' && options.autoHandleLogicError) {
          self._handleLogicError(err)
          throw null;
        }

        throw err;
      })
  }
}

export default NetUtil