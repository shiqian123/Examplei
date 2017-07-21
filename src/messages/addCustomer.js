/**
* @Author: meteor
* @Date:   2016-08-15T18:40:37+08:00
* @Last modified by:   shiqian
* @Last modified time: 2016-09-29T17:15:06+08:00
*/



'use strict'

import React, { Component } from 'react';
import {
    Alert,
    View,
    Text,
    ScrollView,
    RefreshControl,
    ListView,
    TouchableHighlight,
    Linking,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    DatePickerIOS,
    DatePickerAndroid,
    Keyboard
} from 'react-native'
import styles from '../common/styles'
import {Utils,Device} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header} from '../components'
import Storage from 'react-native-storage'
import { Tip, Box} from  "../components";
let that = null;
class AddCustomer extends Component{
  constructor(props){
    super()
    this.state = {
      data: props.data,
      backNow: props.back ? true : false,
      date: new Date(),
      sexSwitch: false,
      dateShow: false,
      nameErr: false,
      tel1Err: false,
      pidErr: false,
      that: this,
      cust: {
        sex: '',
      },
      custUi: {
        sex: '',
      },
      aftKeyboardHeight: 0,
      test: 'world'
    }
  }
  componentDidMount() {
    Utils.fetch( Utils.api.load, 'post', {keys: 'sex'})
    .then( (res)=> {
      this.setState({
        sex: res.sex,
      })
    })
    storage.load({
      key: "User"
    }).then(res => {
      this.state.cust.username = res.username;
    })
    Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }
  componentWillReceiveProps(nextPage){
    this.setState({cust: nextPage.cust, custUi: nextPage.custUi})
  }

  keyboardWillHide() {
    this.setState({aftKeyboardHeight: 0});
  }

  keyboardWillShow(frames) {
    let keyboardSpace =  frames.endCoordinates.height//获取键盘高度
    if(Device.isAndroid) keyboardSpace = 0;
    this.setState({aftKeyboardHeight:keyboardSpace})
  }
  _sexPress(item) {
    this.setState({sexSwitch: false})
    this.state.custUi.sex = item.nm;
    this.state.cust.sex = item.vl;
  }
  _sexSwitch() {
    this.setState({sexSwitch: true})
  }
  _quitSex(){
    this.setState({sexSwitch: false})
  }
  _certificate() {
    Actions.certificate({cust: this.state.cust,custUi: this.state.custUi});
  }
  _addressDetail(){
    Actions.markAddress({cust: this.state.cust, custUi: this.state.custUi})
  }
  _onDateChange (date) {
    this.setState({date: date });
  }
  _setBirthday(){
    if(Device.iOS){
      this.setState({dateShow: true})
    }else{
      DatePickerAndroid.open({
          date: this.state.date,
          maxDate: new Date()
      })
      .then((result) => {
          this.state.cust.birthday = result.year ? (result.year + '-' + (result.month+1) + '-' + result.day) : '';
          this.setState({dateShow: false})
      });
    }
  }
  _dateClear(){
    this.state.cust.birthday = '';
    this.setState({dateShow: false})
  }
  _dateSure(){
    this.state.cust.birthday = Utils.moment(this.state.date).format('YYYY-MM-DD') ;
    this.setState({dateShow: false})
  }
  _onTouchUp(){
    this.setState({sexSwitch:false})
  }
  _save(){
    setTimeout(()=>{
      this.setState({
        nameErr: false,
        tel1Err: false,
        pidErr: false
      })
    },2000)
    let params = {cust: this.state.cust}
    if( !params.cust.name){
      // this.setState({nameErr: true})
       Utils.showMsg('','请输入客户姓名')
    }else if(params.cust.name.length < 2 || !Utils.regexp.isMate( params.cust.name, 'isName' )){
       Utils.showMsg('','请输入两位以上中文／英文')
    }else if( !params.cust.tel1){
       Utils.showMsg('','请输入客户手机号')
    }else if(!Utils.regexp.isMate( params.cust.tel1, 'phone')){
       Utils.showMsg('','请输入11位正确手机号')
    }else if( params.cust.ptype && !params.cust.pid){
       Utils.showMsg('','请输入证件号')
    }else if( params.cust.ptype == '0' &&  !Utils.regexp.isCarid(params.cust.pid) ){
       Utils.showMsg('','请输入正确的身份证号')
    }else {
    Utils.fetch(Utils.api.add, 'post', params )
    .then((res)=>{
      if(res){
        if(!this.state.backNow){
          Actions.pop();
        }
        this.state.data.customer.customer_name = res.name;
        this.state.data.customer.customer_id = res.id;
        this.state.data.customer.customer_sex = this.state.custUi.sex;
        this.state.data.customer.customer_tel = res.tel1;
        Actions.pop({refresh : {data: this.state.data}})
      }
    })
    return null;
  }}

