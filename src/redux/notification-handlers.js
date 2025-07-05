/**
 *  notification-handlers.js
 *  Created Dmitry Chulkov
 */
import BackendAPI from "../../backend/BackendAPI";

import notificationReducer from "./notification-reducer";
import {
  fetchNotifications,
  fetchNotificationsFulfilled,
  fetchNotificationsRejected,
  removeNotificationAction,
  readNotificationAction,
  readAllNotificationsAction
} from "./notification-reducer";

const api = new BackendAPI(this);
const notificationsEndpoint = api.getNotificationsEndpoint();
const readNotificationEndpoint = api.makeReadNotificationEndpoint();
const readAllNotificationsEndpoint = api.getReadAllNotificationEndpoint();
const deleteNotificationEndpoint = api.getDeleteNotificationEndpoint();

export const getNotifications = (showLoading) => {
    return async dispatch => {
        try{
            dispatch(fetchNotifications(showLoading));
            const notificationList = await notificationsEndpoint();
            let list = [];
            notificationList.forEach(item => {
                list.unshift(item);
            })
            dispatch(fetchNotificationsFulfilled(list))
        }catch(error){
            dispatch(fetchNotificationsRejected(error));
        }
    }
}

export const readNotification = (notificationId) => {
    return async dispatch => {
        try{
            dispatch(readNotificationAction(notificationId));
            const result = await readNotificationEndpoint(notificationId);
        }catch(error){
            // console.log("Error occured");
        }
    }
}

export const readAllNotifications = () => {
    return async dispatch => {
        try{
            dispatch(readAllNotificationsAction());
            await readAllNotificationsEndpoint();
        }catch(error){
            // console.log("Error occured");
        }
    }
}

export const deleteNotification = (notificationId) => {
    return async dispatch => {
        try{
            dispatch(removeNotificationAction(notificationId));
            const result = await deleteNotificationEndpoint(notificationId);
        }catch(error){
            // console.log("Error occured");
        }
    }
}