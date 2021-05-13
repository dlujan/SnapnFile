import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Provider } from 'react-redux';

import Loading from './screens/Loading';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Templates from './screens/Templates';
import Albums from './screens/Albums';
import SnapCamera from './screens/SnapCamera';
import Account from './screens/Account';

import * as firebase from 'firebase';
import { firebaseConfig } from './config';
import configureStore from './store/configureStore';
firebase.initializeApp(firebaseConfig);

const store = configureStore();

const { Navigator, Screen } = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return <Tab.Navigator initialRouteName="Account">
    <Tab.Screen name="Templates" component={Templates}/>
    <Tab.Screen name="Albums" component={Albums}/>
    <Tab.Screen name="SnapCamera" component={SnapCamera}/>
    <Tab.Screen name="Account" component={Account}/>
  </Tab.Navigator>
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Navigator headerMode="none">
          <Screen name="Loading" component={Loading} />
          <Screen name="Login" component={Login} />
          <Screen name="Signup" component={Signup} />
          <Screen name="MainTabNavigator" component={MainTabNavigator} />
        </Navigator>
      </NavigationContainer>
    </Provider>
  );
}
