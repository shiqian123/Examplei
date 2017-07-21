
'use strict'

import React, { Component } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  Image,
  StatusBar,
  StyleSheet,
  Alert,
  Animated,
  DatePickerIOS,
  ScrollView,
} from 'react-native';

import styles from '../common/styles';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import lodash from 'lodash';
import {Utils, Device, Assets,_} from "../base";
import {Header, Loading, Button, Developing, Tip, Box} from '../components';
import DatePicker from 'react-native-datepicker';

let that;
export default class changeBoutique extends Component{
  constructor(props){
    super(props);
    this.state = {
      data:'',
      date: new Date(),
      showDate:false,
      isChangeParam:false,
      allParam:[],
      param_value:'',
      new_id:'',
      tip:false,
      name:'',//错误提示信息
      isLoading:false
    }
  }
  componentDidMount(){
    this.setState({data:this.props.data})
  }
  componentWillMount(){
    that = this;
  }
  componentWillReceiveProps(nextProps){

    if (nextProps.remark_flag === 1){
    this.state.data.des = nextProps.des;
    }
    if(nextProps.from=='bouName'){
     let _tempData = _.cloneDeep(this.state.data)
     _tempData.big_class = nextProps.data.big_class;
     _tempData.product_name = nextProps.data.org_name;
     _tempData.product_id = nextProps.data.id;
     //_tempData.num = nextProps.data.stock_num;
     //_tempData.cost =  nextProps.data.cost_default;
     _tempData.param_name = nextProps.data.param_name;
     _tempData.param_value ='';
     _tempData.comp_id = nextProps.data.comp_id;
     this.setState({
       allParam:nextProps.data.param_range==null?[]:nextProps.data.param_range,data:_tempData
     })
     this.setState({isChangeParam:true})
   }else{
        this.setState({isChangeParam:false})
   }
   if(nextProps.from =='selectBouParams'){
      let _tempData = _.cloneDeep(this.state.data);
      _tempData.param_value=nextProps.item;
      this.setState({
         data:_tempData
      })
   }
  }
  _textDidChanged(ref, text){
    let ObjTemp = {};
    // this.state.cust[ref] = text;
    let _tempData = lodash.cloneDeep(this.state.data);
    _tempData[ref] = text;
    if (text && text.length > 0) {
      ObjTemp[ref] = true
    }else {
      ObjTemp[ref] = false
    }
    this.setState(ObjTemp)
    this.setState({
       data:_tempData
    })
  }
  _clear(ref) {
    this._textDidChanged(ref, '');
  }
  _nameSwitch(){
    Actions.changeBouName({data:this.state.data})
  }
  _selectParams(){
    if(this.state.allParam.length){
        Actions.selectBouParams({data:this.state.allParam,selected: this.state.data.param_value})
    }
  }
  _showDate(){
     if(Device.iOS){
        this.setState({showDate:!this.state.showDate})
     }else{
      this.refs._datePicker.onPressDate();
     }
    }
  _onDateChange(date){
    if(Device.iOS){
        this.setState({date:date})
        this.state.data.entertime=Utils.moment(date).format('YYYY-MM-DD HH:mm:ss')
    }else if(Device.isAndroid){
      let _data  = this.state.data;
      _data.entertime = date;
      this.setState({
        data:_data
      })
    }
  }
  _editDes(){
    Actions.textarea({
        title:"备注",
        des:this.state.data.des,
        save:true,
        _save: this._save.bind(this)
    });
  }
  _save(des){
    that.state.data.des = des;
    that.setState({des: des});
    Actions.pop({refresh: {message: 'des changed'}});
  }
  _timeReset(){

  }
  _timeConfirm(){

  }
  _confirm(){
    let that = this;
    this.setState({
      isLoading:true
    })
    setTimeout(function () {
      if(that.state.tip=='error'){
        that.setState({
          tip:'',
          isLoading:false
        })
      }
    }, 1000);
    if (this.state.data.num &&  Number(this.state.data.num) < 1 ) {
      this.setState({tip:'error',name:'数量不可小于1'});
      return ;
    }
    if (this.state.data.num &&  (this.state.data.num.indexOf('.') > -1 )) {
      this.setState({tip:'error',name:'数量必须为整数'});
      return ;
    }
    if( this.state.data.num &&  isNaN(Number(this.state.data.num))){
      this.setState({tip:'error',name:'请填写数字'});
      return
    };
    if(this.state.data.num==null||this.state.data.num==''){
      this.setState({tip:'error',name:'请填写数量'})
      return
    }
    if(this.state.data.cost==null||this.state.data.cost==''&&this.props.ops.cost==1){
      this.setState({tip:'error',name:'请填写成本价'})
      return
    }
    if(this.state.data.cost && isNaN(Number(this.state.data.cost))&&this.props.ops.cost==1){
      this.setState({tip:'error',name:'请填写数字'})
      return
    }
    if(this.state.data.cost && Number(this.state.data.cost)<0&&this.props.ops.cost==1){
      this.setState({tip:'error',name:'成本价不能小于0'})
      return
    }
    if((this.state.allParam.length>0)&&this.state.isChangeParam){
      this.setState({tip:'error',name:'请选择产品细分'})
      return
    }
    let params ={
    id:this.state.data.id,
    warehouse_id:this.state.data.warehouse_id,
    num:this.state.data.num,
    cost:this.state.data.cost,
    productport:this.state.data.productport==null?'':this.state.data.productport,
    entertime:this.state.data.entertime,
    pid:this.state.data.product_id,
    pnm:this.state.data.product_name,
   }
    if(this.state.data.param_name!=null){
      params.pmnm=this.state.data.param_name;
      params.pmvl=this.state.data.param_value;
    }
    if(this.state.data.des!=null){
    params.des=this.state.data.des;
    }
    Utils.fetch(Utils.api.change, 'post', params)
      .then((res) => {
        this.setState({tip:'error',name:'变更成功'})
        let that = this
        res.comp_id = this.state.data.comp_id;
        setTimeout(function () {
          that.setState({tip:''})
          Actions.pop({refresh:{data:res}})
        }, 1000);
      })
  }
  render(){
    return (
    <View style={styles.container}>
      <Header leftPress={()=>Actions.pop()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}}
      title="精品变更"
      rightTitle="确认"
      rightPress={()=>this._confirm()}
      />
    <ScrollView  keyboardShouldPersistTaps={true}>
      <View style={{backgroundColor:'#fff'}}>
        <Box left="仓库" right={this.state.data.warehouse_name}/>
        <Box left="库位"
          inputBox={{
            placeholder:"输入库位",
            ref:"productport",
            onChangeText: this._textDidChanged.bind(that,"productport"),
            value: this.state.data.productport
          }}
          iconPress={this._clear.bind(this,"productport")}
          hasIcon={this.state.productport}
        />
        <TouchableOpacity onPress={this._nameSwitch.bind(this)}>
          <Box left="产品名称" right={this.state.data.product_name} changeAble={true}/>
        </TouchableOpacity>
        <Box left="类别" right={this.state.data.big_class}/>

        <View style={buotique_styles.box}>
         <View style={{width:102,flexDirection: 'row',}}>
           <Text style={[ {marginLeft: 0,fontSize:Utils.normalize(16)} ]}>产品细分</Text>
         </View>
         {this.state.allParam.length>0&&(this.state.data.param_value!=''||this.state.data.param_value!=null)?
            <View  style={{flex:1,flexDirection: 'row',marginTop:-4} }>
            <Text style={buotique_styles.xiFen}>{this.state.data.param_value}</Text>
           </View>:
            <View  style={{flex:1,flexDirection: 'row',marginTop:-4}}>
              <Text style={buotique_styles.xiFen}>{this.state.data.param_name==null?'未定义细分参数':this.state.data.param_value}</Text>
            </View>
          }
          {this.state.allParam.length>0&&(this.state.data.param_value==''||this.state.data.param_value==null)?
           <View style={{flex:1,flexDirection:'row'}}>
             <View  style={{flex:1,flexDirection: 'row',marginTop:-4,justifyContent:'flex-end',paddingRight:Utils.normalize(12),paddingTop:Utils.normalize(7)} }>
               <Text style={buotique_styles.xiFen}>{this.state.data.param_value==''||this.state.data.param_value==null?'选择参数':null}</Text>
             </View>
            <View>
              {(this.state.data.param_value==''||this.state.data.param_value==null)?<Icon style={{marginRight:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>:null}
            </View>
           </View>

            :
            null
           }
         {(this.state.data.param_value==''||this.state.data.param_value==null)?null:<Icon style={{marginRight:Utils.normalize(11)}} color='#bbbbbb' name='ios-arrow-forward' size={23}/>}
        </View>

        <Box left="数量"
          inputBox={{
            placeholder:"输入数量",
            ref:"num",
            onChangeText: this._textDidChanged.bind(that,"num"),
            value: this.state.data.num
          }}
          price={true}
          important={true}
          iconPress={this._clear.bind(this,"num")}
          hasIcon={this.state.num}
        />


        {this.props.ops.cost==1?
          <Box left="成本价"
            inputBox={{
              placeholder:"输入成本价",
              ref:"cost",
              onChangeText: this._textDidChanged.bind(that,"cost"),
              value: this.state.data.cost
            }}
            price={true}
            important={true}
            iconPress={this._clear.bind(this,"cost")}
            hasIcon={this.state.cost}
          />
        :null}

        <TouchableOpacity onPress={this._showDate.bind(this)}>
          <Box left="入库时间" important={true} right={this.state.data.entertime} changeAble={true} listLast={true}/>
        </TouchableOpacity>

        {this.state.showDate && Device.iOS ?
          <View>
          <DatePickerIOS mode="datetime" date={this.state.date} maximumDate={new Date()}  onDateChange={(date) => this._onDateChange(date)}/>
          </View>
        :null}

        {!Device.iOS?<DatePicker
          ref='_datePicker'
          style={{width: 0}}
          date={this.state.date}
          mode="datetime"
          showIcon={false}
          placeholder="select"
          format="YYYY-MM-DD HH:mm:ss"
          minDate="1990-01-01"
          maxDate={new Date()}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
         onDateChange={(date) => this._onDateChange(date)}
        />:null}
      </View>

      <View style={{backgroundColor:'#fff',marginTop:12}}>
        <TouchableOpacity onPress={this._editDes.bind(this)}>
          <Box left="备注" right={this.state.data.des==null?'添加备注':this.state.data.des} changeAble={true} listLast={true}/>
        </TouchableOpacity>
      </View>
    </ScrollView>
    {
      this.state.tip=='error' ?
        <Tip type='miss_tips' name={this.state.name}></Tip>
        : null
    }
    {this.state.isLoading?<Loading></Loading>:null}
    </View>
    )
  }
}
const buotique_styles = StyleSheet.create({
  box:{
    height:Utils.normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth:0.5,
    borderBottomColor:'#ccc',
    marginLeft: 14,
    paddingRight: 15
  },
  input:{
    borderWidth: 0,
    height: Utils.normalize(40),
    fontSize: Utils.normalize(16),
  },
  inputBox: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#387ff5',
    height: Utils.normalize(34),
    marginRight: Utils.normalize(15)
  },
  xiFen: {
    fontSize:Utils.normalize(16),
    color: '#bbb',
    textAlign: 'right',
    flex: 1
  }
})
