/**
 *  DrawerMenu.js
 *  
 *  Modified by Dmitry Chulkov
 */
import React from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    Platform,
    Switch,
    AppState,
    ScrollView,
    Alert,
    StyleSheet
} from "react-native";
import Rating from "./Rating";
import icon from "../constant/Icons";
import settings from "../../backend/Settings";
import BackendAPI from "../../backend/BackendAPI";

import Storage from '../utils/Storage';

import strings from "../utils/Strings";
import Avatar from "./Avatar";
// import MyToast from "../../components/MyToast";
import { Linking, Notifications } from 'expo';
import iOSNotification from './iOSNotification';
import { CommonActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { getNotifications, readNotification } from '../redux/notification-handlers';
import { loadFilters, getFavoriteTasks, getTasks, getCategories } from '../redux/task-handlers';
import Constants from 'expo-constants';
import {LanguageDialogHandler} from './LanguageSelectorDialog';
import { updateProfile } from '../redux/profile/handlers';
import { updateLanguage } from '../redux/config/handlers';
import API from '../api';
import { Notifications as ExpoNotifications } from 'expo';
import * as ExpoNotificationsModule from 'expo-notifications';

const unit = val => val * 0.75;
const style = StyleSheet.create({
    drawerUserContainer: {
        flexDirection: "row",
        paddingTop: unit(24),
        paddingBottom: unit(24),
        paddingRight: unit(16),
        paddingLeft: unit(16),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#8E8E8E"
    },
    drawerUserAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: unit(24),
    },
    drawerMenuItem: {
        flexDirection: "row",
        paddingLeft: Platform.OS === 'ios' ? unit(22) : unit(16),
        paddingRight: unit(16),
        marginTop: unit(16),
        marginBottom: Platform.OS === 'ios' ? unit(16) : unit(16)
    },
    drawerMenuItemContainer: {
        flexDirection: "row"
    },
    drawerMenuImage: {
        marginRight: unit(24),
        height: 24,
        width: 24
    },
    drawerMenuText: {
        fontSize: 16,
        color: "#333333"
    }

})

class DrawerMenu extends React.Component {
    state = {
        profile: null,
        appState: AppState.currentState,
        language: null,
        showLangSelector: true
    };

    notificationSubscription;
    api = new BackendAPI(this);
    updatePushEndpoint = this.api.getPushTokenUpdateEndpoint();
    dialogsEndpoint = this.api.getDialogsEndpoint();
    notificationSettingsEndpoint = this.api.getNotificationSettings();
    updateNotificationSettings = this.api.updateNotificationSettings();
    getUsersCountEndpoint = this.api.getUsersCountEndpoint();
    notificationsEndpoint = this.api.getNotificationsEndpoint();
    setUserLanguageEndpoint = this.api.setUserLanguageEndpoint();
    readNotificationEndpoint = this.api.makeReadNotificationEndpoint();

    languages = {
        "ru": strings["russian"],
        "en": strings["english"],
        "he": strings["hebrew"]
    }

    async componentDidMount() {
        if (this.notificationSubscription) {
            this.notificationSubscription.remove();
        }

        this.props.getNotifications(false);
        this.props.loadFilters();
        this.props.getFavoriteTasks();


        this.setState({language: await settings.getLanguage()})


        Linking.addEventListener('url', this.watchUrl);

        this.notificationSubscription = ExpoNotificationsModule.addListener(this.handleInAppNotification);

        AppState.addEventListener('change', this._handleAppStateChange);

        // const allowNotifications = await this.getPermissions();
        // if (allowNotifications) {
        //     token = await ExpoNotifications.getExpoPushTokenAsync();
        //     await this.updatePushEndpoint({
        //         push_id: token
        //     })
        // }
    
        this.notificationSettingsEndpoint();
    }

    getPermissions = async() => {
        const { status: existingStatus } = await ExpoNotificationsModule.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await ExpoNotificationsModule.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    };

    onCreateTaskPressed = () => {
        const shouldFillProfile = this.props.userProfile !== null &&
            this.props.userProfile["account_type"] === 'creator' &&
            (this.props.userProfile["first_name"] == "" || 
            this.props.userProfile["last_name"] == "");

        if(shouldFillProfile){
            Alert.alert(
                "",
                strings["auth_banner"],
                [
                    {text: strings["cancel"]},
                    {text: strings["ok"], onPress: () => this.props.navigation.navigate("EmployerInfo")}
                ]
            )
        }else{
            this.props.navigation.navigate("CreateTask", {prev: true})
        }        
    }

    // _handleAppStateChange = (nextAppState) => {
    //     if(this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    //         this.props.getNotifications(false);
    //         this.props.loadFilters();
    //         this.props.getFavoriteTasks();
    //         this.props.getTasks(false);
    //         this.props.getCategories();
    //     }
    //     this.setState({appState: nextAppState});
    // };

    componentWillUnmount() {
        // AppState.removeEventListener('change', this._handleAppStateChange);
    }

