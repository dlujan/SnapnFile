import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, TouchableHighlight } from 'react-native';
import firebase from 'firebase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { dbClientID } from '../config';
import { getUserName } from '../util';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
};

const useProxy = Platform.select({ web: false, default: true });

export default function Account() {
  const [userName, setUserName] = React.useState('');
  const [isToken, setTokenExists] = React.useState(false);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: dbClientID,
      // There are no scopes so just pass an empty array
      scopes: [],
      // Dropbox doesn't support PKCE
      usePKCE: false,
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        // scheme: 'snapnfileredirect://redirect',
        useProxy,
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      setDBToken(access_token);
      setTokenExists(true);
    }

    getTheName();
  }, [response]);

  const getTheName = async () => {
    const name = await getUserName();
    setUserName(name);
  }

  const setDBToken = async (token) => {
    try {
      await AsyncStorage.setItem('@storage_Key', token)
    } catch (e) {
      console.error(e);
    }
  }

  const signOutUser = async () => {
    const keys = ['@storage_Key', '@user_Id', '@user_Name']
    try {
      await AsyncStorage.multiRemove(keys);
    } catch(e) {
      console.error(e);
    }
    firebase.auth().signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageHeading}>Account</Text>
      <Text style={styles.userName}>Hi, {userName}</Text>
      {!isToken && request &&  (
        <View style={styles.buttonWrap}>
        <TouchableHighlight underlayColor={'#0057e5'} style={styles.touchable} onPress={() => {if (!isToken) promptAsync({ useProxy })}}>
          <Text style={styles.button}>Connect to Dropbox</Text>
        </TouchableHighlight>
      </View>
      )}
      <Button title="Sign out" onPress={() => signOutUser()}/>
      <StatusBar style="auto" />
    </View>
  );
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
  userName: {
    fontSize: 20,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 50,
  },
  buttonWrap: {
    justifyContent: 'center',
    margin: 12,
    marginBottom: 20
  },
  touchable: {
    alignItems: 'center',
    backgroundColor: '#0061fe',
    padding: 12
  },
  button: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
