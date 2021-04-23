import { createStore, combineReducers } from 'redux';

// As in the reducer that handles major changes
import changeReducer from '../reducers/reducer';

const rootReducer = combineReducers(
    { lastChange: changeReducer }
);

const configureStore = () => {
    return createStore(rootReducer);
}

export default configureStore;
