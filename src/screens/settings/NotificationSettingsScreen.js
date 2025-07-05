/**
 *  NotificationSettingsScreen.js
 *  Screent with settings for notifications
 *  Created by Dmitry Chulkov 2/09/2019
 */

import React from "react";
import {
    StyleSheet,
    FlatList,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    TextInput,
    View,
    Keyboard,
    ScrollView,
    Switch,
    Platform,
    Image
} from "react-native";

import strings from "../../utils/Strings";
import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
import { BurgerButton } from "../../components/Buttons";
import icon from "../../constant/Icons";

const styles = StyleSheet.create({
    container:{
        paddingTop: 30,
        paddingBottom: 30,
        flexDirection: 'column',
    },
    itemContainer: {
        paddingVertical: 12,
        backgroundColor: 'white',
        paddingStart: 24,
        paddingEnd: 24,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    notificationOptionsText: {
        color: 'rgba(66, 67, 106, 0.65)',
        fontSize: 10
    }
})

class NotificationSettingsScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["notification_settings"],
            headerLeft: (<BurgerButton openDrawer={() => navigation.openDrawer()}/>),
        };
    }

    api = new BackendAPI(this);
    tasksCountEndpoint = this.api.getTasksCountEndpoint();
    notificationSettingsEndpoint = this.api.getNotificationSettings();
    updateNotificationSettings = this.api.updateNotificationSettings();

    state = {
        isHebrew: false,
        messageNotificationsIsOn: false,
        notificationSettings: null
    };

    render(){
        let description = strings["notifications_no_filters"];
        if(this.state.notificationSettings !== null && this.state.notificationSettings.new_task){
            description= "";

            let {categories} = this.state.notificationSettings;
            if(Object.entries(categories).length !== 0){
                categories.forEach(category => {
                    description += strings.getCategory(category.name) + ", "
                })
            }

            let {regions} = this.state.notificationSettings;
            if(Object.entries(regions).length !== 0){
                regions.forEach(region => description += strings.getRegion(region.name) + ", ")
            }

            if(this.state.notificationSettings.price_hour > 0){
                description += strings["filter_price_greater"] + " " + this.state.notificationSettings.price_hour  + strings["filter_hour_price"]
                description += ", "
            }

            if(this.state.notificationSettings.price_day > 0){
                description += strings["filter_price_greater"] + " " + this.state.notificationSettings.price_day  + strings["filter_day_price"]
            }


            if(description.endsWith(", ")){
                let index = description.lastIndexOf(", ");
                description = description.substr(0, index);
            }

            if(description == ""){
                description = strings["notifications_no_filters"];
            }
        }else if(this.state.notificationSettings !== null && !this.state.notificationSettings.new_task){
            description = strings["notifications_new_task_off"]
        }
        const isIOS = Platform.OS === 'ios';
        return(
            <ScrollView style={{backgroundColor: '#EFF0F4'}}>
                <View style={styles.container}>
                    <View>
                        <TouchableOpacity onPress={this.openNewTaskNotificationSettings}>
                            <View style={styles.itemContainer}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}} >
                                    <View style={{marginEnd: 8, flex: 1}}>
                                        <Text style={{fontSize: 16, color: "#42436A"}}>{strings["notifications_new_tasks"]}</Text>
                                        <Text style={styles.notificationOptionsText}>{description}</Text>
                                    </View>
                                    
                                    <Image source={icon("chevron-right")} style={{height: 24, width: 24}}/>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.itemContainer}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text style={{fontSize: 16, color: "#42436A"}}>{strings["notifications_new_messages"]}</Text>
                                <Switch 
                                    value={this.state.messageNotificationsIsOn} 
                                    trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                                    thumbColor={isIOS?'': '#e6e6e6'} 
                                    onValueChange={this.newMessageSettingChange}/>
                            </View>
                        </View>
                        
                    </View>
                </View>
            </ScrollView>
        )
    }

    openNewTaskNotificationSettings = () => {
        let {notificationSettings} = this.state;
        this.props.navigation.navigate("NotificationFilters", {notificationSettings, returnFilterSettings: this.returnFilterSettings.bind(this)})
    }

    newMessageSettingChange = async (newValue) => {
        this.setState({messageNotificationsIsOn: newValue});
        await this.updateNotificationSettings({
            "new_message": newValue
        });
    }

    returnFilterSettings(notificationSettings){
        this.setState({notificationSettings})
    }
    

    componentDidMount(){
        this.setLang();
        this.loadNotificationSettings()      
    }

    async loadNotificationSettings(){
        let notificationSettings = await this.notificationSettingsEndpoint();
        this.setState({notificationSettings, messageNotificationsIsOn: notificationSettings["new_message"]})
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };
}

export default NotificationSettingsScreen;