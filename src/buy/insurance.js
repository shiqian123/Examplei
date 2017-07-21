/**
* @Author: shiqian
* @Date:   2016-10-25T14:43:32+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T11:59:29+08:00
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
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device, _} from "../base";
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card,Button} from '../components';


//保险
class Insurance extends Component{
  // 构造
  constructor(props) {
    var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
    super(props);
    // 初始状态

    this.state = {
      dataSource:ds.cloneWithRows(this.props.dataSource),
      itemCount:'',
      backToTop:false,
      isRefreshing:false,
      ani: new Animated.Value(Utils.height),
      backToTop:false
    };
  }

  componentWillReceiveProps(next) {
    this.setState({dataSource:this.state.dataSource.cloneWithRows(next.dataSource)});
  }
  componentDidMount() {
    if(this.props.param.cartId!=''){
      Utils.fetch(Utils.api.get,'post',{id:this.props.param.cartId}).then(
        (res)=>{
          this.setState({itemCount:res.common['item_count']})
        }
      );
    }

  }
  _onScroll() {
    if (this.refs._listView.scrollProperties.offset > Utils.height) {
      this.setState({backToTop: true});
    }else{
      this.setState({backToTop: false});
    }
  }
  _IeDetail(msg,rowId){
    Actions.insuranceDetail({item:msg,param:this.props.param})
  }
  _renderRow(msg,sectionID,rowId){
    if(msg!='Ie'){
      return(
        <View>
          <TouchableOpacity onPress={()=>this._IeDetail(msg,rowId)}>
            <View style={[nc_styles.renderView]}>
              <View style={{ flexDirection: 'column',flex:6}}>
                <Text style={[nc_styles.label,{fontSize: Utils.normalize(15)}]} >{msg.name}</Text>
                <View style={[nc_styles.label,{flex:1,flexDirection: 'row'}]}>
                  <View style={{flex:1,flexDirection: 'row'}}>
                    <Text style={[nc_styles.grayColor,styles.f13]}>指导价:</Text>
                    <Text style={[nc_styles.redColor,styles.f13,{paddingLeft:12}]}>￥{Utils.oFixed(msg.price,2,true)}</Text>
                  </View>
                  <View style={{flex:1,flexDirection: 'row'}}>
                    <Text style={[styles.f13,{paddingLeft:36}]}>供应商:</Text>
                    <Text style={[styles.f13,{paddingLeft:12,width:100,marginTop:1}]}  numberOfLines={1} >{msg['sup_name']}</Text>
                 </View>
                </View>
              </View>
              <View style={{flex:1,flexDirection: 'row',justifyContent:'flex-end',alignItems:'center',paddingRight:Utils.normalize(16)}}>
                <Icon  color='#cccccc' name={ "ios-arrow-forward"} size={23}  onPress={()=>this._IeDetail(msg,rowId)}/>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      )
    }else{
      return(null)
    }

  }
  render(){
    return(
      <View>
        <ListView
          initialListSize={20} pageSize={20}
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          style={[nc_styles.listContainer]}
          onScroll={this._onScroll.bind(this)}
          ref ='_listView'
          renderFooter={() => {
              let _result =
              this.props.foot ?
                (<View>
                   <View style={{height: 40,justifyContent: 'center'}}>
                      <Text style={{textAlign: 'center',color:'#aaa',paddingTop:10,paddingBottom:10}}>--没有更多商品了--</Text>
                     </View>
                </View>)
              :(null);
              return _result

            }}
          onEndReachedThreshold={40}
          scrollRenderAheadDistance={220}
          renderRow={(msg,sectionID,rowId)=>this._renderRow(msg,sectionID,rowId)}>
        </ListView>
        {this.state.backToTop ?
          <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={nc_styles.backToTop}>
            <Image style={{width: 50, height: 50}} source={Assets.backToTop}/>
          </TouchableOpacity>
          : null}
      </View>
    )
  }
}
const nc_styles = StyleSheet.create({
  backToTop: {
    position: 'absolute',
    right: 10,
    bottom: 60,
    width: Utils.normalize(52),
    height: Utils.normalize(52),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'transparent'
  },
  listContainer:{
    flex:1,
    marginTop:Utils.normalize(36),
    height:Utils.height-Utils.normalize(140),
    paddingLeft:Utils.normalize(8),
    backgroundColor:"#fff"
  },
  renderView:{
    flex:1,
    flexDirection: 'row',
    paddingBottom:8,
    paddingTop:8,
    borderBottomWidth:0.5,
    borderBottomColor:'#ccc'
  },
  label:{
    marginTop:Utils.normalize(10),
    marginLeft:Utils.normalize(12),
  },
  redColor:{
    color:'red',
    fontSize:Utils.normalize(16),

  },
  itemTitle: {
    marginLeft: 15,
    marginTop: 14,
  },
  overlay:{
    position: 'absolute',
    top:Utils.andr21Normalize(64),
    bottom:0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    // backgroundColor: 'red',
    width: Utils.width,
    flex: 1,
    // flexDirection: 'row',
  },
  grayColor:{
    color:'#999999',
  },
});
export default Insurance;
