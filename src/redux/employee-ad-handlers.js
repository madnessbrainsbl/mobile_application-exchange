/**
 *  employee-ad-handlers.js
 *  Created by Dmitry Chulkov
 */

import {
    fetchEmployeeAds,
    fetchEmployeeAdsFulfilled,
    fetchAdsNextPageFulfilled,
    incrementCommentCounterAction,
    pushNewAdAction,
    updateAdAction,
    removeAdAction
} from './employee-ad-reducer';

import store from './store';
import API from "../../backend/BackendAPI";

export const getEmployeeAds = () => {
    return async dispatch => {
        try{
            dispatch(fetchEmployeeAds())
            const result = await API.getEmployeeAdList();
            const nextPageUrl = result["next"];
            let nextPage = null;
            if(nextPageUrl !== null && nextPageUrl.includes("page=")){
                nextPage = nextPageUrl.substring(nextPageUrl.indexOf("page=") + "page=".length)
            }
            dispatch(fetchEmployeeAdsFulfilled(result["results"], nextPage))
        }catch(error){
            console.log(error);
        }
    }
}

export const getMoreEmployeeAds = () => {
    return async dispatch => {
        try{
            dispatch(fetchEmployeeAds())
            var { nextPage } = store.getState().employeeAdReducer;
            if(nextPage !== null){
                const result = await API.getEmployeeAdListWithPage(store.getState().employeeAdReducer.nextPage);
                const nextPageUrl = result["next"];
                let nextPage = null;
                if(nextPageUrl !== null && nextPageUrl.includes("page=")){
                    nextPage = nextPageUrl.substring(nextPageUrl.indexOf("page=") + "page=".length)
                }
                dispatch(fetchAdsNextPageFulfilled(result["results"], nextPage))
            }
        }catch(error){
            console.log(error);
        }
    }
}

export const incrementCommentCounter = (adID) => {
    return async dispatch => {
        try{
            dispatch(incrementCommentCounterAction(adID))
        }catch(error){
            console.log(error);
        }
    }
}

export const pushNewAd = (ad) => {
    return async dispatch => {
        dispatch(pushNewAdAction(ad))
    }
}

export const updateAd = (adID, text) => {
    return async dispatch => {
        dispatch(updateAdAction(adID, text))
    }
}

export const removeAd = (adID) => {
    return async dispatch => {
        dispatch(removeAdAction(adID))
    }
}