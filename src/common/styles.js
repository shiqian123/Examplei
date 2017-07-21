/**
* @Author: Shen
* @Date:   2016-08-05T12:10:46+08:00
* @Email:  ihaiyon@gmail.com
* @Last modified by:   shiqian
* @Last modified time: 2016-11-14T14:39:40+08:00
*/

import {
  StyleSheet
} from 'react-native'
import {Utils, Device} from "../base";
import Icon from 'react-native-vector-icons/Ionicons'

const styles = StyleSheet.create({
  /**
   * 全局
   */
  container: {
    flex: 1,
    backgroundColor: '#efefef'
  },
  viewContainer: {
    // alignItems: 'center'
    // backgroundColor:'#FFF',
    flex: 1
  },
  navBarStyle: {
    backgroundColor: '#5090FD',
  },
  navButtonTextStyle: {
    // fontSize:12,
    paddingTop: 2,
    color: '#fff'
  },
  tabBarContainer: {
    borderTopColor: '#BBB',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  tabItems: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 5,
  },
  tabItemText: {
    paddingTop: 2,
    fontSize:15,
    color: '#929292'
  },
  navbar: {
    flexDirection: 'row',
    paddingTop: Utils.andr21Normalize(20),
    height: Utils.andr21Normalize(64),
    backgroundColor: '#387ff5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navLeftButton: {
    flex: Device.iOS ? 1 : 0,
    width: Device.iOS ? 0 : Utils.normalize(40),
    color: '#fff',
    paddingLeft: 10,
    fontSize: Utils.normalize(18),
    textAlign: 'left',
    paddingTop: 5,
  },
  navTitle: {
    flex: 5,
    color: '#fff',
    fontSize: Utils.normalize(18),
    paddingTop: 5,
    fontWeight: 'bold',
    textAlign: Device.iOS ? 'center' : 'left'
  },
  navRightButton: {
    flex: 1,
    fontSize: Utils.normalize(18),
    textAlign: 'right',
    color: '#fff',
    paddingRight: 10,
    paddingTop: 5,
  },
  h10: {
    height: Utils.normalize(10),
  },
  h30: {
    height: Utils.normalize(15)
  },
  h56: {
    height: Utils.normalize(56),
  },
  f13:{
    fontSize:Utils.normalize(13)
  },
  f14:{
    fontSize:Utils.normalize(14)
  },
  f15:{
    fontSize:Utils.normalize(15)
  },

  text: {
    color: '#666',
    fontSize: Utils.normalize(14),
  },
  fullButtonGroup: {
    width: Utils.width,
    height: Utils.normalize(45),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    borderWidth: 0.5, //Utils.normalize(1),
    borderColor: '#ccc',
    marginTop: -1,
  },
  fullButtonGroupA: {
    height: Utils.normalize(45),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    borderTopWidth: 0.5, //Utils.normalize(1),
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    marginTop: -1,
  },
  fullButtonText: {
    fontSize: Utils.normalize(16),
    textAlign: 'center',
  },
  fullButtonTextLeft: {
    fontSize: Utils.normalize(16),
    textAlign: 'left',
    marginLeft: 10,
  },
  seTright: {
    color: '#c8c7cd',
    position: 'absolute',
    right: 15,
    top: 15
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: -1,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    // backgroundColor: 'red',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightOverlay: {
    position: 'absolute',
    top: Device.iOS ? Utils.normalize(108) : Utils.normalize(109),
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(221, 221, 221, 0.3)',
    // backgroundColor: 'red',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  /**
   * 登录
   */
  loginContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingTop: 45,
  },
  logoContainer: {
    paddingTop: 30,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    // 垂直居中
    justifyContent: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: 'center',
  },
  inputContainer: {
    // paddingTop: 30,
    borderRadius: 0,
    overflow: 'hidden',
    // paddingBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  check:{
    marginTop:20,
    marginBottom:10,
    flexDirection:'row',
    justifyContent: 'flex-end'
  },
  checkText:{
    marginTop:1,
    marginLeft:4,
    color:'#888'
  },
  icon: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    top: 12,
    right: 0
  },
  inputs: {
    height: 50,
    width: Utils.width - 30,
    fontSize: Utils.normalize(16),
    paddingLeft: 40,
    paddingRight: 35,
  },
  inputLeftIcon: {
    position: 'absolute',
    width: 30,
    height: 22,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#ccc',
    justifyContent: 'center',
    left: 0,
    top: 14,
  },
  pwdInputs: {
    height: 50,
    width: Utils.width - 30 - 30,
    fontSize:16,
    padding: 10,
  },
  line: {
    width: Utils.width - 30,
    height: Utils.pixel,
    backgroundColor: '#CCC',
  },
  lineFull: {
    width: Utils.width,
    height: Utils.pixel,
    backgroundColor: '#ccc',
  },
  lineM10: {
    width: Utils.width - Utils.normalize(10),
    marginLeft: Utils.normalize(10),
    height: Utils.pixel,
    backgroundColor: '#CCC'
  },
  btnGroup: {
    marginTop: 12,
  },
  loginButton: {
    alignItems: 'center',
    width: Utils.width - 30,
    height: 40,
    backgroundColor: '#fec900',
    borderRadius: 5,
    paddingBottom:2,
  },
  loginText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight:'bold',
    color: '#fff',
  },
  /**
   * 简报
   */
  dateSetBox: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  changeDisplayTyped: {
    width: Utils.width,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDD'
  },
  changeButtonWapper: {
    height: 45,
    justifyContent: 'center',
    borderBottomWidth: 2,
    flex: 1,
    borderBottomColor: '#FFF',
  },
  changeButtonWapperCurrent: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff5555',
    height: 45,
    flex: 1,
    justifyContent: 'center',
  },
  changeButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#f20',
    textAlign: 'center',
    fontSize:18,
    color: '#515567',
  },
  changeButtonCurrent: {
    borderBottomWidth: 2,
    borderBottomColor: '#f20',
    fontSize:18,
    textAlign: 'center',
    color: '#ff5555',
  },
  startDate: {
    flex: 1,
  },
  dateMain: {
    flex: 4,
  },
  dateEnd: {
    flex: 1,
  },
  dateText: {
    textAlign: 'center',
    fontSize: Utils.normalize(16),
    color: '#83879d'
  },
  gap: {
    height: 5,
    backgroundColor: '#efefef'
  },
  itemfirst: {
    height: 100,
    backgroundColor: '#fff',
  },
  itemInsetLine: {
    height: 1,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderLeftColor: '#fff',
    borderRightColor: '#fff',
    backgroundColor: '#efefef',
  },
  itemInsetLineR: {
    height: 0.5,
    borderLeftWidth: 15,
    borderLeftColor: '#fff',
    backgroundColor: '#ccc',
  },
  itemBox: {
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    flex: 1,
  },
  itemRightTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  itemTitle: {
    height: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingBottom:3
  },
  rect: {
    color: '#51a7fb',
    fontWeight: 'bold',
    fontSize: 20,
  },
  sectitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    marginTop:3,
  },
  item: {
    height: 120,
    backgroundColor: '#fff',
    flex: 1
  },
  item2: {
    height: 150,
    backgroundColor: '#fff',
    flex: 1
  },
  itemInsetBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fcfcfc'
  },
  carIcon: {
    width: 55,
    height: 55,
    alignSelf: 'center',
    marginLeft: 15,
    marginRight: 15,
  },
  itemInsetLeft: {
    justifyContent: 'center'
  },
  itemInsetRight: {
    flex: 1,
    flexDirection: 'column'
  },
  msgBox: {
    flex: 19
  },
  msgTitle: {
    height: 53,
    justifyContent: 'center'
  },
  msgInnerTitle: {
    fontSize: 16,
    color: '#000000',
    marginRight: 5,
  },
  msgInnerNum: {
    fontSize: 17,
    color: '#ff9000',
  },
  msgInnerFlat: {
    marginLeft: 5,
    fontSize: 13,
    color: '#999999'
  },
  msgDetail: {
    flex: Utils.width > 320 ? 0.8 : 0.7,
  },
  msgDetailLeft: {
    flex: 151,
  },
  msgDetailRight: {
    flex: Utils.width > 320 ? 1.2 : 1.3,
  },
  msgDetailCompare: {
    fontSize: 13,
    color: '#333333',
    marginTop: 21,
    marginLeft: 6,
  },
  msgDetailComNum: {
    marginLeft: 6,
    marginTop: 10,
    color: '#8393aa',
    fontSize: 12,
  },
  iconChevren: {
    position: 'absolute',
    top: 55,
    right: 18,
    color: '#ccc'
  },
  historyDate: {
    fontSize: 10,
  },
  modalBackgroundStyle: {
    backgroundColor: '#f5fcff',
  },
  /**
   *简报部门页
   */
  fullSonButtonGroup: {
    height: Utils.normalize(45),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    borderBottomWidth: Utils.normalize(0.6),
    borderColor: '#bbb',
    marginLeft: Utils.normalize(15),
    flex:1,
    width: Utils.width
  },
  fullSonButtonText: {
    fontSize: Utils.normalize(16),
    textAlign: 'left',
  },
  selectRight: {
    position: 'absolute',
    right: 30,
    top: 13
  },
  /**
   * 简报详细
   */

  tabContainer: {
    height: 44,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
  },
  scrollView: {
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  today: {
    height: 36,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    paddingLeft: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd'
  },
  date: {
    fontSize:16,
    color: '#666'
  },
  detailContainer: {
    flex: 1,
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
    marginBottom: 20 * Utils.pixel,
    backgroundColor: '#FFF',
    marginTop: -1
  },
  title: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    // height: 20,
    fontSize:16,
  },
  HBarChart: {
    height: 120,
    marginRight: 15,
    marginTop: -30,
    marginBottom: 30
  },
  proTitle: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#dcdcdc"
  },
  proRow: {
    marginLeft: 15,
    marginRight: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  proRowLine: {
    height: 1,
    backgroundColor: "#dcdcdc",
    left: 15,
    right: 15
  },
  proRowText: {
    color: '#434343',
    paddingTop: 5,
    paddingBottom: 5,
  },
  lineChart: {
    // width: Utils.width / 1.1,
    height: Utils.height / 3,
    marginTop: -10,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 30
  },
  profitBox: {
    flex: 1,
    flexDirection: 'row',
    height: Utils.normalize(44),
    alignItems: 'center',
    borderBottomColor: '#CCC',
    borderBottomWidth: 0.5,
    marginLeft: 2,
    marginRight: 2,
    paddingLeft: 12,
    paddingRight: 12
  },
  profit: {
    flex: 1,
    height: Utils.normalize(44),
    justifyContent: 'center',

  },
  profitActive: {
    marginTop: 1,
    borderBottomColor: '#ff0012',
    borderBottomWidth: 2,
  },
  profitTitle: {
    fontSize: Utils.normalize(15),
    textAlign: 'center',
    alignItems: 'center',
    color: '#5090fd',
    marginLeft:10,
    marginRight:10,
  },
  profitTitleActive: {
    color: '#ff0012',
    fontSize: Utils.normalize(15),
    textAlign: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  yellowPercent:{
    position: 'relative',
    left: 10,
    color: '#ff9000',
  },
  marginTop10: {
    marginTop: -10,
  },
  /**
   * 关于
   */
  aboutContent: {
    flex: 1,
    alignItems: 'center',
  },
  aboutLogoBlack: {
    width: Utils.normalize(105),
    height: Utils.normalize(105),
    backgroundColor: '#FFF',
    borderRadius: Utils.normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 108,
    // marginBottom: 66 * Utils.pixel,
  },
  meInfo: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  meBackgroundImageWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  meDetailPic: {
    width: Utils.normalize(85),
    height: Utils.normalize(85),
    backgroundColor: '#fe8e7f',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: Utils.normalize(500),
    borderWidth: Utils.normalize(2),
    borderColor: '#fff'
  },
  meDetailTxt: {
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  meBackgroundImage: {
    height: Utils.normalize(204),
    width: Utils.width,
    overflow: 'hidden',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
    // resizeMode: 'stretch'
  },
  aboutLogo: {
    width: Utils.normalize(90),
    height: Utils.normalize(90),
    alignSelf: 'center',
  },
  meSetIcon: {
    width: Utils.normalize(22),
    height: Utils.normalize(22),
    marginLeft: 15
  },

  /*
   *网络错误
   */
  netErrBox: {
    backgroundColor: '#fff',
    flex: 1
  },
  netErrImage: {
    width: 264 * Utils.pixel,
    height: 246 * Utils.pixel,
    marginTop: 156 * Utils.pixel,
    alignSelf: 'center'
  },
  netErrText: {
    alignSelf: 'center',
    marginTop: 45 * Utils.pixel,
    fontSize: 15,
    color: '#999999'
  },
  netErrbutton: {
    paddingTop: 18 * Utils.pixel,
    paddingBottom: 18 * Utils.pixel,
    width: 156 * Utils.pixel,
    marginTop: 45 * Utils.pixel,
    borderRadius: 5,
    borderColor: '#387ff5',
    borderWidth: 0.5,
    fontSize: 16,
    color: '#387ff5',
    textAlign: 'center',
    alignSelf: 'center'
  },
  /*
  *消息
  */
  msgSerach:{
    padding:0,
    height: Utils.normalize(40),
    borderWidth: 0,
    fontSize:14,
    color:'#000000',
    paddingLeft:25,
    marginTop: Utils.normalize(-5)
  },
  fmsgSerach:{
    marginTop:7,
    marginLeft:10,
    marginRight:10,
    marginBottom:7,
    height:28,
    width:Utils.width - 20,
    backgroundColor:'#fff',
    borderRadius:3,
    fontSize:14,
    color:'#000000',
    paddingLeft:25
  },
  serachIcon:{
    position:'absolute',
    left:6,
    top:Device.isiOS ? 0 : 5,
    backgroundColor:'rgba(255,255,255,0)',
  },
  serachCleanIcon:{
    position:'absolute',
    right:8,
    top: 5,
    backgroundColor:'rgba(255,255,255,0)',
  },
  msgBlock:{
    position:'relative',
    flexDirection:'row',
    flex:1,
    overflow: 'hidden'
  },
  msgRowBox:{
    width:20
  },
  msgRowContent:{
    flex:1,
    borderBottomColor:'#cccccc',
    borderBottomWidth:0.5,
  },
  msgRowCircle:{
    marginTop:24,
    marginLeft:10
  },
  msgRow1:{
    marginTop:20,
    flexDirection:'row'
  },
  msgName:{
    fontSize:Utils.normalize(15),
    color:'#000',
    flex:1
  },
  msgTime:{
    flex:1,
    color:'#999',
    fontSize:Utils.normalize(10),
    textAlign:'right',
    marginRight:42
  },
  msgRow2:{
    marginTop:15,
    flexDirection:'row'
  },
  msgStatus:{
    flex:1,
    fontSize:Utils.normalize(13)
  },
  msgSale:{
    flex:2,
    fontSize:Utils.normalize(13)
  },
  msgRow3:{
    marginTop:4,
    marginBottom:11,
    flexDirection:'row'
  },
  msgSys:{
    flex:2,
    marginTop:5,
    marginRight:2,
    textAlign:'left',
    fontSize: Utils.normalize(13)
  },
  msgDetailX:{
    width:Utils.normalize(60),
    height:Utils.normalize(25),
    borderColor:'#387ff5',
    borderWidth: Utils.pixel,
    marginRight:42,
    alignItems:'center',
    borderRadius:4,
    justifyContent:'center'
  },
  msgDetailText:{
    paddingTop:5,
    paddingBottom:5,
    width:64,
    borderWidth:1,
    borderColor:'#387ff5',
    borderRadius:5,
    marginLeft:6
  },
  msgDetailTxt:{
    fontSize:12,
    textAlign:'center',
    color:'#387ff5',
  },
  rightBtn:{
    width:20,
    height:20
  },
  /*
  *消息详细
  */
  md_itemTitleBox:{
    marginTop: Utils.normalize(10),
    height: Utils.normalize(28),
    justifyContent:'center',
  },
  md_itemTitle:{
    fontSize:Utils.normalize(13),
    color:'#999',
    marginLeft:15,
    flexDirection: 'row'
  },
  md_item:{
    borderColor: '#cccccc',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    backgroundColor:'#fff',
  },
  md_itemsTextBox:{
    height: Utils.normalize(31),
    alignItems: 'center',
    flexDirection: 'row'
  },
  md_itemsText:{
    fontSize:Utils.normalize(14),
    marginLeft:15,
    flex: 1
  },
  md_items:{
    borderColor: '#cccccc',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    backgroundColor:'#fff',
    flexDirection:'row',
    flexWrap:'wrap',
    flex:1,
  },
  md_itemsRow:{
    color:'#ff0012',
    textAlign:'right',
    fontSize:Utils.normalize(14),
    justifyContent:'center',
    flex: 1
  },
  mditemsBox:{
    width: Utils.width/2-8,
    height: 31,
    alignItems: 'center'
  },
  md_itemL:{
    flex:1
  },
  md_itemR:{
    flex:1
  },
  // md_itemsItem:{
  //   borderBottomColor: '#cccccc',
  //   borderBottomWidth: 0.5
  // },
  md_itemsPrice:{
    flexDirection:'row',
    height:40,
    alignItems:'center'
  },
  md_itemPriceitem:{
    flex:1,
    marginLeft:15,
    fontSize:Utils.normalize(14)
  },
  priceRed:{
    color:'#ff0012'
  },
  md_iconChevren: {
    position: 'absolute',
    top:40,
    right: 18,
    color: '#ccc'
  },
  md_iconChevrenH: {
    position: 'absolute',
    top: 50,
    right: 18,
    color: '#ccc'
  },
  md_rebate:{
    fontSize:12,
    color:'#8393aa'
  },
  yellowBtn:{
    paddingLeft:8,
    paddingRight:8,
    paddingTop:4,
    paddingBottom:4,
    borderColor:'#ffb400',
    borderWidth:1,
    color:'#ffb400',
    fontSize:Utils.normalize(12),
    borderRadius:4
 },
 blueBorBtn:{
   paddingLeft:8,
   paddingRight:8,
   paddingTop:4,
   paddingBottom:4,
   borderColor:'#387ff5',
   borderWidth:1,
   color:'#387ff5',
   fontSize:12,
   borderRadius:4
 },
 SaleReference:{
   padding:5,
   borderColor:'#6099f7',
   borderWidth:1,
   color:'#6099f7',
 },
 md_lineChevren:{
   position: 'absolute',
   top: 8,
   right: 18,
   color: '#ccc'
 },
 md_itemsTextCar:{
   marginLeft:15,
   fontSize:Utils.normalize(14),
   flex:1,
 },
 md_itemsTextCarR:{
   flex:1,
  //  height:39,
  //  lineHeight:26,
   marginRight:35,
   fontSize:Utils.normalize(14),
   textAlign:'right',
   color:'#999999'
 },
 yellowSBtn:{
   backgroundColor:'#ffb400',
   paddingTop:9,
   paddingBottom:9,
   paddingLeft:7,
   paddingRight:7,
   borderRadius:2,
   marginRight:15,
   marginTop:9,
   marginBottom:9
 },
 blueSBtn:{
   backgroundColor:'#387ff5',
   paddingTop:9,
   paddingBottom:9,
   paddingLeft:7,
   paddingRight:7,
   borderRadius:2,
   marginRight:15,
   marginTop:9,
   marginBottom:9
 },
 colorWhite:{
   color:'#fff',
 },
 bd_name:{
   fontSize:16,
   marginLeft:20,
   lineHeight:22
 },
 bd_time:{
   fontSize:12,
   color:'#999999',
   textAlign:'right',
   marginRight:22,
   lineHeight:22
 },
 bd_nameBox:{
   marginTop:5,
   height:Utils.normalize(42),
   alignItems:'center'
 },
 bd_Items:{
   marginLeft:Utils.normalize(20),
   flexDirection:'row',
   height:Utils.normalize(26),
   alignItems:'center',
   marginRight:Utils.normalize(20),
   flex:1,
 },
 bd_ItemsText:{
   color:'#8393aa',
   fontSize:Utils.normalize(14),
   lineHeight:Utils.normalize(20),
   width: Utils.normalize(70)
 },
 bd_ItemsTextR:{
   color:'#8393aa',
   fontSize:Utils.normalize(14),
   lineHeight:20,
   flex:1
 },
 bd_input:{
   position:'absolute',
   left:0,
   bottom:0,
   width:Utils.width,
   height:50,
   backgroundColor:'#efefef',
   flexDirection:'row'
 },
 bd_TextInput:{
   flex:1,
   height:Device.iOS ?Utils.normalize(28):Utils.normalize(40),
   marginTop:Device.iOS ?Utils.normalize(12):Utils.normalize(6),
   //marginTop:Utils.normalize(8),
   marginBottom:Utils.normalize(),
   marginLeft:10,
   backgroundColor:'#fff',
   fontSize:14,
   paddingLeft:10,
   borderRadius:5
 },
 bd_Send:{
   fontSize:17,
   marginTop:14,
   marginRight:6,
   marginLeft:6
 },
 bd_xiBtn:{
   width:71,
   height:Utils.normalize(25),
   alignItems:'center',
   borderWidth:1,
   borderColor:'#387ff5',
   justifyContent:'center',
   borderRadius:4
 },
 lineLebel:{
   height:30,
   justifyContent:'center',
   backgroundColor:'#fff',
   paddingLeft:15,
   borderBottomWidth:1,
   borderBottomColor:'#ccc'
 },
 bd_Bar:{
   backgroundColor:'#fff',
   paddingTop: 6,
   paddingBottom: 6
 },
 blueBtn:{
   backgroundColor:'#2eb2fd',
   padding:4,
   borderRadius:4,
   marginTop:3,
   height:18,
   justifyContent: 'center',
   alignItems: 'center'
 },
 redBtn:{
   backgroundColor:'#fd7676',
   padding:4,
   borderRadius:4,
   marginTop:3,
   height:18,
   justifyContent: 'center',
   alignItems: 'center'
 },
 textYellow:{
   color:'#ff9000'
 },
 bigBtn:{
   borderRadius:10,
   height:Utils.normalize(55),
   width:Utils.normalize(355),
   backgroundColor:'#fff',
   justifyContent:'center',
   alignItems:'center'
 },
 ballLine:{
   width:1,
   height:62,
   backgroundColor:'#ccc',
   position:'absolute',
   left:6,
   top:35
 },
 ballLineL:{
   width:1,
   height:62,
   backgroundColor:'#ccc',
   position:'absolute',
   left:6,
   top:0
 },
 ballGray:{
   width:7,
   height:7,
   borderRadius:3.5,
   backgroundColor:'#999',
   position:'absolute',
   left:3,
   top:30
 },
 ballRed:{
   width:7,
   height:7,
   borderRadius:3.5,
   backgroundColor:'#ff0012',
   position:'absolute',
   left:3,
   top:30
 },
 creditBox:{
   height:Utils.normalize(45),
   alignItems:'center',
   flexDirection:'row',
   paddingLeft:15,
   paddingRight:15
 },
 creditLeft:{
   flex:1,
   fontSize:Utils.normalize(16),
 },
 creditRight:{
   flex:1,
   textAlign:'right',
   color:'#999999',
   fontSize:Utils.normalize(16),
 },
 saleRefer:{
   flex:1,
   fontSize:13,
   textAlign:'left',

   paddingLeft:15,

   marginLeft:15
 },
  /*
   *选购
   */
   paramBox:{
     justifyContent:'center',
     paddingLeft:8,
     paddingRight:8,
     height:32,
     borderWidth:0.5,
     maxWidth:100,
     borderColor:'#ccc',
     borderRadius:4,
     marginRight:14,
     marginBottom:14
   },
  msgSerachNew:{
    height:Device.iOS ? 32 : 36,
    backgroundColor:'#fff',
    paddingLeft: 6,
    borderRadius:5,
    fontSize:14,
    color:'#000000',
    flex: 1,
  },
  inputBox: {
    height: 46,
    padding: Device.iOS ? 6 : 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    overflow: 'hidden',
  },
  inputView: {
    height: Device.iOS ? 32 : 38,
    borderColor: '#e7e7e7',
    borderWidth: 0.5,
    borderRadius: 5,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems:'center',
    paddingLeft:6,
    paddingRight:6,
    overflow: 'hidden',
  },
  serachCleanIconNew:{
    position:'absolute',
    right:10,
    top: Device.iOS ? 6 : 10,
    backgroundColor:'rgba(255,255,255,0)',
  },
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
  buttonshadow:{
    position:'absolute',
    bottom:0,
    flex:1,
    width:Utils.width,
    height:Utils.normalize(45),
    justifyContent:'center',
    borderTopWidth:1,
    borderTopColor:'#e4e4e4',
    flexDirection:'row',
    alignItems:'center',
    shadowColor:'#ccc',
    shadowOffset:{width:-2,height:-4},
    shadowOpacity:0.4,
    shadowRadius:3,
    backgroundColor: "#fff"
  },
  //详细情况
  desBox:{
    fontSize:Utils.normalize(16),
    marginTop:12,
    marginBottom:12
  },
  desText:{
    color:'#999999',
    fontSize:Utils.normalize(16),
    paddingLeft:24,
    lineHeight:20
  },
  androidSelectText:{
    backgroundColor: '#fff',
    paddingLeft: Utils.normalize(20),
    height: Utils.normalize(55),
    marginTop: Utils.normalize(10),
    justifyContent: 'center',
    borderColor: '#ccc',
    borderBottomWidth:2
  },
  buyMsgBlock:{
      position:'relative',
      flexDirection:'row',
      flex:1,
      paddingLeft:20,
      overflow: 'hidden',
  },
  buyMsgRowContent:{
      flex:1,
      borderBottomColor:'#cccccc',
      paddingBottom:14,
  },
  buyMsgRow1:{
      marginTop: 12,
      flexDirection:'row'
  },
  buyMsgName:{
      fontSize:Utils.normalize(17),
      color:'#000',
      flex:1
  },
  buyMsgTime:{
      flex:1,
      color:'#999',
      fontSize:Utils.normalize(12),
      textAlign:'right',
      marginRight:42
  },
  buyMsgList: {
      fontSize:Utils.normalize(13),
      color:'#333',
  }
})
export default styles;
