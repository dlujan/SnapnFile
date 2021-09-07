import AsyncStorage from '@react-native-async-storage/async-storage';

// Dropbox token is set in Account.js - use this function to get the token in order to start making API calls
// Will want to do that when sending an album to dropbox - so probably inside Albums.js
export const getDropboxToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_Key')
      if(value !== null) {
        return value;
      }
    } catch(e) {
      console.error(e);
    }
  }

export const getUID = async () => {
    try {
      const value = await AsyncStorage.getItem('@user_Id')
      if(value !== null) {
        return value;
      }
    } catch(e) {
      console.error(e);
    }
  }
// TODO :: delete this wherever it appears in components and import this there
export const getUserName = async () => {
    try {
      const value = await AsyncStorage.getItem('@user_Name')
      if(value !== null) {
        // In Login.js I put a / between the first and last name when setting it in LS. Bc for SOME reason is likes to remove that middle space -_-
        return value.replace("/", " ");
      }
    } catch(e) {
      console.error(e);
    }
  }

  export const checkIfDuplicateExists = (arr) => {
    return new Set(arr).size !== arr.length;
  }
