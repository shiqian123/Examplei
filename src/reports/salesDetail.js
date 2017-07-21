'use strict'

import React, { Component } from 'react';
import {
	ScrollView,
	TouchableHighlight,
	ActivityIndicator,
	View,
	Text,
	StyleSheet,
	WebView
} from 'react-native'
import Button from 'react-native-button'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import {Utils, Assets, API, Device} from '../base'
import {Header, Segmented, Loading} from '../components'
import styles from '../common/styles'

const SPLITKEY=['per_capita_scar_num','per_capita_whole_profit','per_capita_all_earn']
const TITKEY = {
  'all': '全部',
  'parallel': '水平业务',
}
let WEBVIEW_REF = 'reportView'
class SalesDetail extends Component {
  constructor(props) {
    super()
    const TABKEY = props.ops != null && props.ops.cost ? ['sum_scar_num','sum_all_profit','sum_all_earn'] : ['sum_scar_num','sum_all_earn']
    this.state = {
      url: API.webService + "/report/all?"+Math.ceil(Math.random() * 999999),
      tabs: props.tabs,
      tabkey: TABKEY,
      selectedIndex:props.data.index,
      currentTitle: props.tabs[props.data.index],
      currentKey: TABKEY[props.data.index],
      sortStatus: 1,
      loadData: true,
      quData: null
    }
    this.souData = this._orderBy(props.data.detail,this.state.currentKey,this.state.sortStatus)
    this.data = this._getBarChartData(props.data.date, this.souData, this.state.currentKey, props.data.group)
    this.splitData = this._getBarChartData(props.data.date, this.souData, SPLITKEY[this.state.selectedIndex], props.data.group)
    this.labelList = this._getBarChartData(props.data.date, this.souData, 'org_name', props.data.group)[0]
    this.labelIdList = this._getBarChartData(props.data.date, this.souData, 'org_name', props.data.group)[1]
    this.quData = []
  }

  componentDidMount() {
    const {data} = this.props
    if(data.group === 'MONTH'){
      this._getRecentData()
    }
  }

  // props 属性更改调用
  componentWillReceiveProps(props) {
    const {quData} = this.state
    // this.quData = this._getLineChartData(quData, this.state.currentKey)
  }
  /**
   * 排序
   * @param  {Object} data 数据
   * @param  {String} key 需要排序的键值
   * @param  {String} dir 排序类型
   */
  _orderBy(data, key, dir) {
    let _sort = 1
    if(dir){
      _sort = -1
    }
    if(data !== null){
      data.sort((a,b) => {
        if(a[key] === null || a[key] === undefined) { a[key] = 0 }
        if(b[key] === null || b[key] === undefined) { b[key] = 0 }
        return parseFloat(a[key]) > parseFloat(b[key]) ? -_sort : _sort
      })
    }
    return data;
  }

  /**
   * 头部标签切换
   */

  _onSelectChange(index) {
    let _tmp;
    if(Device.iOS) {
      _tmp = {
        selectedIndex: index.nativeEvent.selectedSegmentIndex,
        currentTitle: index.nativeEvent.value,
        currentKey: this.state.tabkey[index.nativeEvent.selectedSegmentIndex],
      }
    } else {
      _tmp = {
        selectedIndex: index,
        currentTitle: this.state.tabs[index],
        currentKey: this.state.tabkey[index]
      }
    }

    if(this.props.data.group === 'MONTH'){
      this.quData = this._getLineChartData(this.state.quData, this.state.tabkey[_tmp.selectedIndex])
    }
    this.souData = this._orderBy(this.props.data.detail,this.state.currentKey,1)
    this.data = this._getBarChartData(this.props.data.date, this.souData, this.state.tabkey[_tmp.selectedIndex], this.props.data.group)
    this.splitData = this._getBarChartData(this.props.data.date, this.souData, SPLITKEY[_tmp.selectedIndex], this.props.data.group)
    this.labelList = this._getBarChartData(this.props.data.date, this.souData, 'org_name', this.props.data.group)[0]
    this.labelIdList = this._getBarChartData(this.props.data.date, this.souData, 'org_name', this.props.data.group)[1]
    this.setState(_tmp);
    this.setState({url: API.webService + "/report/all?"+Math.ceil(Math.random() * 999999)})
    this._webViewReload(WEBVIEW_REF);
  }

  // reload webview
  _webViewReload(obj){
    this.refs[obj].reload();
  }

