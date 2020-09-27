import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Loading from './screens/Loading';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Templates from './screens/Templates';
import Albums from './screens/Albums';
import Account from './screens/Account';

import * as firebase from 'firebase';
import { firebaseConfig } from './config';
firebase.initializeApp(firebaseConfig);

const { Navigator, Screen } = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return <Tab.Navigator>
    <Tab.Screen name="Templates" component={Templates}/>
    <Tab.Screen name="Albums" component={Albums}/>
    <Tab.Screen name="Account" component={Account}/>
  </Tab.Navigator>
}

export default function App() {
  return (
    <NavigationContainer>
      <Navigator headerMode="none">
        <Screen name="Loading" component={Loading} />
        <Screen name="Login" component={Login} />
        <Screen name="Signup" component={Signup} />
        <Screen name="MainTabNavigator" component={MainTabNavigator} />
        {/* <Screen name="Albums" component={Albums} />
        <Screen name="Templates" component={Templates} />
        <Screen name="Account" component={Account} /> */}
      </Navigator>
    </NavigationContainer>
  );
}
