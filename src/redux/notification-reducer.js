
const initialState = {    
    notifications: [],
    loading: true,
}

// Actions
const GET_NOTIFICATIONS = 'GET_NOTIFICATIONS';
const GET_NOTIFICATIONS_FULFILLED = 'GET_NOTIFICATIONS_FULFILLED';
const GET_NOTIFICATIONS_REJECTED = 'GET_NOTIFICATIONS_REJECTED';
const DELETE_NOTIFICATION = "DELETE_NOTIFICATION";
const READ_NOTIFICATION = "READ_NOTIFICATION";
const READ_ALL_NOTIFICATIONS = "READ_ALL_NOTIFICATIONS";

const notificationReducer = (state = initialState, action) => {
    switch(action.type) {
        case GET_NOTIFICATIONS: 
            return {...state, loading: action.payload};
        case GET_NOTIFICATIONS_FULFILLED:
            return {...state, notifications: action.payload, loading: action.loading};
        case GET_NOTIFICATIONS_REJECTED:
            return {...state, loading: action.loading};
        case READ_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.map((item, index) => {
                    if(item.id === action.payload){
                        return {...item, is_read: true}
                    }
                    return item;
                }) 
                }
        case READ_ALL_NOTIFICATIONS:
            return {
                ...state,
                notifications: state.notifications.map((item, index) => {
                    return {...item, is_read: true}
                }) 
            }
        case DELETE_NOTIFICATION:
            let index = state.notifications.findIndex(item => item.id === action.payload);
            return {
                ...state, 
                notifications: [
                    ...state.notifications.slice(0, index),
                    ...state.notifications.slice(index + 1)
                ]
            }
        default: 
            return state;
    }
}

export default notificationReducer;



//Define your action create that set your loading state.
export const fetchNotifications = (bool) => {
    //return a action type and a loading state indicating it is getting data. 
    return {
        type: GET_NOTIFICATIONS,
        payload: bool,
    };
}

//Define a action creator to set your loading state to false, and return the data when the promise is resolved
export const fetchNotificationsFulfilled = (data) => {
    //Return a action type and a loading to false, and the data.
    return {
        type: GET_NOTIFICATIONS_FULFILLED,
        payload: data,
        loading: false,
    };
}

//Define a action creator that catches a error and sets an errorMessage
export const fetchNotificationsRejected = (error) => {
    //Return a action type and a payload with a error
    return {
        type: GET_NOTIFICATIONS_REJECTED,
        payload: error,
        loading: false,
    };
}

export const removeNotificationAction = (notificationId) => {
    return {
        type: DELETE_NOTIFICATION,
        payload: notificationId,
    };
}

export const readNotificationAction = (notificationId) => {
    return {
        type: READ_NOTIFICATION,
        payload: notificationId,
    };
}

export const readAllNotificationsAction = () => {
    return {
        type: READ_ALL_NOTIFICATIONS,
    };
}