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
