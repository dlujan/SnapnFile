import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Button, TextInput, Alert} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { connect } from 'react-redux';
import { updateLastChange } from '../../actions/actions';

class TemplateSingle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewModal: false,
      templateNewName: '',
      layerOne: [],
      layerOneOriginal: [],
      layerTwo: []
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
    const defaultName = this.state.layerOne.length;
    this.setState({ 
      layerOne: [...this.state.layerOne, `Folder ${defaultName + 1}`]
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
          <View style={styles.modalContainer}>
            <Modal animationType="slide">
              <View style={styles.modalContent}>
                <Text style={styles.modalHeading}>View/Edit</Text>

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
                
                <TextInput
                    style={styles.modalNewTemplateName}
                    placeholder={templateTitle}
                    onChangeText={this.handleTemplateName}
                    value={this.state.templateNewName}
                />
                <View style={styles.newFoldersList}>
                    {this.state.layerOne.length !== 0 && this.state.layerOne.map((name, index) => (
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
                    <View style={styles.addFolder}><Button title="Add Folder" onPress={() => this.addFolder()}/></View>
                </View>
                <Button title="Save Changes" onPress={() => this.updateTemplate(index)}/>
                <Button
                    title="Close"
                    onPress={() => Alert.alert(
                    'You sure?',
                    'You will lose any progress updating this template.',
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

      </View>
    );
  }
}

const styles = StyleSheet.create({
  // Loaded Templates
  loadedTemplatesList: {
    backgroundColor: '#f7f7f7',
    width: '90%'
  },
  loadedTemplatesSingle: {
    margin: 5,
    padding: 5
  },
  loadedTemplateRow: {
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
  modalNewFolderRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  modalNewFolder: {
    fontSize: 20,
    width: '90%'
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

export default connect(mapStateToProps, mapDispatchToProps)(TemplateSingle);
