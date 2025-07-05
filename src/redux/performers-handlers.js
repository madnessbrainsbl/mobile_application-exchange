/**
 *  performers-handlers.js
 *  Created by Dmitry Chulkov 09/12/2019
 */

import { batch } from 'react-redux';
import {
    fetchPerformers,
    fetchPerformersFulfilled,
    appendPerformers,
    setCategory,
    setFilters,
    clearOffset,
    nextOffset,
    setEndOfPerformerList,
    setGettingMoreFlag
} from './performers-reducer';
import store from './store';

import {PERFORMERS_QUERY_COUNT} from "./performers-reducer";
import BackendAPI from "../../backend/BackendAPI";
import settings from "../../backend/Settings";

const api = new BackendAPI();
const performersEndpoint = api.getPerformersEndpoint();

export const getPerformers = (showLoading) => {
    return async dispatch => {
        try {
            batch(() => {
                dispatch(fetchPerformers(showLoading));
                dispatch(clearOffset());
            })
            const performers = await loadPerformers();
            if(performers){
                dispatch(fetchPerformersFulfilled(performers))
            }
          } catch(error) {
            console.log("getPerformers failed with error")
          }
    }
}

async function loadPerformers(){
    let {filters, category, offset} = store.getState().performersReducer
    let params = {}

    if(category !== -1){
        params["categories"] = category
    }

    if(filters){
        if(filters.hourPrice){
            params["price_hour"] = filters.hourPrice
        }

        if(filters.dayPrice){
            params["price_day"] = filters.dayPrice
        }

        if(filters.selectedRegions){
            params['regions'] = filters.selectedRegions
                .filter(item => item.value !== 'region_all')
                .map(item => item.value)
                .join(',');
        }

        if(filters.selected_subcategories){
            params['subcategories'] = filters.selected_subcategories
                .map(item => item.id)
                .join(',');
        }

        if(filters.selectedDays){
            params['days'] = filters.selectedDays.join(',')
        }
    }

    params['count'] = PERFORMERS_QUERY_COUNT
    params['offset'] = offset

    const performers =  await performersEndpoint(params);
    return performers;
}

export const getMorePerformers = () => {
    return async dispatch => {
        try {
            let {performersQueryEndOfList, gettingMoreInProgress} = store.getState().performersReducer
            if(performersQueryEndOfList || gettingMoreInProgress) return
            // 1. Set new offset
            await batch(() => {
                dispatch(setGettingMoreFlag())
                dispatch(nextOffset())
            })
            
            const performers = await loadPerformers();
            // 2. Append performers to old list
            if(performers && performers.length > 0){
                dispatch(appendPerformers(performers))
            }else{
                dispatch(setEndOfPerformerList())
            }
          } catch(error) {
              console.log("getMorePerformers failed with error: ", error)
          }
    }
}

export const selectCategory = (category) => {
    return async dispatch => {
        batch(() => {
            dispatch(setCategory(category))
            dispatch(clearOffset())
            dispatch(fetchPerformers(true))
        })

        const performers = await loadPerformers();
        dispatch(fetchPerformersFulfilled(performers))
    }
}

export const applyFilters = (filters) => {
    return async dispatch => {
        batch(() => {
            dispatch(setFilters(filters))
            dispatch(clearOffset())
            dispatch(getPerformers(true))
        })

        const performers = await loadPerformers();
        dispatch(fetchPerformersFulfilled(performers))
    }
}

