'use strict'

import React, { Component } from 'react';
import {
	ScrollView,
	TouchableHighlight,
	ActivityIndicator,
	View,
	Text,
	StyleSheet,
	SegmentedControlIOS,
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

class horizontalDetail extends Component {
  constructor(props) {
    super()
    const TABKEY = props.ops != null && props.ops.cost ? ['sum_parallel_profit','sproduct_cover_ratio','sum_parallel_earn'] : ['sproduct_cover_ratio','sum_parallel_earn']
    this.state = {
      url: API.webService + "/report/level?"+Math.ceil(Math.random() * 999999),
      tabs: props.tabs,
      tabkey: TABKEY,
      selectedIndex:props.data.index,
      currentTitle: props.tabs[props.data.index] + '排行',
      currentKey: TABKEY[props.data.index],
      sortStatus: 1,
      loadData: true,
      quData: null
    }
    this.selectDate = props.data.date
    this.selectGroup = props.data.group
    this.souData = this._orderBy(props.data.detail,this.state.currentKey,this.state.sortStatus)
    this.data = this._getBarChartData(props.data.date, this.souData, this.state.currentKey, props.data.group)
    this.flagTab1 = (this.state.currentKey === 'sum_parallel_profit') ? true : false
    this.data1_1 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sum_sproduct_profit', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'sum_sproduct_earn', props.data.group)
    this.data1_2 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sproduct_profit_per_scar', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'arv_sproduct_earn', props.data.group)
    this.data1_3 = this._addPercent(this._getBarChartData(props.data.date, this.souData, 'sproduct_cover_ratio', props.data.group))
    this.data2_1 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sum_sinsure_profit', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'sum_sinsure_earn', props.data.group)
    this.data2_2 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sinsure_profit_per_scar', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'arv_sinsure_earn', props.data.group)
    this.data2_3 = this._addPercent(this._getBarChartData(props.data.date, this.souData, 'sinsure_cover_ratio', props.data.group))
    this.data3_1 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sum_sbeauty_profit', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'sum_sbeauty_earn', props.data.group)
    this.data3_2 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sbeauty_profit_per_scar', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'arv_sbeauty_earn', props.data.group)
    this.data3_3 = this._addPercent(this._getBarChartData(props.data.date, this.souData, 'sbeauty_cover_ratio', props.data.group))
    this.data4_1 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sum_swarrant_profit', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'sum_swarrant_earn', props.data.group)
    this.data4_2 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'swarrant_profit_per_scar', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'arv_swarrent_earn', props.data.group)
    this.data4_3 = this._addPercent(this._getBarChartData(props.data.date, this.souData, 'swarrant_cover_ratio', props.data.group))
    this.data5_1 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sum_service_fee', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'sum_service_fee', props.data.group)
    this.data5_2 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'service_fee_per_scar', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'service_fee_per_scar', props.data.group)
    this.data5_3 = this._addPercent(this._getBarChartData(props.data.date, this.souData, 'service_fee_cover_ratio', props.data.group))
    this.data6_1 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sum_sfee_profit', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'sum_sfee_earn', props.data.group)
    this.data6_2 = this.flagTab1 ? this._getBarChartData(props.data.date, this.souData, 'sfee_profit_per_scar', props.data.group) : this._getBarChartData(props.data.date, this.souData, 'arv_sfee_earn', props.data.group)
    this.data6_3 = this._addPercent(this._getBarChartData(props.data.date, this.souData, 'sfee_cover_ratio', props.data.group))
    this.splitData = this._getBarChartData(props.data.date, this.souData, SPLITKEY[this.state.selectedIndex], props.data.group)
    this.labelList = this._getBarChartData(props.data.date, this.souData, 'org_name', props.data.group)[0]
    this.labelIdList = this._getBarChartData(props.data.date, this.souData, 'org_name', props.data.group)[1]
    this.quData = []
    this.catesNameList = ['精品','保险','汽车美容','延长质保','分期贷款','其它']
    this.catesValueList = this._getCatesList(props.data.souData)
    this.dt1_1 = this.state.currentKey ==="sum_parallel_profit" ? '毛利' : '水平销售额'
    this.dt1_2 = this.state.currentKey ==="sum_parallel_profit" ? '平均毛利' : '平均产值'
    this.pieData = this._getPieValue(props.data.souData)
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
  _onSelectChange(index, title) {
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
    this.souData = this._orderBy(this.props.data.detail,this.state.tabkey[_tmp.selectedIndex],1)
    this.data = this._getBarChartData(this.props.data.date, this.souData, this.state.tabkey[_tmp.selectedIndex], this.props.data.group)
    this.splitData = this._getBarChartData(this.props.data.date, this.souData, SPLITKEY[_tmp.selectedIndex], this.props.data.group)
    this.labelList = this._getBarChartData(this.props.data.date, this.souData, 'org_name', this.props.data.group)[0]
    this.labelIdList = this._getBarChartData(this.props.data.date, this.souData, 'org_name', this.props.data.group)[1]
    this.flagTab1 = (this.state.tabkey[index] === 'sum_parallel_profit') ? true : false;
    this.data1_1 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sum_sproduct_profit', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'sum_sproduct_earn', this.selectGroup)
    this.data1_2 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sproduct_profit_per_scar', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'arv_sproduct_earn', this.selectGroup)
    this.data2_1 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sum_sinsure_profit', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'sum_sinsure_earn', this.selectGroup)
    this.data2_2 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sinsure_profit_per_scar', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'arv_sinsure_earn', this.selectGroup)
    this.data3_1 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sum_sbeauty_profit', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'sum_sbeauty_earn', this.selectGroup)
    this.data3_2 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sbeauty_profit_per_scar', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'arv_sbeauty_earn', this.selectGroup)
    this.data4_1 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sum_swarrant_profit', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'sum_swarrant_earn', this.selectGroup)
    this.data4_2 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'swarrant_profit_per_scar', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'arv_swarrent_earn', this.selectGroup)
    this.data5_1 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sum_service_fee', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'sum_service_fee', this.selectGroup)
    this.data5_2 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'service_fee_per_scar', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'service_fee_per_scar', this.selectGroup)
    this.data6_1 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sum_sfee_profit', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'sum_sfee_earn', this.selectGroup)
    this.data6_2 = this.flagTab1 ? this._getBarChartData(this.selectDate, this.souData, 'sfee_profit_per_scar', this.selectGroup) : this._getBarChartData(this.selectDate, this.souData, 'arv_sfee_earn', this.selectGroup)
    this.data1_3 = this._addPercent(this._getBarChartData(this.selectDate, this.souData, 'sproduct_cover_ratio', this.selectGroup))
    this.data2_3 = this._addPercent(this._getBarChartData(this.selectDate, this.souData, 'sinsure_cover_ratio', this.selectGroup))
    this.data3_3 = this._addPercent(this._getBarChartData(this.selectDate, this.souData, 'sbeauty_cover_ratio', this.selectGroup))
    this.data4_3 = this._addPercent(this._getBarChartData(this.selectDate, this.souData, 'swarrant_cover_ratio', this.selectGroup))
    this.data5_3 = this._addPercent(this._getBarChartData(this.selectDate, this.souData, 'service_fee_cover_ratio', this.selectGroup))
    this.data6_3 = this._addPercent(this._getBarChartData(this.selectDate, this.souData, 'sfee_cover_ratio', this.selectGroup))
    this.dt1_1 = this.state.tabkey[_tmp.selectedIndex] ==="sum_parallel_profit" ? '毛利' : '水平销售额';
    this.dt1_2 = this.state.tabkey[_tmp.selectedIndex] ==="sum_parallel_profit" ? '平均毛利' : '平均产值';
    this.setState(_tmp);
    this.setState({url: API.webService + "/report/level?"+Math.ceil(Math.random() * 999999)});
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
          'where': ['PARALLEL'],
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
          if(!v) v=0;
          _r.push(parseFloat(v))
        }
      })
    }
    return _r
  }

  /**
    * 过滤各品类毛利分布
    * @param  {Object} data
    *
  */
  _getCatesList(data){
    if(data){
      return [Math.round(data.sum_sproduct_profit ? data.sum_sproduct_profit : 0),Math.round(data.sum_sinsure_profit ? data.sum_sinsure_profit : 0),Math.round(data.sum_sbeauty_profit ? data.sum_sbeauty_profit : 0),
      Math.round(data.sum_swarrant_profit ? data.sum_swarrant_profit : 0),Math.round(data.sum_service_fee ? data.sum_service_fee : 0),Math.round(data.sum_sfee_profit ? data.sum_sfee_profit : 0)]
    }
  }

  /**
    * 给数据增加百分号
    * @param  {Array} data
    *
  */
  _addPercent(data){
    if(data){
      for(var i=0;i<data.length;i++){
        data[i] = data[i] +'%';
      }
    }
    return data
  }

  /**
    * 过滤饼状图数据
    * @param  {Array} data
    *
  */
  _getPieValue(d){
    let _p=[];
    if(d){
      _p=[Math.round(d.sum_sproduct_earn),Math.round(d.sum_swarrant_earn),Math.round(d.sum_sbeauty_earn),Math.round(d.sum_sfee_earn),Math.round(d.sum_sinsure_earn),Math.round(d.sum_service_fee)]
    }
    return _p
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
            selectedTitleStyle={{ color: '#387ff5'}}
						onChange={this._onSelectChange.bind(this)}
            onPress={index => this._onSelectChange(index)}
            stretch
          />
        </View>
        <View style={styles.today}>
          <Text style={styles.date}>{Utils.toDisDate(data.date, data.group)}</Text>
        </View>
        {
          (this.props.data.group === 'DAY' || this.state.quData != null) ?
          <WebView
            source={{
              uri: url,
              method: 'POST',
              body: 'isMonth=' + data.group
                + '&org_name=' + this.props.title
                + '&dt=' + this.labelList
                + '&dtId=' + this.labelIdList
                + '&t1=' + this.state.currentTitle
                + '&d1=' + this.data
                + '&t1_1=' + this.dt1_1
                + '&d1_1=' + this.data1_1
                + '&t1_2=' + this.dt1_2
                + '&d1_2=' + this.data1_2
                + '&t1_3=' + '覆盖率'
                + '&d1_3=' + this.data1_3
                + '&d2_1=' + this.data2_1
                + '&d2_2=' + this.data2_2
                + '&d2_3=' + this.data2_3
                + '&d3_1=' + this.data3_1
                + '&d3_2=' + this.data3_2
                + '&d3_3=' + this.data3_3
                + '&d4_1=' + this.data4_1
                + '&d4_2=' + this.data4_2
                + '&d4_3=' + this.data4_3
                + '&d5_1=' + this.data5_1
                + '&d5_2=' + this.data5_2
                + '&d5_3=' + this.data5_3
                + '&d6_1=' + this.data6_1
                + '&d6_2=' + this.data6_2
                + '&d6_3=' + this.data6_3
                + '&t2=平均' + this.state.currentTitle
                + '&d2=' + this.splitData
                + '&souData=' + JSON.stringify(data.souData)
                + '&currentKey='+ this.state.currentKey
                + '&quSouData='+ JSON.stringify(this.state.quData)
                + '&quData='+ this.quData
                + '&catesName='+ this.catesNameList
                + '&catesValue='+ this.catesValueList
                + '&pieData='+ this.pieData
          }}/> : <Loading />
        }
      </View>
    )
  }
}

export default horizontalDetail
