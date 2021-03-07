import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Modal, Button, TextInput, Alert} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUID } from '../util';

import TemplateSingle from './components/TemplateSingle';
import TemplateNew from './components/TemplateNew';

export default class Templates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTemplates: [],
      viewModal: false
    }
  }

  // *******************************************
  // *******************************************
  // TODO: Refactor all code having to do with Object.keys() -ing templates and use Object.values() intead
  // *******************************************
  // *******************************************

  // TODO: Cache pulled templates - maybe???
  componentDidMount() {
    this.loadTemplatesFromFirebase();
  }
  // ehh..
  componentDidUpdate() {
    this.loadTemplatesFromFirebase();
  }

  // TODO: Loading text while templates are being fetched from Firebase (ex. "Loading templates...")
  loadTemplatesFromFirebase = async () => {
    const uid = await getUID();
    let ref = firebase.database().ref('users/' + uid).child("album_templates");
    ref.once('value').then(snapshot => {
      let templates = snapshot.val();
      if (templates !== null) {
        this.setState({ allTemplates: templates });
      }
    })
  }

  closeNewTemplateModal = () => {
    this.setState({
      viewModal: false
    })
  }

  renderSavedTemplates = () => {
    const templates = this.state.allTemplates;
    return (
      <View style={styles.loadedTemplatesList}>
        {Object.keys(templates).map((template, index) => (
          <TemplateSingle
            templates={templates}
            template={template}
            key={index} 
            index={index}
          />
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
        <TemplateNew
          viewModal={this.state.viewModal}
          closeModal={this.closeNewTemplateModal}
        />
          // <View style={styles.modalContainer}>
          //   <Modal animationType="slide">
          //     <View style={styles.modalContent}>
          //       <Text style={styles.modalHeading}>New Template</Text>
          //       <TextInput
          //         style={styles.modalNewTemplateName}
          //         placeholder="Template Name"
          //         onChangeText={this.handleTemplateName}
          //         value={this.state.newTemplateName}
          //       />
          //       <View style={styles.newFoldersList}>
          //         {this.state.layerOne.length !== 0 && this.state.layerOne.map((folder, index) => (
          //           <TextInput
          //             style={styles.modalNewFolder}
          //             key={index}
          //             placeholder={`Folder ${index+1}`}
          //             value={this.state.layerOne[index]}
          //             onChange={(event) => this.handleFolderName(event, index)}
          //           />
          //         ))}
          //         <View style={styles.addFolder}><Button title="Add Folder" onPress={() => this.addFolder()}/></View>
          //       </View>
          //       <Button title="Save Template" onPress={() => this.createTemplate()}/>
          //       <Button
          //         title="Close"
          //         onPress={() => Alert.alert(
          //           'You sure?',
          //           'You will lose your current progress on this new template.',
          //           [
          //             {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          //             {text: 'OK', onPress: this.closeModal}
          //           ]
          //         )}

          //       />
          //     </View>
          //   </Modal>
          // </View>
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
