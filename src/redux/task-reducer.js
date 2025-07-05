/**
 *  task-reducer.js
 *  Created by Dmitry Chulkov
 */

import settings from '../../backend/Settings';
import moment from 'moment';
// import store from './store';

export const QUERY_TASK_COUNT = 100

export const QUICK_FILTER = {
    ALL: 0,
    MY: 1,
    CATEGORY: 2
}

const initialState = {    
    tasks: [],
    taskQueryOffset: 0,
    taskQueryEndOfList: false,
    preFilteredTasks: [],
    filteredTasks: [],
    loading: true,
    categories: [],
    quickFilter: QUICK_FILTER.ALL,
    quickFilterCategory: null,
    errorMessage: '',
    filters: null,
    favoriteTasks: [],
    myTasks: {active: [], completed: []},
    assignedTasks: {active: [], completed: []},
}

// Actions
const GET_TASKS = 'GET_TASKS';
const GET_TASKS_FULFILLED = 'GET_TASKS_FULFILLED';
const GET_TASKS_REJECTED = 'GET_TASKS_REJECTED';
const APPEND_TASKS = 'APPEND_TASKS';
const GET_MY_TASKS = 'GET_MY_TASKS';
const GET_MY_TASKS_FULFILLED = 'GET_MY_TASKS_FULFILLED';
const GET_ASSIGNED_TASKS = 'GET_ASSIGNED_TASKS';
const GET_ASSIGNED_TASKS_FULFILLED = 'GET_ASSIGNED_TASKS_FULFILLED';
// Action filters
const GET_CATEGORIES_FILFILLED = 'GET_CATEGORIES_FILFILLED';
const SET_QUICK_FILTER = "SET_QUICK_FILTER";
const APPLY_QUICK_FILTER = "APPLY_QUICK_FILTER";
const UPDATE_FILTERS = "UPDATE_FILTERS";

const GET_FAVORITE_TASKS_FULFILLED = "GET_FAVORITE_TASKS_FULFILLED";
const ADD_TASK_TO_FAVORITE = "ADD_TASK_TO_FAVORITE";
const REMOVE_TASK_FROM_FAVORITE = "REMOVE_TASK_FROM_FAVORITE";

const CLEAR_OFFSET = "CLEAR_OFFSET";
const NEXT_OFFSET = "NEXT_OFFSET";
const SET_END_OF_LIST = "SET_END_OF_LIST";

const taskReducer = (state = initialState, action) => {
    switch(action.type) {
        case GET_TASKS: 
            return {...state, loading: action.payload};
        case GET_TASKS_FULFILLED:
            return {
                ...state,
                loading: action.loading,
                tasks: action.payload,
            }
        case GET_TASKS_REJECTED:
            return {...state, errorMessage: action.payload, loading: action.loading};
        case CLEAR_OFFSET:
            return {
                ...state,
                taskQueryOffset: 0,
                taskQueryEndOfList: false
            }
        case NEXT_OFFSET:
            return{
                ...state,
                taskQueryOffset: state.taskQueryOffset + QUERY_TASK_COUNT
            }
        case APPEND_TASKS:
            let tasks = combineTasks(state.tasks, action.payload)
            return{
                ...state,
                tasks
            }
        case SET_END_OF_LIST:
            return {
                ...state,
                taskQueryEndOfList: true
            }
        case GET_CATEGORIES_FILFILLED:
            return {...state, categories: action.payload}
        case SET_QUICK_FILTER:
            return {
                ...state, 
                quickFilter: action.payload.FILTER, 
                quickFilterCategory: action.payload.category, 
                loading: true,
            }
        case UPDATE_FILTERS:
            return {...state, filters: action.payload}
        case GET_FAVORITE_TASKS_FULFILLED:
            return {...state, favoriteTasks: action.payload}
        case ADD_TASK_TO_FAVORITE:
            if(state.favoriteTasks.filter(task => task.id === action.payload.id).length === 0){
                let task = action.payload;
                return Object.assign({}, state, {
                    favoriteTasks: [
                        ...state.favoriteTasks,
                        task
                    ]
                })
            }else{
                return state
            }
        case REMOVE_TASK_FROM_FAVORITE:
                let taskId = action.payload;
                if(state.favoriteTasks.filter(task => task.id === taskId).length !== 0){
                    return Object.assign({}, state, {
                        favoriteTasks: state.favoriteTasks.filter(task => {
                            if(task.id !== taskId){
                                return true
                            }
                        })
                    })
                }else{
                    return state
                }
        case GET_MY_TASKS_FULFILLED:
            return {
                ...state,
                myTasks: action.payload,
            }
        case GET_ASSIGNED_TASKS_FULFILLED:
                return {
                    ...state,
                    assignedTasks: action.payload,
                } 
        default: 
            return state;
    }
}

