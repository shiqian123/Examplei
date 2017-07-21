/**
* @Author: shiqian
* @Date:   2016-10-19T17:13:18+08:00
* @Email:  15611555640@163.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-10T12:09:25+08:00
*/

/**
 * Created by shiqian on 16/8/27.
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
import {Header,Loading,Developing,TabBar,SearchBar,SearchTitle,Cart,Card,Button} from '../components';
import {Utils, Assets,Device,_,API} from "../base";

class Boutique extends Component{
  // 构造
  constructor(props) {
    super(props);
    var ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1 !==r2});
    // 初始状态
    this.state = {
      dataArr:ds.cloneWithRows(this.props.dataSource),
      itemCount:'',
      backToTop:false
    };
  }

  componentWillReceiveProps(next) {
    this.setState({dataArr:this.state.dataArr.cloneWithRows(next.dataSource)});
  }
  _boutiqueDetail(msg){
    Actions.boutigueDetail({data:msg,param:this.props.param})
  }
  _onScroll() {
    if (this.refs._listView.scrollProperties.offset > Utils.height) {
      this.setState({backToTop: true});
    }else{
      this.setState({backToTop: false});
    }
  }
  _renderRow(msg,sectionID,rowId){
    if(msg!='Pd'){
      return(
        <View>
          <TouchableOpacity onPress={()=>this._boutiqueDetail(msg,rowId)}>
            <View style={[boutique.renderView]}>
              <View style={{paddingTop:8}}>
                <Image source={ (msg.pics==undefined)?Assets.noImg:{uri: (msg.pics==undefined)?Assets.noImg:API.url+msg.pics[0].href}}
                       style={{width: 60, height: 54}} />
              </View>
              <View style={{ flexDirection: 'column',flex:8, borderBottomWidth:0.5,borderBottomColor:'#ccc',paddingBottom:4,marginLeft:8,paddingBottom:12}}>
                <Text style={[{fontSize:Utils.normalize(15)}]} >{msg.atr.nm}</Text>
                <View style={{flexDirection: 'row',flex: 1,paddingTop:10}}>
                  <View style={{flexDirection:'column',flex: 1}}>
                    <View style={{flexDirection:'row'}}>
                      <Text style={[boutique.grayColor]}>
                        指导价:
                      </Text>
                      <Text style={[boutique.redColor,{paddingLeft:12}]}>¥ {Utils.oFixed(msg.atr.prc,2,true)}</Text>
                    </View>
                    <View style={{flexDirection:'row',paddingTop:4}}>
                      <Text style={{fontSize:Utils.normalize(13)}}>品牌:</Text>
                      <Text style={[{paddingLeft:12,fontSize:Utils.normalize(13)}]}>{msg.atr.brd}</Text>
                    </View>
                  </View>
                  <View style={{flexDirection:'column',flex: 1,paddingLeft:42}}>
                    <View style={{flexDirection:'row'}}>
                      <Text style={[boutique.grayColor]}>
                        库存:
                      </Text>
                      <Text style={[boutique.redColor,{paddingLeft:12}]}>
                        {msg.count}
                      </Text>
                    </View>
                    <Text style={{marginTop:4,fontSize:Utils.normalize(13)}}>{msg.ior==0?'非原装':'原装'}</Text>
                  </View>
                </View>
              </View>
              <View style={{flex:1,flexDirection: 'row',justifyContent:'flex-end',alignItems:'center',paddingRight:Utils.normalize(16), borderBottomWidth:0.5,borderBottomColor:'#ccc'}}>
                <Icon  color='#cccccc' name={"ios-arrow-forward"} size={23}/>
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
      <View >
      <ListView
          initialListSize={20} pageSize={20}
          enableEmptySections={true}
          ref="_listView"
          scrollEventThrottle={400}
          dataSource={this.state.dataArr}
          style={[boutique.listContainer,(this.state.dataArr._dataBlob.s1.length==0?{backgroundColor:'#EFEFEF'}:{})]}
          onScroll={this._onScroll.bind(this)}
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
          renderRow={(msg,sectionID,rowId)=>this._renderRow(msg,sectionID,rowId)}>
        </ListView>
        {this.state.backToTop ?
          <TouchableOpacity activeOpacity={1} onPress={() => this.refs._listView.scrollTo({y: 0, animated: true})} style={styles.backToTop}>
            <Image style={{width: 50, height: 50}} source={Assets.backToTop}/>
          </TouchableOpacity>
          : null}
      </View>
    )
  }
}
const boutique = StyleSheet.create({
  listContainer:{
    flex:1,
    height:Utils.height-Utils.normalize(140),
    paddingLeft:Utils.normalize(8),
    backgroundColor:"#fff",
    marginTop:Utils.normalize(36),
    paddingTop:Utils.normalize(8),
  },
  renderView:{
    flex:1,
    flexDirection: 'row',
    paddingBottom:8,

  },
  redColor:{
    color:'red',
    fontSize:Utils.normalize(13),
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
    fontSize:Utils.normalize(13),
    paddingBottom:Utils.normalize(4)
  },
});
export default Boutique
