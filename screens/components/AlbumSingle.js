import { FileSystemSessionType } from 'expo-file-system';
import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, Modal, Button, TextInput, Alert} from 'react-native';
import GridImageView from 'react-native-grid-image-viewer';

export default class AlbumSingle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          viewModal: false,
          imageIndex: 0
        }
    }

    render() {
        const { allPhotos, album } = this.props;

        if (this.props.allPhotos === undefined) return null;

        let filteredPhotos = [];
        allPhotos.forEach(image => {
          if (image.album_id === album.id) {
            filteredPhotos.push(image);
          }
        })

        return (
            <View>
              <TouchableOpacity style={styles.loadedAlbumsSingle} onPress={() => this.setState({viewModal: true})}>
                <View style={styles.loadedAlbumRow}>
                  <Text style={styles.loadedAlbumTitle}>{album.name} - {album.template.title}</Text>
                  <Button title="Upload" onPress={() => this.props.uploadAlbumToDropbox(album.id, album.name)}></Button>
                </View>
              </TouchableOpacity>

              {this.state.viewModal && filteredPhotos.length > 0 && (
                <View>
                  <Modal animationType="slide">
                    <TouchableOpacity style={styles.modalBackBtn} onPress={() => this.setState({viewModal: false})}>
                      <Text style={styles.modalBackText}>Back</Text>
                    </TouchableOpacity>
                    <GridImageView data={filteredPhotos} />
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
  loadedAlbumsList: {
    backgroundColor: '#f7f7f7',
    width: '90%'
  },
  loadedAlbumsSingle: {
    margin: 5,
    padding: 5
  },
  loadedAlbumRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadedAlbumTitle: {
    color: 'lime',
    fontSize: 20
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