export default taskReducer;

function combineTasks(oldTasks, newTasks){
    if(oldTasks.length === 0) return newTasks
    
    let lastTask = oldTasks[oldTasks.length - 1];
    let index = newTasks.findIndex(item => item.id !== lastTask.id)
    // Remove duplicate items from newTasks
    newTasks.splice(0, index)
    let taskList = [...oldTasks, ...newTasks];
    return taskList;
}

//! Deprecated
function filter(tasks, filters){
    if(filters === null){
        return Object.assign([], tasks)
    }else{
        return tasks.filter(task => {
    
            if(filters.selectedRegions.length > 0 &&
                !filters.selectedRegions.some(region => region.value === task.region)){
                    return false;
            }

            if(Number(filters.hourPrice) > 0 && task["pay_type"] === "hour" && task.price < Number(filters.hourPrice)){
                return false
            }

            if(Number(filters.dayPrice) > 0 && task["pay_type"] === "day" && task.price < Number(filters.dayPrice)){
                return false
            }

            let taskDay = moment(task["date_begin"]).format("dd");
            if(filters.selectedDays.length > 0 && 
                !filters.selectedDays.some(day => day === taskDay)){
                    return false;
            }
                
            return true;
        });
    }
}




//Define your action create that set your loading state.
export const fetchData = (showLoading) => {
    //return a action type and a loading state indicating it is getting data. 
    return {
        type: GET_TASKS,
        payload: showLoading,
    };
}

//Define a action creator to set your loading state to false, and return the data when the promise is resolved
export const fetchDataFulfilled = (data) => {
    //Return a action type and a loading to false, and the data.
    return {
        type: GET_TASKS_FULFILLED,
        payload: data,
        loading: false,
    };
}

//Define a action creator that catches a error and sets an errorMessage
export const fetchDataRejected = (error) => {
    //Return a action type and a payload with a error
    return {
        type: GET_TASKS_REJECTED,
        payload: error,
        loading: false,
    };
}

export const appendTasks = (newTasks) => {
    return {
        type: APPEND_TASKS,
        payload: newTasks
    }
}

export const setEndOfList = () => {
    return {
        type: SET_END_OF_LIST
    }
}

/**
 * Filters actions
 */

export const fetchCategoriesFulfilled = (data) => {
    return {
        type: GET_CATEGORIES_FILFILLED,
        payload: data
    }
}

export const setQuickFilter = (filter) => {
    return {
        type: SET_QUICK_FILTER,
        payload: filter
    }
}

export const applyQuickFilterAction = (profile) => {
    return {
        type: APPLY_QUICK_FILTER,
        payload: profile
    }
}

export const setFilters = (filters) => {
    return {
        type: UPDATE_FILTERS,
        payload: filters
    }
}

export const getFavoriteTasksFulfilled = (data) => {
    return {
        type: GET_FAVORITE_TASKS_FULFILLED,
        payload: data
    }
}

export const addTaskToFavorite = (task) => {
    return {
        type: ADD_TASK_TO_FAVORITE,
        payload: task
    }
}

export const removeTaskFromFavorite = (task_id) => {
    return {
        type: REMOVE_TASK_FROM_FAVORITE,
        payload: task_id
    }
}

export const fetchMyTasksFulfilled = (data) => {
    //Return a action type and a loading to false, and the data.
    return {
        type: GET_MY_TASKS_FULFILLED,
        payload: data,
    };
}

export const fetchAssignedTasksFulfilled = (data) => {
    //Return a action type and a loading to false, and the data.
    return {
        type: GET_ASSIGNED_TASKS_FULFILLED,
        payload: data,
    };
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