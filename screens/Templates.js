import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableHighlight, Alert} from 'react-native';
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

  // TODO: Cache pulled templates - maybe??? -- yeah probably
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
      <ScrollView style={styles.loadedTemplatesList}>
        {Object.keys(templates).map((template, index) => (
          <TemplateSingle
            templates={templates}
            template={template}
            key={index} 
            index={index}
          />
        ))}
        <View style={styles.buttonWrap}>
          <TouchableHighlight underlayColor={'#D94521'} style={styles.touchable} onPress={() => this.setState({ viewModal: true })}>
            <Text style={styles.button}>Create New Template</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
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
        {/* <StatusBar style="auto" /> */}
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
  button: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
