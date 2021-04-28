import { UPLOAD_INPROGRESS } from '../constants';
import { UPLOAD_COMPLETE } from '../constants';

const initialState = {
    albumUploading: false,
    uploadSuccess: null,
    uploadMessage: ''
};
const uploadsReducer = (state = initialState, action) => {
    switch(action.type) {
        case UPLOAD_INPROGRESS:
            console.log(`From reducer: ${action.payload}`)
            return {
                ...state,
                albumUploading: true
            };
        case UPLOAD_COMPLETE:
            console.log(`From reducer: ${action.payload}`)
            return {
                ...state,
                albumUploading: false,
                uploadSuccess: action.payload.success,
                uploadMessage: action.payload.message
            };
        default:
            return state;
    }
}
export default uploadsReducer;
