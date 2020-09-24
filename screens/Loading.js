import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import firebase from 'firebase';

export default function Loading({ navigation }) {
    useEffect(() => {
        checkIfLoggedIn();
    }, []);

    const checkIfLoggedIn = () => {
        firebase
            .auth()
            .onAuthStateChanged((user) => {
                if (user) {
                    navigation.navigate('Account');
                } else {
                    navigation.navigate('Login');
                }
            })
    }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large"/>
      <StatusBar style="auto" />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
