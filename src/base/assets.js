/**
 * @Author: Shen
 * @Date:   2016-07-29T14:37:41+08:00
 * @Email:  ihaiyon@gmail.com
 * @Last modified by:   callback
 * @Last modified time: 2016-11-11T14:56:19+08:00
 */

'use strict'

import Device from './device'
import API from './api'
const Assets = {
     logo: Device.iOS ? require('../assets/img/logo.png') : {uri: 'logo'},
    backToTop: Device.iOS ? require('image!backToTop') : {uri: 'backtotop'},
    car: Device.iOS ? require('image!car') : {uri: 'car'},
    dao: Device.iOS ? require('image!dao') : {uri: 'dao'},
    money: Device.iOS ? require('image!money') : {uri: 'money'},
    cover: Device.iOS ? require('image!cover') : {uri: 'cover'},
    history: Device.iOS ? require('image!history-high') : {uri: 'history-high'},
    aboutBack: Device.iOS ? require('image!aboutBack') : {uri: 'aboutback'},
    networkError: Device.iOS ? require('image!networkError') : {uri: 'networkerror'},
    load: Device.iOS ? require('../assets/img/load_red.gif') : {uri: 'load_red.gif'},
    homeSlide1: Device.iOS ? require('image!home') : {uri: 'home'},
    homeSlide2: Device.iOS ? require('image!home') : {uri: 'home'},
    homeSlide3: Device.iOS ? require('image!home') : {uri: 'home'},
    cars: Device.iOS ? require('image!cars') : {uri: 'cars'},
    reports: Device.iOS ? require('image!reports') : {uri: 'reports'},
    shoppingCart: Device.iOS ? require('image!shoppingCart') : {uri: 'shoppingcart'},
    developing:Device.iOS? require('image!developing'):{uri: 'developing'},
    developTips:Device.iOS? require('image!developTips'):{uri: 'developtips'},
    cart:Device.iOS? require('image!cart'):{uri: 'cart'},
    noImg:Device.iOS? require('image!noimg'):{uri: 'noimg'},
    reserve:Device.iOS? require('image!reserve'):{uri: 'reserve'},
    boutique:Device.iOS? require('image!pd_stock'):{uri: 'pd_stock'},
    change:Device.iOS? require('image!change'):{uri: 'change'},
    outStock:Device.iOS? require('image!outStock'):{uri: 'outStock'},
    androidBar:Device.iOS ? require('image!androidbar') : {uri: 'androidbar'},
    user:Device.iOS ? require('image!user') : {uri: 'user'},
    birthday:Device.iOS ? require('image!birthday') : {uri: 'birthday'},
    message:Device.iOS ? require('image!message') :{uri:'message'},
        logout: Device.iOS ? require('image!logout') : {uri: 'icon_logout'},
        login: Device.iOS ? require('image!login') : {uri: 'icon_login'},
        share: Device.iOS ? require('image!share') : {uri: 'icon_share'},
        menu: Device.iOS ? require('image!navicon') : {uri: 'icon_navicon'},
        setting: Device.iOS ? require('image!settings') : {uri: 'icon_settings'},
        plus: Device.iOS ? require('image!plus') : {uri: 'icon_plus'},
        funnel: Device.iOS ? require('image!funnel') : {uri: 'icon_funnel'},
        fork: Device.iOS ? require('image!fork') : {uri: 'icon_fork'},
        eye: Device.iOS ? require('image!eye') : {uri: 'icon_eye'},
        eye_outline: Device.iOS ? require('image!eye_outline') : {uri: 'icon_eye_outline'},
        chevron_left: Device.iOS ? require('image!chevron_left') : {uri: 'icon_chevron_left'},
        trash: Device.iOS ? require('image!trash') : {uri: 'icon_trash'},
        about: Device.iOS ? require('image!about') : {uri: 'icon_about'},
        me_on: Device.iOS ? require('image!me_on') : {uri: 'icon_me_on'},
        me_off: Device.iOS ? require('image!me_off') : {uri: 'icon_me_off'},
        message_on: Device.iOS ? require('image!message_on') : {uri: 'icon_message_on'},
        message_off: Device.iOS ? require('image!message_off') : {uri: 'icon_message_off'},
        brief_on: Device.iOS ? require('image!brief_on') : {uri: 'icon_brief_on'},
        brief_off: Device.iOS ? require('image!brief_off') : {uri: 'icon_brief_off'},
        home_on: Device.iOS ? require('image!home_on') : {uri: 'icon_home_on'},
        home_off: Device.iOS ? require('image!home_off') : {uri: 'icon_home_off'},
        filter: Device.iOS ? require('image!filter') : {uri: 'icon_filter_a'},
        log: Device.iOS ? require('image!log') : {uri: 'icon_log'},
        createcart: Device.iOS ? require('image!createcart') : {uri: 'createcart'},
        shoppinggoods: Device.iOS ? require('image!shoppinggoods') : {uri: 'shoppinggoods'},
        addloop: Device.iOS ? require('image!icon_addloop') : {uri: 'icon_addloop'},
        shop_cart: Device.iOS ? require('image!shop_cart') : {uri: 'shop_cart'},
        lock_btn: Device.iOS ? require('image!lock_btn') : {uri: 'lock_btn'},
        unlock_btn: Device.iOS ? require('image!unlock_btn') : {uri: 'unlock_btn'},
        whitepen: Device.iOS ? require('image!whitepen') : {uri: 'whitepen'},
        whitecar: Device.iOS ? require('image!whitecar') : {uri: 'whitecar'},
        dustibn:Device.iOS ? require('image!dustbin') : {uri: 'dustbin'}
}
export default Assets
