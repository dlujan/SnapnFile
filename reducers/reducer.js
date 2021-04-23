import { PRIMARY_CHANGE } from '../constants';

const initialState = {
    lastChange: 'asdf'
};
const changeReducer = (state = initialState, action) => {
    switch(action.type) {
        case PRIMARY_CHANGE:
            console.log(`From reducer: ${action.payload}`)
            return {
                ...state,
                lastChange: action.payload
            };
        default:
            return state;
    }
}
export default changeReducer;
