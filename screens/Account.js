import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import firebase from 'firebase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { dbClientID } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
};

const useProxy = Platform.select({ web: false, default: true });

export default function Account() {
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
        native: 'snapnfileredirect://redirect',
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
  }, [response]);

  const setDBToken = async (token) => {
    try {
      await AsyncStorage.setItem('@storage_Key', token)
    } catch (e) {
      console.error(e);
    }
  }

  const signOutUser = async () => {
    const keys = ['@storage_Key', '@user_Id']
    try {
      await AsyncStorage.multiRemove(keys);
    } catch(e) {
      console.error(e);
    }
    firebase.auth().signOut();
  }

  return (
    <View style={styles.container}>
      <Text>Account</Text>
      <Button title="Sign out" onPress={() => signOutUser()}/>
      {!isToken && (
        <Button
        disabled={!request}
        title="Connect to Dropbox"
        onPress={() => {if (!isToken) promptAsync({ useProxy })}}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