  /**
   * 请求最近6个月数据
   */
  _getRecentData() {
    const {data} = this.props
    let endTime = Utils.toMinDate(new Date())
    let startTime = Utils.toMinDate(endTime,'MONTH',-6)
    startTime = startTime.slice(0,6) + '01';
    endTime = Utils.moment(endTime).endOf('month').format("YYYYMMDD");
    let params = {
      choice: {
        'time': {
          'where': ['ABSOLUTE', startTime, endTime],
          'group': 'MONTH'
        },
        'sales': {
          'where': ['BYORG', data.orgs],
          'group': 'ORG'
        },
        'goods': {
          'where': ['ALL'],
          'group': ''
        },
        'option': {
          'brief': 1,
          'patch': 1,
          'version': 'v2'
        }
      }
    }
    Utils.fetch(Utils.api.anasale, 'post', params)
      .then(res => {
        this.quData = this._getLineChartData(res.brief, this.state.currentKey)
        this.setState({quData:res.brief, loadData: false})
      })
  }

  /**
   * 过滤横向柱状图数据
   * @param  {Time} date
   * @param  {Object} data
   * @param  {String} key
   * @param  {String} group
   */
  _getBarChartData(date,data, key, group){
    date = group === 'DAY' ? Utils.moment(date).format('YYYYMMDD') : Utils.moment(date).format('YYYYMM')
    let _tmp = [],_tmp2 = [];
    data.forEach(o => {
      if(o[key] === undefined || o[key] === null){
        o[key] = 0
      }
      _tmp.push(o[key])
      if(key === 'org_name'){
        _tmp2.push(o['org_id'])
      }
    })
    if(key === 'org_name'){
      return [_tmp,_tmp2]
    }else{
      return _tmp
    }
  }

  /**
   * 过滤曲线图所需数据
   * @param  {Object} data
   * @param  {String} key
   */
  _getLineChartData(data, key) {
    let _r = []
    if(data !== null){
      Object.keys(data).map((o, i) => {
        if(o !== 'max' && i != 0){
          let v = data[o][key]
          if(key === 'sum_gift_cost') {
            data[o]['sum_gift_cost'] ? v = data[o]['sum_gift_cost'] : v = data[o]['sum_all_gift_cost']
          }
          /*
          销售简报需要计算项
           if(key === 'avr_all_profit'){
             v = data[o]['sum_all_profit'] / data[o]['sum_scar_num'];
           } else if(key === 'profit_per_goods'){
             v = data[o]['sum_scar_profit'] / data[o]['sum_scar_num'];
           } else if(key === 'sum_level_profit') {
             v = data[o]['sum_all_profit'] - data[o]['sum_scar_profit'] + data[o]['sum_all_gift_cost']
           }
           */
           if(!v) v=0;
          _r.push(parseFloat(v))
        }
      })
    }
    return _r
  }

  render() {
    const {data} = this.props;
    const {url} = this.state;
    return (
      <View style={[styles.container,{backgroundColor:'#fff'}]}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title={this.props.title + '-' + TITKEY[this.props.clsName]}/>
        <View style={styles.tabContainer}>

          <Segmented
            titles={this.state.tabs}
            index={this.state.selectedIndex}
            barPosition='bottom'
            selectedTitleStyle={{ color: '#387ff5'}}
            stretch
            onPress={index => this._onSelectChange(index)}
						onChange={this._onSelectChange.bind(this)}
						iosStyle={styles.tabs}
          />
        </View>
        <View style={styles.today}>
          <Text style={styles.date}>{Utils.toDisDate(data.date, data.group)}</Text>
        </View>
        {
          (this.props.data.group === 'DAY' || this.state.quData != null) ?
            <WebView
              ref={WEBVIEW_REF}
              source={{
                uri: url,
                method: 'POST',
                body: 'isMonth=' + data.group
                  + '&org_name=' + this.props.title
                  + '&dt=' + this.labelList
                  + '&dtId=' + this.labelIdList
                  + '&t1=' + this.state.currentTitle
                  + '&d1=' + this.data
                  + '&t2=人均' + this.state.currentTitle
                  + '&d2=' + this.splitData
                  + '&souData=' + JSON.stringify(data.souData)
                  + '&currentKey='+ this.state.currentKey
                  + '&quSouData='+ JSON.stringify(this.state.quData)
                  + '&quData='+ this.quData
               }} />
          : <Loading/>
        }
      </View>
    )
  }
}

export default SalesDetail
