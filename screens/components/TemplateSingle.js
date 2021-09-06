import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, Modal, Button, TextInput, Alert, ScrollView} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { connect } from 'react-redux';
import { updateLastChange } from '../../actions/actions';

import { checkIfDuplicateExists } from '../../util';

class TemplateSingle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewModal: false,
      templateNewName: '',
      layerOne: [],
      layerOneOriginal: []
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

  updateTemplate = async (index) => {

    if (this.state.layerOne.length <= 0) {
      alert('You cannot save a template with no folders. Delete the template or add at least one folder.')
      return;
    }

    if (checkIfDuplicateExists(this.state.layerOne)) {
      alert('Cannot have duplicate folder names.');
      return;
    }

    // Check that new template name doesnt equal empty string or all spaces
    const templateNameChanged = this.state.templateNewName !== '' && this.state.templateNewName.trim() !== '';
    const foldersChanged = this.compareArrays(this.state.layerOne, this.state.layerOneOriginal);
    
    if (templateNameChanged || foldersChanged) {
      const uid = await this.getUID();
      let ref = firebase.database().ref('/users/' + uid).child("album_templates");

      let updatedTemplate = {
        title: templateNameChanged ? this.state.templateNewName : this.state.templateCurrentName,
        folders: this.state.layerOne
      }
      
      ref.once('value').then(snapshot => {
        let templates = snapshot.val();
        if (templates !== null) {
          const templateToUpdate = Object.keys(templates)[index];
          if (templateToUpdate) {
            ref.child(templateToUpdate).set(updatedTemplate);
            console.log(`Template ${templateToUpdate} updated.`);
            this.props.updateLastChange('Template updated.');
            this.closeModal();
          }
        }
      })


    } else {
      alert('No changes detected.')
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
          this.props.updateLastChange('Template deleted.');
        }
      }
    })
  }

  handleTemplateName = (name) => {
    this.setState({ templateNewName: name });
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

    const defaultName = this.state.layerOne.length;
    this.setState({ 
      layerOne: [...this.state.layerOne, `Folder${defaultName + 1}`]
    })
  }

  deleteFolder = (index) => {
    this.setState({ layerOne: this.state.layerOne.filter((_, i) => i !== index) })
  }

  openModal = () => {
    // When modal opens, populate the specific template component's state, using provided index
    const { templates, template } = this.props;
    const templateTitle = templates[template].title;
    const currentTemplate = templates[template].folders;
    
    // DEV: Manually delete a template, second arg is the index of the one I want to delete
    // if (currentTemplate === undefined) this.deleteTemplate(0, 3);

    const folderListCurrent = currentTemplate.map(folder => {
      return folder;
    })

    this.setState({
      templateCurrentName: templateTitle,
      layerOne: [...folderListCurrent],
      layerOneOriginal: [...folderListCurrent],
      viewModal: true
    })
  }

  closeModal = () => {
    this.setState({
      viewModal: false,
      templateCurrentName: '',
      templateNewName: '',
      layerOne: [],
      layerOneOriginal: [],
      layerTwo: []
    })
  }

  compareArrays = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return true;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return true;
    }

    return false;
  }

  render() {
    // I'm using current template to render title placeholder only
    const { templates, template, index } = this.props;
    const templateTitle = templates[template].title;
    return (
      <View>
        <TouchableOpacity style={styles.loadedTemplatesSingle} onPress={this.openModal}>
          <View style={styles.loadedTemplateRow}>
            <Text style={styles.loadedTemplateTitle}>{templateTitle}</Text>
          </View>
          {/* <View style={styles.loadedTemplateFolders}>
            {templates[template].folders.map((name, index) => (
              <Text key={index}>{name}</Text>
            ))}
          </View> */}
        </TouchableOpacity>
        
        {this.state.viewModal && (
          <View>
            <Modal animationType="slide">
              <TouchableOpacity style={styles.modalBackBtn}
                onPress={() => Alert.alert(
                  'Confirm',
                  'You will lose any progress updating this template.',
                  [
                      {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                      {text: 'OK', onPress: this.closeModal}
                  ]
                  )}
              >
                <FontAwesome name="chevron-left" style={{ color: "#F06543", fontSize: 20}}/>
              </TouchableOpacity>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>Template Single</Text>
                
                <TextInput
                    style={styles.modalNewTemplateName}
                    placeholder={templateTitle}
                    onChangeText={this.handleTemplateName}
                    value={this.state.templateNewName}
                    returnKeyType="done"
                />

                <View style={styles.newFoldersList}>
                  <ScrollView>
                    {this.state.layerOne.length !== 0 && this.state.layerOne.map((name, index) => (
                    <View key={index} style={styles.modalNewFolderRow}>
                      <TextInput
                        style={styles.modalNewFolder}
                        placeholder={`Folder ${index+1}`}
                        value={this.state.layerOne[index]}
                        onChange={(event) => this.handleFolderName(event, index)}
                        returnKeyType="done"
                      />
                      <TouchableOpacity style={styles.modalFolderDelete} onPress={() => this.deleteFolder(index)}>
                        <FontAwesome name="minus-circle" style={{ color: '#ed3434', fontSize: 20}}/>
                      </TouchableOpacity>
                    </View>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.buttonWrap}>
                  <TouchableHighlight underlayColor={'#D94521'} style={styles.touchable} onPress={() => this.addFolder()}>
                    <Text style={styles.button}>Add Folder</Text>
                  </TouchableHighlight>
                </View>
                <View style={styles.buttonWrap}>
                  <TouchableHighlight underlayColor={'#1c911c'} style={[styles.touchable, styles.green]} onPress={() => this.updateTemplate(index)}>
                    <Text style={styles.button}>Save Changes</Text>
                  </TouchableHighlight>
                </View>
                <View style={styles.buttonWrap}>
                  <TouchableHighlight underlayColor={'#c72c2c'} style={[styles.touchable, styles.red]} 
                    onPress={(event) => Alert.alert(
                      'Confirm',
                      'This template will be deleted permanently.',
                      [
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                        {text: 'OK', onPress: () => this.deleteTemplate(event, index)}
                      ]
                    )}
                  >
                    <Text style={styles.button}>Delete Template</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </Modal>
          </View>
        )}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalBackBtn: {
    top: '6.5%',
    left: '3%',
    zIndex: 10
  },
  // Loaded Templates
  loadedTemplatesSingle: {
    padding: 20,
    paddingLeft: 0,
    marginLeft: 20,
    borderBottomColor: '#E8E9EB',
    borderBottomWidth: 1
  },
  loadedTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadedTemplateTitle: {
    color: '#313638',
    fontSize: 20
  },
  loadedTemplateFolders: {
    margin: 5
  },

  // New Template Modal
  modalContent: {
    paddingTop: 100,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    height: '100%'
  },
  modalHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
  },
  modalNewTemplateName: {
    padding: 5,
    paddingLeft: 20,
    marginBottom: 10,
    fontSize: 26,
  },
  newFoldersList: {
    backgroundColor: '#f7f7f7',
    marginLeft: 10,
    marginRight: 10,
    width: '100%',
    maxHeight: '41%'
  },
  modalNewFolderRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomColor: '#E8E9EB',
    borderBottomWidth: 1
  },
  modalNewFolder: {
    fontSize: 20,
    width: '80%'
  },
  modalFolderDelete: {
    padding: 15
  },

  buttonWrap: {
    justifyContent: 'center',
    margin: 12,
    marginBottom: 0
  },
  touchable: {
    alignItems: 'center',
    backgroundColor: '#F06543',
    padding: 12
  },
  green: {
    backgroundColor: '#22b522'
  },
  red: {
    backgroundColor: '#ed3434'
  },
  button: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold'
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

export default connect(mapStateToProps, mapDispatchToProps)(TemplateSingle);
