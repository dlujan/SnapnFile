import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Loading from '../screens/Loading';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import Templates from '../screens/Templates';
import Albums from '../screens/Albums';
import Account from '../screens/Account';

const { Navigator, Screen } = createStackNavigator();

const HomeNavigator = () => (
    <Navigator headerMode="none">
      <Screen name="Loading" component={Loading} />
      <Screen name="Login" component={Login} />
      <Screen name="Signup" component={Signup} />
      <Screen name="Templates" component={Templates} />
      <Screen name="Albums" component={Albums} />
      <Screen name="Account" component={Account} />
    </Navigator>
  );

export const AppNavigator = () => (
  <NavigationContainer>
    <HomeNavigator />
  </NavigationContainer>
);
