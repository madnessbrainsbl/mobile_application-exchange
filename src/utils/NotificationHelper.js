/**
 * NotificationHelper.js
 * Safe wrapper for notifications that works in both Expo Go and development builds
 * 
 * Created for SDK 53 compatibility
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let ExpoNotifications = null;

// Only import notifications if not in Expo Go
if (!isExpoGo) {
    try {
        ExpoNotifications = require('expo-notifications');
    } catch (error) {
        console.warn('expo-notifications not available:', error.message);
    }
}

class NotificationHelper {
    static isAvailable() {
        return !isExpoGo && ExpoNotifications !== null;
    }

    static async getPermissionsAsync() {
        if (!this.isAvailable()) {
            console.warn('Notifications not available in Expo Go');
            return { status: 'denied' };
        }
        
        try {
            return await ExpoNotifications.getPermissionsAsync();
        } catch (error) {
            console.error('Error getting notification permissions:', error);
            return { status: 'denied' };
        }
    }

    static async requestPermissionsAsync() {
        if (!this.isAvailable()) {
            console.warn('Notifications not available in Expo Go');
            return { status: 'denied' };
        }
        
        try {
            return await ExpoNotifications.requestPermissionsAsync();
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return { status: 'denied' };
        }
    }

    static addNotificationReceivedListener(listener) {
        if (!this.isAvailable()) {
            console.warn('Notifications not available in Expo Go');
            return { remove: () => {} };
        }
        
        try {
            return ExpoNotifications.addNotificationReceivedListener(listener);
        } catch (error) {
            console.error('Error adding notification listener:', error);
            return { remove: () => {} };
        }
    }

    static addNotificationResponseReceivedListener(listener) {
        if (!this.isAvailable()) {
            console.warn('Notifications not available in Expo Go');
            return { remove: () => {} };
        }
        
        try {
            return ExpoNotifications.addNotificationResponseReceivedListener(listener);
        } catch (error) {
            console.error('Error adding notification response listener:', error);
            return { remove: () => {} };
        }
    }

    static async getExpoPushTokenAsync() {
        if (!this.isAvailable()) {
            console.warn('Push tokens not available in Expo Go');
            return null;
        }
        
        try {
            const token = await ExpoNotifications.getExpoPushTokenAsync();
            return token;
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }

    static setNotificationHandler(handler) {
        if (!this.isAvailable()) {
            console.warn('Notification handler not available in Expo Go');
            return;
        }
        
        try {
            ExpoNotifications.setNotificationHandler(handler);
        } catch (error) {
            console.error('Error setting notification handler:', error);
        }
    }
}

export default NotificationHelper;
