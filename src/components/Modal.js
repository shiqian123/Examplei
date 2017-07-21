"use strict";
import React, { Component } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Utils } from '../base';

class ModalC extends Component {

  constructor(props) {
    super(props)
    this.state =  {
      animationType: 'none',
      modalVisible: false,
      transparent: false,
    };
  }

  _setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  _setAnimationType(type) {
    this.setState({animationType: type});
  }

  _toggleTransparent() {
    this.setState({transparent: !this.state.transparent});
  }

  render() {
    var modalBackgroundStyle = {
      backgroundColor: this.state.transparent ? 'rgba(0, 0, 0, 0.5)' : '#f5fcff',
    };
    var innerContainerTransparentStyle = this.state.transparent
      ? {backgroundColor: '#fff', padding: 20}
      : null;
    var activeButtonStyle = {
      backgroundColor: '#ddd'
    };

    return (
      <View>
        <Modal
          animationType={this.state.animationType}
          transparent={this.state.transparent}
          visible={this.state.modalVisible}
          onRequestClose={() => {this._setModalVisible(false)}}
          >
          <View style={[styles.container, modalBackgroundStyle]}>
            <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
              <Text>This modal was presented {this.state.animationType === 'none' ? 'without' : 'with'} animation.</Text>
              <Button
                onPress={this._setModalVisible.bind(this, false)}
                style={styles.modalButton}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default ModalC
