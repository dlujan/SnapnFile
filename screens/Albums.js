import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUID } from '../util';

// @TODO ::

// *** Each album will need to contain all photo information eventually, photos will be set to it in SnapCamera

// 1. Load in user templates : DONE
// 2. Create album - name and template, convert object -> string : DONE
// 3. Save using Async Storage - test this with some random value first : DONE
// 4. Save multiple albums to one large array, convert to string : DONE
// 5. Figure out how to move albums (with connected templates) to the SnapCamera OH
// ***** Just reuse my methods wherever I need the templates and albums - they either fetch directly from Firebase or Async Storage

export default class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTemplates: [],
      allAlbums: [],
      // newAlbum: {
      //   name: '',
      //   template: {}
      // }
    }
  }

  componentDidMount() {
    this.loadTemplatesFromFirebase();
    this.getSavedAlbums();
  }

  // @TODO: Consider moving these methods into util.js
  loadTemplatesFromFirebase = async () => {
    const uid = await getUID();
    let ref = firebase.database().ref('users/' + uid).child("album_templates");
    ref.once('value').then(snapshot => {
      let templates = snapshot.val();
      if (templates !== null) {
        this.setState({ allTemplates: Object.values(templates) });
      }
    })
  }

  getSavedAlbums = async () => {
    try {
      const savedAlbums = await AsyncStorage.getItem('@storage_savedAlbums')
      if(savedAlbums !== null) {
        // Replace current state (empty array) with new array coming in
        this.setState({ allAlbums: JSON.parse(savedAlbums) })
      }
    } catch(e) {
      console.error(e);
    }
  }

  createAlbum = async () => {
    const testAlbum = {
      name: 'Test Album',
      template: this.state.allTemplates[0]
    };

    // Create temporary copy of all albums in state and push new album to it
    let allAlbumsToSave = this.state.allAlbums;
    allAlbumsToSave.push(testAlbum);

    try {
      // Set state's allAlbums into storage, including the new one
      await AsyncStorage.setItem('@storage_savedAlbums', JSON.stringify(allAlbumsToSave))
      this.getSavedAlbums();
    } catch (e) {
      console.error(e);
    }
  }

  deleteAllAlbumData = async () => {
    try {
      await AsyncStorage.removeItem('@storage_savedAlbums')
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Albums</Text>
        {this.state.allAlbums.map((album, index) => (
          <Text key={index}>{album.name} - {album.template.title}</Text>
        ))}
        <Button title="Create Album" onPress={() => this.createAlbum()}/>
        <Button title="DELETE ALL" onPress={() => this.deleteAllAlbumData()}/>
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
