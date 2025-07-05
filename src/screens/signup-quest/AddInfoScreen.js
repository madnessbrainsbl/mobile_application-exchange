/**
 *  AddInfoScreen.js
 *  Screen with adding information about performer
 * 
 *  Created by Dmitry Chulkov 10/10/2019
 */
import React from 'react';
import {
    Image,
    FlatList,
    Text,
    View,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    TouchableWithoutFeedback,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions,
    SectionList,
    ActivityIndicator,
    KeyboardAvoidingView,
    TextInput,
    Switch
} from 'react-native';
import RNPickerSelect from "react-native-picker-select";
import BackendAPI from "../../../backend/BackendAPI";
import strings from "../../utils/Strings";
import icon from "../../constant/Icons";
import Avatar from '../../components/Avatar';
import Color from '../../constant/Color';
import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';
import { SimpleButton } from '../../components/Buttons';

import API from '../../api';

const styles = StyleSheet.create({
    title: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center'
    },
    action: {
        fontWeight: 'bold',
        color: 'rgba(66, 67, 106, 0.86)',
    },
    skip: {
        color: 'rgba(66, 67, 106, 0.46)',
        paddingHorizontal: 12, 
        paddingVertical: 6
    },
    continueButton: {
        color: Color.accent,
        fontSize: 17,
        borderColor: Color.accent,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 32,
        paddingVertical: 10
    },
    description: {
        marginTop: 8,
        color: 'rgba(66, 67, 106, 0.86)',
        textAlign: 'center'
    },
    sectionTitle: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionDescription: {
        color: 'rgba(66, 67, 106, 0.86)',
    },
    fieldPicker: {
        height: 38,
        padding: 5,
        justifyContent: "center",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0",
        paddingHorizontal: 16
    },
    fieldInput: {
        height: 38,
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0",
        paddingHorizontal: 16
    },
    fieldInputMultiline: {
        paddingVertical: 20,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0",
        paddingHorizontal: 16
    }
})

class AddInfoScreen extends React.Component {

    static navigationOptions = {
        header: null
    };

    api = new BackendAPI(this);
    updateUserEndpoint = this.api.getUpdateUserEndpoint();

    state = {
        loading: false,
        first_name: this.props.userProfile.first_name,
        last_name: this.props.userProfile.last_name,
        email: this.props.userProfile.email,
        category: null,
        region: null,
        selected_subcategories: [],
        categories: [],
        subcategories: [],
        categoryList: [],
        min_rate_day: 0,
        min_rate_hour: 0,
        experience: "0",
        about: "",
        privacy_show_profile_in_search: true,
        privacy_show_phone_number: false,
        experienceOption: [
            {key: "0", value: "0", label: strings["profile_exp_no"]},
            {key: "0-1", value: "0-1", label: `${strings["profile_exp_0"][0].toUpperCase() + strings["profile_exp_0"].slice(1)}`},
            {key: "1-2", value: "1-2", label: `1-2 ${strings["profile_exp_1-4"]}`},
            {key: "2-3", value: "2-3", label: `2-3 ${strings["profile_exp_1-4"]}`},
            {key: "3-4", value: "3-4", label: `3-4 ${strings["profile_exp_1-4"]}`},
            {key: "4-5", value: "4-5", label: `4-5 ${strings["profile_exp_5-15"]}`},
            {key: "5-6", value: "5-6", label: `5-6 ${strings["profile_exp_5-15"]}`},
            {key: "6-7", value: "6-7", label: `6-7 ${strings["profile_exp_5-15"]}`},
            {key: "7-8", value: "7-8", label: `7-8 ${strings["profile_exp_5-15"]}`},
            {key: "8-9", value: "8-9", label: `8-9 ${strings["profile_exp_5-15"]}`},
            {key: "9-10", value: "9-10", label: `9-10 ${strings["profile_exp_5-15"]}`},
            {key: "10-11", value: "10-11", label: `10-11 ${strings["profile_exp_5-15"]}`},
            {key: "11-12", value: "11-12", label: `11-12 ${strings["profile_exp_5-15"]}`},
            {key: "12-13", value: "12-13", label: `12-13 ${strings["profile_exp_5-15"]}`},
            {key: "13-14", value: "13-14", label: `13-14 ${strings["profile_exp_5-15"]}`},
            {key: "14-15", value: "14-15", label: `14-15 ${strings["profile_exp_5-15"]}`},
            {key: "15+", value: "15+", label: `${strings["profile_ext_15+"][0].toUpperCase() + strings["profile_ext_15+"].slice(1)}`}
        ],
        availability: {
            "sunday": {
                "end": null,
                "full_day": true,
                "start": null,
                "unavailable": false,
            },
            "monday":  {
              "end": null,
              "full_day": true,
              "start": null,
              "unavailable": false,
            },
            "tuesday": {
                "end": null,
                "full_day": true,
                "start": null,
                "unavailable": false,
            },
            "wednesday": {
                "end": null,
                "full_day": true,
                "start": null,
                "unavailable": false,
            },
            "thursday": {
              "end": null,
              "full_day": true,
              "start": null,
              "unavailable": false,
            },
            "friday": {
                "end": null,
                "full_day": true,
                "start": null,
                "unavailable": false,
            },
            "saturday": {
                "end": null,
                "full_day": true,
                "start": null,
                "unavailable": false,
            },
        }
    }

