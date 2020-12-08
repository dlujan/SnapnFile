import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render } from 'react-dom';

export default class Templates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newTemplateName: '',
      layerOne: [],
      layerTwo: [],
      newFolder: ''
    }
  }

  //*** Need to create separate modal to hold the new template creation

  // #1 Name the template
  // #2 Let user create new inputs - will need a method that returns an input field
  
  // This function uses current state to create the template
  createTemplate = async () => {
    // Create a template format and save to database
    const uid = await this.getUID();
    let ref = firebase.database().ref('/users/' + uid);

    // **** I need to figure out how to be able to create deeper folders with Firebase, it won't take an array :/
    // Using a static test template for now, but will eventually be a dynamic one (aka object) that user creates
    let newAlbumTemplate = {
      title: this.state.newTemplateName,
      folders: this.state.layerOne
    }

    ref.child("album_templates").push(newAlbumTemplate);
  }

  getDBToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key')
      if(value !== null) {
        return value;
      }
    } catch(e) {
      console.error(e);
    }
  }

  getUID = async () => {
    try {
      const value = await AsyncStorage.getItem('@user_Id')
      if(value !== null) {
        return value;
      }
    } catch(e) {
      console.error(e);
    }
  }

  handleTemplateName = (name) => {
    this.setState({ newTemplateName: name });
  }

  handleFolderName = (name) => {
    this.setState({ newFolder: name })
  }

  addFolder = () => {
    if (this.state.newFolder !== '') {
      this.setState({ 
        layerOne: [...this.state.layerOne, this.state.newFolder],
        newFolder: ''
      })
    }
  }

  // renderFolderComponent = () => {
  //   return (
  //     <TextInput 
  //       placeholder="Folder Name"
  //       onChangeText={this.handleFolderName}
  //       value={this.state.newFolder}
  //     />
  //   );
  // }
  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.newTemplateName}</Text>
        <Text>{this.state.newFolder}</Text>
        <View>
          <TextInput 
            placeholder="Template Name"
            onChangeText={this.handleTemplateName}
            value={this.state.newTemplateName}
          />
          <TextInput 
            placeholder="Folder Name"
            onChangeText={this.handleFolderName}
            value={this.state.newFolder}
          />
          <Button title="Add Folder" onPress={() => this.addFolder()}/>
        </View>
        <Button title="Create Template" onPress={() => this.createTemplate()}/>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
