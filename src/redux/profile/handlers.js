/**
 *  profile/handlers.js
 *  
 *  Created by Dmitry Chulkov 23/04/2020
 */

import { setProfile } from "./reducer";
import API from '../../api';

export const loadProfile = () => {
    return async dispatch => {
        try{
            const profile = await API.getMyProfile();
            dispatch(setProfile(profile));
        }catch(e){
            console.error(e);
        }
    }
}

export const updateProfile = (profile) => {
    return async dispatch => {
        try{
            dispatch(setProfile(profile));
        }catch(e){
            console.error(e);
        }
    }
}