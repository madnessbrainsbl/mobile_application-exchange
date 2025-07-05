/**
 *  config/reducer.js
 *  Created by Dmitry Chulkov 05/06/2020
 */

const initialState = {
    language: "en",
    rtl: false, // Indicates whether layout should render Right-To-Left,
    checkNewVersion: false
};

const SET_PROPERTY = "SET_PROPERTY";

const configReducer = (state = initialState, action) => {
    switch(action.type){
        case SET_PROPERTY:
            return { ...state, ...action.payload };
        default:
            return state
    }
}

export const setProperty = (property, value) => {
    let payload = {}
    payload[property] = value;
    return{
        type: SET_PROPERTY,
        payload
    }
}

export const PROPERTIES = {
    LANGUAGE: "language",
    RTL: "rtl",
    CHECK_NEW_VERSION: "checkNewVersion"
}

export default configReducer;