    handleInAppNotification = ({origin, data}) => {
        const isIOS = Platform.OS === 'ios';
        if(origin === 'received'){

            if (isIOS && !!Object.keys(data).length) {
                this.showIOSNotification(data);
            }

        }
        else if(origin === 'selected'){
            let payload = data.payload;
            if(payload){
                switch(payload.type){
                    case 'task':
                        //route to task
                        taskID = payload.task_id;
                        this.openTask(taskID, extraPayload=payload.extraPayload);
                        break;
                    case 'new_message':
                        // route to dialog
                        dialogID = payload.dialog_id;
                        this.loadDialog(dialogID);
                        break;
                    case 'ad_comment':
                        this.openAd(payload["ad_id"])
                        break;
                }

                if(payload.notification_id){
                    this.handleReadingNotification(payload.notification_id)
                }
                
            }
        }
    };

    async handleReadingNotification(notificationId){
        await this.readNotificationEndpoint(notificationId);
        this.props.getNotifications(false);
    }
    

    watchUrl = async ({url}) => {
        const { path, queryParams } = await Linking.parse(url);
        if(path !== null){
            const arr = path.split('/');
            const pathItem = arr[arr.length - 1];
            console.log("Wtch url triggered")
            if (pathItem === 'share-task') {
                this.openTask(queryParams.id);
            }
        }
    };

