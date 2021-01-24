import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Button, TextInput, Alert} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class TemplateSingle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewModal: false,
      templateName: '',
      layerOne: [],
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
    const defaultName = this.state.layerOne.length;
    this.setState({ 
      layerOne: [...this.state.layerOne, `Folder ${defaultName + 1}`]
    })
  }

  openModal = () => {
    // When modal opens, populate the specific template component's state, using provided index
    const { templates, template, index } = this.props;
    const thisTemplate = templates[template].folders;
    
    const folderList = thisTemplate.map(folder => {
      return folder;
    })

    this.setState({
      layerOne: folderList,
      viewModal: true
    })
  }

  closeModal = () => {
    this.setState({
      templateName: '',
      layerOne: [],
      layerTwo: [],
      viewModal: false
    })
  }

  render() {
    const { templates, template, index } = this.props;
    const templateTitle = templates[template].title;
    return (
      <View>
        <TouchableOpacity style={styles.loadedTemplatesSingle} onPress={this.openModal}>
          <View style={styles.loadedTemplateRow1}>
            <Text style={styles.loadedTemplateTitle}>{templates[template].title}</Text>
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
                <Button title="Save Changes" onPress={() => this.createTemplate()}/>
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
