/**
* @Author: Shen
* @Date:   2016-08-22T10:14:02+08:00
* @Email:  ihaiyon@gmail.com

* @Last modified by:   MillerD
* @Last modified time: 2016-11-18T19:08:00+08:00

*/

'use strict';

let BASE_URL = {
  //HOST: 'https://www.4sone.com',
 // HOST: 'http://dev.4sstar.cn',
     HOST:'https://debug.4snow.cn',
  PORT: '',
  PATH: '',
 // DOWN: 'http://down.4sone.com', //android可使用http
   DOWN: 'http://down.4snow.cn',
 // WHOST: 'https://mw.4sone.com',
  WHOST: 'https://mw.debug.4snow.cn',
  WPORT: '',
  WPATH: ''
}
let URL = BASE_URL.PORT ? (BASE_URL.HOST + ':' + BASE_URL.PORT + BASE_URL.PATH) : (BASE_URL.HOST + BASE_URL.PATH)
let WEBSERVICEURL = BASE_URL.WPORT ? (BASE_URL.WHOST + ':' + BASE_URL.WPORT + BASE_URL.WPATH) : (BASE_URL.WHOST + BASE_URL.WPATH)
/**
 * 所有POST都需要 token参数
 * @type {Object}
 */
const API = {
  webService: WEBSERVICEURL, // Web Service
  url: URL, //接口地址
  downUrl: BASE_URL.DOWN,
  /**
   * 登录接口
   * @method POST
   * @param login, pwd
   */
  login: URL + '/Home/Index/go/op/login',
  /**
   * 获取当前用户信息
   * @method GET
   */
  me: URL + '/Home/Index/go/op/me',
  /**
   * 获取一些基础信息 (待补充)
   * @method POST
   * @param {
   *   shop_fee_list 其它商品列表
   *   cart_proc  订单类型
   *   cart_stage  订单状态
   *   sex 性别
   *   create_cart 是否有创建购物车权限
   *   me_anasaleempscope 当前用户部门信息
   * }
   */
  load: URL + '/Business/Enum/go/op/load',
  /**
   * 我的消息
   * @method POST
   */
  countMsg: URL +  '/Business/Message/go/op/countMsg',   //未读消息数量
  message: URL + '/Business/Message/go/op/query', // 我的消息
  msgDetail: URL + '/Business/Message/go/op/detail', //获取单据详情
  cartcicate: URL + '/Business/KeyQuery/go/op/cartcicate', //分期贷款类型
  allowvin: URL + '/Business/Cart/go/op/allowvin', //车架号
  searchStock:URL+ '/Business/Cart/go/op/searchStock',
  getextinfo: URL + '/Business/Message/go/op/getextinfo', //单据日志
  reply: URL + '/Business/Message/go/op/reply', //单据备注
  carts: URL + '/Business/Cart/go/op/carts', //获取追加单据
  cartcust: URL + '/Business/KeyQuery/go/op/cartcust', //获取客户信息
  car: URL + '/Business/CustCar/go/op/car', //获取已购车
  delete: URL + '/ns/cart/delete', //删除单据

  get: URL + '/ns/cart/get', // 获取销售单据信息
  save: URL + '/ns/cart/save',//保存
  submit: URL +'/ns/cart/submit',//单据提交
  unionquery: URL + '/Business/Newcarwarehouse/go/op/unionquery', //车辆查找
  deliver: URL + '/Business/Newcarwarehouse/go/op/deliver', //车辆调拨
  lock: URL + '/Business/Newcarwarehouse/go/op/lock', // 车辆锁定
  unlock: URL + '/Business/Newcarwarehouse/go/op/unlock', //车辆解锁
  add: URL + '/Business/Cust/go/op/add', //增加客户
  custcaradd: URL + '/Business/CustCar/go/op/add', //已购车辆录入新车辆
  /**
   * 销售简报/销售分析 (待补充)
   * @type {RegExp}
   */
  anasale: URL + '/Business/Ana/go/op/anasale', // 销售简报
  version: WEBSERVICEURL + '/version', //检查版本

 /**
  *
  *车辆查找
  *@method POST
  *
  *
  *
  *
  *
  *
  *
  *
  */

  /**
   * 选购
   *
   * */
  queryNC:URL+'/Business/Sale/go/op/queryNC', //新车选购
  queryPd:URL+'/Business/Sale/go/op/queryPd',//精品选购
  queryBy:URL+'/Business/Sale/go/op/queryBy',//汽车美容选购
  queryIe:URL+'/Business/Sale/go/op/queryIe',//保险选购
  queryEw:URL+'/Business/Sale/go/op/queryEw',//延保选购
  queryOt:URL+'/Business/Sale/go/op/queryOt',//其他选购
  querySu:URL+'/Business/Sale/go/op/querySu', //套装选购
  createcart:URL+'/Business/Cart/go/op/create',  //创建购物车
  cartList:URL+'/Business/Cart/go/op/carts',  //购物车列表
  buying:URL+'/ns/cart/buying', //购物车购买中
  querybill: URL+'/Business/Cart/go/op/query', //搜索主销售单
  priceLimit:URL+'/Business/Sale/go/op/priceLimit',
  /*
  *  精品库存
   */
  queryBoutique:URL+'/Business/ProductStock/go/op/query', //精品列表
  deliverStorage:URL+'/Business/ProductStock/go/op/deliver', //精品出库
  queryCates:URL+'/Admin/Category/go/op/queryCates', //修改时精品查询
  change:URL+'/Business/ProductStock/go/op/change',//变更精品名称
  //忘记密码
  checkAccount: URL + '/Home/Index/go/op/checkAccount', // 检查账户是否存在
  apply: URL + '/ns/non_aut/captcha/apply', // 获取验证码
  verify: URL + '/ns/non_aut/captcha/verify', // 验证
  updatePwdByName: URL + '/Home/Index/go/op/updatePwdByName', // 重置密码
  /*
   *客户管理
   */
   queryUser:URL + '/Business/Cust/go/op/query',
   querySales:URL + '/Business/Cust/go/op/depAndPer',
   deleteUser:URL +  '/Business/Cust/go/op/delete',
   updateUser:URL + '/Business/Cust/go/op/update',
   getSale:URL + '/Business/Cust/go/op/getSale',
   CustCar:URL + '/Business/CustCar/go/op/car',
   deleteCar:URL + '/Business/CustCar/go/op/delete',
   updateCar:URL + '/Business/CustCar/go/op/update'
}
export default API
