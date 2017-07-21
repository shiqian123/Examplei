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
import {Utils,Device,_} from "../base";
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import {Header,Loading} from '../components'
import Storage from 'react-native-storage'

import {Tip} from  "../components";

let salesString = '',salesId = []

class AddUser extends Component{
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
      loading:false,
      cust: {
        sex: '',
      },
      custUi: {
        sex: '',
      },
      userId:'',
      defineName:'',
      userName:'',
      sales:[],
      isGetSale:'',
      aftKeyboardHeight: 0
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
      this.setState({userId:res.me_id,defineName:res.username,userName:res.username})
    })
    if(this.props.types == 'CHANGE'){
      let item = this.props.item;
      item.onFocus = item.email;
      Utils.fetch(Utils.api.getSale,'post',{cust_id:this.props.item.id,create_id:this.state.userId}).then((res)=>{
        if(res.list!=0){
           _.forEach(res.list,(item,i)=>{
             salesId.push(item.id)
             salesString += item.name +','
           })
        }
        this.setState({userName:item.creater_name,cust:item,custUi:{sex:item.sex==1?"男":"女",ptype:item.ptype_name},sales:res.list,isGetSale:true})
      })
    }
    Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }
  componentWillReceiveProps(nextPage){
    if(nextPage.cust){
      this.setState({cust: nextPage.cust, custUi: nextPage.custUi})
    }
    if(nextPage.sales){
      this.setState({sales:nextPage.sales,isGetSale:false})
      salesId = [];

      if(nextPage.sales.length!=0){
         _.forEach(nextPage.sales,(item,i)=>{
           salesId.push(item.id)
           salesString += item.name +','
         })
      }
    }

  }
  componentWillUnmount(){
    salesString = [];salesId=[];

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
        params.sale = salesId;
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
      if(this.props.types=='CHANGE'){
        for (var i in params.cust) {
          if ( params.cust[i]==null) {
           params.cust[i] = '';
          }
        }
        this.setState({loading:true})
        Utils.fetch(Utils.api.updateUser, 'post', params )
        .then((res)=>{
          this.setState({loading:false})
          if(res){
            params.sale = this.state.sales;
            if(params.sale.length==0){
              params.sale.push({id:this.state.userId,name:this.state.defineName})
            }
            Actions.pop({refresh : {data: params}})
          }
        })
      }else{
          this.setState({loading:true})
        Utils.fetch(Utils.api.add, 'post', params )
        .then((res)=>{
          this.setState({loading:false})
          if(res){
              this.setState({loading:false})
            // this.state.data.customer.customer_name = res.name;
            // this.state.data.customer.customer_id = res.id;
            // this.state.data.customer.customer_sex = this.state.custUi.sex;
            // this.state.data.customer.customer_tel = res.tel1;
            Actions.pop({refresh : {data: params}})
          }
        })
      }
    return null;
  }}

  _textDidChanged(ref, text) {
    let ObjTemp = {};
    this.state.cust[ref] = text;
    if (text && text.length > 0 && this.refs[ref].isFocused()) {
      ObjTemp[ref] = true
    }else {
      ObjTemp[ref] = false
    }
    this.setState(ObjTemp)
  }
  _clear(ref) {
    this._textDidChanged(ref, '');
    this.refs[ref].clear();
  }
  _addSales(){
    salesString = '';
    if(this.state.sales.length==0){
      Actions.addSales({sales:this.state.sales})
    }else{
      // if(this.props.types=='CHANGE'&&this.state.isGetSale){
      //   this._getSales()
      // }else{
        Actions.alreadySalesList({sales:this.state.sales,canEdit:true})
      // }
    }
  }
  _getSales(){
    Utils.fetch(Utils.api.getSale,'post',{cust_id:this.props.item.id,create_id:this.state.userId}).then((res)=>{
      Actions.alreadySalesList({sales:res.list,canEdit:true})
    })
  }
  _scrollView(){

    return (
      <ScrollView keyboardShouldPersistTaps={true}>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>姓名</Text>
              <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text>
            </View>
            <View style={localStyle.inputBox}>
              <TextInput
                underlineColorAndroid="transparent"
                ref="name"
                onChangeText={this._textDidChanged.bind(this, "name")}
                placeholder="输入客户姓名"
                defaultValue={this.state.cust.name!=''?this.state.cust.name:''}
                placeholderTextColor='#ccc'
                onBlur={() => this.setState({name: false})}
                onFocus={() => this.setState({name: this.state.cust.name ? true : false})}
                style={localStyle.input} />
              {this.state.name ? <Icon onPress={() => {this._clear("name")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>性别</Text>
            </View>
            <TouchableOpacity style={localStyle.item} onPress={this._sexSwitch.bind(this)}>
              <Text style={localStyle.itemText}>{this.state.custUi.sex ? this.state.custUi.sex : '选择性别'}</Text>
              <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>手机号</Text>
              <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text>
            </View>
            <View style={localStyle.inputBox}>
              <TextInput
                underlineColorAndroid="transparent"
                placeholder="输入手机号"
                placeholderTextColor='#ccc'
                ref="tel1"
                defaultValue={this.state.cust.tel1!=''?this.state.cust.tel1:''}
                style={localStyle.input}
                onChangeText={this._textDidChanged.bind(this, "tel1")}
                onFocus={() => this.setState({tel1: this.state.cust.tel1 ? true : false})}
                onBlur={() => this.setState({tel1: false})} />
              {this.state.tel1 ? <Icon onPress={() => {this._clear("tel1")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>座机</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <View style={localStyle.inputBox}>
              <TextInput
                underlineColorAndroid="transparent"
                placeholder="输入座机号"
                placeholderTextColor='#ccc'
                ref="tel2"
                defaultValue={this.state.cust.tel2!=''?this.state.cust.tel2:''}
                style={localStyle.input}
                onChangeText={this._textDidChanged.bind(this, "tel2")}
                onFocus={() => this.setState({tel2: this.state.cust.tel2 ? true : false})}
                onBlur={() => this.setState({tel2: false})} />
              {this.state.tel2 ? <Icon onPress={() => {this._clear("tel2")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>证件类型</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <TouchableOpacity style={localStyle.item} onPress={this._certificate.bind(this)}>
              <Text style={localStyle.itemText}>{this.state.cust.ptype ? this.state.custUi.ptype : '选择证件类别'}</Text>
              <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
            </TouchableOpacity>
          </View>
        </View>
        {this.state.cust.ptype ?
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
              <View style={{width: 102, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>证件号码</Text>
                <Text style={{color:'#ff3a2b',marginLeft: Utils.normalize(5),fontWeight: 'bold'}}>*</Text>
              </View>
              <View style={localStyle.inputBox}>
                <TextInput
                  underlineColorAndroid="transparent"
                  placeholder="输入证件号"
                  placeholderTextColor='#ccc'
                  ref="pid"
                  defaultValue={this.state.cust.pid!=''?this.state.cust.pid:''}
                  style={localStyle.input}
                  onChangeText={this._textDidChanged.bind(this, "pid")}
                  onFocus={() => this.setState({pid: this.state.cust.pid ? true : false})}
                  onBlur={() => this.setState({pid: false})} />
                {this.state.pid ? <Icon onPress={() => {this._clear("pid")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
              </View>
            </View>
          </View>
          : <View></View>
        }
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>地址</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <TouchableOpacity onPress={this._addressDetail.bind(this)} style={localStyle.item}>
              <Text style={localStyle.itemText}>{this.state.cust.address ? this.state.cust.address : '输入地址'}</Text>
              <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>邮编</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <View style={localStyle.inputBox}>
              <TextInput
                underlineColorAndroid="transparent"
                placeholder="输入邮编号"
                placeholderTextColor='#ccc'
                ref="postcode"
                defaultValue={this.state.cust.postcode!=''?this.state.cust.postcode:''}
                style={localStyle.input}
                onChangeText={this._textDidChanged.bind(this, "postcode")}
                onFocus={() => this.setState({postcode: this.state.cust.postcode ? true : false})}
                onBlur={() => this.setState({postcode: false})} />
              {this.state.postcode ? <Icon onPress={() => {this._clear("postcode")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>QQ</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <View style={localStyle.inputBox}>
              <TextInput
                underlineColorAndroid="transparent"
                placeholder="输入QQ号"
                placeholderTextColor='#ccc'
                ref="qq"
                defaultValue={this.state.cust.qq!=''?this.state.cust.qq:''}
                style={localStyle.input}
                onChangeText={this._textDidChanged.bind(this, "qq")}
                onFocus={() => this.setState({qq: this.state.cust.qq ? true : false})}
                onBlur={() => this.setState({qq: false})} />
              {this.state.qq ? <Icon onPress={() => {this._clear("qq")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>电子邮箱</Text>
            </View>
            <View style={localStyle.inputBox}>
              <TextInput
                underlineColorAndroid="transparent"
                placeholder="输入邮箱地址"
                placeholderTextColor='#ccc'
                ref="email"
                defaultValue={this.state.cust.onFocus!=''?this.state.cust.onFocus:''}
                style={localStyle.input}
                onChangeText={this._textDidChanged.bind(this, "email")}
                onFocus={() => this.setState({email: this.state.cust.onFocus ? true : false})}
                onBlur={() => this.setState({email: false})} />
              {this.state.email ? <Icon onPress={() => {this._clear("email")}} name='ios-close-circle' size={18} color='#999999' style={styles.serachCleanIcon} /> : null }
            </View>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>生日</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <TouchableOpacity onPress={this._setBirthday.bind(this)} style={localStyle.item}>
              <Text style={localStyle.itemText}>{this.state.cust.birthday ? this.state.cust.birthday : '选择日期'}</Text>
              <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{backgroundColor: '#fff'}}>
          <View style={[styles.fullSonButtonGroup,localStyle.fullSonButtonGroup]}>
            <View style={{width: 102, flexDirection: 'row'}}>
              <Text style={[ {marginLeft: 0} ]}>客户创建人</Text>
              <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
            </View>
            <View style={[localStyle.item,{justifyContent: 'flex-start'}]}>
              <Text style={{color:'#999'}}>{this.state.userName}</Text>
            </View>
          </View>
        </View>
        {this.props.ops.allot ?
          <View style={{backgroundColor: '#fff'}}>
            <View style={[styles.fullSonButtonGroup, localStyle.fullSonButtonGroup,{borderBottomWidth: 0}]}>
              <View style={{width: 116, flexDirection: 'row'}}>
                <Text style={[ {marginLeft: 0} ]}>所属销售顾问</Text>
                <Text style={[ {marginLeft: Utils.normalize(10)} ]}></Text>
              </View>
              <TouchableOpacity style={localStyle.item} onPress={this._addSales.bind(this)}>
                <Text numberOfLines={1} style={localStyle.itemText}>{salesString.length!=0 ? salesString : '选择'}</Text>
                <Icon style={{marginLeft:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>
              </TouchableOpacity>
            </View>
          </View>
          : <View></View>
        }
    </ScrollView>
    )
  }
  render(){
    return (
      <View style={styles.container}>
        <Header leftPress={() => { Actions.pop() }} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title={this.props.types=="ADD"?"增加客户":"修改客户"} rightTitle="保存" rightPress={this._save.bind(this)}/>
        {Device.iOS ?
          <View style={{height: Device.height - this.state.aftKeyboardHeight - Utils.normalize(64), width: Device.width}}>{ this._scrollView() }</View>
          : <View>{ this._scrollView() }</View>
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
      {this.state.loading?<Loading></Loading>:null}
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
      // flexDirection: 'row',
  },
  fullSonButtonGroup:{
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: Utils.normalize(15)
  },
  inputBox: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#387ff5',
    height: Utils.normalize(34),
    marginRight: Utils.normalize(15)
  }
})

export default AddUser;
