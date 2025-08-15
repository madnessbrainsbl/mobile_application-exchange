/**
 * Storage.js
 * Handling internal data
 * 
 * Created by Dmitry Chulkov 04/06/2020
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization'
import strings from "./Strings";
import moment from 'moment';
import 'moment/locale/ru';
import 'moment/locale/ro';
import 'moment/locale/he';

const KEYS = {
    API_TOKEN_KEY: "@ExtraMobile.API_KEY",
    LANG_KEY: "@ExtraMobile.LANGUAGE",
    TASK_FILTERS_KEY: "@ExtraMobile.FILTERS",
};

class Storage {
    token = null;
    language = null;
    taskFilters = null;

    async getApiToken() {
        if (this.token)
            return this.token;

        return this.token = await AsyncStorage.getItem(KEYS.API_TOKEN_KEY);
    }

    async setApiKey(value) {
        this.token = value;
        if (value === null)
            await AsyncStorage.removeItem(KEYS.API_TOKEN_KEY);
        else
            await AsyncStorage.setItem(KEYS.API_TOKEN_KEY, value);
    }

    async getLanguage() {
        if (this.language) {
            return this.language;
        }

        let language = await AsyncStorage.getItem(KEYS.LANG_KEY);
        if (!language) {
            // Safely handle locale parsing
            const systemLocale = Localization.locale || Localization.locales?.[0] || "en-US";
            language = systemLocale.split("-")[0];
            if (strings.getAvailableLanguages().indexOf(language) === -1)
                language = "en";
        }

        return this.language = language;
    }

    async setLanguage(value) {
        this.language = value;
        strings.setLanguage(value);
        if (value === null) {
            await AsyncStorage.removeItem(KEYS.LANG_KEY);
        } else {
            await AsyncStorage.setItem(KEYS.LANG_KEY, value);
        }
        moment.locale(this.language);
    }

    async setFilters(filterObject){
        this.taskFilters = filterObject;
        
        if(filterObject === null){
            await AsyncStorage.removeItem(KEYS.TASK_FILTERS_KEY);
        }else{
            let filtersString = JSON.stringify(filterObject);
            await AsyncStorage.setItem(KEYS.TASK_FILTERS_KEY, filtersString);
        }
            
    }

    async getFilters(){
        if(this.taskFilters)
            return this.taskFilters

        let filtersString = await AsyncStorage.getItem(KEYS.TASK_FILTERS_KEY);
        this.taskFilters = JSON.parse(filtersString);
        return this.taskFilters;
    }
}

const instance = new Storage();
export default instance;