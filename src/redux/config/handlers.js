/**
 *  config/handlers.js
 *  
 *  Created by Dmitry Chulkov 05/06/2020
 */
import { batch } from 'react-redux';
import { setProperty, PROPERTIES } from "./reducer";

const RTL_LANGUAGES = ["he"]

export const updateLanguage = (lang) => {
    return async dispatch => {
        try{
            batch(() => {
                dispatch(setProperty(PROPERTIES.LANGUAGE, lang));
                if(RTL_LANGUAGES.includes(lang)){
                    dispatch(setProperty(PROPERTIES.RTL, true));
                }else{
                    dispatch(setProperty(PROPERTIES.RTL, false));
                }
            })
        }catch(e){
            console.error(e);
        }
    }
}

export const doNotCheckNewVersionAgain = () => {
    return async dispatch => {
        try{
            dispatch(setProperty(PROPERTIES.CHECK_NEW_VERSION, false));
        }catch(e){
            console.error(e);
        }
    }
}