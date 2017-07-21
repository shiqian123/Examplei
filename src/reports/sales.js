/**
* @Author: yanke
* @Date:   2016-09-09T11:42:48+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   MillerD
* @Last modified time: 2016-11-17T19:33:44+08:00
*/

'use strict'

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
  Image,
  Text,
  Animated
} from 'react-native';
import Button from 'react-native-button';
import {Actions} from 'react-native-router-flux';

import styles from '../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import {Utils, Assets,Device} from "../base";
import {Header,Loading} from '../components';

const DTABS = {
  'all': ['新车销量', '总毛利', '总销售额']
}
let flag = 0;

class Sales extends Component {
  constructor(props) {
    super()
    let disType = props.his ? props.his.type : 'DAY';
    let disDate = props.his ? props.his.date : Utils.toMinDate(new Date());
    this.state = {
      isRefreshing: false,
      showLoading: false,
      showDisplay: false,
      display: disType,
      date: disDate,
      ops: null,
      ops2: null,
      orgs: null,
      refTitle: '',
      orgShow:false,
      startYear: new Date('2012/01/01'),
      dataSource: new ListView.DataSource({
        rowHasChanged: () => true
      }),
      dataSource2: new ListView.DataSource({
        rowHasChanged: () => true
      }),
      orgsTop: new Animated.Value(Utils.height),
    }
    this.orgs = null
    this.detailData = null
    this.detailData2 = null
  }


  /**
   * 视图初始化
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({isRefreshing:true});
      this._checkData()
    }, 500)
    setTimeout(()=>{
      this.setState({isRefreshing:false});
    },3500)
  }

  // props 属性更改调用
  componentWillReceiveProps(next) {
    this.setState({showLoading: true,date: next.date})
    this._onRefresh(this.state.orgs, Utils.toMinDate(next.date, next.type, -1), Utils.toMinDate(next.date, next.type), next.type)
    this.setState({showDisplay: false, display: next.type})
  }

  /**
   * 界面初始化时验证数据
   */
  _checkData() {
    this._getOrgs()
  }

  /**
   * 获取组织／部门数据
   */
  _getOrgs() {
    let params = {
      keys: 'me_anasaleempscope'
    }
    Utils.fetch(Utils.api.load, 'post', params)
      .then( res => {
        this.orgs = res[params.keys].orglist
        if(this.props.selectOrgs !== undefined && this.props.selectOrgs['id'] !== this.orgs[0].id){
          this.setState({orgs:this.props.selectOrgs.id, orgsName:this.props.selectOrgs.name})
        } else {
          this.setState({orgs:this.orgs[0].id, orgsName:this.orgs[0].name, orgsList: this.orgs})
        }
        this.setState({isRefreshing: true, showLoading: false})
        this._onRefresh(this.state.orgs, Utils.toMinDate(this.state.date, this.state.display, -1), Utils.toMinDate(this.state.date, this.state.display), this.state.display)
      })
  }

  /**
   * 下拉刷新调用
   */
  _refresh(){
    this.setState({isRefreshing: true, showLoading: false})
    this._onRefresh(this.state.orgs, Utils.toMinDate(this.state.date, this.state.display, -1), Utils.toMinDate(this.state.date, this.state.display), this.state.display)
  }

