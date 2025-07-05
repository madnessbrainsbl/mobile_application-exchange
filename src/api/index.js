/**
 *  API
 *  Created by Dmitry Chulkov 04/06/2020
 */
import axios from 'axios';
import { Platform } from "react-native";

const PROTOCOL = "http";//"http";//
const HOST =  "192.168.1.12:8000";//"apiextra.pythonanywhere.com"; //"192.168.43.84:8000";//"192.168.1.57:8000";//
const API_BASE = `${PROTOCOL}://${HOST}/`;
const API_VERSION = "v1";
const BASE_URL = `${API_BASE}api/${API_VERSION}/`;

// Config default request parameters
axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";

class API {

    static setToken(token){
        if(token === null){
            delete axios.defaults.headers.common["Authorization"];
        }else{
            axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        }
    }

    static async getMyProfile(){
        return await get(`user/me/`);
    }

    static async getUser(userID){
        return await get(`user/${userID}/`);
    }

    static async getLatestAppVersion(){
        return await get(`app-version/${Platform.OS}`);
    }

    static async loginUserWithFacebook(token){
        return await get(`login_with_facebook/${token}`)
    }

    static async sendSMSCode(phoneNumber){
        return await get(`send_sms_code/${phoneNumber}`);
    }

    static async createUser(phoneNumber, accountType){
        return await post(`create_user/`, {
            phone: parseInt(phoneNumber),
            username: phoneNumber, //! This is uneccessary
            account_type: accountType
        })
    }

    static async loginUser(username, password){
        return await post(`${API_BASE}auth/token/login/`, {
            username, password
        })
    }

    static async deleteUserWithFacebookToken(token){
        return await del(`login_with_facebook/${token}`)
    }

    static async updateToken(push_id, language){
        return await post('update/device/', {
            push_id, language
        })
        
    }


    static async updateSchedule(newSchedule){
        return await put("update_schedule/", newSchedule);
    }
}

async function get(url){
    const response = await axios.get(url);
    return response.data;
}

async function post(url, payload){
    const response = await axios.post(url, payload)
    return response.data;
}

async function put(url, payload){
    const response = await axios.put(url, payload)
    return response.data;
}

async function del(url){
    const response = await axios.delete(url);
    return response.data;
}

export default API;