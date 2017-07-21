
/**
* 接收参数：
* 点击事件---touchEvent--- 传入的方法接收连个返回两个值 1，日期 2.类型（'DAY' or 'MONTH'）
* 日期类型---timeType--- eg: {timeType:'DAY'} 按天或按月显示
* 开始时间---startTime--- eg: 默认值 {startTime = '2015/01/01'}
* 选中日期---checkDate--- eg: {checkDate:'2016/11/01'}
* 头部样式---headerStyle--- 默认 {backgroundColor:'#f5f5f5'},
* 头部文字---textColor--- 默认 {color:'#999'},
*/

'use strict';

import React, { Component } from 'react';
import {
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  ListView,
  RefreshControl,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import styles from '../common/styles';
import {Utils, Assets,Device,Holiday} from "../base";
import {Loading} from '../components';

let monthNum;//从开始时间到现在一共多少个月
let yearNum; //从开始时间到现在一共多少年
let startYear;//日历起始日期
let scrollViewHeight = 0;
let height = 0;//跳到指定位置
let heightArr;//每个月内容高度数组
let items = [];//按月渲染数据

class Calendar extends  Component{
  // 构造
  constructor(props) {
    super(props);
    let getSectionData = (dataBlob, sectionID) => {
        return dataBlob[sectionID];
    };
    let getRowData = (dataBlob, sectionID, rowID) => {
        return dataBlob[sectionID + ':' + rowID];
    };
    let dataSource = new ListView.DataSource({
        getRowData: getRowData,
        getSectionHeaderData: getSectionData,
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    })
    let nowTime = new Date();
    startYear = this.props.startTime ? this.props.startTime : new Date('2012-01-01');
    //从开始时间到现在一共多少个月
    monthNum = (nowTime.getFullYear() - startYear.getFullYear() == 0) ? (nowTime.getMonth() - startYear.getMonth()) + 1 : (nowTime.getFullYear() - startYear.getFullYear())*12 + (nowTime.getMonth() - startYear.getMonth()) + 1;
    //从开始时间到现在一共多少年
    yearNum = nowTime.getFullYear() - startYear.getFullYear() + 1;
    this.state = {
      dataSource,
      timeType: '',
      loadingShow: true,
      //开始时间
      startTime: startYear,
      //头部样式
      headerStyle: this.props.headerStyle || {backgroundColor:'#f5f5f5'},
      textColor: this.props.textColor || {color:'#999'},
      //选中样式
      checkStyle: this.props.checkStyle || {},
    };
  }

  componentDidMount(){
    let res;
    items = [];
    this._renderMonth(items);
    if(this.props.timeType == 'DAY'){
      res = this._renderCale(true);
      setTimeout(()=>{
        this.setState({dataSource: this.state.dataSource.cloneWithRowsAndSections(res.dataBlob,res.sectionIDs,res.rowIDs)});
      },500)
    } else {
      res = this._renderCale(false);
      setTimeout(()=>{
        this.setState({dataSource: this.state.dataSource.cloneWithRowsAndSections(res.dataBlob,res.sectionIDs,res.rowIDs)});
      },500)
    }
  }

  componentDidUpdate() {
    if(this.props.timeType == 'DAY'){
      this.refs._listView.scrollTo({x: 0, y: height, animated: false});
    }
  }

  //计算按天渲染的数据
  _renderCale(first){
    let dataBlob = {};
    let rowIDs = [];
    let sectionIDs = [];
    let date = startYear;//日历开始时间
    let num = monthNum;//日历开始到现在总月份数
    let check = this.props.checkData || null;
    let dateNow = new Date();
    heightArr = [];
    let canPress = true;
    scrollViewHeight = 0;
    for(let n = 0; n < num; n++){
      //清明节计算
      let Y = new Date(date.getFullYear(), date.getMonth()+n ).getFullYear() % 100,
          D = 0.2422,
          C = 4.81,
          L = Math.floor(Y/4),
          qingMing =  '04/0' + Math.floor((Y*D+C)-L);

      let rows = [];//一个月
      let newDate = new Date(date.getFullYear(),date.getMonth() + 1 + n,0);//天数
      let week  = new Date(date.getFullYear(),date.getMonth()+n,1).getDay()+1;//月份开始的星期

      if(week === 0){
        week = 7;
      }
      let counts = newDate.getDate();
      let rowCounts = Math.ceil((counts + week - 1) / 7);//本月行数
      heightArr.push(rowCounts * Utils.normalize(50) + Utils.normalize(35));
      if( n > 0){
        scrollViewHeight = scrollViewHeight + heightArr[n-1]
      }
      for(let i = 0; i < rowCounts; i++){
        let days = [];

        for(let j = (i * 7) + 1; j < ((i+1) * 7) + 1; j++){
          //根据每个月开始的［星期］往后推
          let dayNum = j - week + 1;
          if(dayNum > 0 && j < (counts + week)){
            let dateObj = new Date(date.getFullYear(), date.getMonth()+n, dayNum);
            let midMonth = (dateObj.getMonth() + 1) > 9 ? (dateObj.getMonth() + 1) : '0' + (dateObj.getMonth() + 1);
            let midDay = dayNum > 9 ? dayNum : '0' + dayNum;
            let dateStr = dateObj.getFullYear() + '/' + midMonth + '/' + midDay;
            let grayStyle = {};
            let bk = {};
            let key = dateStr.substr(-5); //'month/day'格式字符
            //今天
            let curDate = new Date(date.getFullYear(), date.getMonth() + n, dayNum);
            let curDatePlus = new Date(date.getFullYear(), date.getMonth() + n, dayNum + 1);
            if(Utils.formatDate(dateNow) == Utils.formatDate(curDate)){
              grayStyle = {
                color: '#37c348',
                fontSize: Utils.normalize(15),
              };
              dayNum = '今天';
            }else{
              //节假日处理
              let midStyle = {
                color: dateNow >= curDatePlus ? '#ff0012' : '#ccc',
                fontSize: Utils.normalize(15),
              };

              //公历假期
              if(Holiday.solar[key]){
                grayStyle = midStyle;
                dayNum = Holiday.solar[key].name;
              }
              else if(qingMing == key){
                grayStyle = midStyle;
                dayNum = '清明节';
              }

              //农历假期
              let lunarDay = Utils.calanderSwitch.solar2lunar(dateObj.getFullYear(),midMonth,midDay);
              let lunarDayKey = (lunarDay.lMonth > 9 ? lunarDay.lMonth : '0' + lunarDay.lMonth)  + '/' + (lunarDay.lDay > 9 ? lunarDay.lDay : '0' + lunarDay.lDay);
              if(Holiday.lunar[lunarDayKey]){
                grayStyle = midStyle;
                dayNum = Holiday.lunar[lunarDayKey].name;
              }

              //周六周日 红色文字
              if(j % 7 == 0 || j % 7 == 1){
                if(dateNow >= curDatePlus){
                  grayStyle = {
                    color: '#ff0012',
                    fontSize: Utils.normalize(15),
                  };
                }
              }
            }
            //标记的
            if(first && check == dateStr){
              if(dayNum.length > 2){
                bk = {
                  backgroundColor:'#37c348',
                  borderRadius: Utils.normalize(10),
                  paddingLeft: Utils.normalize(4),
                  paddingRight: Utils.normalize(4),
                  paddingTop: Utils.normalize(3),
                  paddingBottom: Utils.normalize(3),
                };
                grayStyle = {
                  color: '#fff',
                  fontSize: Utils.normalize(12),
                };
              } else {
                bk = {
                  backgroundColor:'#37c348',
                  borderRadius: Utils.normalize(11),
                  paddingLeft: Utils.normalize(10),
                  paddingRight: Utils.normalize(10),
                  paddingTop: Utils.normalize(2),
                  paddingBottom: Utils.normalize(2),
                };
                grayStyle = {
                  color: '#fff',
                  fontSize: Utils.normalize(15),
                };
              }
              height = scrollViewHeight;
            }

            //如果当前日期大于今天，变灰
            if(dateNow < curDate){
              bk = {};
              grayStyle = {
                color: '#ccc',
                fontSize: Utils.normalize(15),
              };
              canPress = false;
            }

            days.push(
              {
                bk : bk,
                grayStyle : grayStyle,
                dayNum : dayNum,
                dateStr : dateStr,
                canPress : canPress
              }
            );
          } else {
            days.push(
              {
                bk : null,
                grayStyle : null,
                dayNum : null,
                dateStr : null,
                canPress : false,
              }
            );
          }
        }
        rows.push(
          days
        );
      }
      sectionIDs.push(
        's'+ n
      )
      rowIDs.push(
        [2*n + 1]
      )
      dataBlob['s'+n] = {
        year: newDate.getFullYear(),
        month: (newDate.getMonth() + 1) > 9 ? newDate.getMonth() + 1 : '0' + (newDate.getMonth() + 1),
        yearText: newDate.getFullYear()+ '年' + (newDate.getMonth() + 1) + '月',
        rows:rows,
        height: scrollViewHeight,
        id: 2*n
      };
      dataBlob['s'+n+':'+(2*n+1)] = {
        year: newDate.getFullYear(),
        month: (newDate.getMonth() + 1) > 9 ? newDate.getMonth() + 1 : '0' + (newDate.getMonth() + 1),
        yearText: newDate.getFullYear()+ '年' + (newDate.getMonth() + 1) + '月',
        rows:rows,
        height: scrollViewHeight,
        id: 2*n+1
      };
    }
    if(!first){
      height = scrollViewHeight - (Utils.height - Utils.normalize(143) - heightArr[num -1])
    }
    return {
      dataBlob: dataBlob,
      rowIDs: rowIDs,
      sectionIDs: sectionIDs
    };
  }

  //渲染listView--Row部分
  _renderRow(data,sectionID,rowID){
    let rows = [];
    for(let i in data.rows){
      let days = [];
      let rowData = data.rows[i];
      rowData.map((item,j)=>{
        if(item.dayNum){
          days.push(
            <TouchableHighlight key={sectionID + '-' + i + '-' + j} style={[cale_styles.flex_1]} underlayColor="#fff" onPress={this.props.touchEvent && item.canPress ? this.props.touchEvent.bind(this, item.dateStr, 'DAY') : null}>
            {
              item.bk.backgroundColor ?
              <View style={item.bk}>
                <Text style={item.grayStyle}>{item.dayNum}</Text>
              </View>
              : <Text style={item.grayStyle}>{item.dayNum}</Text>
            }
            </TouchableHighlight>
          );
        } else {
          days.push(
            <TouchableHighlight key={sectionID + '-' + i + '-' + j} style={[cale_styles.flex_1]} underlayColor="#fff">
              <Text></Text>
            </TouchableHighlight>
          );
        }
      });
      rows.push(
        <View key={'days' + i} style={cale_styles.row}>{days}</View>
      )
    }
    return (
      <View style={cale_styles.cm_bottom}>
        {rows}
      </View>
    )
  }

  //渲染listView--Section部分
  _renderSectionHeader(sectionData, sectionID){
      if(sectionData && sectionData['id']%2 == 0){
          return (
            <View style={[cale_styles.month]}>
              <Text style={cale_styles.month_text}>{sectionData.yearText}</Text>
            </View>
          )
      }else{
          return (<Text></Text>);
      }
  }

  //按月渲染
  _renderMonth(items){
    let date = startYear;
    let num = yearNum;
    let check = this.props.checkData || null;
    let dateNow = new Date();
    let canPress = true;
    for(let n = 0; n < num; n++){
      let keyFlag = Math.random();//唯一的key
      let curYear = date.getFullYear() + n;
      let rows = [];
      for(let i = 0; i < 2; i++){
        let months = [];
        for(let j = 1; j < 7; j++){
          let grayStyle = {};
          let bk = {};
          let curMonth = (i * 6 + j) + '月';
          let curDate = curYear + '/' + (i * 6 + j);
          //YYYYMM
          let curDate2 = curYear + '/' + ((i * 6 + j) > 9 ? (i * 6 + j) : '0' + (i * 6 + j));
          let today = dateNow.getFullYear() + '/' + (dateNow.getMonth() + 1);
          //本月
          if(curDate == today){
            curMonth = '本月';
            grayStyle = {
              color: '#37c348',
              fontSize: Utils.normalize(15),
            };
          }
          //标记
          if(check){
            let midCheck = check.substr(0,7);
            if(midCheck == curDate2){
              bk = {
                backgroundColor:'#37c348',
                borderRadius: Utils.normalize(11),
                paddingLeft: Utils.normalize(10),
                paddingRight: Utils.normalize(10),
                paddingTop: Utils.normalize(2),
                paddingBottom: Utils.normalize(2),
              };
              grayStyle = {
                color: '#fff',
                fontSize: Utils.normalize(15),
              };
            }
          }
          //本月之后的月份
          if(curYear >= dateNow.getFullYear()){
            if((i * 6 + j) > (dateNow.getMonth() + 1)){
              grayStyle = {
                color: '#ccc',
                fontSize: Utils.normalize(15),
              };
              bk = {};
              canPress = false;
            }
          }
          months.push(
            <TouchableHighlight key={n + '-' + j + '-' + i} activeOpacity={0.6} style={[cale_styles.flex_1]} underlayColor="#fff" onPress={this.props.touchEvent && canPress ?this.props.touchEvent.bind(this, curDate2,'MONTH'):null}>
              <View style={bk}>
                <Text style={grayStyle}>{curMonth}</Text>
              </View>
            </TouchableHighlight>
          );
        }
        rows.push(
          <View key={n + '-' + i} style={cale_styles.row}>{months}</View>
        );
      }
      items.push(
        <View key={keyFlag} style={[cale_styles.cm_bottom]}>
          <View style={cale_styles.month}>
            <Text style={cale_styles.month_text}>{curYear}年</Text>
          </View>
          {rows}
        </View>
      );
    }
  }


  render() {
    return (
        this.props.timeType == 'DAY' ?
        <View style={cale_styles.calendar_container}>
          <View style={[cale_styles.headerRow, cale_styles.row_header, this.state.headerStyle]}>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>日</Text>
            </View>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>一</Text>
            </View>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>二</Text>
            </View>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>三</Text>
            </View>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>四</Text>
            </View>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>五</Text>
            </View>
            <View style={[cale_styles.flex_1]}>
              <Text style={this.state.textColor}>六</Text>
            </View>
          </View>
          {
            false ?
            <ScrollView
            style={{flex:1}}
            ref='_scrollView'
            >
            {items}
            <View onLayout={e => scrollViewHeight = e.nativeEvent.layout.y}></View>
            </ScrollView>
            : null
          }
          <ListView
            ref='_listView'
            style={{flex:1}}
            dataSource={this.state.dataSource}
            renderRow={(rowData, sectionID, rowID, highlightRow) => this._renderRow(rowData, sectionID, rowID, highlightRow)}
            renderSectionHeader = {this._renderSectionHeader}
            initialListSize={monthNum}
            >
          </ListView>
        </View>
        :
        <View style={cale_styles.calendar_container}>
          <ScrollView style={{flex:1}} ref='_scrollView'>
            {items}
          </ScrollView>
        </View>
    )
  }
}

var cale_styles = StyleSheet.create({
  flex_1:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  calendar_container:{
    backgroundColor:'#fff',
    flex:1,
    borderTopWidth:Utils.normalize(1),
    borderBottomWidth:Utils.normalize(1),
    borderColor:'#ccc'
  },
  row_header:{
    borderBottomWidth:Utils.normalize(1),
    borderBottomColor:'#ccc',
  },
  headerRow:{
    flexDirection:'row',
    height:Utils.normalize(35),
  },
  row:{
    flexDirection:'row',
    height:Utils.normalize(50),
  },
  month:{
    justifyContent:'center',
    height:Utils.normalize(34),
    backgroundColor:"#f1f7fc",
    paddingLeft:Utils.normalize(17)
  },
  month_text:{
    fontSize:Utils.normalize(15),
    fontWeight:'400',
  },
  week_highlight:{
    color:'#23B8FC'
  },
  cm_bottom:{
    borderBottomWidth:Utils.normalize(1),
    borderBottomColor:'#fff',
    overflow: 'hidden'
  }
});

export default Calendar;
