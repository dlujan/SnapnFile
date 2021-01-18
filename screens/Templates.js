import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Modal, Button, TextInput, Alert} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render } from 'react-dom';

export default class Templates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTemplates: [],
      viewModal: false,
      newTemplateName: '',
      layerOne: [],
      layerTwo: []
    }
  }

  // TODO: Cache pulled templates
  componentDidMount() {
    this.loadTemplatesFromFirebase();
  }
  // ehh..
  componentDidUpdate() {
    this.loadTemplatesFromFirebase();
  }

  loadTemplatesFromFirebase = async () => {
    const uid = await this.getUID();
    let ref = firebase.database().ref('users/' + uid).child("album_templates");
    ref.once('value').then(snapshot => {
      let templates = snapshot.val();
      if (templates !== null) {
        this.setState({ allTemplates: templates });
      }
    })
  }

  // TODO: Put these into separate utility functions file
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

  // TODO: Loading screen while templates are being fetched from Firebase
  
  // This function uses current state to create the template
  createTemplate = async () => {
    if (this.state.newTemplateName !== '' && this.state.layerOne.length !== 0) {
      // Create a template format and save to database
      const uid = await this.getUID();
      let ref = firebase.database().ref('/users/' + uid);

      // TODO: Decide on how many layers deep I wanna let the user create and figure out how to handle it
      let newAlbumTemplate = {
        title: this.state.newTemplateName,
        folders: this.state.layerOne
      }

      ref.child("album_templates").push(newAlbumTemplate);

      this.closeModal();

    } else if (this.state.newTemplateName === '' && this.state.layerOne.length === 0) {
      alert('Please fill in template name and create at least one folder.');
    } else if (this.state.newTemplateName === '') {
      alert('Please fill in template name.');
    } else {
      alert('Please create at least one folder.');
    }
  }

  deleteTemplate = async (event, index) => {
    const uid = await this.getUID();
    let ref = firebase.database().ref('/users/' + uid).child("album_templates");

    ref.once('value').then(snapshot => {
      let templates = snapshot.val();
      if (templates !== null) {
        const templateToDelete = Object.keys(templates)[index];
        if (templateToDelete) {
          ref.child(templateToDelete).remove();
          console.log(`Template ${templateToDelete} deleted.`);
        }
      }
    })
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
    const defaultName = this.state.layerOne.length; // *** NOTE *** I MIGHT remove this, idk. Do I want the user creating folders with empty names potentially?
    this.setState({ 
      layerOne: [...this.state.layerOne, `Folder ${defaultName + 1}`]
    })
  }

  closeModal = () => {
    this.setState({
      newTemplateName: '',
      layerOne: [],
      layerTwo: [],
      viewModal: false
    })
  }

  renderSavedTemplates = () => {
    const templates = this.state.allTemplates;
    return (
      <View style={styles.loadedTemplatesList}>
        {Object.keys(templates).map((template, index) => (
          <View key={index} style={styles.loadedTemplatesSingle}>
            <View style={styles.loadedTemplateRow1}>
              <Text style={styles.loadedTemplateTitle}>{templates[template].title}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(event) => Alert.alert(
                  'You sure?',
                  'This template will be deleted permanently.',
                  [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => this.deleteTemplate(event, index)}
                  ]
                )}
              >
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.loadedTemplateFolders}>
            {templates[template].folders.map((name, index) => (
              <Text key={index}>{name}</Text>
            ))}
            </View>
          </View>
        ))}
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.pageHeading}>Templates</Text>
        { this.renderSavedTemplates() }
        { this.state.viewModal && (
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
                <View style={styles.newFoldersList}>
                  {this.state.layerOne.length !== 0 && this.state.layerOne.map((folder, index) => (
                    <TextInput
                      style={styles.modalNewFolder}
                      key={index}
                      placeholder={`Folder ${index+1}`}
                      value={this.state.layerOne[index]}
                      onChange={(event) => this.handleFolderName(event, index)}
                    />
                  ))}
                  <View style={styles.addFolder}><Button title="Add Folder" onPress={() => this.addFolder()}/></View>
                </View>
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
        )}
        <Button title="Create New Template" onPress={() => this.setState({ viewModal: true })}/>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeading: {
    fontSize: 30,
    fontWeight: 'bold'
  },

  // Loaded Templates
  loadedTemplatesList: {
    backgroundColor: '#f7f7f7',
    width: '90%'
  },
  loadedTemplatesSingle: {
    margin: 5,
    padding: 5
  },
  loadedTemplateRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  loadedTemplateTitle: {
    color: 'orange',
    fontSize: 20
  },
  deleteButton: {
    padding: 5,
    backgroundColor: 'red'
  },
  loadedTemplateFolders: {
    margin: 5
  },

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
    width: '90%'
  },
  modalNewTemplateName: {
    padding: 10,
    fontSize: 26
  },
  modalNewFolder: {
    padding: 10,
    fontSize: 20
  }
});
