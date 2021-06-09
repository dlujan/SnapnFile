import { FileSystemSessionType } from 'expo-file-system';
import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, Modal, Button, TextInput, Alert} from 'react-native';
import FancyModal from 'react-native-modal';
import GridImageView from 'react-native-grid-image-viewer';
import { FontAwesome } from '@expo/vector-icons';

export default class AlbumSingle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          viewModal: false,
          viewOptionsModal: false,
          imageIndex: 0
        }
    }

    render() {
        const { allPhotos, album } = this.props;

        if (this.props.allPhotos === undefined) return null;

        let filteredPhotos = [];
        allPhotos.forEach(image => {
          if (image.album_id === album.id) {
            filteredPhotos.push(image.image_uri);
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
                  <TouchableOpacity style={{padding: 15, paddingRight: 20}} onPress={() => this.setState({viewOptionsModal: true})}>
                    <FontAwesome name="ellipsis-h" style={{ color: "#000", fontSize: 20}}/>
                  </TouchableOpacity>
                  <FancyModal
                    isVisible={this.state.viewOptionsModal}
                    backdropOpacity={0.40}
                    onBackdropPress={() => this.setState({viewOptionsModal: false})}>
                    <View style={{backgroundColor: '#fff', padding: 20}}>
                      <Button title="Upload" onPress={() => this.props.uploadAlbumToDropbox(album.id, album.name)}/>
                      <Button
                        title="Delete"
                        onPress={() => Alert.alert(
                        'You sure?',
                        'This album and all photos saved within it will be deleted forever.',
                        [
                            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                            {text: 'OK', onPress: () => this.props.deleteAlbum(album.id)}
                        ]
                        )}
                      />
                    </View>
                  </FancyModal>
                </View>
              </TouchableOpacity>

              {this.state.viewModal && filteredPhotos.length > 0 && (
                <View>
                  <Modal animationType="slide">
                    <TouchableOpacity style={styles.modalBackBtn} onPress={() => this.setState({viewModal: false})}>
                      <Text style={styles.modalBackText}>Back</Text>
                    </TouchableOpacity>
                    <View style={{flex: 1, marginTop: 70}}>
                    <GridImageView data={filteredPhotos} uri_string={"image_uri"}/>
                    </View>
                    
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
  }
})