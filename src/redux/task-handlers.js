/**
 *  task-handlers.js
 *  
 *  Created by Dmitry Chulkov 30.08.2019
 */
import { batch } from 'react-redux';
import { 
    fetchData, 
    fetchDataFulfilled, 
    fetchDataRejected,
    fetchCategoriesFulfilled,
    setQuickFilter,
    applyQuickFilterAction,
    setFilters,
    getFavoriteTasksFulfilled,
    addTaskToFavorite,
    removeTaskFromFavorite,
    fetchMyTasksFulfilled,
    fetchAssignedTasksFulfilled,
    clearOffset,
    nextOffset,
    appendTasks,
    setEndOfList
} from './task-reducer';
import store from './store';
import { QUICK_FILTER, QUERY_TASK_COUNT } from './task-reducer';

import BackendAPI from "../../backend/BackendAPI";
import settings from "../../backend/Settings";

const api = new BackendAPI(this);
const taskListEndpoint = api.getTaskListEndpoint();
const tasksCountEndpoint = api.getTasksCountEndpoint();
const favoriteTaskListEndpoint = api.getFavoriteTaskListEndpoint();
const addTaskToFavoriteEndpoint = api.getAddTaskToFavoriteEndpoint();
const removeTaskFromFavoriteEndpoint = api.getRemoveTaskFromFavoriteEndpoint();
const myTasksTasksEndpoint = api.getMyTasksEndpoint();
const assignedTasksEndpoint = api.getAssignedTasksEndpoint();

// Define your action creators that will be responsible for asynchronouse operatiosn 
export const getTasks = (showLoading) => {
    //IN order to use await your callback must be asynchronous using async keyword.
    return async dispatch => {
        //Then perform your asynchronous operations.
        try {
            //Have it first fetch data from our starwars url.
            batch(() => {
                dispatch(fetchData(showLoading));
                dispatch(clearOffset());
            })
            const tasks = await loadTasks();
            if(tasks){
                dispatch(fetchDataFulfilled(tasks))
            }
          } catch(error) {
            console.log("Get tasks exception occured")
          }
    }
}

export const getMoreTasks = () => {
    return async dispatch => {
        try {
            let {taskQueryEndOfList} = store.getState().taskReducer
            if(taskQueryEndOfList) return

            // 1. Set new offset
            dispatch(nextOffset())
            const tasks = await loadTasks();
            // 2. Append tasks to old task list
            if(tasks && tasks.length > 0){
                dispatch(appendTasks(tasks))
            }else{
                dispatch(setEndOfList())
            }
          } catch(error) {
            dispatch(fetchDataRejected(error))
          }
    }
}

async function loadTasks(){
    return await taskListEndpoint(buildQueryForTaskList());
}

function buildQueryForTaskList(){
    let {filters, quickFilter, quickFilterCategory, taskQueryOffset} = store.getState().taskReducer
    let params = {}

    if(quickFilter == QUICK_FILTER.CATEGORY){
        params["category"] = quickFilterCategory.category
    }else if(quickFilter == QUICK_FILTER.MY){
        params["category"] = "my"
    }

    if(filters){
        if(filters.hourPrice){
            params["price_hour_gte"] = filters.hourPrice
        }

        if(filters.dayPrice){
            params["price_day_gte"] = filters.dayPrice
        }

        if(filters.selectedRegions){
            params['regions'] = filters.selectedRegions
                .filter(item => item.value !== 'region_all')
                .map(item => item.value)
                .join(',');
        }

        if(filters.selectedDays){
            params['weekdays'] = filters.selectedDays
                .map(item => item.id)
                .join(',')
        }
    }

    params['count'] = QUERY_TASK_COUNT
    params['offset'] = taskQueryOffset

    return params
}

export const getCategories = () => {
    return async dispatch => {
        const categories = await tasksCountEndpoint();
        let withoutAllItem = categories.filter(item => item.category !== "all");
        dispatch(fetchCategoriesFulfilled(withoutAllItem));
    }
}

export const applyQuickFilter = (quickFilter) => {
    return async dispatch => {

        batch(() => {
            dispatch(setQuickFilter(quickFilter));
            dispatch(clearOffset());
        })
        const tasks = await loadTasks();
        dispatch(fetchDataFulfilled(tasks))
    }
}

export const loadFilters = () => {
    return async dispatch => {
        const filtersObject = await settings.getFilters();
        dispatch(setFilters(filtersObject));
        dispatch(fetchData(true));

        const tasks = await loadTasks();
        dispatch(fetchDataFulfilled(tasks))
    }
}

export const updateFilters = (filters) => {
    return async dispatch => {
        batch(() => {
            dispatch(setFilters(filters));
            dispatch(clearOffset());
            dispatch(fetchData(true));
        })
        
        const tasks = await taskListEndpoint(buildQueryForTaskList());
        dispatch(fetchDataFulfilled(tasks))
    }
}

export const getFavoriteTasks = () => {
    return async dispatch => {
        const favoriteTasks = await favoriteTaskListEndpoint();
        dispatch(getFavoriteTasksFulfilled(favoriteTasks))
    }
}

export const addTaskToFavoriteList = (task) => {
    return async dispatch => {
        dispatch(addTaskToFavorite(task))
        await addTaskToFavoriteEndpoint(task.id)
    }
}

export const removeTaskFromFavoriteList = (task_id) => {
    return async dispatch => {
        dispatch(removeTaskFromFavorite(task_id))
        const result = await removeTaskFromFavoriteEndpoint(task_id);
    }
}

export const getMyTasks = () => {
    return async dispatch => {
        try {
            const tasks = await myTasksTasksEndpoint();
            dispatch(fetchMyTasksFulfilled(tasks))
          } catch(error) {
            // do nothing
          }
    }
}

export const getAssignedTasks = () => {
    return async dispatch => {
        try {
            const tasks = await assignedTasksEndpoint();
            dispatch(fetchAssignedTasksFulfilled(tasks))
          } catch(error) {
            // do nothing
          }
    }
}