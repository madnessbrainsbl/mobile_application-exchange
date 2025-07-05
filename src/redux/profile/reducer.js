/**
 *  profile/reducer.js
 *  Created by Dmitry Chulkov 23/04/2020
 */

const initialState = null;

const SET_PROFILE = "SET_PROFILE";

const profileReducer = (state = initialState, action) => {
    switch(action.type){
        case SET_PROFILE:
            return { ...state, ...action.payload };
        default:
            return state
    }
}

export const setProfile = (profile) => {
    return{
        type: SET_PROFILE,
        payload: profile
    }
}

export default profileReducer;

