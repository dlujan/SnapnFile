import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Templates() {
  
  const createTemplate = async () => {
    // Create a template format and save to database
    const uid = await getUID();
    let ref = firebase.database().ref('/users/' + uid);

    // **** I need to figure out how to be able to create deeper folders with Firebase, it won't take an array :/
    // Using a static test template for now, but will eventually be a dynamic one (aka object) that user creates
    let testTemplate = {
      title: 'test-template',
      foundation: 'foundation',
      roof: 'roof',
      plumbing: 'plumbing'
    }

    ref.child("album_templates").push(testTemplate);
  }

  const getDBToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key')
      if(value !== null) {
        return value;
      }
    } catch(e) {
      console.error(e);
    }
  }

  const getUID = async () => {
    try {
      const value = await AsyncStorage.getItem('@user_Id')
      if(value !== null) {
        return value;
      }
    } catch(e) {
      console.error(e);
    }
  }

  return (
    <View style={styles.container}>
      <Text>Templates</Text>
      <Text>Template 1</Text>
      <Text>Template 2</Text>
      <Button title="Create Template" onPress={() => createTemplate()}/>
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
