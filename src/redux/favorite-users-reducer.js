/**
 *  favorite-users-reducer.js
 *  Created by Dmitry Chulkov 13/10/2019
 */

import settings from '../../backend/Settings';


const initialState = {    
    users: [],
    loading: false
}

// Actions
const GET_FAVORITE_USERS = 'GET_FAVORITE_USERS';
const GET_FAVORITE_USERS_FULFILLED = 'GET_FAVORITE_USERS_FULFILLED';
const ADD_USER_TO_FAVORITE = 'ADD_USER_TO_FAVORITE';
const REMOVE_USER_FROM_FAVORITE = 'REMOVE_USER_FROM_FAVORITE';

const favoriteUserReducer = (state = initialState, action) => {
    switch(action.type) {
        case GET_FAVORITE_USERS: 
            return {...state, loading: action.payload};
        case GET_FAVORITE_USERS_FULFILLED:
            return {...state, loading: action.loading, users: action.payload};
        
        case ADD_USER_TO_FAVORITE:
            if(state.users.filter(user => user.id === action.payload.id).length === 0){
                let user = action.payload;
                return Object.assign({}, state, {
                    users: [
                        ...state.users,
                        user
                    ]
                })
            }else{
                return state
            }
        case REMOVE_USER_FROM_FAVORITE:
                let userId = action.payload;
                if(state.users.filter(user => user.id === userId).length !== 0){
                    return Object.assign({}, state, {
                        users: state.users.filter(user => {
                            if(user.id !== userId){
                                return true
                            }
                        })
                    })
                }else{
                    return state
                }
        default: 
            return state;
    }
}

export default favoriteUserReducer;



export const fetchFavoriteUsers = (showLoading) => {
    //return a action type and a loading state indicating it is getting data. 
    return {
        type: GET_FAVORITE_USERS,
        payload: showLoading,
    };
}

export const fetchFavoriteUsersFulfilled = (data) => {
    //Return a action type and a loading to false, and the data.
    return {
        type: GET_FAVORITE_USERS_FULFILLED,
        payload: data,
        loading: false,
    };
}


export const addUserToFavorite = (user) => {
    return {
        type: ADD_USER_TO_FAVORITE,
        payload: user
    }
}

export const removeUserFromFavorite = (user_id) => {
    return {
        type: REMOVE_USER_FROM_FAVORITE,
        payload: user_id
    }
}
