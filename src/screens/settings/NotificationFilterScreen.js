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
    Switch,
    ScrollView,
    Platform
} from "react-native";

import strings from "../../utils/Strings";
import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
import { HeaderTextButton } from "../../components/Buttons";

import { connect } from 'react-redux';
import { getCategories } from '../../redux/task-handlers';

const styles = StyleSheet.create({
    container:{
        backgroundColor: 'white',
        paddingTop: 30,
        paddingBottom: 30,
        paddingStart: 24,
        paddingEnd: 24,
        flexDirection: 'column',
    },
    filterCategoryTitle: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    filterCategoryContainer: {
        marginBottom: 20
    },
    categoryItem:{
        borderRadius: 12,  
        marginRight: 8, 
        marginBottom: 8,
        borderColor: '#3B5998', 
        borderWidth: 1,
    },
    categoryItemText: {
        paddingHorizontal: 20, 
        paddingVertical: 4
    },
    priceSubtitle:{
        color: 'rgba(59, 89, 152, 0.65)'
    },
    price: {
        color: "#2E8F1E",
        fontSize: 16,
        fontWeight: "bold"
    },
    itemContainer: {
        paddingVertical: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
    },
    notificationOptionsText: {
        color: 'rgba(66, 67, 106, 0.65)',
        fontSize: 12
    }
})

class NotificationFilterScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {title: strings["notification_filters"]};
    }

    api = new BackendAPI(this);
    tasksCountEndpoint = this.api.getTasksCountEndpoint();
    regionsEndpoint = this.api.getRegions();
    categoriesEndpoint = this.api.getCategories();
    updateNotificationSettings = this.api.updateNotificationSettings();

    state = {
        regions:[],
        categories: [],
        hourPrice: "",
        dayPrice: "",
        isHebrew: false,
        notificationSettings: null
    };

    componentDidMount(){
        this.setLang();
        this.loadCategories();
        this.loadRegions();
        
        let notificationSettings = this.props.route.params?.notificationSettings || null;
        let hourPrice = notificationSettings.price_hour !== -1? notificationSettings.price_hour.toString(): "";
        let dayPrice = notificationSettings.price_day !== -1? notificationSettings.price_day.toString(): "";
        this.setState({notificationSettings, hourPrice, dayPrice});
    }


    render(){
        const isIOS = Platform.OS === 'ios';
        return(
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <ScrollView>
                <View>
                <View style={styles.container}>

                    <View style={styles.itemContainer}>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flex: 1}}>
                            <View style={{marginEnd: this.state.isHebrew? 0:8, marginStart: this.state.isHebrew? 8: 0, flex: 1, alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}}>
                                <Text style={{fontSize: 16, color: "#42436A"}}>{strings["notifications_new_tasks"]}</Text>
                                <Text style={styles.notificationOptionsText}>{strings["notification_description"]}</Text>
                            </View>
                            
                            <Switch 
                                value={this.state.notificationSettings?this.state.notificationSettings.new_task:false} 
                                trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                                thumbColor={isIOS?'': '#e6e6e6'} 
                                onValueChange={this.newTaskSettingChange}/>
                        </View>
                    </View>

                    <View style={{marginTop: 8, marginBottom: 16, alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}}>
                        <Text style={{fontSize: 16, color: "#42436A"}}>{strings["notification_filters"]}</Text>
                        <Text style={styles.notificationOptionsText}>{strings["notification_filters_description"]}</Text>
                    </View>

                    <View style={[styles.filterCategoryContainer, {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}]}>
                        <Text style={styles.filterCategoryTitle}>{strings["categories"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', flexWrap: 'wrap', marginTop: 8}}>
                            {this.renderCategories()}
                        </View>
                    </View>

                    <View style={[styles.filterCategoryContainer, {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}]}>
                        <Text style={styles.filterCategoryTitle}>{strings["region"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', flexWrap: 'wrap', marginTop: 8}}>
                            {this.renderRegions()}
                        </View>
                    </View>

                    <View style={{alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}}>
                        <Text style={styles.filterCategoryTitle}>{strings["price"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', marginTop: 8}}>
                            <View>
                                <Text style={styles.priceSubtitle}>{strings["filter_price_greater"]}</Text>
                                <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', alignItems: 'center'}}>
                                    <TextInput 
                                        value={this.state.hourPrice}
                                        onChangeText={(text) => this.setState({hourPrice: text})}
                                        keyboardType="numeric"
                                        style={{borderBottomWidth: 1, borderBottomColor: '#3B5998', width: 50}}/>
                                    <Text style={styles.price}>{strings["filter_hour_price"]}</Text>
                                </View>
                            </View>

                            <View style={{marginHorizontal: 16}}>
                                <Text style={styles.priceSubtitle}>{strings["filter_price_greater"]}</Text>
                                <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', alignItems: 'center'}}>
                                    <TextInput 
                                        value={this.state.dayPrice}
                                        onChangeText={(text) => this.setState({dayPrice: text})}
                                        keyboardType="numeric"
                                        style={{borderBottomWidth: 1, borderBottomColor: '#3B5998', width: 50}}/>
                                    <Text style={styles.price}>{strings["filter_day_price"]}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{marginTop: 30, flexDirection: this.state.isHebrew? "row-reverse": "row", justifyContent: this.state.isHebrew? 'flex-start':'flex-end'}}>
                        <TouchableOpacity onPress={this.resetNotificationFilters} style={{marginHorizontal: 8}}>
                            <Text style={{color: "#EB5757"}}>{strings["notification_filters_reset"]}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.saveNotificationFilters} style={{marginHorizontal: 8}}>
                            <Text style={{color: "#3B5998"}}>{strings["notification_filters_save"]}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
            </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        )
    }

    renderCategories(){
        let items = []
        this.state.categories.forEach(item => items.push(this.renderCategoryItem(item)))
        return items;
    }

    renderCategoryItem(category){
        let {notificationSettings} = this.state
        let isSelected = false;
        if(notificationSettings != null && notificationSettings.categories.length > 0){
            let {categories} = notificationSettings;
            isSelected = categories.findIndex(item => item.id === category.id) !== -1;
        }

        return(
            <View key={category.id.toString()} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={() => this.onCategoryPressed(category)}>
                    <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{ strings.getCategory(category["name"])}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    newTaskSettingChange = async (newValue) => {
        let {notificationSettings} = this.state;
        notificationSettings.new_task = newValue
        this.setState({notificationSettings});
        const result = await this.updateNotificationSettings({
            "new_task": newValue
        });
        let returnFilterSettings = this.props.route.params?.returnFilterSettings || null;
        if(returnFilterSettings != null && typeof(returnFilterSettings) === "function"){
            returnFilterSettings(result);
        }
    }

    onCategoryPressed(category){
        let {notificationSettings} = this.state;
        let {categories} = notificationSettings;
        let position = categories.findIndex(item => item.id === category.id)
        if(position === -1){
            categories.push(category);
        }else{
            categories.splice(position, 1);
        }

        notificationSettings.categories = categories
        this.setState({notificationSettings})
    }


    onRegionPress(region){
        let {notificationSettings} = this.state;
        let {regions} = notificationSettings;
        let position = regions.findIndex(item => item.id === region.id)
        if(position === -1){
            regions.push(region);
        }else{
            regions.splice(position, 1);
        }

        notificationSettings.regions = regions
        this.setState({notificationSettings})
    }

    renderRegions(){
        let items = [];
        let {notificationSettings} = this.state
        
        this.state.regions.forEach(region => {
            let isSelected = false;

            if(notificationSettings != null && notificationSettings.regions.length > 0){
                let {regions} = notificationSettings;
                isSelected = regions.findIndex(item => item.id === region.id) !== -1;
            }
            // let {selectedRegions} = this.state
            // let isSelected = selectedRegions? selectedRegions.findIndex(item => item.value === region.value) !== -1 : false;

            items.push(
                <View key={region.id.toString()} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                    <TouchableWithoutFeedback onPress={() => this.onRegionPress(region)}>
                        <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{strings.getRegion(region.name)}</Text>
                    </TouchableWithoutFeedback>
                </View>
            )
        })

        return items;
    }


    loadRegions = async () => {
        const result = await this.regionsEndpoint();
        this.setState({regions: result});
    }

    loadCategories = async () => {
        const result = await this.categoriesEndpoint();
        this.setState({categories: result})
    }

    saveNotificationFilters = async () => {
        let {notificationSettings} = this.state;
        let update = {
            "categories": notificationSettings.categories,
            "regions": notificationSettings.regions,
            "price_day": this.state.dayPrice? this.state.dayPrice: -1,
            "price_hour": this.state.hourPrice? this.state.hourPrice: -1
        }
        const result = await this.updateNotificationSettings(update);
        let returnFilterSettings = this.props.route.params?.returnFilterSettings || null;
        if(returnFilterSettings != null && typeof(returnFilterSettings) === "function"){
            returnFilterSettings(result);
        }
        this.props.navigation.goBack();
    }

    resetNotificationFilters = async () => {
        let {notificationSettings} = this.state;
        notificationSettings.categories = []
        notificationSettings.regions = []
        notificationSettings.price_hour = -1
        notificationSettings.price_day = -1
        this.setState({notificationSettings, dayPrice: "", hourPrice: ""});
        const result = await this.updateNotificationSettings({
            "categories": [],
            "regions": [],
            "price_hour": -1,
            "price_day": -1
        });
        let returnFilterSettings = this.props.route.params?.returnFilterSettings || null;
        if(returnFilterSettings != null && typeof(returnFilterSettings) === "function"){
            returnFilterSettings(result);
        }
        this.props.navigation.goBack();
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };
}

const mapStateToProps = state => ({
    categories: state.taskReducer.categories,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getCategories,
}


export default connect(mapStateToProps, mapDispatchToProps)(NotificationFilterScreen);