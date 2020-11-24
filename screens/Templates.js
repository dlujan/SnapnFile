import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Templates() {
  
  const createTemplate = () => {
    getDBToken();
  }

  const getDBToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key')
      if(value !== null) {
        console.log(`Get token inside Templates: ${value}`);
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
