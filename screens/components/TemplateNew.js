import React from 'react';
import { StyleSheet, Text, View, Modal, Button, TouchableOpacity, TextInput, Alert, ScrollView} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { connect } from 'react-redux';
import { updateLastChange } from '../../actions/actions';

import { checkIfDuplicateExists } from '../../util';

class TemplateNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newTemplateName: '',
      layerOne: []
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
  
  // This function uses current state to create the template
  createTemplate = async () => {

    if (checkIfDuplicateExists(this.state.layerOne)) {
      alert('Cannot have duplicate folder names.');
      return;
    }

    if (this.state.newTemplateName !== '' && this.state.newTemplateName.trim() !== "" && this.state.layerOne.length !== 0) {
      // Create a template format and save to database
      const uid = await this.getUID();
      let ref = firebase.database().ref('/users/' + uid);

      let newAlbumTemplate = {
        title: this.state.newTemplateName,
        folders: this.state.layerOne
      }

      ref.child("album_templates").push(newAlbumTemplate);

      this.props.updateLastChange('New template created.');

      this.closeModal();

    } else if (this.state.newTemplateName === '' && this.state.layerOne.length === 0) {
      alert('Please fill in template name and create at least one folder.');
    } else if (this.state.newTemplateName === '') {
      alert('Please fill in template name.');
    } else {
      alert('Please create at least one folder.');
    }
  }

  handleTemplateName = (name) => {
    this.setState({ newTemplateName: name });
  }

  handleFolderName = (event, index) => {
    const text = event.nativeEvent.text;

    let layerOneNew = this.state.layerOne;
    layerOneNew[index] = text;

    this.setState({ layerOne: layerOneNew });
  }

  addFolder = () => {

    if (this.state.layerOne.length >= 20) {
      alert('Folder limit reached')
      return;
    }

    const defaultName = this.state.layerOne.length; // *** NOTE *** I MIGHT remove this, idk. Do I want the user creating folders with empty names potentially?
    this.setState({ 
      layerOne: [...this.state.layerOne, `Folder${defaultName + 1}`]
    })
  }

  deleteFolder = (index) => {
    this.setState({ layerOne: this.state.layerOne.filter((_, i) => i !== index) })
  }

  closeModal = () => {
    this.setState({
      newTemplateName: '',
      layerOne: [],
      layerTwo: []
    })
    this.props.closeModal();
  }

  render() {
    return (
        <View style={styles.modalContainer}>
            <Modal animationType="slide">
                <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>New Template</Text>
                <TextInput
                    style={styles.modalNewTemplateName}
                    placeholder="Template Name"
                    onChangeText={this.handleTemplateName}
                    value={this.state.newTemplateName}
                />
                <ScrollView style={styles.newFoldersList}>
                    {this.state.layerOne.length !== 0 && this.state.layerOne.map((folder, index) => (
                    <View key={index} style={styles.modalNewFolderRow}>
                      <TextInput
                        style={styles.modalNewFolder}
                        placeholder={`Folder ${index+1}`}
                        value={this.state.layerOne[index]}
                        onChange={(event) => this.handleFolderName(event, index)}
                      />
                      <TouchableOpacity style={styles.modalFolderDelete} onPress={() => this.deleteFolder(index)}><Text>Delete</Text></TouchableOpacity>
                    </View>
                    ))}
                </ScrollView>
                <Button title="Add Folder" onPress={() => this.addFolder()}/>
                <Button title="Save Template" onPress={() => this.createTemplate()}/>
                <Button
                    title="Close"
                    onPress={() => Alert.alert(
                    'You sure?',
                    'You will lose your current progress on this new template.',
                    [
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                        {text: 'OK', onPress: this.closeModal}
                    ]
                    )}
                />
                </View>
            </Modal>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  // New Template Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalContent: {
    marginTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: 28,
    fontWeight: '600'
  },
  newFoldersList: {
    backgroundColor: '#f7f7f7',
    width: '90%',
    maxHeight: '60%'
  },
  modalNewTemplateName: {
    padding: 10,
    fontSize: 26
  },
  modalNewFolderRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  modalNewFolder: {
    width: '70%',
    fontSize: 20
  },
  modalFolderDelete: {
    width: '10%',
    textAlign: 'center',
    backgroundColor: 'red'
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

export default connect(mapStateToProps, mapDispatchToProps)(TemplateNew);
