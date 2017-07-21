/**
* @Author: Shen
* @Date:   2016-08-10T10:45:54+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-17T11:46:11+08:00

*/

'use strict';

import React, { Component } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Linking
} from 'react-native'
import {Actions} from 'react-native-router-flux'
import styles from '../common/styles'
import Icon from 'react-native-vector-icons/Ionicons'
import {Utils, Device, Assets,API} from "../base";
import lodash from 'lodash';
// #custom components
import { Header, Button, Loading, ItemCheckbox } from '../components'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      logined: true,
      loading: true,
      passSafe: true,
      isUpdateVersion:false,
      dataLoged: false,
    }
  }

  async componentDidMount() {
    this._getUser();

  }
  _upDateVersionTip(res){
      let updateContent= '';
      let currentVersion = Device.version;
      let releaseVersion = Device.iOS ? res.ios.version : res.android.version;
      if(currentVersion < releaseVersion){
        this.setState({isUpdateVersion:true});
        let content = Device.iOS ? res.ios.content : res.android.content;
        lodash.each(content,function(data,i){
          if(content.length-1 == i){
            return updateContent =updateContent+ data
          }else{
            //对数据进行换行处理
            return updateContent =updateContent+ data+'\n'
          }
        });
       Utils.showMsg('有新的版本',updateContent,'updateVersion','马上更新')
      }
  }
  _loginSuccess(index) {
    if(Device.iOS){
      this.refs.username.blur()
      this.refs.password.blur()
    }
    Actions.tabbar({type:'replace'})
  }

  _getUser() {
    // 重置密码后，默认显示重置时的用户名
    if (this.props.account) {
      this.setState({username: this.props.account, loading: false})
      return ;
    }

    storage.load({
      key: "User"
    }).then(res => {
      if(res.loginname && res.password && res.token && res.isLogin){
        this._loginSuccess(res.homeIndex)
      }else {
        this._checkSys();
      }
      //如果点击退出  并且勾选了记住密码  读取密码
    }).catch(err => {
      this._checkSys();
    })
  }
  _checkSys(){
    storage.load({
      key: 'System'
    }).then(res => {
      this.setState({
        loading: false,
        username: res.loginname,
        password: res.remember && res.password ? res.password : '',
        remember: res.remember,
        dataLoged: true
      })

    }).catch(err => {
      this.setState({loading: false, username: '',dataLoged: true})
    })
  }

  _onLogin() {
    if(this.state.isUpdateVersion){
      Utils.showMsg('有新的版本','请先更新后再进入系统','updateVersion','马上更新')
      return
    }

    let me = {
      login: this.state.username,
      pwd: this.state.password,
      version: Device.version
    }

    if(me.login.length >= 5 && me.pwd.length >= 5){
      // this.setState({loading: true})
      Utils.fetch(Utils.api.login, 'post', me).then((res) => {
        if(res) {
          let token = res.token, username = res.username, domain = 'http://' + res.domain, homeIndex = res.homeindex, msg_domain = res.msg_domain;
          storage.save({key: 'User',rawData: { token: token, username: username, domain: domain, msg_domain: msg_domain}});
          Utils.fetch(Utils.api.me, 'post', {token: res.token}).then((res) => {
            let menu = [], shop_type = res.shop_type;
            //根据版本筛选菜单
            res.menuprevs.menu.map((o, i) => {
              if ( !o.version || o.version <= Device.version) {
                menu.push(o)
              }
            })
            let _prevs = res.prevs ? res.prevs : false,
                _isPrev = false,
                _isSale = false,
                _saleLevel3 = false,
                _vinAvailbal = false,
                _isWare = false,
                _wareLevel3 = false;
            if(_prevs){
              _prevs.map((o, i) => {
                if((o.name === '201' || o.name === '600' || o.name === '601' || o.name === '200'||o.name === '100')&& (shop_type == '2'||shop_type == '1')) {
                  _isPrev = true;
                  //销售顾问
                  if(o.name === '200'){
                    _isSale = true;
                    if(o.level == '3'){
                      _saleLevel3 = true;   //三级销顾不能搜索车架号
                    }
                  }
                }
                if(o.name === '100'){
                  _isWare = true;
                  if(o.level == '3'){
                    _wareLevel3 = true;
                  }
                }
              })
            }


            if(_isPrev) {
                storage.save({
                  key: 'System',
                  rawData: {
                    loginname: res.loginname,
                    password: this.state.password,
                    remember:this.state.remember
                  }
                })
                storage.save({
                  key: 'User',
                  rawData: {
                    token: token,
                    loginname: res.loginname,
                    username: username,
                    password: this.state.password,
                    domain: domain,
                    title: res.title,
                    prevs: res.prevs,
                    shop_id: res.shop_id,
                    me_id: res.employee_id,
                    netInfo: true,
                    menu: menu,
                    isSale: _isSale,
                    homeIndex: res.homeindex,
                    saleLevel3: _saleLevel3,
                    isWare: _isWare,
                    wareLevel3: _wareLevel3,
                    msg_domain: msg_domain,
                    isLogin: true
                  },
                  expires: 1000 * 3600*24*30
                })
                this._loginSuccess(homeIndex)
            } else {
              Utils.showMsg('系统消息', '对不起，手机客户端没有适合您权限的功能，敬请留意')
              storage.save({key: 'User',rawData: null})
              return false
            }
          })
        } else {
          return false;
        }

      })
    } else if(!me.login){
      this.setState({logined: false})
      Utils.showMsg('登录失败', '请输入用户名')
    } else if(me.login.length < 5){
      this.setState({logined: false})
      Utils.showMsg('登录失败', '用户名格式错误')
    } else if(!me.pwd){
      this.setState({logined: false})
      Utils.showMsg('登录失败', '请输入密码')
    } else if(me.pwd.length < 5){
      this.setState({logined: false})
      Utils.showMsg('登录失败', '密码格式错误')
    }
  }
  _onPassSafe() {
    this.setState({passSafe: !this.state.passSafe})
    this.setState({ password : this.state.password + ' ' });
    setTimeout(() => {this.setState({ password : this.state.password.substring(0, this.state.password.length - 1)})}, 0)
  }
  _onCheck (){
   this.setState({remember:true});
  }
  _onUncheck(){
    this.setState({remember:false});
  }
  _cleanInput(type){
    this.refs[type] && this.refs[type].clear();
    this.setState({usernameShow: false,passwordShow:false})
  }

  _onPressForget() {
    Actions.checkAccount();
  }

  render() {

    let loginAvailable = this.state.username && this.state.password;
    return (
      <View style={styles.container}>
        <Header title="云杉思维" />
        <View style={styles.logoContainer}>
          <Image source={Assets.logo} style={styles.logo}/>
        </View>
        <View style={styles.viewContainer}>
          <View style={styles.loginContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <View style={styles.inputLeftIcon}><Icon name='ios-person' size={20} color="#BBB" onPress={() => this._onPassSafe()}/></View>
                <TextInput ref="username" onFocus={()=> this.state.username && this.setState({usernameShow: true})} onBlur={()=>this.setState({usernameShow: false})} style={styles.inputs} defaultValue={this.state.username} onChangeText={(username) => this.setState({username: username, usernameShow: username?true:false})} placeholder="用户名" autoCorrect={false} autoCapitalize="none" returnKeyType='next' keyboardType="default" onEndEditing={()=>{ this.refs['password'].focus()}} underlineColorAndroid="transparent"/>
                {this.state.usernameShow ? <Icon onPress={()=> this._cleanInput('username')} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{top:18}]} /> : <View/>}
              </View>
              <View style={styles.line}></View>
              <View style={styles.iconContainer}>
                <View style={styles.inputLeftIcon}><Icon name={this.state.passSafe ? 'ios-lock': 'ios-unlock'} size={18} color="#BBB" onPress={() => this._onPassSafe()}/></View>
                <TextInput ref="password"   onFocus={()=> this.state.password && this.setState({passwordShow: true})} onBlur={()=>this.setState({passwordShow: false})}  style={styles.inputs} onChangeText={(password) => this.setState({password: password,passwordShow:password?true:false})} placeholder="密码" defaultValue={this.state.password} secureTextEntry={this.state.passSafe} returnKeyType='done' underlineColorAndroid="transparent"/>
                {this.state.passwordShow ? <Icon onPress={()=> this._cleanInput('password')} name='ios-close-circle' size={18} color='#999999' style={[styles.serachCleanIcon,{top:16, right:38}]} /> : <View/> }
                <View style={styles.icon}><Icon name={this.state.passSafe ? 'ios-eye-outline': 'ios-eye'} size={32} color={this.state.passSafe ? '#bbb' : '#5090FD'} onPress={() => this._onPassSafe()}/></View>
              </View>
              <View style={styles.line}></View>

              <View style={localStyle.operateBar}>
                <TouchableOpacity onPress={this._onPressForget}>{

                  //<Text style={[styles.text, localStyle.forgetText]}>忘记密码</Text>\

                }
                </TouchableOpacity>
                {
                  this.state.dataLoged ?
                  <ItemCheckbox
                    backgroundColor="#fff"
                    color="#999"
                    borderColor="#999"
                    iconSize="normal"
                    refs="checkbox"
                    onCheck={this._onCheck.bind(this)}
                    onUncheck={this._onUncheck.bind(this)}
                    default={this.state.remember}
                    circle={false}
                    label={true}
                    text = '记住密码'
                    size={17}/>
                  :<View/>
                }

              </View>
              <View style={styles.btnGroup}>
                <Button value="登 录" shutdownInteractive={!loginAvailable} pattern={{outLine: loginAvailable?"fullButton":"fullButtonUnAct",text:"fullText"}} onPress={() => loginAvailable && this._onLogin()} />
              </View>
            </View>
          </View>
        </View>
        {this.state.loading ? <Loading top="hide" bg="#FFF"/> : null}
      </View>
    )
  }
}

const localStyle = StyleSheet.create({
  // 忘记密码和记住密码
  operateBar: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  forgetText: {
    color: '#888',
    fontSize: 15
  }
})
export default Login