  _textDidChanged(ref, text) {
    let ObjTemp = {};
    this.state.cust[ref] = text;
    if (text && text.length > 0) {
      ObjTemp[ref] = true
    }else {
      ObjTemp[ref] = false
    }
    this.setState(ObjTemp)
  }
  _clear(ref) {
    this._textDidChanged(ref, '');
  }
  _scrollView(){
    let that = this;
    return (
      <ScrollView keyboardShouldPersistTaps={true} style={{flex: 1}}>
        <View style={{backgroundColor: '#fff'}}>
          <Box
            left={'姓名'}
            inputBox={{
              placeholder:"输入客户姓名",
              ref:"name",
              onChangeText: this._textDidChanged.bind(that,"name"),
            }}
            important={true}
            iconPress={this._clear.bind(this,"name")}
            hasIcon={this.state.name}
          />
          <TouchableOpacity onPress={this._sexSwitch.bind(this)}>
            <Box left={'性别'} right={this.state.custUi.sex ? this.state.custUi.sex : '选择性别'} changeAble={true}/>
          </TouchableOpacity>
          <Box
            left={'手机号'}
            inputBox={{
              placeholder:"输入手机号",
              ref:"tel1",
              onChangeText: this._textDidChanged.bind(that,"tel1"),
            }}
            important={true}
            iconPress={this._clear.bind(this,"tel1")}
            hasIcon={this.state.tel1}
          />
          <Box
            left={'座机'}
            inputBox={{
              placeholder:"输入座机号",
              ref:"tel2",
              onChangeText: this._textDidChanged.bind(that,"tel2"),
            }}
            iconPress={this._clear.bind(this,"tel2")}
            hasIcon={this.state.tel2}
          />
          <TouchableOpacity onPress={this._certificate.bind(this)}>
            <Box left={'证件类型'} right={this.state.cust.ptype ? this.state.custUi.ptype : '选择证件类别'} changeAble={true}/>
          </TouchableOpacity>
          {this.state.cust.ptype ?
            <Box
              left={'证件号码'}
              inputBox={{
                placeholder:"输入证件号",
                ref:"pid",
                onChangeText: this._textDidChanged.bind(that,"pid"),
              }}
              iconPress={this._clear.bind(this,"pid")}
              important={true}
              hasIcon={this.state.pid}
            />
            : <View></View>
          }
          <TouchableOpacity onPress={this._addressDetail.bind(this)}>
            <Box left={'地址'} right={this.state.cust.address ? this.state.cust.address : '输入地址'} changeAble={true}/>
          </TouchableOpacity>
          <Box
            left={'邮编'}
            inputBox={{
              placeholder:"输入邮编号",
              ref:"postcode",
              onChangeText: this._textDidChanged.bind(that,"postcode"),
            }}
            iconPress={this._clear.bind(this,"postcode")}
            hasIcon={this.state.postcode}
          />
          <Box
            left={'QQ'}
            inputBox={{
              placeholder:"输入QQ号",
              ref:"qq",
              onChangeText: this._textDidChanged.bind(that,"qq"),
            }}
            iconPress={this._clear.bind(this,"qq")}
            hasIcon={this.state.qq}
          />
          <Box
            left={'电子邮箱'}
            inputBox={{
              placeholder:"输入邮箱地址",
              ref:"email",
              onChangeText: this._textDidChanged.bind(that,"email"),
            }}
            iconPress={this._clear.bind(this,"email")}
            hasIcon={this.state.email}
          />
          <TouchableOpacity onPress={this._setBirthday.bind(this)}>
            <Box left={'生日'} right={this.state.cust.birthday ? this.state.cust.birthday : '选择日期'} changeAble={true}/>
          </TouchableOpacity>
          <Box left={'客户创建人'} right={this.state.cust.username} listLast={true}/>
        </View>
    </ScrollView>
    )
  }
  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={() => { Actions.pop() }} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title="增加客户" rightTitle="保存" rightPress={this._save.bind(this)}/>
        {Device.iOS ?
          <View style={{height: Device.height - this.state.aftKeyboardHeight - Utils.normalize(64), width: Device.width}}>{ this._scrollView() }</View>
          : <View style={{flex: 1}}>{ this._scrollView() }</View>
        }
      {this.state.dateShow && Device.iOS ?
        <View style={{width: Utils.width, position: 'absolute', bottom: Utils.normalize(Device.andrAPIBelow21 ? 20 : 0), backgroundColor: '#c9ccd3' }}>
          <View style={{backgroundColor:'#eff1f0',height: Utils.normalize(44),flexDirection: 'row', alignItems:'center'}}>
            <TouchableOpacity onPress={this._dateClear.bind(this)} style={{position: 'absolute',left: Utils.normalize(10), top: Utils.normalize(14)}}>
              <Text style={{color: '#017aff',fontWeight: 'bold',fontSize: Utils.normalize(16)}}>清除</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._dateSure.bind(this)} style={{position: 'absolute',right: Utils.normalize(10), top: Utils.normalize(14)}}>
              <Text style={{color: '#017aff',fontWeight: 'bold',fontSize:Utils.normalize(16)}}>完成</Text>
            </TouchableOpacity>
          </View>
          <DatePickerIOS mode="date" date={this.state.date} maximumDate={new Date()} onDateChange={this._onDateChange.bind(this)}/>
        </View>
        : <View></View>
      }

      {
        this.state.sexSwitch&&Device.iOS?
        <View style={localStyle.overlay}>
          <View style={localStyle.sexSet}>
            <View style={{height: Utils.normalize(110), borderRadius: Utils.normalize(10), backgroundColor: '#fff',overflow: 'hidden'}}>
            {
              this.state.sex && this.state.sex.map((item,key)=> {
                return (
                  <View key={key}>
                    <TouchableOpacity style={{height: Utils.normalize(55),borderRadius: Utils.normalize(10),backgroundColor:'rgba(0,0,0,0)', justifyContent: 'center',paddingLeft: Utils.normalize(20),borderColor: '#ccc'}} onPress={this._sexPress.bind(this,item)}>
                      <View style={styles.row}>
                        <Text style={{fontSize: Utils.normalize(18)}}>{item.nm}</Text>
                        {
                          this.state.cust.sex == item.vl ? <Icon style={localStyle.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null
                        }
                      </View>
                    </TouchableOpacity>
                    <View style={{height: (key <= this.state.sex.length) ? Utils.normalize(1) : 0, backgroundColor: '#ccc'}}>
                    </View>
                  </View>
                )
              })
            }
            </View>
            <TouchableOpacity onPress={this._quitSex.bind(this)} style={{borderRadius: Utils.normalize(10), backgroundColor: '#fff', height: Utils.normalize(55), marginTop: Utils.normalize(10),justifyContent: 'center'}}>
              <Text style={{color: '#fe3a2e', fontSize: Utils.normalize(18), fontWeight: 'bold',textAlign: 'center'}}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
        : <View></View>
      }
      {
        this.state.sexSwitch&&!Device.iOS?
          <View onStartShouldSetResponder={() => this._onTouchUp()} style={[localStyle.overlay,{ justifyContent:'center',alignItems:'center'}]}>
            <View style={localStyle.androidSexSet}>
              <View style={[styles.androidSelectText]}>
                <Text style={{fontSize: Utils.normalize(18), fontWeight: 'bold'}}>修改性别</Text>
              </View>
              <View style={{height: Utils.normalize(110),backgroundColor: '#fff',overflow: 'hidden'}}>
                {
                  this.state.sex && this.state.sex.map((item,key)=> {
                    return (
                      <View key={key}>
                        <TouchableOpacity style={{height: Utils.normalize(55),backgroundColor:'rgba(0,0,0,0)', justifyContent: 'center',paddingLeft: Utils.normalize(20),borderColor: '#ccc'}} onPress={this._sexPress.bind(this,item)}>
                          <View style={styles.row}>
                            <Text style={{fontSize: Utils.normalize(18)}}>{item.nm}</Text>
                            {
                              this.state.cust.sex == item.vl ? <Icon style={localStyle.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null
                            }
                          </View>
                        </TouchableOpacity>
                        <View style={{height: (key <= this.state.sex.length) ? Utils.normalize(1) : 0, backgroundColor: '#ccc'}}>
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
    </View>
    )
  }
}

const localStyle = StyleSheet.create({
  selectRight: {
    position: 'absolute',
    right: 30,
    top: 0
  },
  input:{
    borderWidth: 0,
    height: Utils.normalize(40),
    fontSize: Utils.normalize(16),
  },
  item: {
    flex: 1,
    marginRight: Utils.normalize(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  itemText: {
    color: '#999'
  },
  sexSet: {
    position: 'absolute',
    bottom: Utils.normalize(Device.andrAPIBelow21 ? 30 : 10),
    width: Utils.width - 16,
    marginLeft: 8,
    height: Utils.normalize(175),
  },
  androidSexSet: {
    width: Utils.width - 16,
    height: Utils.normalize(175),
  },
  overlay:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: Utils.height,
    width: Utils.width,
    flex: 1,
  },
  fullSonButtonGroup:{
    marginLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: Utils.normalize(15),
  },
  inputBox: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#387ff5',
    height: Utils.normalize(34),
    marginRight: Utils.normalize(15)
  }
})

export default AddCustomer;
