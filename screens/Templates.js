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
        )}
        <Button title="Create New Template" onPress={() => this.setState({ viewModal: true })}/>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    height: '100%'
  },
  pageHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
  },
  loadedTemplatesList: {
    backgroundColor: '#fff',
    width: '100%'
  }
});

// dark: '#313638',
// lightish: '#E0DFD5',
// light: '#E8E9EB',
// primary: '#F06543',
// secondary: '#F09D51'
