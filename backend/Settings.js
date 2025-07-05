import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Localization } from 'expo';
import * as Localization from 'expo-localization'
import strings from "../src/utils/Strings";
import moment from 'moment';
import 'moment/locale/ru';
import 'moment/locale/ro';
import 'moment/locale/he';

const KEYS = {
    API_KEY: "@ExtraMobile.API_KEY",
    LANG_KEY: "@ExtraMobile.LANGUAGE",
    USER_ID_KEY: "@ExtraMobile.USER_ID",
    FILTER_KEY: "@ExtraMobile.FILTERS",
    FILL_DATA_CANCEL_KEY: "@ExtraMobile.FILL_DATA_CANCEL_KEY"
};

class Settings {
    apiKey = null;
    language = null;
    profile = null;
    filters = null;

    
    async getApiKey() {
        if (this.apiKey)
            return this.apiKey;

        return this.apiKey = await AsyncStorage.getItem(KEYS.API_KEY);
    }

    async setApiKey(value) {
        this.apiKey = value;
        if (value === null)
            await AsyncStorage.removeItem(KEYS.API_KEY);
        else
            await AsyncStorage.setItem(KEYS.API_KEY, value);
    }

    async getLanguage() {
        if (this.language) {
            return this.language;
        }

        let language = await AsyncStorage.getItem(KEYS.LANG_KEY);
        if (!language) {
            language = Localization.locale.split("-")[0];
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
        this.filters = filterObject;
        let filtersString = JSON.stringify(filterObject);
        if(filterObject === null)
            await AsyncStorage.removeItem(KEYS.FILTER_KEY);
        else
            await AsyncStorage.setItem(KEYS.FILTER_KEY, filtersString);
        
    }

    async getFilters(){
        if(this.filters)
            return this.filters

        let filtersString = await AsyncStorage.getItem(KEYS.FILTER_KEY);
        this.filters = JSON.parse(filtersString);
        return this.filters;
    }


    getProfile() {
        return this.profile;
    }

    setProfile(value) {
        this.profile = value;
    }
}

const settings = new Settings();

export default settings;