import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, Button, Modal, TextInput, Alert} from 'react-native';
import RNPickerSelect from "react-native-picker-select";
import AlbumSingle from './components/AlbumSingle';

import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { getUID, getDropboxToken } from '../util';

const db = SQLite.openDatabase('photos.db');

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
      viewCreateAlbumModal: false,
      photosFromDatabase: {},
      allTemplates: [],
      allAlbums: [],
      newAlbumName: '',
      newAlbumTemplate: null // will be an int once chosen (0, 1, 2, etc.) - used as index when getting template from allTemplates
    }
  }

  componentDidMount() {
    // TODO: Loading screen until all of these are done
    this.loadTemplatesFromFirebase();
    this.getSavedAlbums();
    this.fetchAndSetPhotosFromDB();
  }

  fetchAndSetPhotosFromDB = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE if not exists photos (id integer primary key not null, album_id int, image_uri text, folder_name text);'
      );
      tx.executeSql("select * from photos", [], (_, { rows }) => {
        this.setState({
          photosFromDatabase: rows
        }, () => {
          //console.log(this.state.photosFromDatabase);
          //console.log('Photos from SQLite loaded into state')
        })
      });
    });
  }

  // ***** MUST PROMPT USER TO CONNECT TO DROPBOX TO GET TOKEN
  uploadAlbumToDropbox = async (id, albumName) => {
    console.log(`Filter for images with id: ${id}`);
    const imagesArray = this.state.photosFromDatabase._array;
    const filteredImages = imagesArray.filter(photo => photo.album_id === id);

    const token = await getDropboxToken();

    if (filteredImages.length > 0) {

      console.log('Uploading images to Dropbox...');

      for (const image of filteredImages) {

        try {
          const response = await FileSystem.uploadAsync('https://content.dropboxapi.com/2/files/upload', image.image_uri, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/octet-stream",
              "Dropbox-API-Arg": JSON.stringify({
                "path": `/${albumName}/${image.folder_name}/${image.folder_name}.jpg`,
                "mode": "add",
                "autorename": true,
                "mute": false
              })
            }
          })
          console.log(response);
        } catch (error) {
          console.error(error);
        }
      }
      
    } else {
      console.log('Cant upload an empty album!');
    }
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

    if (this.state.newAlbumName !== '' && this.state.newAlbumName.trim() !== "" && this.state.newAlbumTemplate !== null) {

      const testAlbum = {
        id: Date.now(),
        name: this.state.newAlbumName,
        template: this.state.allTemplates[this.state.newAlbumTemplate]
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

      this.closeNewAlbumModal();

    } else if (this.state.newAlbumName === '' && this.state.newAlbumTemplate === null) {
      alert('Please fill in album name and pick a template.');
    } else if (this.state.newAlbumName === '') {
      alert('Please fill in album name.');
    } else {
      alert('Please choose a template. If none are available, create a new one on the Templates tab!');
    }
    
  }

  // DEV only
  deleteAllAlbumData = async () => {
    try {
      await AsyncStorage.removeItem('@storage_savedAlbums')
    } catch (e) {
      console.error(e);
    }
  }

  handleNewAlbumName = (name) => {
    this.setState({ newAlbumName: name });
    console.log(this.state.newAlbumName)
  }

  handleNewAlbumTemplate = (index) => {
    this.setState({ newAlbumTemplate: index });
    console.log(this.state.newAlbumTemplate)
  }

  closeNewAlbumModal = () => {
    this.setState({
      newAlbumName: '',
      newAlbumTemplate: undefined,
      viewCreateAlbumModal: false
    })
  }

  render() {
    const templateOptions = this.state.allTemplates.map((template, index) => {
      return { label: template.title, value: index }
    })
    return (
      <View style={styles.container}>
        <Text>Albums</Text>
        {this.state.allAlbums.length > 0 && this.state.allAlbums.map((album, index) => (
          <View key={index}>
            <Text>{album.name} - {album.template.title}</Text>
            <AlbumSingle allPhotos={this.state.photosFromDatabase} album={album}/>
            <Button title="Upload" onPress={() => this.uploadAlbumToDropbox(album.id, album.name)}></Button>
          </View>
        ))}
        { this.state.viewCreateAlbumModal && (
          <View style={styles.modalContainer}>
            <Modal animationType="slide">
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>New Album</Text>
                <TextInput
                  style={styles.modalNewAlbumName}
                  placeholder="Album Name"
                  onChangeText={this.handleNewAlbumName}
                  value={this.state.newAlbumName}
                />
                <RNPickerSelect
                 onValueChange={(value) => this.handleNewAlbumTemplate(value)}
                 items={templateOptions}
                />
                <Button title="Save Album" onPress={() => this.createAlbum()}/>
                <Button
                  title="Close"
                  onPress={() => Alert.alert(
                  'You sure?',
                  'You will lose your current progress on this new album.',
                  [
                      {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                      {text: 'OK', onPress: this.closeNewAlbumModal}
                  ]
                  )}
                />
              </View>
            </Modal>
          </View>
        )}
        <Button title="Create New Album" onPress={() => this.setState({ viewCreateAlbumModal: true })}/>
        <Button title="DELETE ALL ALBUMS" onPress={() => this.deleteAllAlbumData()}/>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalContent: {
    marginTop: 60,
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: 28,
    fontWeight: '600'
  },
  modalNewAlbumName: {
    padding: 10,
    fontSize: 26
  }
});
