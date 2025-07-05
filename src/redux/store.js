/**
 *  store.js
 *  Created by Dmitry Chulkov
 */

import { createStore, applyMiddleware, combineReducers } from 'redux';
//import thunk for doing asynchronous operations in redux
import { thunk } from 'redux-thunk';
//import reducer from our reducer file
import taskReducer from './task-reducer';
import notificationReducer from "./notification-reducer";
import favoriteUserReducer from "./favorite-users-reducer";
import performersReducer from "./performers-reducer";
import employeeAdReducer from "./employee-ad-reducer";
import profileReducer from './profile/reducer';
import configReducer from './config/reducer';

const app = combineReducers({
    notificationReducer,
    taskReducer,
    favoriteUserReducer,
    performersReducer,
    employeeAdReducer,
    profileReducer,
    configReducer
});

// Create the middleware

// Create the store with middleware
const store = createStore(app, applyMiddleware(thunk))

export default store;