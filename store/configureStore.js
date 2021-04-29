import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import changeReducer from '../reducers/general';
import uploadsReducer from '../reducers/uploads';

const middleware = [thunk];

const rootReducer = combineReducers({
    lastChange: changeReducer,
    albumIsUploading: uploadsReducer,
    uploadSuccess: uploadsReducer,
    uploadMessage: uploadsReducer
});

const configureStore = () => {
    return createStore(rootReducer, applyMiddleware(...middleware));
}

export default configureStore;