    openTask = (id, extraPayload=null) => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'TaskDetails',
                params: { taskID: id, extraPayload }
            })
        );
    };

    loadDialog = async (dialog_id) => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'Dialog',
                params: { dialogId: dialog_id }
            })
        );
    };

    openAd = async (ad_id) => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'EmployeeAd',
                params: { adId: ad_id }
            })
        );
    };

    logout = async () => {
        await Storage.clearAll();
        this.props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Auth' }]
            })
        );
    };

    renderProfile(){
        if(this.props.userProfile){
            return(
                <TouchableOpacity onPress={this.openProfile}>
                        <View style={style.drawerUserContainer}>
                            <Avatar
                                style={style.drawerUserAvatar}
                                src={this.props.userProfile["avatar"]}
                            />
                            <View style={{
                                flex: 1,
                                flexDirection: "column"
                            }}>
                                <Text numberOfLines={1}
                                      style={{
                                        fontSize: 20,
                                        color: "#333333"
                                      }}
                                >
                                    {this.props.userProfile["first_name"]} {this.props.userProfile["last_name"]}
                                </Text>
                                <Text style={{
                                    fontSize: 16,
                                    color: "#848484"
                                }}>
                                    {
                                        this.props.userProfile["account_type"] === "creator"
                                            ? strings["customer"]
                                            : strings["executor"]
                                    }
                                </Text>
                                <Rating style={{
                                    flexDirection: "row",
                                    marginTop: unit(12)
                                }}
                                        value={this.props.userProfile["rating"]}/>
                            </View>
                        </View>
                </TouchableOpacity>
            )
        }
    }

    render() {
        const isIOS = Platform.OS === 'ios';
        return (
            <View style={{
                flex: 1,
                flexDirection: "column",
                paddingTop: Platform.OS === 'ios' ? 30 : 22,
            }}>
                {this.renderProfile()}
                {
                    this.props.userProfile
                        ? (
                            <View style={{
                                paddingBottom: 8, 
                                flex: 1,
                                flexDirection: "column",
                                paddingTop: unit(8)}}>
                                <ScrollView>

                                
                                {
                                    this.createMenuItem("search", strings["all_tasks"], () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'MainTaskList' }]
                                            })
                                        );
                                    })
                                }
                                {
                                    this.createMenuItem("tasks-create", strings["drawer_create_ad"], this.onCreateTaskPressed)
                                }
                                {/* {
                                    this.createMenuItem("performers", strings["performer_list_title"], () => {
                                        this.props.navigation.dispatch(
                                            StackActions.reset({
                                                index: 0,
                                                actions: [NavigationActions.navigate({ routeName: 'PerformersList' })],
                                            })
                                        );
                                    })
                                } */}
                                {
                                    this.createMenuItem("tasks-my", strings["my_tasks"], () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'MyTasks' }]
                                            })
                                        );
                                    })
                                }
                                {
                                    this.createFavoriteTasksMenuItem("heart", strings["favorite_title"], () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'FavoriteTasks' }]
                                            })
                                        );
                                    })
                                }
                                {
                                    this.createMenuItem("dialogs", strings["messages"], () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'DialogList' }]
                                            })
                                        );
                                    })
                                }
                                {
                                    this.createNotificationMenuItem("notification", strings["notification_screen_title"], () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'NotificationCenter' }]
                                            })
                                        );
                                    })
                                }
                                {
                                    this.createMenuItem("settings-gears", strings["notification_settings"], () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'NotificationSettings' }]
                                            })
                                        );
                                    })
                                }
                                {
                                    this.createMenuItem("information", strings["help"], () => {
                                        Alert.alert(
                                            strings["help"],
                                            strings["help_description"],
                                            [
                                                {text: strings["help_open_facebook"], onPress: () => Linking.openURL('https://www.facebook.com/GetCook-557182778149140/')},
                                                {text: strings["cancel"], onPress: () => {}, style: 'cancel'},
                                            ]
                                        )
                                    })
                                }
                                {
                                    this.createMenuItem("translation", strings["language"] +": " + this.languages[this.state.language], () => {
                                        LanguageDialogHandler.show((lang) => {
                                            this.changeLanguage(lang);
                                        });
                                    })
                                }

                                <Text style={{
                                    fontSize: 12,
                                    color: 'rgba(0, 0, 0, 0.3)',
                                    marginTop: 24,
                                    textAlign: 'center'
                                }}>{strings.formatString(strings["app_version"], Constants.manifest.version)}</Text>

                                </ScrollView>
                            </View>
                        )
                        : (
                            <View style={{
                                flex: 1,
                                flexDirection: "column",
                                paddingTop: unit(8)
                            }}>
                                {this.createMenuItem("exit", strings["login"], this.logout)}
                            </View>
                        )
                }
            </View>
        );
    }

    async changeLanguage(lang){
        this.setState({language: lang})
        await Storage.setLanguage(lang);
        this.props.updateLanguage(lang);

        await this.setUserLanguageEndpoint(lang);

        this.props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTaskList' }]
            })
        );
    }

    createMenuItem(iconName, text, handler) {
        return (
            <TouchableOpacity
                style={style.drawerMenuItem}
                onPress={() => handler()}>
                <View style={style.drawerMenuItemContainer}>
                    <Image
                        style={style.drawerMenuImage}
                        source={icon(iconName)}
                    />
                    <Text style={style.drawerMenuText}>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }


    createNotificationMenuItem(iconName, text, handler) {
        const unreadNotifications = this.props.notifications.filter(item => !item.is_read);
        const notificationCounter = unreadNotifications.length;
        return (
            <TouchableOpacity
                style={[style.drawerMenuItem, {justifyContent: 'space-between', alignItems: 'center'}]}
                onPress={() => handler()}>
                <View style={style.drawerMenuItemContainer}>
                    <Image
                        style={style.drawerMenuImage}
                        source={icon(iconName)}
                    />
                    <Text style={style.drawerMenuText}>
                        {text}
                    </Text>
                </View>
                {notificationCounter > 0 &&
                <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#F93535', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'white', fontSize: 12}}>{notificationCounter}</Text>
                </View>
                }
            </TouchableOpacity>
        );
    }

    createMenuItemWithLabel(iconName, text, handler) {
        return (
            <TouchableOpacity
                style={[style.drawerMenuItem, {justifyContent: 'space-between', alignItems: 'center'}]}
                onPress={() => handler()}>
                <View style={style.drawerMenuItemContainer}>
                    <Image
                        style={style.drawerMenuImage}
                        source={icon(iconName)}
                    />
                    <Text style={style.drawerMenuText}>
                        {text}
                    </Text>
                </View>
                <View style={{borderRadius: 12, backgroundColor: '#F93535', paddingHorizontal: 6, paddingVertical: 4}}>
                    <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>{"new"}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    createFavoriteTasksMenuItem(iconName, text, handler) {
        const taskCount = this.props.favoriteTasks.length
        return (
            <TouchableOpacity
                style={[style.drawerMenuItem, {justifyContent: 'space-between', alignItems: 'center'}]}
                onPress={() => handler()}>
                <View style={style.drawerMenuItemContainer}>
                    <Image
                        style={style.drawerMenuImage}
                        source={icon(iconName)}
                    />
                    <Text style={style.drawerMenuText}>
                        {text}
                    </Text>
                </View>
                {taskCount > 0 &&
                <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#4b79bb', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'white', fontSize: 12}}>{taskCount}</Text>
                </View>
                }
            </TouchableOpacity>
        );
    }

    openProfile = () => {
        this.props.navigation.navigate('UserProfile', {user_id: "me"});
    }

    showIOSNotification(notification){
        iOSNotification.show({
            title: notification.title, 
            body: notification.body,
            params: notification.payload,
            onPress: this.onIOSNotificationPressed.bind(this)
        })
    }

    onIOSNotificationPressed(payload){
        if(payload){
            switch(payload.type){
                case 'task':
                    //route to task
                    taskID = payload.task_id;
                    this.openTask(taskID, extraPayload=payload.extraPayload);
                    break;
                case 'new_message':
                    // route to dialog
                    dialogID = payload.dialog_id;
                    this.loadDialog(dialogID);
                    break;
            }

            if(payload.notification_id){
                this.handleReadingNotification(payload.notification_id)
            }
            
        }
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    notifications: state.notificationReducer.notifications,
    favoriteTasks: state.taskReducer.favoriteTasks,
    userProfile: state.profileReducer,
    rtl: state.configReducer.rtl
  })

//Map your action creators to your props.
const mapDispatchToProps = {
    getNotifications,
    loadFilters,
    getFavoriteTasks,
    getTasks, 
    getCategories,
    readNotification,
    updateProfile,
    updateLanguage
}

export default connect(mapStateToProps, mapDispatchToProps) (DrawerMenu);
