import React, {
  Component,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Launch from './components/Launch';
import Register from './components/Register';
import Login from './components/Login';
import Login2 from './components/Login2';
import Login3 from './components/Login3';
import {
  Scene,
  Router,
  Actions,
  Reducer,
  ActionConst,
    Modal,
} from 'react-native-router-flux';
import Error from './components/Error';
import Home from './components/Home';
import TabView from './components/TabView';
import TabIcon from './components/TabIcon';
import EchoView from './components/EchoView';
import Button from 'react-native-button';

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: 'transparent', justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarStyle: {
    backgroundColor: '#eee',
  },
  tabBarSelectedItemStyle: {
    backgroundColor: '#ddd',
  },
});

const reducerCreate = params => {
  const defaultReducer = new Reducer(params);
  return (state, action) => {
    console.log('ACTION:', action);
    return defaultReducer(state, action);
  };
};

class Example extends Component {
    render() {
        return (
            <Router createReducer={reducerCreate} tintColor='red'>
              <Scene key="lightbox" lightbox leftButtonTextStyle={{ color: 'green' }} backButtonTextStyle={{ color:'red' }} >
                <Scene key="modal" modal hideNavBar>
                  <Scene key="login" inital component={Login} >

                  </Scene>
                </Scene>
                <Scene key="error" component={Error}/>
              </Scene>
            </Router>
        );
    }
}

export default Example;