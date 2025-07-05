/**
 *  InitScreen.js
 *  App entry point. Initializes app params. Switch between Auth Stack and App Stack
 *  
 *  Created by Dmitry Chulkov
 *  14/09/2019
 */
import React, { useEffect } from 'react';
import {
    View,
    Text
} from 'react-native';
import strings from '../../utils/Strings';
import Storage from '../../utils/Storage';
import API from '../../api';

import moment from 'moment';
import 'moment/locale/ru';
import 'moment/locale/he';

import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';
import { updateLanguage } from '../../redux/config/handlers';
import { useNavigation } from '@react-navigation/native';

const InitScreen = ({ updateProfile, updateLanguage }) => {
    const navigation = useNavigation();

    useEffect(() => {
        console.log("InitScreen: useEffect started");
        
        const initialize = async () => {
            try {
                console.log("InitScreen: initialize function started");
                
                const language = await Storage.getLanguage();
                console.log("InitScreen: language retrieved:", language);
                
                strings.setLanguage(language);
                moment.locale(language);
                updateLanguage(language);
                console.log("InitScreen: language updated");

                const apiToken = await Storage.getApiToken();
                console.log("InitScreen: apiToken retrieved:", apiToken ? "exists" : "null");
                
                if (apiToken === null) {
                    console.log("InitScreen: apiToken is null, navigating to Auth");
                    navigation.navigate('Auth');
                    return;
                }

                API.setToken(apiToken);
                try {
                    const profile = await API.getMyProfile();
                    console.log("InitScreen: profile retrieved");
                    updateProfile(profile);
                } catch (error) {
                    console.error("InitScreen: Error getting profile:", error);
                    if (error.response?.status === 401) {
                        navigation.navigate('Auth');
                    }
                }
                
                console.log("InitScreen: navigating to App");
                navigation.navigate('App');
            } catch (error) {
                console.error("InitScreen: Error in initialization:", error);
            }
        };

        initialize();
    }, []); // Empty dependency array means this effect runs once on mount

    return <View/>
};

const mapStateToProps = state => ({
    userProfile: state.profileReducer
});

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
    updateLanguage
};

export default connect(mapStateToProps, mapDispatchToProps)(InitScreen);