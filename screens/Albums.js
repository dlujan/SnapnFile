import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, Button, Modal, TextInput, Alert} from 'react-native';
import RNPickerSelect from "react-native-picker-select";
import AlbumSingle from './components/AlbumSingle';

import { connect } from 'react-redux';
import { updateLastChange } from '../actions/actions';
import { albumStartedUploading } from '../actions/actions';
import { albumStoppedUploading } from '../actions/actions';

import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { getUID, getDropboxToken } from '../util';

const db = SQLite.openDatabase('photos.db');

class Albums extends React.Component {
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
    //this.deleteAlbum(1618187120142);
  }

  UNSAFE_componentWillReceiveProps() {
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
          console.log(this.state.photosFromDatabase);
          //console.log('Photos from SQLite loaded into state')
        })
      });
    });
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
      if (savedAlbums !== null) {
        // Replace current state (empty array) with new array coming in
        this.setState({ allAlbums: JSON.parse(savedAlbums) })
        console.log(`Saved albums: ${savedAlbums}`)
      }
    } catch(e) {
      console.error(e);
    }
  }

  // ***** MUST PROMPT USER TO CONNECT TO DROPBOX TO GET TOKEN
  uploadAlbumToDropbox = async (id, albumName) => {

    const token = await getDropboxToken();
    if (token === undefined) {
      alert('Please sign in to Dropbox first.')
      return;
    }

    console.log(`Filter for images with id: ${id}`);
    const imagesArray = this.state.photosFromDatabase._array;
    const filteredImages = imagesArray.filter(photo => photo.album_id === id);

    if (filteredImages.length > 0) {

      console.log('Uploading images to Dropbox...');
      this.props.albumStartedUploading('Uploading images to Dropbox...');

      let uploadFailed = false;

      for (const image of filteredImages) {
        try {
          const response = await FileSystem.uploadAsync('https://content.dropboxapi.com/2/files/upload', image.image_uri, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/octet-stream",
              "Dropbox-API-Arg": JSON.stringify({
                "path": `/${albumName}/${image.folder_name}/${image.folder_name.replaceAll("/", "-")}.jpg`,
                "mode": "add",
                "autorename": true,
                "mute": false
              })
            }
          })
          console.log(response);
          if (response.status === 401) {
            uploadFailed = true;
          }
        } catch (error) {
          console.error(error);
        }
      }

      if (uploadFailed === true) {
        this.props.albumStoppedUploading({success: false, message: 'One or more photos failed to upload.'});
      } else {
        this.props.albumStoppedUploading({success: true, message: 'Album successfully uploaded to Dropbox!'});
      }

    } else {
      console.log('Cant upload an empty album!');
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

      this.props.updateLastChange('New album created.');

      this.closeNewAlbumModal();

    } else if (this.state.newAlbumName === '' && this.state.newAlbumTemplate === null) {
      alert('Please fill in album name and pick a template.');
    } else if (this.state.newAlbumName === '') {
      alert('Please fill in album name.');
    } else {
      alert('Please choose a template. If none are available, create a new one on the Templates tab!');
    }
    
  }

  deleteAlbum = async (album_id) => {

    // Delete album from SQL db and reset state
    db.transaction(tx => {
      tx.executeSql('select * from photos where album_id = ?;', [album_id], (_, { rows }) => {

        // Delete all images from file store
        if (rows._array.length > 0) this.deleteImageFiles(rows._array);
      })
      tx.executeSql('delete from photos where album_id = ?;', [album_id], () => {
        console.log('All image data for this album deleted from local SQL database.')
      });
      tx.executeSql("select * from photos", [], (_, { rows }) => {
        this.setState({
          photosFromDatabase: rows
        }, () => {
          //console.log(this.state.photosFromDatabase);
          //console.log('Photos from SQLite loaded into state')
          this.props.updateLastChange('Album deleted.')
        })
      });
    });

    // Delete from AsyncStorage
    try {
      const savedAlbums = await AsyncStorage.getItem('@storage_savedAlbums');
      if (savedAlbums !== null) {
        const updatedAlbums = JSON.parse(savedAlbums).filter(album => album.id !== album_id);
        if (updatedAlbums.length !== 0) {
          try {
            await AsyncStorage.setItem('@storage_savedAlbums', JSON.stringify(updatedAlbums));
            this.setState({ allAlbums: updatedAlbums })
            console.log('All album metadata successfully deleted from Async Storage. (new version of @storage_savedAlbums)')
          } catch(e) {
            console.error(e);
          }
        } else {
          try {
            await AsyncStorage.removeItem('@storage_savedAlbums');
            this.setState({ allAlbums: [] })
            console.log('All album metadata successfully deleted from Async Storage. (@storage_savedAlbums deleted)')
          } catch(e) {
            console.error(e);
          }
        }
      }
    } catch(e) {
      console.error(e);
    }
  }

  deleteImageFiles = async (images) => {
    for (const image of images) {
      let file = image.image_uri.split('/photos/')[1];
      await FileSystem.deleteAsync(FileSystem.documentDirectory + 'photos' + `/${file}`);
    }
    console.log('All image files deleted from File System.')
  }

  handleNewAlbumName = (name) => {
    this.setState({ newAlbumName: name });
  }

  handleNewAlbumTemplate = (index) => {
    this.setState({ newAlbumTemplate: index });
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
        <Text style={styles.pageHeading}>Albums</Text>
        {this.state.allAlbums.length > 0 && this.state.allAlbums.map((album, index) => (
          <AlbumSingle
            allPhotos={this.state.photosFromDatabase._array}
            album={album} 
            key={index}
            uploadAlbumToDropbox={this.uploadAlbumToDropbox}
            deleteAlbum={this.deleteAlbum}
          />
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
        {this.props.uploadMessage.albumUploading && (<Text>Album uploading...</Text>)}
        {!this.props.uploadMessage.albumUploading && this.props.uploadMessage.uploadSuccess && this.props.uploadMessage.uploadMessage !== '' && (<Text>{this.props.uploadMessage.uploadMessage}</Text>)}
        {!this.props.uploadMessage.albumUploading && !this.props.uploadMessage.uploadSuccess && this.props.uploadMessage.uploadMessage !== '' && (<Text>{this.props.uploadMessage.uploadMessage}</Text>)}
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    height: '100%'
  },
  pageHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
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
    alignItems: 'center'
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

const mapStateToProps = state => ({
  lastChange: state.lastChange,
  albumUploading: state.albumUploading,
  uploadSuccess: state.uploadSuccess,
  uploadMessage: state.uploadMessage
})

export default connect(mapStateToProps, { updateLastChange, albumStartedUploading, albumStoppedUploading })(Albums);
