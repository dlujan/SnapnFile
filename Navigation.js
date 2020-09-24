import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function Navigation() {
  return (
    <View style={styles.container}>
      <Text>NAVIGATION</Text>
      <Button title="Go to Albums">Albums</Button>
      <Button title="Go to Templates">Templates</Button>
      <Button title="Go to Camera">Camera</Button>
      <Button title="Go to Account">Account</Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
