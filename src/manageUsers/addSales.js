/**
* @Author: shiqian
* @Date:   2016-10-12T14:29:28+08:00
* @Email:  15611555640@163.com
* @Last modified by:   shiqian
* @Last modified time: 2016-10-15T14:41:19+08:00
*/

/**
 * Created by shiqian on 16/9/1.
 */
import React, { Component } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  ListView,
  RefreshControl,
  Modal,
  View,
  StyleSheet,
  Image,
  TextInput,
  Text,
  Animated
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import styles from '../common/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Box,Button,ItemCheckbox} from '../components';
import InsideSearch from './insideSearch';

let _select = [],initRes= [],isSearch = false;
class AddSalses extends Component{
  // 构造
  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });
    // 初始状态
    this.state = {
      dataSource,
      loading:false,
      count:0,
      initRes:[]
    };
  }
  componentDidMount(){
   this._onRefresh()
  }
  componentWillUnmount(){
    isSearch = false
  }
  _onRefresh(){
    this.setState({loading:true})
    Utils.fetch(Utils.api.querySales,'POST').then((res) => {
      _res = res.emps.map((item) => {
        item.selected = false;
        _.forEach(this.props.sales,(_item,i)=>{
          if(_item.name == item.name){
           item.selected = true;
          }
        })
        return item
      })

      this.setState({initRes:_res})
      this.setState({dataSource:this.state.dataSource.cloneWithRows(_res),count:res.count,loading:false,ops:res.ops})
    })
  }
  _onScroll(){

  }
  onCheck(rowData){
    if(rowData.selected){
      rowData.selected =false
    }else{
        rowData.selected = true
    }
    if(isSearch){
      _.forEach(_select,(d,i)=>{
        if(d.id==rowData.id){
          d.selected = rowData.selected
        }
      })
      var _res = _.cloneDeep(_select)
      this.setState({dataSource:this.state.dataSource.cloneWithRows(_res),loading:false})
    }else{
      _.forEach(this.state.initRes,(d,i)=>{
        if(d.id==rowData.id){
          d.selected = rowData.selected
        }
      })
      var _res = _.cloneDeep(this.state.initRes)
      this.setState({dataSource:this.state.dataSource.cloneWithRows(_res),loading:false})
    }

  }
  _change(text){
    if(text==''){
        isSearch = false;
      this.setState({dataSource:this.state.dataSource.cloneWithRows(this.state.initRes),loading:false})
      return
    }
    _select=[]
    _.forEach(this.state.initRes,(item,i)=>{
      if(text!=''&&item.name.indexOf(text)>-1){
        _select.push(item)
      }
    })
    isSearch = true;
    this.setState({dataSource:this.state.dataSource.cloneWithRows(_select),loading:false})
  }
  _goBack(){
    let data = [];
    _.forEach(this.state.initRes,(d,i)=>{
      if(d.selected){
        data.push(d)
      }
    })
     Actions.pop({refresh:{sales:data}})
  }
  _renderRow(rowData,selec,rowID){
    return(
      <TouchableOpacity onPress={()=>this.onCheck(rowData)} underlayColor={'#f2f2f2'}  style={{backgroundColor:'#fff'}}>
          <View style={[styles.fullSonButtonGroup,{marginLeft: 16}]}>
            <View style={{flexDirection:'row'}}>
              <View  style={[s_styles.circle,rowData.selected?{backgroundColor:'#387ff5',borderColor:'#387ff5'}:{}]} >
                <View style={{justifyContent:'center',alignItems:'center',paddingTop:1}} >
                    {rowData.selected?  <Icon name='check' style={{color:'#fff'}}></Icon>:<Text></Text>}
                </View>
              </View>
                <Text style={{width:120}}> {rowData.name}
                </Text>
                <Text style={[styles.fullSonButtonText]}> {rowData.org_name}
                </Text>
            </View>
          </View>
      </TouchableOpacity>
    )
  }
  render(){
    let params = this.props.data
    return(
      <View  style={[styles.container]}>
        <Header  rightPress={()=>this._goBack()} rightTitle="保存" title="选择销售顾问" leftPress={()=>{Actions.pop()}} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}}/>
        <InsideSearch _onChange={(text)=>this._change(text)} placeholder="已销售顾问姓名搜索"/>
        <ListView
          ref="_listView"
          scrollEnabled={this.state.scrollEnabled}
          style={{height:Device.height,backgroundColor:'#fff'}}
          dataSource={this.state.dataSource}
          renderRow={(rowData, sectionID, rowID)=>this._renderRow(rowData, sectionID, rowID)}
          enableEmptySections = {true}
          onScroll={this._onScroll.bind(this)}
          removeClippedSubviews={true}
          scrollEventThrottle={0}
          pageSize={20}
          renderFooter={()=>{
            return(
            <View>
              {(this.state.dataSource._dataBlob!=null&&this.state.dataSource._dataBlob.s1.length==0)?
                <View style={{height: 30,justifyContent: 'center'}}>
                  <Text style={{textAlign: 'center',color:'#aaa'}}>--没有更多客户--</Text></View>
                : <View></View>
              }
            </View>
            )
          }}
        />
        {this.state.loading?<Loading></Loading>:null}
      </View>
    )
  }
}
const s_styles =StyleSheet.create({
  container:{
    width:60,
    height:60,
    position:'relative',
    bottom:Utils.normalize(80),
    left:Utils.normalize(24),
    backgroundColor:'transparent'
  },
  circle:{
    width:17,
    height:17,
    borderRadius:17/2,
    backgroundColor:'#fff',
    borderColor:'#999',
    borderWidth:1,
    overflow:'hidden'
  },
  number:{
    position:'absolute',
    top:Utils.normalize(8),
    right:Utils.normalize(14),
    color:'#fff'

  }
})
export default AddSalses
