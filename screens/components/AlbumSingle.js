import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, Modal, FlatList, TextInput, Alert, Touchable} from 'react-native';
import Gallery from 'react-native-image-gallery';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { FontAwesome } from '@expo/vector-icons';

export default class AlbumSingle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          viewModal: false,
          viewOptionsModal: false,
          viewImageSlider: false,
          sliderIndex: 0,
        }
    }

    deletePhoto = () => {
      const { allPhotos, album } = this.props;
      const filteredPhotos = allPhotos.filter(photo => photo.album_id === album.id);

      const photo = filteredPhotos[this.state.sliderIndex];
      const id = photo.id;
      const file = photo.image_uri.split('/photos')[1];

      this.setState({ viewImageSlider: false })
      this.props.deleteSinglePhoto(id, file);
    }

    openImageSlider = (index) => {
      this.setState({
        viewImageSlider: true,
        sliderIndex: index
      })
    }

    formatData = (data, numColumns) => {
      const numberOfFullRows = Math.floor(data.length / numColumns);
    
      let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
      while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
        data.push({ key: `blank-${numberOfElementsLastRow}`, empty: true });
        numberOfElementsLastRow++;
      }
    
      return data;
    };

    render() {
        const { allPhotos, album } = this.props;
        if (this.props.allPhotos === undefined) return null;

        let filteredPhotos = [];
        allPhotos.forEach(image => {
          if (image.album_id === album.id) {
            let photo = { folder_name: image.folder_name, dimensions: { width: 150, height: 150 } }; // maybe make these values dynamic based on screen size???
            photo.source = {url: image.image_uri};
            filteredPhotos.push(photo);
          }
        })
        return (
            <View>
              <TouchableOpacity style={styles.loadedAlbumsSingle} onPress={() => this.setState({viewModal: true})}>
                <View style={styles.loadedAlbumRow}>
                  <View>
                    <Text style={styles.loadedAlbumTitle}>{album.name}</Text>
                    <Text style={styles.loadedAlbumTemplate}>Template - {album.template.title}</Text>
                  </View>
                  <Menu>
                      <MenuTrigger
                        text="..."
                        customStyles={{
                          triggerOuterWrapper: {
                          },
                          triggerText: {
                            position: 'relative',
                            color: '#F06543',
                            fontSize: 40,
                            lineHeight: 20,
                            bottom: -2,
                            padding: 13,
                            paddingRight: 20
                          }
                        }}
                      />
                      <MenuOptions>
                        <MenuOption onSelect={() => this.props.uploadAlbumToDropbox(album.id, album.name)}>
                          <Text>Upload</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => Alert.alert(
                          'You sure?',
                          'This album and all photos saved within it will be deleted forever.',
                          [
                              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                              {text: 'OK', onPress: () => this.props.deleteAlbum(album.id)}
                          ]
                        )}>
                          <Text style={{color: 'red'}}>Delete</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                </View>
              </TouchableOpacity>

              {this.state.viewModal && filteredPhotos.length > 0 && (
                <View>
                  <Modal animationType="slide">
                    <TouchableOpacity style={styles.modalBackBtn} onPress={() => this.setState({viewModal: false})}>
                      <Text style={styles.modalBackText}>Back</Text>
                    </TouchableOpacity>
                    {this.state.viewImageSlider ? (
                      <View style={{flex: 1, marginTop: 70}}>
                        <Gallery
                          style={{ flex: 1, backgroundColor: 'black' }}
                          images={filteredPhotos}
                          initialPage={this.state.sliderIndex}
                          onPageSelected={(index) => this.setState({sliderIndex: index})}
                        />
                        <View style={{ top: 0, height: 65, backgroundColor: 'rgba(0, 0, 0, 0.7)', width: '50%', position: 'absolute', justifyContent: 'center' }}>
                          <TouchableOpacity onPress={() => this.setState({viewImageSlider: false})}><Text style={{ textAlign: 'left', color: 'white', fontSize: 15, paddingLeft: '5%' }}><FontAwesome name="close" style={{fontSize: 20}}/></Text></TouchableOpacity>
                        </View>
                        <View style={{ top: 0, right: 0, height: 65, backgroundColor: 'rgba(0, 0, 0, 0.7)', width: '50%', position: 'absolute', justifyContent: 'center' }}>
                          <TouchableOpacity 
                            onPress={() => Alert.alert(
                              'You sure?',
                              'This image will be permanently deleted.',
                              [
                                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                  {text: 'OK', onPress: this.deletePhoto}
                              ]
                              )}
                          >
                            <Text style={{ textAlign: 'right', color: 'white', fontSize: 15, paddingRight: '5%' }}><FontAwesome name="trash-o" style={{ color: "red", fontSize: 20}}/></Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ bottom: 0, height: 100, backgroundColor: 'rgba(0, 0, 0, 0.7)', width: '100%', position: 'absolute', justifyContent: 'center' }}>
                          <Text style={{ textAlign: 'center', color: 'white', fontSize: 15, fontStyle: 'italic' }}>{filteredPhotos[this.state.sliderIndex].folder_name}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={{flex: 1, marginTop: 70}}>
                        <FlatList
                          data={this.formatData(filteredPhotos, 3)}
                          numColumns={3}
                          keyExtractor={(item, index) => `thumbnail${index}`}
                          renderItem={({item, index}) => {
                            if (item.empty) return <View style={[styles.thumbnail, styles.thumbnailInvisible]} />;
                            return <TouchableOpacity onPress={() => this.openImageSlider(index)} style={styles.thumbnail}><Image style={styles.thumbnailImage} source={{uri: item.source.url}}/></TouchableOpacity>
                          }}
                        />

                      </View>
                    )}

                  </Modal>
                </View>
              )}

              {this.state.viewModal && filteredPhotos.length === 0 && (
                <View>
                  <Modal animationType="slide">
                    <TouchableOpacity style={styles.modalBackBtn} onPress={() => this.setState({viewModal: false})}>
                      <Text style={styles.modalBackText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalNoPhotosNotice}>No photos. Start snapping!</Text>
                  </Modal>
                </View>
              )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
  loadedAlbumsSingle: {
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 20,
    borderBottomColor: '#E8E9EB',
    borderBottomWidth: 1
  },
  loadedAlbumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  loadedAlbumTitle: {
    color: '#313638',
    fontSize: 20
  },
  loadedAlbumTemplate: {
    color: '#313638',
    marginTop: 5
  },
  deleteButton: {
    padding: 5,
    backgroundColor: 'red'
  },

  modalBackBtn: {
    top: '5.5%',
    left: '5%',
    zIndex: 10
  },
  modalBackText: {
    color: '#000',
    fontSize: 20
  },
  modalNoPhotosNotice: {
    top: '50%',
    left: '30%'
  },
  thumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / 3,
  },
  thumbnailImage: {
    flex:1,
    resizeMode: 'cover',
    width: '100%'
  },
  thumbnailInvisible: {
    backgroundColor: 'transparent',
  },
})