  /**
   * 刷新数据
   */
  _onRefresh(orgs, startTime, endTime, type, cb) {
    if(type === 'MONTH'){
      startTime = startTime.slice(0,6) + '01';
      endTime = Utils.moment(endTime).endOf('month').format("YYYYMMDD");
    }
    let params = {
      choice: {
        'time': {
          'where': ['ABSOLUTE', startTime, endTime],
          'group': type
        },
        'sales': {
          'where': ['BYORG', orgs],
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
    let params2 = {
      choice: {
        'time': {
          'where': ['ABSOLUTE', startTime, endTime],
          'group': type
        },
        'sales': {
          'where': ['BYORG', orgs],
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
    // this.setState({showLoading: true})
    Utils.fetch(Utils.api.anasale, 'post', params)
      .then(res => {
        // storage.save({
        //   key: 'Sales',
        //   rawData: res
        // })
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this._getTodayData(this.state.date, res, this.state.display)),
          ops: res.ops
        })
        this.detailData = res['data']
        this.setState({showLoading: false, isRefreshing: false})
      })
    Utils.fetch(Utils.api.anasale, 'post', params2)
      .then(res => {
        this.setState({
          dataSource2: this.state.dataSource2.cloneWithRows(this._getTodayData(this.state.date, res, this.state.display)),
          ops2: res.ops
        })
        this.detailData2 = res['data']
      })
      //对网络状态进行判断
      setTimeout(()=>{
        this.setState({isRefreshing: false,showLoading: false})
      },3000)
  }
  /**
   * 获取当前数据／上一日／及最大值
   * @param  {[Date]} date
   * @param  {[Object]} data
   * @param  {[String]} type
   */
  _getTodayData(date, data, type) {
    let _r = []
    let curDate = type === 'DAY' ? Utils.toMinDate(date, this.state.display, 0) : Utils.moment(Utils.toMinDate(date, this.state.display, 0)).format('YYYYMM');
    let oldDate = type === 'DAY' ? Utils.toMinDate(date, this.state.display, -1) : Utils.moment(Utils.toMinDate(date, this.state.display, -1)).format('YYYYMM');
    if(data.brief[curDate] === undefined || data.brief[curDate].length === 0) { data.brief[curDate] = {} }
    if(data.brief[oldDate] === undefined || data.brief[oldDate].length === 0){ data.brief[oldDate] = {} }
    if(data.brief.max === undefined || data.brief.max.length === 0) { data.brief.max = {} }

    let _d = {
      max: data.brief.max,
      d: data.brief[curDate],
      od: data.brief[oldDate]
    }
    switch (type) {
      case 'MONTH':
        _r.push(_d)
        break
      default:
        _r.push(_d)
        break
    }
    return _r
  }

  /**
   * 前一日 / 上一月
   */
  _onPrev() {
    const today = Utils.toMinDate(this.state.date, this.state.display)
    const prevday = Utils.toMinDate(this.state.date, this.state.display, -1)
    if(new Date(Utils.toDisDate(this.state.date, 'DAY')) > this.state.startYear ){
      this.setState({date: prevday})
      this.setState({showLoading: true})
      this._onRefresh(this.state.orgs, Utils.toMinDate(this.state.date, this.state.display, -2), Utils.toMinDate(this.state.date, this.state.display,-1), this.state.display)
      this.setState({showDisplay: false})
    }
  }
  /**
   * 后一日/ 下一月
   */
  _onNext() {
    const today = Utils.toMinDate(this.state.date, this.state.display)
    const nextday = Utils.toMinDate(this.state.date, this.state.display, 1)
    if(this.state.display == 'DAY'){
      if(today < Utils.toMinDate(new Date(), this.state.display)){
        this.setState({showLoading: true})
        this._onRefresh(this.state.orgs, Utils.toMinDate(this.state.date, this.state.display), Utils.toMinDate(this.state.date, this.state.display, 1), this.state.display)
        this.setState({date: nextday})
      }
    }else if(this.state.display == 'MONTH'){
      if((Utils.toMinDate(new Date(), this.state.display)-today)>31){
        this.setState({showLoading: true})
        this._onRefresh(this.state.orgs, Utils.toMinDate(this.state.date, this.state.display), Utils.toMinDate(this.state.date, this.state.display, 1), this.state.display)
        this.setState({date: nextday})
      }
    }
    this.setState({showDisplay: false})
  }

  /**
   * 显示按天／按月切换
   */
  _onChangeTyped(key) {
    this.setState({showLoading: true})
    this._onRefresh(this.state.orgs, Utils.toMinDate(this.state.date, key, -1), Utils.toMinDate(this.state.date, key), key)
    this.setState({showDisplay: false, display: key})
  }

  /**
   * 全局点击事件
   */
  _onTouchUp() {
    this.setState({showDisplay: false,orgShow:false}) // 隐藏日/月选择
    return true
  }

  /**
   * 更改显示类型 / 月 / 日
   */
  _onShowChangeType() {
    // this.state.showDisplay ? this.setState({showDisplay: !this.state.showDisplay}) : this.setState({showDisplay: true});
    setTimeout( ()=> {
      if(flag == 0){
        Actions.selectDate({data:{type: this.state.display,check: this.state.date, startYear: this.state.startYear}});
        flag = 1;
        setTimeout(() => {
          flag = 0;
        },250)
      }
    },0)
  }

  /**
   * 查看详细数据
   */
  _showDetail(data, key) {
    const {ops, orgs, display, date, orgsName } = this.state;
    DTABS[key] = ops != null && ops.cost ? ['新车销量', '总毛利', '总销售额'] : ['新车销量', '总销售额'];
    if(ops != null && ops.cost) {
      null;
    } else if(data.index === 2) {
      data.index = 1;
    }
    this.setState({showDisplay: false})
    data['orgs'] = orgs
    data['group'] = display
    data['date'] = Utils.toMinDate(date, display)
    data['detail'] = this._getDetailData(date, this.detailData, display)
    Actions.salesDetail({data: data, title: orgsName, tabs: DTABS[key], clsName: key, ops: ops})
  }
  _showDetail2(data, key) {
    const {ops, orgs, display, date, orgsName } = this.state;
    DTABS[key] = ops != null && ops.cost ? ['水平毛利', '覆盖率', '水平销售额'] : ['覆盖率', '水平销售额'];
    if(ops != null && ops.cost) {
      null;
    } else if(data.index === 1) {
      data.index = 0;
    } else if(data.index === 2) {
      data.index = 1;
    }
    this.setState({showDisplay: false})
    data['orgs'] = orgs
    data['group'] = display
    data['date'] = Utils.toMinDate(date, display)
    data['detail'] = this._getDetailData(date, this.detailData2, display)
    Actions.horizontalDetail({data: data, title: orgsName, tabs: DTABS[key], clsName: key, ops: ops})
  }
  _getDetailData(date, data, showType) {
    let t = {
      year: Utils.moment(date).year(),
      month: Utils.moment(date).month() + 1,
      date: Utils.moment(date).date()
    };
    let _tmp = []
    if(data !== null){
      data.forEach(o => {
        if (showType ==='MONTH' && o.year == t.year && o.month == t.month) {
          _tmp.push(o);
        } else if (showType ==='DAY' && o.year == t.year && o.month == t.month && o.date == t.date) {
          _tmp.push(o);
        }
      })
    }
    return _tmp;
  }
  /**
   * 更改组织／部门
   */
  _changeOrgs() {
    const{display, date, orgs, orgsList } = this.state
    this.setState({showDisplay: false})
    if(orgsList.length > 0){
      let parentOrgs = orgsList[0]
      let selectOrgs = null
      orgsList.forEach(o => {
        if(o.id === orgs){
          selectOrgs = o
        }
      })
      let ds = new ListView.DataSource({
        rowHasChanged: () => true
      })
      this.setState({orgShow:true,parentOrgs:parentOrgs,select:selectOrgs,orgsN:orgsList,orgSource:ds.cloneWithRows(this._getOrgsList(orgsList, parentOrgs))});
      Animated.timing(
   　　　　this.state.orgsTop,
   　　　　{
   　　　　　　toValue: 0,
   　　　　　　duration: 250,
   　　　　}
   　　).start();
      // Actions.changeOrgs({his:{type:display, date:date}, orgs:orgsList, parentOrgs: parentOrgs, selectOrgs: selectOrgs})
    } else {
      Utils.showMsg('系统提醒', '获取组织失败，请重新登录', 1)
    }
  }
  _onBack(orgs){
    // 未修改部门直接点击完成返回
    if (orgs === 'finish') {
      Animated.timing(
        this.state.orgsTop,
        {
          toValue: Utils.height,
          duration: 250,
        }
      ).start();
    return;
    }

    // 更改了部门
    this.setState(
      {
        orgs: orgs? orgs.id : this.state.select.id,
        orgsName: orgs? orgs.name : this.state.select.name,
        orgShow: false
      }
    )
    Animated.timing(
      this.state.orgsTop,
      {
        toValue: Utils.height,
        duration: 250,
      }
    ).start();
    this._onRefresh(orgs? orgs.id : this.state.select.id, Utils.toMinDate(this.state.date, this.state.display, -1), Utils.toMinDate(this.state.date, this.state.display), this.state.display);
  }
  _orgsRow(orgs, _, index){
    return  (
      <View style={styles.netErrBox}>
        <TouchableHighlight onPress={() => this._changeSelect(orgs)} underlayColor={'transparent'}>
          <View style={styles.fullSonButtonGroup}>
            <Text style={styles.fullSonButtonText}>{orgs.name}</Text>
            { this.state.select['id'] === orgs['id'] ? <Icon style={styles.selectRight} name='md-checkmark' size={20} color="#387ff5" /> : null }
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  _changeSelect(orgs) {
    this.setState({select: orgs, showLoading: true})
    //if(Device.iOS){
      this.setState({
        orgSource: this.state.dataSource.cloneWithRows(this._getOrgsList(this.state.orgsN, this.state.parentOrgs))
      })
      this._onBack(orgs);
    //}
    // else{
    //   this.setState({
    //     orgSource: this.state.dataSource.cloneWithRows(this._getOrgsList(this.state.orgsN, this.state.parentOrgs)),
    //     orgShow: false,
    //     orgs: orgs.id,
    //     orgsName: orgs.name
    //   })
    //   this._onRefresh(orgs.id, Utils.toMinDate(this.state.date, this.state.display, -1), Utils.toMinDate(this.state.date, this.state.display), this.state.display);
    // }
    // Actions.tabbar({type:'replace',selectOrgs:this.state.select,his:this.props.his})
  }
  _getOrgsList(data, parent){
    let rows = [parent]
    for(let i = 0; i < data.length; i++){
      data[i].sales_num = parseInt(data[i].sales_num)
      if(data[i].parent === parent.id && data[i].sales_num > 0){
        rows.push(data[i])
      }
    }
    return rows
  }

  /**
   * 渲染列表视图-全部
   */
  _renderRow(data, _, index) {
    return (
      <View>
        <View style={styles.gap}></View>
        <View style={styles.itemBox}>
          <View style={styles.itemTitle}>
            <Text style={styles.rect}>{'|'}</Text>
            <Text style={styles.sectitle}>全部</Text>
          </View>
          <TouchableHighlight style={styles.item} underlayColor='#CCC' onPress={this._showDetail.bind(this,{souData: data.d, type: 'sum_scar_num', index: 0}, 'all')}>
            <View style={styles.itemInsetBox}>
              <View style={styles.itemInsetLeft}>
                <Image style={styles.carIcon} source={Assets.car} />
              </View>
              <View style={styles.itemInsetRight}>
                <View style={styles.itemRightTitle}>
                  <Text style={styles.msgInnerTitle}>新车销量</Text>
                  <Text style={styles.msgInnerNum}>{Utils.oFixed(data.d['sum_scar_num'], 0, true) || 0}</Text>
                  <Text style={styles.msgInnerFlat}>辆</Text>
                </View>
                <View style={[styles.row]}>
                  <View style={styles.msgDetail}>
                    <Text style={styles.msgDetailCompare}>较前一{this.state.display === 'DAY' ? '日' : '月'}</Text>
                    <Text style={styles.msgDetailComNum}>
                      {
                        Utils.calPrevData(data.d['sum_scar_num'], data.od['sum_scar_num'], 2) > 0 ?
                        <Icon name='md-arrow-round-up' size={14} color="#e52113" />
                        : null
                      }
                      {
                        Utils.calPrevData(data.d['sum_scar_num'], data.od['sum_scar_num'], 2) < 0 ?
                        <Icon name='md-arrow-round-down' size={14} color="#2aa44f" />
                        : null
                      }
                      {!data.od['sum_scar_num']?'-':(Utils.toString(Utils.calPrevData(data.d['sum_scar_num'], data.od['sum_scar_num'], 2))+'%')}
                    </Text>
                  </View>
                  <View style={styles.msgDetailRight}>
                    <Text style={styles.msgDetailCompare}>历史最高
                      <Text style={styles.historyDate}>
                      (
                        {data.max['sum_scar_num'] ? data.max['sum_scar_num']['year']+'.'+data.max['sum_scar_num']['month'] : null}
                        {this.state.display === 'DAY' && data.max['sum_scar_num'] ? '.'+ (data.max['sum_scar_num']['date'] || '') : null }
                      )
                      </Text>
                    </Text>
                    <Text style={styles.msgDetailComNum}>{data.max['sum_scar_num'] ? data.max['sum_scar_num']['max'] : 0}辆</Text>
                  </View>
                </View>
              </View>
              <Icon style={styles.iconChevren} name='ios-arrow-forward' size={19}/>
            </View>
          </TouchableHighlight>
          {
            this.state.ops != null && this.state.ops.cost ?
            <View>
              <View style={[styles.itemInsetLineR,{backgroundColor:'#cccccc'}]}></View>
              <TouchableHighlight style={styles.item} underlayColor='#CCC' onPress={this._showDetail.bind(this,{souData: data.d, type: 'sum_all_profit', index: 1}, 'all')}>
                <View style={styles.itemInsetBox}>
                  <View style={styles.itemInsetLeft}>
                    <Image style={styles.carIcon} source={Assets.money} />
                  </View>
                  <View style={styles.itemInsetRight}>
                    <View style={styles.itemRightTitle}>
                      <Text style={styles.msgInnerTitle}>总毛利</Text>
                      <Text style={styles.msgInnerNum}>{Utils.oFixed(data.d['sum_all_profit'], 0, true) || 0}</Text>
                      <Text style={styles.msgInnerFlat}>元</Text>
                    </View>
                    <View style={styles.row}>
                      <View style={styles.msgDetail}>
                        <Text style={styles.msgDetailCompare}>较前一{this.state.display === 'DAY' ? '日' : '月'}</Text>
                        <Text style={styles.msgDetailComNum}>
                        {
                          Utils.calPrevData(data.d['sum_all_profit'], data.od['sum_all_profit'], 2) > 0 ?
                          <Icon name='md-arrow-round-up' size={14} color="#e52113" />
                          : null
                        }
                        {
                          Utils.calPrevData(data.d['sum_all_profit'], data.od['sum_all_profit'], 2) < 0 ?
                          <Icon name='md-arrow-round-down' size={14} color="#2aa44f" />
                          : null
                        }
                        {!data.od['sum_all_profit']?'-':(Utils.toString(Utils.calPrevData(data.d['sum_all_profit'], data.od['sum_all_profit'], 2))+'%')}
                        </Text>
                      </View>
                      <View style={styles.msgDetailRight}>
                        <Text style={styles.msgDetailCompare}>历史最高
                          <Text style={styles.historyDate}>
                            (
                              {data.max['sum_all_profit'] ? data.max['sum_all_profit']['year']+'.'+data.max['sum_all_profit']['month'] : null}
                              {this.state.display === 'DAY' && data.max['sum_all_profit'] ? '.'+ (data.max['sum_all_profit']['date'] || '') : null }
                            )
                          </Text>
                        </Text>
                        <Text style={styles.msgDetailComNum}>{Utils.oFixed(data.max['sum_all_profit'] ? data.max['sum_all_profit']['max'] : 0, 0, true)}元</Text>
                      </View>
                    </View>
                  </View>
                  <Icon style={styles.iconChevren} name='ios-arrow-forward' size={23}/>
                </View>
              </TouchableHighlight>
            </View>
            : null
          }
          <View style={[styles.itemInsetLineR,{backgroundColor:'#cccccc'}]}></View>
          <TouchableHighlight style={styles.item} underlayColor='#CCC' onPress={this._showDetail.bind(this,{souData: data.d, type: 'sum_all_earn', index: 2}, 'all')}>
            <View style={styles.itemInsetBox}>
              <View style={styles.itemInsetLeft}>
                <Image style={styles.carIcon} source={Assets.dao} />
              </View>
              <View style={styles.itemInsetRight}>
                <View style={styles.itemRightTitle}>
                  <Text style={styles.msgInnerTitle}>总销售额</Text>
                  <Text style={styles.msgInnerNum}>{Utils.oFixed(data.d['sum_all_earn'], 0, true) || 0}</Text>
                  <Text style={styles.msgInnerFlat}>元</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.msgDetail}>
                    <Text style={styles.msgDetailCompare}>较前一{this.state.display === 'DAY' ? '日' : '月'}</Text>
                    <Text style={styles.msgDetailComNum}>
                    {
                      Utils.calPrevData(data.d['sum_all_earn'], data.od['sum_all_earn'], 2) > 0 ?
                      <Icon name='md-arrow-round-up' size={14} color="#e52113" />
                      : null
                    }
                    {
                      Utils.calPrevData(data.d['sum_all_earn'], data.od['sum_all_earn'], 2) < 0 ?
                      <Icon name='md-arrow-round-down' size={14} color="#2aa44f" />
                      :null
                    }

                    {!data.od['sum_all_earn']?'-':(Utils.toString(Utils.calPrevData(data.d['sum_all_earn'], data.od['sum_all_earn'], 2))+'%')}
                    </Text>
                  </View>
                  <View style={styles.msgDetailRight}>
                    <Text style={styles.msgDetailCompare}>历史最高
                      <Text style={styles.historyDate}>
                        (
                          {data.max['sum_all_earn'] ? data.max['sum_all_earn']['year']+'.'+data.max['sum_all_earn']['month'] : null}
                          {this.state.display === 'DAY' && data.max['sum_all_earn'] ? '.'+ (data.max['sum_all_earn']['date'] || '') : null }
                        )
                      </Text>
                    </Text>
                    <Text style={styles.msgDetailComNum}>{Utils.oFixed(data.max['sum_all_earn'] ? data.max['sum_all_earn']['max'] : 0, 0, true)}元</Text>
                  </View>
                </View>
              </View>
              <Icon style={styles.iconChevren} name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  /**
   * 渲染列表视图-水平业务
   */
  _renderRowHorizontal(data, _, index) {
    return (
      <View>
        <View style={styles.gap}></View>
        <View style={styles.itemBox}>
          <View style={styles.itemTitle}>
            <Text style={styles.rect}>{'|'}</Text>
            <Text style={styles.sectitle}>水平业务</Text>
          </View>
          {
            this.state.ops != null && this.state.ops.cost ?
            <View>
              <TouchableHighlight style={styles.item} underlayColor='#CCC' onPress={this._showDetail2.bind(this,{souData: data.d, type: 'sum_parallel_profit', index: 0}, 'parallel')}>
                <View style={styles.itemInsetBox}>
                  <View style={styles.itemInsetLeft}>
                    <Image style={styles.carIcon} source={Assets.money} />
                  </View>
                  <View style={styles.itemInsetRight}>
                    <View style={styles.itemRightTitle}>
                      <Text style={styles.msgInnerTitle}>水平毛利</Text>
                      <Text style={styles.msgInnerNum}>{Utils.oFixed(data.d['sum_parallel_profit'], 0, true) || 0}</Text>
                      <Text style={styles.msgInnerFlat}>元</Text>
                    </View>
                    <View style={[styles.row]}>
                      <View style={styles.msgDetail}>
                        <Text style={styles.msgDetailCompare}>较前一{this.state.display === 'DAY' ? '日' : '月'}</Text>
                        <Text style={styles.msgDetailComNum}>
                          {
                            Utils.calPrevData(data.d['sum_parallel_profit'], data.od['sum_parallel_profit'], 2) > 0 ?
                            <Icon name='md-arrow-round-up' size={14} color="#e52113" />
                            : null
                          }
                          {
                            Utils.calPrevData(data.d['sum_parallel_profit'], data.od['sum_parallel_profit'], 2) < 0 ?
                            <Icon name='md-arrow-round-down' size={14} color="#2aa44f" />
                            : null
                          }
                          {!data.od['sum_parallel_profit']?'-':(Utils.toString(Utils.calPrevData(data.d['sum_parallel_profit'], data.od['sum_parallel_profit'], 2))+'%')}
                        </Text>
                      </View>
                      <View style={styles.msgDetailRight}>
                        <Text style={styles.msgDetailCompare}>历史最高
                          <Text style={styles.historyDate}>
                          (
                            {data.max['sum_parallel_profit'] ? data.max['sum_parallel_profit']['year']+'.'+data.max['sum_parallel_profit']['month'] : null}
                            {this.state.display === 'DAY' && data.max['sum_parallel_profit'] ? '.'+ (data.max['sum_parallel_profit']['date'] || '') : null }
                          )
                          </Text>
                        </Text>
                        <Text style={styles.msgDetailComNum}>{Utils.oFixed(data.max['sum_parallel_profit'] ? data.max['sum_parallel_profit']['max'] : 0, 0, true)}元</Text>
                      </View>
                    </View>
                  </View>
                  <Icon style={styles.iconChevren} name='ios-arrow-forward' size={19}/>
                </View>
              </TouchableHighlight>
            </View>
            : null
          }
          <View>
            <View style={[styles.itemInsetLineR,{backgroundColor:'#cccccc'}]}></View>
            <TouchableHighlight style={styles.item2} underlayColor='#CCC' onPress={this._showDetail2.bind(this,{souData: data.d, type: 'sproduct_cover_ratio', index: 1}, 'parallel')}>
              <View style={styles.itemInsetBox}>
                <View style={styles.itemInsetLeft}>
                  <Image style={styles.carIcon} source={Assets.cover} />
                </View>
                <View style={styles.itemInsetRight}>
                  <View style={styles.itemRightTitle}>
                    <Text style={styles.msgInnerTitle}>覆盖率</Text>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.msgDetail}>
                      <Text style={styles.msgDetailCompare}><Text>精品</Text>   <Text style={styles.yellowPercent}>{data.d['sproduct_cover_ratio'] ? Math.round(data.d['sproduct_cover_ratio'] * 100) : 0}%</Text></Text>
                    </View>
                    <View style={styles.msgDetailRight}>
                      <Text style={styles.msgDetailCompare}><Text>延长质保</Text>   <Text style={styles.yellowPercent}>{data.d['swarrant_cover_ratio'] ? Math.round(data.d['swarrant_cover_ratio'] * 100) : 0}%</Text></Text>
                    </View>
                  </View>
                  <View style={[styles.row,styles.marginTop10]}>
                    <View style={styles.msgDetail}>
                      <Text style={styles.msgDetailCompare}><Text>保险</Text>   <Text style={styles.yellowPercent}>{data.d['sinsure_cover_ratio'] ? Math.round(data.d['sinsure_cover_ratio'] * 100) : 0}%</Text></Text>
                    </View>
                    <View style={styles.msgDetailRight}>
                      <Text style={styles.msgDetailCompare}><Text>汽车美容</Text>   <Text style={styles.yellowPercent}>{data.d['sbeauty_cover_ratio'] ? Math.round(data.d['sbeauty_cover_ratio'] * 100) : 0}%</Text></Text>
                    </View>
                  </View>
                  <View style={[styles.row,styles.marginTop10]}>
                    <View style={styles.msgDetail}>
                      <Text style={styles.msgDetailCompare}><Text>其他</Text>   <Text style={styles.yellowPercent}>{data.d['sfee_cover_ratio'] ? Math.round(data.d['sfee_cover_ratio'] * 100) : 0}%</Text></Text>
                    </View>
                    <View style={styles.msgDetailRight}>
                      <Text style={styles.msgDetailCompare}><Text>分期贷款</Text>   <Text style={styles.yellowPercent}>{data.d['service_fee_cover_ratio'] ? Math.round(data.d['service_fee_cover_ratio'] * 100) : 0}%</Text></Text>
                    </View>
                  </View>
                </View>
                <Icon style={styles.iconChevren} name='ios-arrow-forward' size={23}/>
              </View>
            </TouchableHighlight>
          </View>
          <View style={[styles.itemInsetLineR,{backgroundColor:'#cccccc'}]}></View>
          <TouchableHighlight style={styles.item} underlayColor='#CCC' onPress={this._showDetail2.bind(this,{souData: data.d, type: 'sum_parallel_earn', index: 2}, 'parallel')}>
            <View style={styles.itemInsetBox}>
              <View style={styles.itemInsetLeft}>
                <Image style={styles.carIcon} source={Assets.dao} />
              </View>
              <View style={styles.itemInsetRight}>
                <View style={styles.itemRightTitle}>
                  <Text style={styles.msgInnerTitle}>水平销售额</Text>
                  <Text style={styles.msgInnerNum}>{Utils.oFixed(data.d['sum_parallel_earn'], 0, true) || 0}</Text>
                  <Text style={styles.msgInnerFlat}>元</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.msgDetail}>
                    <Text style={styles.msgDetailCompare}>较前一{this.state.display === 'DAY' ? '日' : '月'}</Text>
                    <Text style={styles.msgDetailComNum}>
                    {
                      Utils.calPrevData(data.d['sum_parallel_earn'], data.od['sum_parallel_earn'], 2) > 0 ?
                      <Icon name='md-arrow-round-up' size={14} color="#e52113" />
                      : null
                    }
                    {
                      Utils.calPrevData(data.d['sum_parallel_earn'], data.od['sum_parallel_earn'], 2) < 0 ?
                      <Icon name='md-arrow-round-down' size={14} color="#2aa44f" />
                      :null
                    }

                    {!data.od['sum_parallel_earn']?'-':(Utils.toString(Utils.calPrevData(data.d['sum_parallel_earn'], data.od['sum_parallel_earn'], 2))+'%')}
                    </Text>
                  </View>
                  <View style={styles.msgDetailRight}>
                    <Text style={styles.msgDetailCompare}>历史最高
                      <Text style={styles.historyDate}>
                        (
                          {data.max['sum_parallel_earn'] ? data.max['sum_parallel_earn']['year']+'.'+data.max['sum_parallel_earn']['month'] : null}
                          {this.state.display === 'DAY' && data.max['sum_parallel_earn'] ? '.'+ (data.max['sum_parallel_earn']['date'] || '') : null }
                        )
                      </Text>
                    </Text>
                    <Text style={styles.msgDetailComNum}>{Utils.oFixed(data.max['sum_parallel_earn'] ? data.max['sum_parallel_earn']['max'] : 0, 0, true)}元</Text>
                  </View>
                </View>
              </View>
              <Icon style={styles.iconChevren} name='ios-arrow-forward' size={23}/>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container} onStartShouldSetResponder={() => this._onTouchUp()}>
        <Header leftPress={Actions.pop} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} title={this.state.orgsName ? this.state.orgsName + ' ': null} titleIcon={{name:"ios-arrow-down",size:23}}  titlePress={() => this._changeOrgs()} />
        <View style={styles.dateSetBox}>
          <TouchableOpacity activeOpacity={0.6}  style={styles.startDate} onPress={() => this._onPrev()}>
             <Text style={styles.dateText}> {this.state.display === 'DAY' ? '前一日' : '上一月'} </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6}  style={styles.dateMain} onPress={() => this._onShowChangeType()}>
            <Text style={styles.dateText}>
              {Utils.toDisDate(this.state.date, this.state.display)} <Icon name="md-arrow-dropdown" size={20} color="#999" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6}  style={styles.dateEnd} onPress={() => this._onNext()}>
             <Text style={[styles.dateText],{fontSize:Utils.normalize(16), color:this.state.date === Utils.toMinDate(new Date(), this.state.display) ? '#a3a6b8' : '#83879d'}}>
               {this.state.display === 'DAY' ? '后一日' : '下一月'}
             </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              style={{backgroundColor:'transparent'}}
              refreshing={this.state.isRefreshing}
              onRefresh={() => this._refresh()}
              tintColor="#ff5555"
              title="加载中..."
              colors={['#FF5555']}
              progressBackgroundColor="#fff"
            />}
          >
          <View>
            <ListView dataSource={this.state.dataSource} renderRow={this._renderRow.bind(this)} />
          </View>
          <View style={[styles.h10]}></View>
          <View>
            <ListView dataSource={this.state.dataSource2} renderRow={this._renderRowHorizontal.bind(this)} />
          </View>
          <View style={[styles.h10]}></View>
        </ScrollView>
        {
          this.state.showDisplay ?
          <View style={styles.lightOverlay}>
            <View style={styles.changeDisplayTyped}>
              <View style={this.state.display === 'DAY' ? styles.changeButtonWapperCurrent : styles.changeButtonWapper}><Text style={this.state.display === 'DAY' ? styles.changeButtonCurrent : styles.changeButton} onPress={() => this._onChangeTyped('DAY')}>按日</Text></View>
              <View style={this.state.display === 'MONTH' ? styles.changeButtonWapperCurrent : styles.changeButtonWapper}><Text style={this.state.display === 'MONTH' ? styles.changeButtonCurrent : styles.changeButton} onPress={() => this._onChangeTyped('MONTH')}>按月</Text></View>
            </View>
          </View>
          : null
        }
        {this.state.orgsN ?
          <Animated.View style={[styles.container,{position:'absolute',flex:1,width:Utils.width,height:Utils.height,top:this.state.orgsTop}]}>
            <View style={styles.navbar}>
              <Text style={styles.navLeftButton}></Text>
              <Text style={styles.navTitle}>{this.state.parentOrgs.name}</Text>
              <Text style={styles.navRightButton} onPress={this._onBack.bind(this, 'finish')}>完成</Text>
            </View>
            <ScrollView>
              <ListView style={{width:Utils.width}} dataSource={this.state.orgSource} renderRow={this._orgsRow.bind(this)} />
            </ScrollView>
          </Animated.View>
          :null
        }
        {
          //this.state.orgsN&&Device.isAndroid&&this.state.orgShow?
          //   <View style={[styles.overlay,{top:Utils.normalize(64)}]}>
          //   <ScrollView>
          //     <ListView style={{width:200, height:420}} dataSource={this.state.orgSource} renderRow={this._orgsRow.bind(this)} />
          //    </ScrollView>
          //   </View>
          // :null
        }
        {
          //Device.isAndroid&&this.state.orgShow?<View style={{borderWidth:11,borderTopColor:'rgba(0,0,0,0)',borderLeftColor:'rgba(0,0,0,0)',borderRightColor:'rgba(0,0,0,0)',borderBottomColor:'#fff',width:0,height:0,position:'absolute',left:Utils.normalize((Utils.width-12)/2),top:42}}></View>:null
        }
        {this.state.showLoading ? <Loading /> : null}
      </View>
    )
  }
}

export default Sales
