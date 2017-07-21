
'use-strict'
import React ,{Component} from 'react';
import {
  TouchableHighlight,
  StatusBar,
  View,
  Image,
  Text,
  StyleSheet,
  ListView,
  AppState
} from 'react-native';
// socket io
import './UserAgent';

import styles from '../common/styles';
import {Utils,Assets, Device,_} from "../base";
import {Loading} from '../components';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons';
import {Actions} from 'react-native-router-flux';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';

 let _params ='';
let isMounted = false;
export default class HomePage extends Component {
  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      dataSource: dataSource.cloneWithRows([]),
      isLoading:false,
      currentAppState: AppState.currentState,
      umengToken:''
    }
  }

  m_setState(obj) {
    if(isMounted) {
      this.setState(obj);
    }
  }
  _jumpPage(rowData) {
    if (rowData.component) {
      Actions[rowData.component]()
    } else {
      Utils.showMsg('公告', '正在开发')
    }
  }

  componentDidMount() {
    isMounted = true;
    AppState.addEventListener('change',  this.handleAppStateChange.bind(this));
    storage.load({
      key: "User"
    }).then(res => {
      this._getLoad(res.menu);
    });
  }
  componentWillUnmount() {
    AppState.removeEventListener('change',  this.handleAppStateChange.bind(this));
  }
  handleAppStateChange(currentAppState) {
    this.m_setState({ currentAppState, });
    if(this.state.currentAppState=='background'){
      console.log('后台')
      socket.emit('backRun')
    }else{
      console.log('前台')
      socket.emit('running')
    }
  }
  _storage = function () {

  }
  _getLoad(menu){
    this.m_setState({isLoading:true});
    Utils.fetch(Utils.api.load,'post',{keys:'create_cart'}).then(
      (res1)=>{
        if(!res1['create_cart']){
          _.forEach(menu,(d,k)=>{
            if(d.component=='chooseNewCar'){
              menu.splice(k,1)
            }
          });
          this._addEmptyBox(menu);
        }else{
          this._addEmptyBox(menu);
        }
        this.m_setState({isLoading:false});
      }
    )
  }
  _addEmptyBox(menu){
    // menu.push({code:"select",component:'userIndex',icon:'user',name:"客户管理"})
    let menuObj = {
      code : '',
      component : '',
      icon : '',
      name : ''
    };
    if(menu.length % 3 === 1) {
      menu.push(menuObj,menuObj);
    }
    if(menu.length % 3 === 2){
      menu.push(menuObj);
    }
    this.m_setState({
      dataSource: this.state.dataSource.cloneWithRows(menu)
    });
  }
  _renderRow(rowData, sectionID, rowID){
    return(
      rowData.name != '' ?
        <TouchableHighlight underlayColor='#efefef' onPress={()=>this._jumpPage(rowData)} style={[styles_home.item,{borderRightWidth:rowID%3 != 2 ? 0.5 : 0}]}>
          <View style={{alignItems: 'center',}}>
            <Image style={{width:Utils.normalize(30),height:Utils.normalize(30),marginTop:Utils.normalize(30)}} source={Assets[rowData.icon]} />
            <Text style={{marginTop:Utils.normalize(15)}}>{rowData.name}</Text>
          </View>
        </TouchableHighlight>
        :
        <View style={[styles_home.item,{borderRightWidth:rowID%3 != 2 ? 0.5 : 0}]}></View>
    )
  }
  render(){
    return(
      <View style={[styles.container,{backgroundColor: '#FFF'}]}>
        <StatusBar backgroundColor={Device.iOS ? '#4987EF' : 'rgba(0,0,0,0.05)'} translucent={true} animated={true} barStyle="light-content" />
        <Swiper showsPagination={true} loop={true} horizontal={true} width={Utils.width} autoplayTimeout={5} showButtons={true} autoplay={true} height={Utils.normalize(204)}>
          <View style={styles_home.slide}>
            <Image style={styles_home.image} source={Assets.homeSlide3} />
          </View>
        </Swiper>
        <ListView
          contentContainerStyle={styles_home.square}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)}
          enableEmptySections = {true}
        />
        {this.state.isLoading ? <Loading top="hide"></Loading>:null}
      </View>
    )
  }
}

const styles_home = StyleSheet.create({
  wrapper: {
    width: Utils.width,
    height: Utils.normalize(100),
    backgroundColor: '#fff'
  },
  slide: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  image: {
    flex: 1,
    width: Utils.width,
    //resizeMode:'stretch'
  },
  square: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: Utils.width / 3,
    height: Utils.width / 3,
    //justifyContent:'space-around',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    alignItems: 'center',
  }
})
