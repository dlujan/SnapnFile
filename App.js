import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppNavigator } from './routes/AppNavigator';
import Navigation from './Navigation';

import * as firebase from 'firebase';
import { firebaseConfig } from './config';
firebase.initializeApp(firebaseConfig);

export default function App() {
  return (
    <AppNavigator />
  );
}
