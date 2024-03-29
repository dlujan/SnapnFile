import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const onSignIn = (googleUser) => {
  console.log('Google Auth Response', googleUser);
  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
  var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
    unsubscribe();
    // Check if we are already signed-in Firebase with the correct user.
    if (!isUserEqual(googleUser, firebaseUser)) {
      // Build Firebase credential with the Google ID token.
      var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
      );
      // Sign in with credential from the Google user.
      firebase.auth()
      .signInWithCredential(credential)
      .then((result) => {
        console.log('user signed in');
        if (result.additionalUserInfo.isNewUser) {
        firebase
          .database()
          .ref('/users/' + result.user.uid)
          .set({
            gmail: result.user.email,
            profile_picture: result.additionalUserInfo.profile.picture,
            locale: result.additionalUserInfo.profile.locale,
            first_name: result.additionalUserInfo.profile.given_name,
            last_name: result.additionalUserInfo.profile.family_name,
            created_at: Date.now()
          });
        } else {
          firebase
          .database()
          .ref('/users/' + result.user.uid).update({
            last_logged_in: Date.now()
          })
        }
        setUID(result.user.uid);
        setUserName(result.additionalUserInfo.profile.given_name, result.additionalUserInfo.profile.family_name);
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
    } else {
      console.log('User already signed-in Firebase.');
    }
  });
}

const signInWithGoogleAsync = async () => {
  try {
    const result = await Google.logInAsync({
      //androidClientId: YOUR_CLIENT_ID_HERE,
      iosClientId: '485885658904-554ksfe631f5qla5003aph9bqh5rdobe.apps.googleusercontent.com',
      iosStandaloneAppClientId: '485885658904-l8ko3m9i247j7cg3b9k3l4n1k8aadddi.apps.googleusercontent.com',
      androidClientId: '485885658904-aulq2ui18jhvmtvoch66hbmsbbbhc4sr.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      behavior: "web"
    });

    if (result.type === 'success') {
      onSignIn(result);
      return result.accessToken;
    } else {
      console.log('cancelled')
      return { cancelled: true };
    }
  } catch (e) {
    console.log(e);
    alert(e);
    return { error: true };
  }
}

const isUserEqual = (googleUser, firebaseUser) => {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {
        // We don't need to reauth the Firebase connection.
        return true;
      }
    }
  }
  return false;
}

const setUID = async (id) => {
  try {
    await AsyncStorage.setItem('@user_Id', id)
  } catch (e) {
    console.error(e);
  }
}

const setUserName = async (first, last) => {
  const name = `${first}/${last}`;
  try {
    await AsyncStorage.setItem('@user_Name', name)
  } catch (e) {
    console.error(e);
  }
}

export default function Login() {
  return (
    <View style={styles.container}>
      <Button 
        title="Sign in with Google"
        onPress={() => signInWithGoogleAsync()}
      />
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
