'use strict';

import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableHighlight,
  PropTypes,
  SegmentedControlIOS
} from 'react-native'
import {Utils, Device} from '../base'
import tweenState from 'react-tween-state'
class Segmented extends Component {
  constructor(props) {
  	super(props)
  	this.state = {
  		barLeft: 0,
  		barRight: Device.width,
  	}
  }

  componentDidMount() {
  	// setTimeout(() => this.moveTo(this.props.index), 0);
  }

  componentWillReceiveProps(nextProps) {
  	// this.moveTo(nextProps.index);
  }

  componentWillReceiveProps(nextProps) {
  	// this.moveTo(nextProps.index);
  }

  measureHandler(ox, oy, width) {
  	this.setState({'barLeft': {
  		easing: tweenState.easingTypes.easeInOutQuad,
  		duration: 200,
  		endValue: ox
  	}});

  	this.setState({'barRight': {
  		easing: tweenState.easingTypes.easeInOutQuad,
  		duration: 200,
  		endValue: Device.width - ox - width,
  		onEnd: this.props.onTransitionEnd
  	}});

    setTimeout(() => { this.props.onTransitionStart }, 0)
  }

  moveTo(index) {
  	this.refs[index].measure(this.measureHandler);
  }

  _renderTitle(title, i) {
    return (
      <View style={styles.title}>
        <Text style={this.props.titleStyle, i === this.props.index && this.props.selectedTitleStyle}>{title}</Text>
      </View>
    );
  }

  renderTitle(title, i) {
    return (
      <View key={i} ref={i} style={[{ flex: this.props.stretch ? 1 : 0 },(i === this.props.index) && ({borderBottomWidth:1.5,borderBottomColor:'#387ff5'})]}>
        <TouchableHighlight underlayColor={this.props.underlayColor} onPress={() => this.props.onPress(i)}>
          {this.props.renderTitle ? this.props.renderTitle(title, i) : this._renderTitle(title, i)}
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    let items = [];
    let titles = this.props.titles;

    if (!this.props.stretch) {
      items.push(<View key={`s`} style={styles.spacer} />);
    }

    for (var i = 0; i < titles.length; i++) {
      items.push(this.renderTitle(titles[i], i));
      /*添加竖直分割线*/
      if(i < titles.length-1){
          items.push(<View style={{width:1,height:21,marginTop:12,backgroundColor:'#ccc'}}></View>)
      }
      if (!this.props.stretch) {

        items.push(<View key={`s${i}`} style={styles.spacer} />);
      }
    }
    let barContainer = (
      <View style={styles.barContainer}>
        <View ref="bar" style={[styles.bar, {
          left: this.state.barLeft,
          right: this.state.barRight,
          backgroundColor: this.props.barColor
        }]} />
      </View>
    );

    return (
      <View>
        {
          Device.iOS ?
            <SegmentedControlIOS
              style={styles.tabs}
              values={this.props.titles}
              onChange={this.props.onChange}
              selectedIndex={this.props.index}
            />
          :
          <View>
            {this.props.barPosition == 'top' && barContainer}
            <View style={styles.titleContainer}>
               {items}
            </View>
            {this.props.barPosition == 'bottom' && barContainer}
          </View>
        }

      </View>
    );
  }
}

Segmented.propTypes = {
  duration: React.PropTypes.number,
  onTransitionStart: React.PropTypes.func,
  onTransitionEnd: React.PropTypes.func,
  onPress: React.PropTypes.func,
  renderTitle: React.PropTypes.func,
  titles: React.PropTypes.array,
  index: React.PropTypes.number,
  barColor: React.PropTypes.string,
  barPosition: React.PropTypes.string,
  underlayColor: React.PropTypes.string,
  stretch: React.PropTypes.bool,
  selectedTitleStyle: React.PropTypes.object,
  titleStyle: React.PropTypes.object,
}

Segmented.defaultProps = {
	duration: 200,
	onTransitionStart: () => {},
	onTransitionEnd: () => {},
	onPress: () => {},
	renderTitle: null,
	index: 1,
	barColor: '#4987ef',
	barPosition: 'bottom',
	underlayColor: 'transparent',
	stretch: true,
	selectedTextStyle: {color:'#4987ef'},
	textStyle: {color:'#333'}
}

Segmented.mixins = [tweenState.Mixin]

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
  tabs: {
    marginLeft: 15,
    marginRight: 15,
  },
	titleContainer: {
		flexDirection: 'row',
	},
	title: {
		flex: 0,
		//backgroundColor: '#f3f3f3',
    height:42,
		alignItems: 'center',
    justifyContent:'center',
		paddingHorizontal: 2,
		paddingVertical: 10,
	},
	spacer: {
		flex: 1,
    backgroundColor:'red'
	},
	barContainer: {
		height: 4,
		position: 'relative',
	},
	bar: {
		backgroundColor: 'blue',
		position: 'absolute',
		height: 4,
	}
});

export default Segmented
