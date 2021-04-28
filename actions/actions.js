import { PRIMARY_CHANGE } from '../constants';
import { UPLOAD_INPROGRESS } from '../constants';
import { UPLOAD_COMPLETE } from '../constants';

export function updateLastChange(change) {
    // The change will be a string, detailing what just happened (took a picture, created template, deleted album)
    console.log(`From actions: ${change}`)
    return {
        type: PRIMARY_CHANGE,
        payload: change
    }
}

export function albumStartedUploading(message) {
    console.log(`From actions: ${message}`)
    return {
        type: UPLOAD_INPROGRESS,
        payload: message
    }
}

export function albumStoppedUploading(result) {
    console.log(`From actions: ${result.message}`)
    return {
        type: UPLOAD_COMPLETE,
        payload: result
    }
}
