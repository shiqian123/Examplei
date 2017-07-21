
'use strict'

import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    TextInput,
    Alert,
}from 'react-native'

import { Header, Tip } from '../components';
import {Utils,Device,Assets} from "../base";
import styles from '../common/styles';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';


export default class selectBouParams extends Component{
    constructor(props){
        super(props);
        this.state = {
            data:'',
            selected:''
        }
    }
    componentDidMount(){
      this.setState({data:this.props.data,selected:(this.props.selected=='')?this.props.data[0]:this.props.selected})
    }
   paramChosed(item){
     setTimeout(()=>{
         Actions.pop({refresh:{item:item,from:'selectBouParams'}})
     },0)
   }
   goBack(){
     Actions.pop()
   }
    render(){
        return (
            <View style={styles.container}>
                <View>
                  <Header title="产品细分" leftPress={() => this.goBack()} leftIcon={{name:Device.iOS ? "ios-arrow-back" : "md-arrow-back",size:Device.iOS?23:28}}/>
                  <View style={localStyles.label}>
                      <Text style={{color:'#999999',fontSize:Utils.normalize(13)}}>颜色</Text>
                  </View>
                  {
                    this.props.data.map((item,key) => {
                      return (
                        <View key={key}>
                          <TouchableOpacity onPress={() => this.paramChosed(item)} style={localStyles.detailBox}>
                            <Text style={[localStyles.detailLeft, {color: '#000000'}]}>{item}</Text>
                            {this.state.selected === item ? <Icon style={localStyles.selectRight} name='md-checkmark' size={23} color="#387ff5" /> : null}
                          </TouchableOpacity>
                          {key + 1 >= this.props.data.length ? null : <View style={localStyles.itemInsetLineR}></View>}
                        </View>
                      )
                    })
                  }
                </View>
            </View>

        )
    }
}
    const localStyles = StyleSheet.create({
      detailLeft: {
        flex: 1,
        color: '#000000',
        fontSize: Utils.normalize(16),
        fontWeight: '400',
      },
      detailBox: {
        alignItems: 'center',
        flexDirection: 'row',
        height: Utils.normalize(49.5),
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingLeft: 15
      },
      itemInsetLineR:{
        height: 0.5,
        borderLeftWidth: 15,
        borderLeftColor: '#fff',
        backgroundColor: '#ccc',
      },
      label:{
          width:Utils.width,
          height:Utils.normalize(34),
          justifyContent:'center',
          paddingLeft:Utils.normalize(10),
          backgroundColor:'#efefef'
      },
      selectRight:{
        position: 'absolute',
        right: Utils.normalize(15),
        top: Utils.normalize(20)
      },
    })