    api = new BackendAPI(this);
    updateUserEndpoint = this.api.getUpdateUserEndpoint();
    getCategoriesEndpoint = this.api.getCategories();

    async componentDidMount(){
        var categories = await this.getCategoriesEndpoint();
        const categoryList = [...categories];
        let categoryMap = {};
        categories.forEach(item => categoryMap[item.id] = item);
        categories = categoryMap;
        

        this.setState({categories, categoryList})
    }

    

    render(){
        return (
            <KeyboardAvoidingView behavior="padding" style={{backgroundColor: 'white', flex: 1}}>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <View style={{
                        flex: 1,
                        flexDirection: "column",
                        padding: 24,
                        marginTop: 40
                    }}>
                        <View>
                            <View style={{alignItems: 'center'}}>
                                <Image source={require("../../assets/images/splash.jpg")} style={{width: 180, height: 110, resizeMode: 'contain'}}/>
                            </View>
                            <View style={{alignItems: 'center', marginBottom: 24}}>
                                <Text style={styles.title}>{strings["quest_add_info_title"]}</Text>
                                <Text style={styles.description}>{strings["quest_add_info_description"]}</Text>
                            </View>

                            <View style={{paddingHorizontal: 8}}>

                                <View style={{marginBottom: 16}}>
                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["name"]}
                                    </Text>
                                    <TextInput style={styles.fieldInput}
                                        onChangeText={value => this.setState({"first_name": value})}
                                        value={this.state["first_name"]}
                                    />
                            
                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["surname"]}
                                    </Text>
                                    <TextInput style={styles.fieldInput}
                                        onChangeText={value => this.setState({"last_name": value})}
                                        value={this.state["last_name"]}
                                    /> 

                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["email"]}
                                    </Text>
                                    <TextInput style={styles.fieldInput}
                                        onChangeText={value => this.setState({"email": value})}
                                        value={this.state["email"]}
                                    />   
                                </View>


                                <View style={{
                                    marginBottom: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'}}>

                                    <Text style={styles.sectionTitle}>
                                        {strings["driver_license"]}
                                    </Text>
                                    <TouchableOpacity onPress={() => this.setState({driver_license: !this.state.driver_license})}>
                                    {
                                        this.state.driver_license ? 
                                        <Image style={{height: 24, width: 24}} source={icon("available")}/> 
                                        : <EmptySelection size={24}/>
                                    }
                                    </TouchableOpacity>
                                </View>


                                <Text style={styles.sectionTitle}>
                                    {strings["profile_choose_your_direction"]}
                                </Text>
                                <View style={{marginBottom: 16, marginTop: 16}}>
                                    {this.renderCategories()}
                                </View>

                                
                                {/* <View style={{marginBottom: 16}}>
                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["quest_add_info_specialization"]}
                                    </Text>
                                    <View style={styles.fieldPicker}>
                                        <RNPickerSelect
                                            placeholder={{value: null, label: strings["quest_add_info_picker_none"]}}
                                            items={this.getCategoriesForPicker()}
                                            onValueChange={this.handleCategorySelect}
                                            value={this.state.category}
                                            style={{
                                                inputIOS: {
                                                    color: "#42436A"
                                                },
                                                inputAndroid: {
                                                    color: "#42436A"
                                                }
                                            }}
                                        /> 
                                    </View>

                                    {
                                        this.state.category &&
                                        <Text style={[styles.sectionDescription, {marginBottom: 6}]}>
                                            {strings["quest_add_info_direction_description"]}
                                        </Text>
                                    }
                                    <View style={{marginBottom: 8, alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap'}}>
                                        {this.renderSubcategories()}
                                    </View>
                                </View> */}

                                
                                <View style={{marginBottom: 16}}>
                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["profile_exp"]}
                                    </Text>
                                    <View style={styles.fieldPicker}>
                                        <RNPickerSelect
                                            placeholder={{}}
                                            items={this.state.experienceOption}
                                            onValueChange={this.selectExperience}
                                            value={this.state.experience}
                                            style={{
                                                inputIOS: {
                                                    color: "#42436A"
                                                },
                                                inputAndroid: {
                                                    color: "#42436A"
                                                }
                                            }}
                                        />
                                    </View>
                                </View>
                                
                                <View style={{marginBottom: 16}}>
                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["region"]}
                                    </Text>
                                    <View style={styles.fieldPicker}>
                                        <RNPickerSelect
                                            placeholder={{key: "none", value: null, label: strings["quest_add_info_picker_none"]}}
                                            items={[
                                                { key: "any", value: "any", label: strings["profile_any_region"] },
                                                { key: "centre", value: "centre", label: strings["centre"] },
                                                { key: "region_jerusalem", value: "region_jerusalem", label: strings["region_jerusalem"] },
                                                { key: "north", value: "north", label: strings["north"] },
                                                { key: "region_sharon", value: "region_sharon", label: strings["region_sharon"] },
                                                { key: "south", value: "south", label: strings["south"] },
                                                { key: "region_arava", value: "region_arava", label: strings["region_arava"] },
                                            ]}
                                            onValueChange={this.selectRegion}
                                            value={this.state.region}
                                            style={{
                                                inputIOS: {
                                                    color: "#42436A"
                                                },
                                                inputAndroid: {
                                                    color: "#42436A"
                                                }
                                            }}
                                        />
                                    </View>
                                </View>
                                
                                <View style={{marginBottom: 16}}>
                                    <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                        {strings["quest_add_info_min_rate_title"]}
                                    </Text>

                                    <Text style={styles.fieldLabel}>
                                    {strings["profile_hour_price_title"]}
                                    </Text>
                                    <TextInput 
                                        style={styles.fieldInput}
                                        keyboardType="numeric"
                                        onChangeText={value => this.setState({"min_rate_hour": value})}
                                        value={`${this.state.min_rate_hour}`}
                                    />

                                    <Text style={styles.fieldLabel}>
                                        {strings["profile_day_price_title"]}
                                    </Text>
                                    <TextInput style={styles.fieldInput}
                                        keyboardType="numeric"
                                        onChangeText={value => this.setState({"min_rate_day": value})}
                                        value={`${this.state.min_rate_day}`}
                                    />
                                </View>

                                <View style={{marginBottom: 24}}>
                                    <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                        <Text style={[styles.sectionTitle, {marginBottom: 0}]}>
                                            {strings["quest_add_info_availability_title"]}
                                        </Text>
                                        <SimpleButton title={strings['change']} onPress={this.editAvailability}/>
                                    </View>
                                    
                                    <Text style={[styles.sectionDescription, {marginBottom: 12}]}>
                                        {strings["quest_add_info_availability_description"]}
                                    </Text>

                                    {this.renderAvailabilitySection()}
                                </View>

                                <View style={{marginBottom: 16}}>
                                    <Text style={[styles.sectionTitle, {marginBottom: 0}]}>
                                        {strings["quest_add_info_about_title"]}
                                    </Text>
                                    <Text style={[styles.sectionDescription, {marginBottom: 6}]}>
                                        {strings["quest_add_info_about_description"]}
                                    </Text>
                                    <TextInput style={styles.fieldInputMultiline}
                                        onChangeText={value => this.setState({about: value})}
                                        value={this.state.about}
                                        multiline
                                        placeholder={strings["quest_add_info_about_hint"]}
                                    />
                                </View>

                                {/* {this.renderPrivacySection()} */}

                                <View style={{alignItems: 'center'}}> 
                                    {
                                        this.state.loading?
                                        <ActivityIndicator style={{marginTop: 40}} color={Color.primary}/> :
                                        <View style={{alignItems: 'center'}}>
                                            {this.getContinueButton()}
                                        </View>
                                    }
                                </View>

                            </View>
                        </View>                    
                    </View>

                    <View style={{height: 60}}/>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    renderPrivacySection(){
        const isIOS = Platform.OS === 'ios';
        return(
            <View style={{marginBottom: 24}}>
                <View style={{flexDirection: this.state.isHebrew? 'row-reverse': 'row'}}>
                    <Text style={styles.sectionTitle}>{strings["profile_privacy"]}</Text>
                </View>
                <View style={{}}>
                    <View style={{
                        flexDirection: this.state.isHebrew? "row-reverse": "row", 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingVertical: 6
                        }}>
                        <Text style={styles.sectionDescription}>{strings["profile_show_profile_in_search"]}</Text>
                        <Switch 
                            value={this.state.privacy_show_profile_in_search}
                            trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                            thumbColor={isIOS?'': '#e6e6e6'}
                            onValueChange={this.changePrivacySearchSettings}/>
                    </View>

                    <View style={[styles.actionContainer, {
                        flexDirection: this.state.isHebrew? "row-reverse": "row", 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingVertical: 6
                        }]}>
                        <Text style={styles.sectionDescription}>{strings["profile_show_phone_number"]}</Text>
                        <Switch 
                            value={this.state.privacy_show_phone_number}
                            trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                            thumbColor={isIOS?'': '#e6e6e6'}
                            onValueChange={this.changePrivacyPhoneSettings}/>
                    </View>
                </View>
            </View>
        )
    }

    changePrivacySearchSettings = async (newValue) => {
        this.setState({privacy_show_profile_in_search: newValue})
    }

    changePrivacyPhoneSettings = async (newValue) => {
        this.setState({privacy_show_phone_number: newValue})
    }


    renderCategories(){
        return this.state.categoryList.map((category, index) => {
            return (
                <View key={category.id.toString()} style={{marginBottom: 10}}>
                    <View style={{
                            marginBottom: 6,
                            backgroundColor: 'rgba(18, 144, 203, 0.2)',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                            borderRadius: 4
                        }}>
                        <Text style={{fontWeight: 'bold'}}>
                            {strings.getCategory(category.name)}
                        </Text>
                    </View>
                    
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {this.renderSubcategories(category)}
                    </View>
                </View>
            )
        })
    }

    renderSubcategories(category){
        return category.subcategories.map((item, index) => {
            let background = 'transparent';
            let text = 'black';
            if(this.state.selected_subcategories.includes(item.id)){
                background = 'rgba(0, 65, 201, 0.56)';
                text = 'white'
            }
            return (
                <TouchableOpacity 
                    key={item.id} 
                    style={{marginVertical: 2, marginHorizontal: 2}} 
                    onPress={() => this.handleSubcategoryPress(item.id)}>
                        
                    <View style={{
                        borderRadius: 6,
                        backgroundColor: background,
                    }}>
                        <Text style={{
                        marginVertical: 4, 
                            marginHorizontal: 8, 
                            color: text
                            }}>{strings.getCategory(item.name)}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    handleSubcategoryPress = (subcategoryID) => {
        let {selected_subcategories} = this.state;
        if(selected_subcategories.includes(subcategoryID)){
            selected_subcategories.splice(selected_subcategories.indexOf(subcategoryID), 1)
        }else{
            if(selected_subcategories.length <= 7){
                selected_subcategories.push(subcategoryID);
            }
        }

        this.setState({selected_subcategories});
    }

    renderAvailabilitySection(){
        let {availability} = this.state
        return(
            <View style={{flexDirection: this.state.isHebrew? "row-reverse":"row", justifyContent: 'space-between'}}>
                <DayView key="sunday" params={availability["sunday"]} title={strings["profile_weekday_sunday"]}/>
                <DayView key="monday" params={availability["monday"]} title={strings["profile_weekday_monday"]}/>
                <DayView key="tuesday" params={availability["tuesday"]} title={strings["profile_weekday_tuesday"]}/>
                <DayView key="wednesday" params={availability["wednesday"]} title={strings["profile_weekday_wednesday"]}/>
                <DayView key="thursday" params={availability["thursday"]} title={strings["profile_weekday_thursday"]}/>
                <DayView key="friday" params={availability["friday"]} title={strings["profile_weekday_friday"]}/>
                <DayView key="saturday" params={availability["saturday"]} title={strings["profile_weekday_saturday"]}/>
            </View>
        )
    }

    editAvailability = () => {
        this.props.navigation.navigate("QuestScheduleEdit", {
            updateSchedule: this.updateSchedule.bind(this),
            schedule: this.state.availability
        })
    }

    updateSchedule = (schedule) => {
        console.log(schedule);
        this.setState({availability: schedule})
    }

    getContinueButton(){
        let disabledButton = (
            <View style={{marginTop: 40}}>
                <Text style={{...styles.continueButton, color: "rgba(5, 158, 48, 0.3)", borderColor: "rgba(5, 158, 48, 0.5)"}}>{strings["quest_continue"]}</Text>
            </View>
        )

        if(this.state.first_name === null){
            return disabledButton;
        }

        if(this.state.last_name === null){
            return disabledButton;
        }

        if(this.state.email === null){
            return disabledButton;
        }

        return (
            <TouchableOpacity style={{marginTop: 40}} onPress={this.continuePress}>
                <Text style={styles.continueButton}>{strings["quest_continue"]}</Text>
            </TouchableOpacity>
        )
    }

    processPriceData = (value) => {
        if(!isNaN(value)) return value;

        let clear = "";
        for(let index in value){
            if(!isNaN(value[index])){
                clear += value[index]
            }
        }

        return clear;
    }

    getCategoriesForPicker(){
        let arr = [];
        let categoryList = this.state.categories;
        for(let id in categoryList){
            arr.push({
                key: id,
                value: id,
                label: strings.getCategory(categoryList[id]["name"]),
            })
        }

        return arr;
    }

    selectExperience = experience => {
        this.setState({experience});
    }

    selectRegion = region => {
        this.setState({region});
    }

    continuePress = async() => {
        if(
            this.state.first_name === '' || 
            this.state.last_name === '' || 
            this.state.email === '' ||
            this.state.loading) return

        this.setState({loading: true})
        
        const result = await this.updateUserEndpoint({
            "first_name": this.state.first_name,
            "last_name": this.state.last_name,
            "email": this.state.email,
            "category": this.state.category,
            "region": this.state.region,
            "experience": this.state.experience,
            "subcategory_list": this.state.selected_subcategories,
            "min_rate_day": this.processPriceData(this.state.min_rate_day),
            "min_rate_hour": this.processPriceData(this.state.min_rate_hour),
            "about": this.state.about,
            "privacy_show_profile_in_search": this.state.privacy_show_profile_in_search,
            "privacy_show_phone_number": this.state.privacy_show_phone_number
        });

        await API.updateSchedule({"availability": this.state.availability});
        result["availability"] = this.state.availability;
        this.props.updateProfile(result);
        this.props.navigation.navigate("Home")
    }

    
}

function EmptySelection(props){
    return(
        <View
            style={{
                height: props.size,
                width: props.size,
                borderRadius: props.size/2,
                borderColor: 'rgba(0, 0, 0, 0.3)',
                borderStyle: 'solid',
                borderWidth: 1
            }}
        />
    )
}

function DayView(props){
    let view = null;
    if(props.params.unavailable){
        view = <Image style={{height: 18, width: 18}} source={icon("unavailable")}/>
    }else if(props.params.full_day){
        view = <Image style={{height: 18, width: 18}} source={icon("available")}/>
    }else{
        view = (
        <View style={{alignItems: 'center'}}>
            <Text style={{color: 'rgba(66, 67, 106, 0.86)'}}>{props.params.start.substr(0, 5)}</Text>
            <Text style={{color: 'rgba(66, 67, 106, 0.86)'}}>{props.params.end.substr(0, 5)}</Text>
        </View>)
    }
    return(
        <View style={{alignItems: 'center', marginHorizontal: 0}}>
            <Text style={{color: 'rgba(66, 67, 106, 0.65)'}}>{props.title}</Text>
            <View style={{flex: 1, justifyContent: 'center'}}>
                {view}
            </View>
        </View>
    )
}


const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
}

export default connect(mapStateToProps, mapDispatchToProps)(AddInfoScreen);