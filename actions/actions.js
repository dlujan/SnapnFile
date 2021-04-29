import { PRIMARY_CHANGE } from '../constants';
import { UPLOAD_INPROGRESS } from '../constants';
import { UPLOAD_COMPLETE } from '../constants';
import { REMOVE_UPLOAD_MESSAGE } from '../constants';

export const updateLastChange = (change) => dispatch => {
    // The change will be a string, detailing what just happened (took a picture, created template, deleted album)
    console.log(`From actions: ${change}`)
    dispatch({
        type: PRIMARY_CHANGE,
        payload: change
    })
}

export const albumStartedUploading = (message) => dispatch => {
    console.log(`From actions: ${message}`)
    dispatch({
        type: UPLOAD_INPROGRESS,
        payload: message
    })
}

export const albumStoppedUploading = (result) => dispatch => {
    console.log(`From actions: ${result.message}`)
    dispatch({
        type: UPLOAD_COMPLETE,
        payload: result
    })
    
    setTimeout(() => dispatch({ type: REMOVE_UPLOAD_MESSAGE, payload: '' }), 5000);
}
