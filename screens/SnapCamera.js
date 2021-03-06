import React from 'react';
import { StyleSheet, Text, View ,TouchableOpacity, Platform, Image, FlatList} from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

import { connect } from 'react-redux';
import { updateLastChange } from '../actions/actions';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('photos.db');

class SnapCamera extends React.Component {
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
      testUri: 'https://daniellujan.com/wp-content/themes/portfolio-website-updated/images/me-profile-img.jpg'
    })


    this.getPermissionAsync();
    this.getSavedAlbums();

    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE if not exists photos (id integer primary key not null, album_id int, image_uri text, folder_name text);'
      );
      tx.executeSql("select * from photos", [], (_, { rows }) =>
        //console.log(JSON.stringify(rows))
        console.log('DB stuff loaded')
      );
      // DEV : Delete a row from photos table manually
      //tx.executeSql('delete from photos where id = ?;', [1]);
    });


    // DEV : Print all images saved to file system
    console.log(await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'photos'))

    // DEV : Remove specific image from file system
    //await FileSystem.deleteAsync(FileSystem.documentDirectory + 'photos' + '/1615072344565.jpg');

  }

  UNSAFE_componentWillReceiveProps() {
    this.getSavedAlbums();
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

  getSavedAlbums = async () => {
    try {
      const savedAlbums = await AsyncStorage.getItem('@storage_savedAlbums')

      // On app load when the state is initially empty
      if (savedAlbums !== null && JSON.parse(savedAlbums).length !== 0 && Object.keys(this.state.selectedAlbum).length === 0) {
        this.setState({
          allAlbums: JSON.parse(savedAlbums),
          selectedAlbum: JSON.parse(savedAlbums)[0],
          selectedFolder: JSON.parse(savedAlbums)[0].template.folders[0]
        })
      }
      // If there are no saved albums
      else if (savedAlbums === null || JSON.parse(savedAlbums).length === 0) {
        this.setState({
          allAlbums: [],
          selectedAlbum: {},
          selectedFolder: ''
        })
      }
      // There are albums but the number of them changed (added/deleted) - MAY FAIL IF USER DELETES AN ALBUM AND CREATES A NEW ONE
      else if (savedAlbums !== null && JSON.parse(savedAlbums).length !== 0 && JSON.parse(savedAlbums).length !== this.state.allAlbums.length) {
        this.setState({
          allAlbums: JSON.parse(savedAlbums),
          selectedAlbum: JSON.parse(savedAlbums)[0],
          selectedFolder: JSON.parse(savedAlbums)[0].template.folders[0]
        })
      }
    } catch(e) {
      console.error(e);
    }
  }

  takePicture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (this.camera) {
      let photo = await this.camera.takePictureAsync();

      // ***** Show the new image in the top right thumbnail
      this.setState({ testUri: photo.uri })

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

      this.props.updateLastChange('A new picture was taken.')
    }
  }

  pickImage = async () => {
    if (this.camera) {
      let photo = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      if (photo.cancelled) return;

      this.setState({ testUri: photo.uri })

      const USER_PHOTO_DIR = FileSystem.documentDirectory + 'photos';
      const folderInfo = await FileSystem.getInfoAsync(USER_PHOTO_DIR);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(USER_PHOTO_DIR);
      }

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

      this.props.updateLastChange('Image from device was saved to album.')
    }
  }

  handleCameraType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { cameraType } = this.state;

    this.setState({cameraType:
      cameraType === Camera.Constants.Type.back
      ? Camera.Constants.Type.front
      : Camera.Constants.Type.back
    })
  }

  toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // Drop down and slider select
  handleAlbumSelect = (index) => {
    this.setState({
      selectedAlbum: this.state.allAlbums[index],
      selectedFolder: this.state.allAlbums[index].template.folders[0]
    })
    console.log(this.state.selectedAlbum);
    this.toggleAlbumSelect();
  }

  // handleFolderSelect = () => {

  // }

  scrollToFolder = (index) => {
    this.flatListRef.scrollToIndex({animated: true, index: index})
    this.setState({ selectedFolder: this.state.selectedAlbum.template.folders[index] })
    console.log(`Selected ${this.state.selectedFolder}`)
  }

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
              <TouchableOpacity onPress={() => this.toggleFolderSelect()}><Text>{this.state.selectedFolder}</Text></TouchableOpacity>

              <Image
                style={{width: 23, height: 38}}
                source={{
                  uri: this.state.testUri,
                }}
              />

            </View>
            <Camera
              style={styles.camera}
              type={this.state.cameraType}
              flashMode={this.state.cameraFlash}
              zoom={this.state.cameraZoom}
              ref={ref => {this.camera = ref}}
            >

              <Slider
                style={{width: '80%', height: 40, marginLeft: '10%'}}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                onValueChange={(event) => this.setState({cameraZoom: event})}
              />
            </Camera>
            <View>
              {this.state.allAlbums.length !== 0 && (
                <View style={styles.folderListContainer}>
                  <FlatList
                    ref={(ref) => {this.flatListRef = ref;}}
                    showsHorizontalScrollIndicator={false}
                    data={this.state.selectedAlbum.template.folders}
                    keyExtractor={(item, index) => item}
                    horizontal
                    snapToInterval={20}
                    snapToAlignment={'center'}
                    decelerationRate={0}
                    bounces={false}
                    contentContainerStyle={{
                      alignItems: 'center'
                    }}
                    renderItem={({ item, index }) => {
                      return (
                        <TouchableOpacity style={styles.folderItem} onPress={() => this.scrollToFolder(index)}>
                          <Text style={styles.folderText}>{this.state.selectedAlbum.template.folders[index]}</Text>
                        </TouchableOpacity>
                      )
                    }}
                  >
                  </FlatList>
                </View>
              )}
              <View style={styles.cameraButtons}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={()=>this.pickImage()}>
                  <Ionicons
                      name="ios-photos"
                      style={{ color: "#FFF", fontSize: 40}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={()=>this.takePicture()}
                  >
                  <Ionicons
                      name="ios-radio-button-on"
                      style={{ color: "#FFF", fontSize: 80}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={()=>this.handleCameraType()}
                  >
                  <MaterialCommunityIcons
                      name="camera-switch"
                      style={{ color: "#FFF", fontSize: 40}}
                  />
                </TouchableOpacity>
              </View>
            </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  topBar: {
    paddingTop: '15%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  albumMenu: {
    top: 0,
  },
  camera: {
    height: '69.4%',
    paddingBottom: 10,
    justifyContent: 'flex-end'
  },
  folderListContainer: {
    marginBottom: 0,
    backgroundColor: '#000'
  },
  folderItem: {
    paddingTop: 12,
    paddingBottom: 6,
    marginHorizontal: 16
  },
  folderText: {
    color: '#fff',
    fontSize: 16
  },
  cameraButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingLeft: 27,
    paddingRight: 27,
    width: '100%',
    backgroundColor: '#000'
  },
  cameraButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
});

const mapStateToProps = state => ({
  lastChange: state.lastChange
})

const mapDispatchToProps = dispatch => ({
  updateLastChange: message => {
    dispatch(updateLastChange(message));
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SnapCamera);
