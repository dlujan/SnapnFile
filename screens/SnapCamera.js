import React from 'react';
import { StyleSheet, Text, View ,TouchableOpacity, Platform, Image} from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { FontAwesome, Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('photos.db');

export default class SnapCamera extends React.Component {
  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.back,
    cameraFlash: Camera.Constants.FlashMode.off,
    albumMenuExpanded: false,
    folderMenuExpanded: false,
    allAlbums: [],
    selectedAlbum: {},
    selectedFolder: '',

    testUri: ''
  }

  async componentDidMount() {
    this.setState({
      testUri: 'file:///var/mobile/Containers/Data/Application/84978127-DA5B-4EE4-9CAC-EC88910B901C/Documents/ExponentExperienceData/%2540dlujan%252FSnapnFile/photos/1613853347370.jpg'
    })


    this.getPermissionAsync();
    this.getSavedAlbums();

    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE if not exists photos (id integer primary key not null, album_id int, image_uri text, folder_name text);'
      );
      tx.executeSql("select * from photos", [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
      // DEV : Delete a row from photos table manually
      // tx.executeSql('delete from photos where id = ?;', [1]);
    });


    // DEV : Print all images saved to file system
    console.log(await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'photos'))

    // DEV : Remove specific image from file system
    //await FileSystem.deleteAsync(FileSystem.documentDirectory + 'photos' + '/1613949487557.jpg');

  }

  getPermissionAsync = async () => {
    // Camera roll Permission 
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
    // Camera Permission
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === 'granted' });
  }

  takePicture = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();

      // ***** Just for testing
      this.setState({ testUri: photo.uri })
      // ***** Just for testing

      // Check if user photo directory exists, if not, create it
      const USER_PHOTO_DIR = FileSystem.documentDirectory + 'photos';
      const folderInfo = await FileSystem.getInfoAsync(USER_PHOTO_DIR);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(USER_PHOTO_DIR);
      }
      
      // Save taken image to device
      const imageName = `${Date.now()}.jpg`;
      const NEW_PHOTO_URI = `${USER_PHOTO_DIR}/${imageName}`;

      await FileSystem.copyAsync({
        from: photo.uri,
        to: NEW_PHOTO_URI
      })
      .then(() => {
        console.log(`File ${photo.uri} was saved as ${NEW_PHOTO_URI}`)

        // Store image info inside database - store the file system image uri, album id, and folder name
        db.transaction(tx => {
          tx.executeSql('insert into photos (album_id, image_uri, folder_name) values (?,?,?)',
            [this.state.selectedAlbum.id, NEW_PHOTO_URI, this.state.selectedFolder],
            () => console.log('Image added to database...')
          );
          tx.executeSql('select * from photos', [], (_, { rows }) =>
            console.log(JSON.stringify(rows))
          );
        })
        
      })
      .catch(error => { console.error(error) })
    }
  }

  pickImage = async () => {
    let photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });
    console.log(photo);
  }

  getSavedAlbums = async () => {
    try {
      const savedAlbums = await AsyncStorage.getItem('@storage_savedAlbums')
      if(savedAlbums !== null) {
        // Replace current state (empty array) with new array coming in
        this.setState({
          allAlbums: JSON.parse(savedAlbums),
          selectedAlbum: JSON.parse(savedAlbums)[0], // TEMPORARY :: SET DEFAULT SELECTED ALBUM TO FIRST IN LIST
          selectedFolder: JSON.parse(savedAlbums)[0].template.folders[0]
        })
      }
    } catch(e) {
      console.error(e);
    }
  }

  handleCameraType=()=>{
    const { cameraType } = this.state;

    this.setState({cameraType:
      cameraType === Camera.Constants.Type.back
      ? Camera.Constants.Type.front
      : Camera.Constants.Type.back
    })
  }

  toggleFlash = () => {
    const { cameraFlash } = this.state;

    this.setState({cameraFlash:
      cameraFlash === Camera.Constants.FlashMode.off
      ? Camera.Constants.FlashMode.on
      : Camera.Constants.FlashMode.off
    })
  }

  toggleAlbumSelect = () => {
    const { albumMenuExpanded } = this.state;

    this.setState({albumMenuExpanded:
      albumMenuExpanded === false
      ? true
      : false
    })
  }

  toggleFolderSelect = () => {
    const { folderMenuExpanded } = this.state;

    this.setState({folderMenuExpanded:
      folderMenuExpanded === false
      ? true
      : false
    })
  }

  handleAlbumSelect = (index) => {
    this.setState({ selectedAlbum: this.state.allAlbums[index] })
    this.toggleAlbumSelect();
  }

  // handleFolderSelect = () => {

  // }

  render(){
    const { hasPermission } = this.state
    if (hasPermission === null) {
      return <View />;
    } else if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
          <View style={{ flex: 1 }}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => this.toggleFlash()}
              >
                {this.state.cameraFlash ? (
                  <Ionicons
                  name="ios-flash"
                  style={{ color: "#000", fontSize: 40}}
                  />
                ) : (
                  <Ionicons
                  name="ios-flash-off"
                  style={{ color: "#000", fontSize: 40}}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.toggleAlbumSelect()}>
                <Text>{this.state.selectedAlbum.name}</Text>
                {this.state.albumMenuExpanded && (
                  <View style={styles.albumMenu}>
                    {this.state.allAlbums.map((album, index) => (
                      <TouchableOpacity onPress={() => this.handleAlbumSelect(index)} key={index}><Text>{album.name}</Text></TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
              {/* TODO: Copy above code for folder too */}
              <TouchableOpacity onPress={() => this.toggleFolderSelect()}><Text>Folder</Text></TouchableOpacity>

              <Image
                style={{width: 23, height: 38}}
                source={{
                  uri: this.state.testUri,
                }}
              />

            </View>
            <Camera style={{ flex: 1 }} type={this.state.cameraType} flashMode={this.state.cameraFlash} ref={ref => {this.camera = ref}}>
              {this.state.allAlbums.length !== 0 && (
                <View style={styles.folderCarousel}>
                {this.state.selectedAlbum.template.folders.map((name, index) => (
                  <Text style={styles.folderAnimal} key={index}>{name}</Text>
                ))}
              </View>
              )}
              <View style={{flex:1, flexDirection:"row",justifyContent:"space-between",margin:30}}>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent'                 
                  }}
                  onPress={()=>this.pickImage()}>
                  <Ionicons
                      name="ios-photos"
                      style={{ color: "#fff", fontSize: 40}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                  onPress={()=>this.takePicture()}
                  >
                  <FontAwesome
                      name="camera"
                      style={{ color: "#fff", fontSize: 40}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                  onPress={()=>this.handleCameraType()}
                  >
                  <MaterialCommunityIcons
                      name="camera-switch"
                      style={{ color: "#fff", fontSize: 40}}
                  />
                </TouchableOpacity>
              </View>
            </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  albumMenu: {
    top: 0,
  },
  folderCarousel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 500
  },
  folderAnimal: {
    color: 'white',
    alignSelf: 'flex-end'
  }
});
