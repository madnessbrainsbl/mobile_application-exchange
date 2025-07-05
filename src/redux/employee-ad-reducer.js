/**
 *  employee-ad-reducer.js
 *  Created by Dmitry Chulkov
 */

const initialState = {    
    ads: [],
    loading: false,
    endReached: false,
    nextPage: null
}

const GET_ADS = "GET_ADS";
const GET_ADS_FULFILLED = "GET_ADS_FULFILLED";
const GET_ADS_NEXT_PAGE = "GET_ADS_NEXT_PAGE";
const UPDATE_COMMENT_COUNTER = "UPDATE_COMMENT_COUNTER";
const PUSH_AD = "PUSH_AD";
const UPDATE_AD = "UPDATE_AD";
const REMOVE_AD = "REMOVE_AD";

const employeeAdReducer = (state = initialState, action) => {
    switch(action.type){
        case GET_ADS:
            return {...state, loading: true};
        case GET_ADS_FULFILLED:
            return {
                ...state,
                loading: false,
                ads: [...action.payload],
                nextPage: action.nextPage,
                endReached: action.endReached
            };
        case GET_ADS_NEXT_PAGE:
            return {
                ...state,
                loading: false,
                ads: [...state.ads, ...action.payload],
                nextPage: action.nextPage,
                endReached: action.endReached
            };
        case UPDATE_COMMENT_COUNTER:
            return Object.assign({}, state, {
                ads: state.ads.map((item) => {
                    if(item.id === action.payload){
                        return {...item, comment_count: item.comment_count + 1}
                    }else{
                        return item;
                    }
                })
            })
        case PUSH_AD:
            return {
                ...state,
                ads: [action.payload, ...state.ads]
            }
        case UPDATE_AD:
            return Object.assign({}, state, {
                ads: state.ads.map(item => {
                    if(item.id === action.adID){
                        return {...item, text: action.text}
                    }else{
                        return item;
                    }
                })
            })
        case REMOVE_AD:
            let {ads} = state;
            let adIndex = ads.findIndex(item => item.id === action.adID);
            ads.splice(adIndex, 1);
            return { ...state, ads: [...ads]}
        default:
            return state;
    }
}

export default employeeAdReducer;

export const fetchEmployeeAds = () => {
    return {
        type: GET_ADS
    }
}

export const fetchEmployeeAdsFulfilled = (ads, nextPage) => {
    return {
        type: GET_ADS_FULFILLED,
        payload: ads,
        nextPage: nextPage,
        endReached: nextPage === null
    }
}

export const fetchAdsNextPageFulfilled = (ads, nextPage) => {
    return {
        type: GET_ADS_NEXT_PAGE,
        payload: ads,
        nextPage: nextPage,
        endReached: nextPage === null
    }
}

export const incrementCommentCounterAction = (adID) => {
    return {
        type: UPDATE_COMMENT_COUNTER,
        payload: adID
    }
}

export const pushNewAdAction = (ad) => {
    return {
        type: PUSH_AD,
        payload: ad
    }
}

export const updateAdAction = (adID, text) => {
    return {
        type: UPDATE_AD,
        adID: adID,
        text: text
    }
}

export const removeAdAction = (adID) => {
    return {
        type: REMOVE_AD,
        adID: adID
    }
}
