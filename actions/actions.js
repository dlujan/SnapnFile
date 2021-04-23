import { PRIMARY_CHANGE } from '../constants';
export function updateLastChange(change) {
    // The change will be a string, detailing what just happened (took a picture, created template, deleted album)
    console.log(`From actions: ${change}`)
    return {
        type: PRIMARY_CHANGE,
        payload: change
    }
}
