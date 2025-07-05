/**
 *  favorite-users-handlers.js
 *  
 *  Created by Dmitry Chulkov 30.08.2019
 */

import { 
    fetchFavoriteUsers,
    fetchFavoriteUsersFulfilled,
    addUserToFavorite,
    removeUserFromFavorite
} from './favorite-users-reducer';

import BackendAPI from "../../backend/BackendAPI";
import settings from "../../backend/Settings";

const api = new BackendAPI(this);
const favoriteUsersEndpoint = api.getFavoriteUsersListEndpoint();
const addUserToFavoriteEndpoint = api.getAddFavoriteUserEndpoint();
const removeUserFromFavoriteEndpoint = api.getRemoveFavoriteUserEndpoint();

export const getFavoriteUsers = (showLoading) => {
    return async dispatch => {
        try {
            dispatch(fetchFavoriteUsers(showLoading));
            const users = await favoriteUsersEndpoint();
            dispatch(fetchFavoriteUsersFulfilled(users))
        } catch(error) {
        }
    }
}

export const addUserToFavoriteList = (user) => {
    return async dispatch => {
        dispatch(addUserToFavorite(user))
        await addUserToFavoriteEndpoint(user.id)
    }
}

export const removeUserFromFavoriteList = (user_id) => {
    return async dispatch => {
        dispatch(removeUserFromFavorite(user_id))
        await removeUserFromFavoriteEndpoint(user_id);
    }
}

