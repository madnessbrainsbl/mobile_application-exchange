/**
 *  performers-reducer.js
 *  Created by Dmitry Chulkov 09/12/2019
 */

export const PERFORMERS_QUERY_COUNT = 50

const initialState = {    
    performers: [],
    loading: false,
    gettingMoreInProgress: false,
    category: -1,
    filters: null,
    offset: 0,
    performersQueryEndOfList: false
}

const GET_PERFORMERS = "LOAD_PERFORMERS";
const GET_PERFORMERS_FULFILLED = "GET_PERFORMERS_FULFILLED";
const APPEND_PERFORMERS = "APPEND_PERFORMERS";
const SET_CATEGORY = "SET_CATEGORY";
const SET_FILTERS = "SET_FILTERS";
const CLEAR_OFFSET = "CLEAR_OFFSET";
const NEXT_OFFSET = "NEXT_OFFSET";
const SET_END_OF_PERFORMERS_LIST = "SET_END_OF_PERFORMERS_LIST";
const SET_GETTING_MORE_FLAG = "SET_GETTING_MORE_FLAG";

const performersReducer = (state = initialState, action) => {
    switch(action.type){
        case GET_PERFORMERS:
            return {
                ...state,
                loading: action.payload,
                endOfList: false
            }
        case GET_PERFORMERS_FULFILLED:
            return{
                ...state,
                performers: action.payload,
                loading: false,
                gettingMoreInProgress: false,
            }
        case APPEND_PERFORMERS: 
            return{
                ...state,
                gettingMoreInProgress: false,
                performers: combinePerformers(state.performers, action.payload)
            }
        case SET_CATEGORY:
            return{
                ...state,
                category: action.payload
            }
        case SET_FILTERS:
            return {
                ...state,
                filters: action.payload
            }
        case CLEAR_OFFSET:
            return {
                ...state,
                offset: 0,
                endOfList: false
            }
        case NEXT_OFFSET:
            return{
                ...state,
                offset: state.offset + PERFORMERS_QUERY_COUNT
            }
        case SET_END_OF_PERFORMERS_LIST:
            return {
                ...state,
                endOfList: true
            }
        case SET_GETTING_MORE_FLAG:
            return {
                ...state,
                gettingMoreInProgress: true
            }

        default:
            return state;
    }
}

export default performersReducer;

function combinePerformers(oldPerformers, newPerformers){
    if(oldPerformers.length === 0) return newPerformers
    
    let lastOldItem = oldPerformers[oldPerformers.length - 1]
    let index = newPerformers.findIndex(user => user.id !== lastOldItem.id)
    // Remove duplicate items from newPerformers list
    newPerformers.splice(0, index)
    let performersList = [...oldPerformers, ...newPerformers];
    return performersList;
}

export const fetchPerformers = (showLoading) => {
    return {
        type: GET_PERFORMERS,
        payload: showLoading,
    };
}

export const fetchPerformersFulfilled = (performers) => {
    return {
        type: GET_PERFORMERS_FULFILLED,
        payload: performers
    };
}

export const appendPerformers = (performers) => {
    return {
        type: APPEND_PERFORMERS,
        payload: performers
    };
}

export const setGettingMoreFlag = () => {
    return {
        type: SET_GETTING_MORE_FLAG
    }
}

export const setCategory = (category) => {
    return {
        type: SET_CATEGORY,
        payload: category
    };
}

export const setFilters = (filters) => {
    return {
        type: SET_FILTERS,
        payload: filters
    }
}

export const clearOffset = () => {
    return {
        type: CLEAR_OFFSET
    }
}

export const nextOffset = () => {
    return {
        type: NEXT_OFFSET
    }
}

export const setEndOfPerformerList = () => {
    return {
        type: SET_END_OF_PERFORMERS_LIST
    }
}