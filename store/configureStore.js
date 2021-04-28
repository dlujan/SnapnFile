import { createStore, combineReducers } from 'redux';

import changeReducer from '../reducers/general';
import uploadsReducer from '../reducers/uploads';

const rootReducer = combineReducers({
    lastChange: changeReducer,
    albumIsUploading: uploadsReducer,
    uploadSuccess: uploadsReducer,
    uploadMessage: uploadsReducer
});

const configureStore = () => {
    return createStore(rootReducer);
}

export default configureStore;
