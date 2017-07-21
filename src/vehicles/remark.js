
'use strict'

import React,{Component} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
}from 'react-native'

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';

let placeHolder = '';
export default class Remark extends Component{
    constructor(props){
        super(props);
        this.state = {
            des:props.des,
            tempDes:props.des,
        }
    }
    componentWillMount(){
      this.props.showText ?  placeHolder = '点击输入' + this.props.showText + '备注' : placeHolder = '点击输入单据备注';
      this.props.des ? this.setState({tempDes:this.props.des}) :''
    }
    _desBack() {
      if(this.state.des !== this.state.tempDes){
        Alert.alert(
          '',
          '确认放弃此次编辑',
          [
            {text:'取消', onPress:()=>{this.refs._lockNotes.blur();}},
            {text:'确定', onPress:()=>{
                this.refs._lockNotes.blur();
                this.setState({tempDes: this.state.des});
                Actions.pop();
              }
            }
          ]
        )
      }else if(this.state.des === ''){
        this.setState({tempDes: ''});
        Actions.pop();
      }else{
        Actions.pop();
      }
    }

    _changeText(text) {
      this.setState({tempDes: text});
    }

    _saveDes() {
        /*
                remark_flag 表示备注执行成功
         */
      Actions.pop({refresh:{des:this.state.tempDes,remark_flag:1}})
    }

    render(){
        return(
            <View style={styles.container}>
                <View>
                  <Header title="备注" leftPress={() => this._desBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size: 23}} rightTitle="保存" rightPress={() => this._saveDes()}/>
                  <View>
                    <TextInput
                      placeholder={placeHolder}
                      placeholderTextColor='#ccc'
                      ref="_lockNotes"
                      defaultValue={this.state.tempDes}
                      multiline={true}
                      numberOfLines={6}
                      style={{height:Utils.normalize(110),backgroundColor:'#fff',marginTop:10,marginLeft:10,marginRight:10,borderRadius:5,padding:12,fontSize:Utils.normalize(14),textAlignVertical:'top'}}
                      onChangeText={this._changeText.bind(this)}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                </View>
            </View>
        )
    }
}
