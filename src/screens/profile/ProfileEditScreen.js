import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    TextInput,
    Image,
    Alert,
    StyleSheet
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import Loader from "../../components/Loader";
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import MyToast from "../../components/MyToast";
import RNPickerSelect from "react-native-picker-select";
import { Picker } from '@react-native-picker/picker';
import { HeaderTextButton, SimpleButton } from "../../components/Buttons";
import Avatar from "../../components/Avatar";
import icon from "../../constant/Icons";
import API from "../../api";
import { Notifications as ExpoNotifications } from 'expo';
import * as Notifications from 'expo-notifications';

import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';
import { useNavigation } from '@react-navigation/native';

const unit = val => val * 0.75;

const styles = StyleSheet.create({
    fieldLabel: {
        fontSize: 14,
        marginBottom: 5,
        color: "#888A92"
    },
    fieldInput: {
        height: 38,
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0"
    },
    validationMessage: {
        fontSize: 12,
        color: "#FFAAAA",
        marginTop: unit(-16)
    },
    fieldPicker: {
        height: 38,
        padding: 5,
        justifyContent: "center",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0"
    }
})

class ProfileEditScreen extends React.Component {

    state = {
        isLoading: true,
        validate: false,
        newAvatar: null,
        subcategories: [],
        category: null,
        subcategory: null,
        selected_subcategories: [],
        categories: [],
        categoryList: [],
        user: null,
        language: null,
        driver_license: false,
        languages: [
            {key: "ru", value: "ru", label: strings["russian"]},
            {key: "he", value: "he", label: strings["hebrew"]},
            // {key: "ro", value: "ro", label: strings["romanian"]},
            {key: "en", value: "en", label: strings["english"]}
        ],
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
        ]
    };

    api = new BackendAPI(this);
    userEndpoint = this.api.getUserEndpoint();
    updateUserEndpoint = this.api.getUpdateUserEndpoint();
    getCategoriesEndpoint = this.api.getCategories();


    async componentDidMount() {
        this.props.navigation.setParams({donePress: this.saveEdit});
        const user = await this.loadUser();

        var categories = await this.getCategoriesEndpoint();
        const categoryList = [...categories];
        let categoryMap = {};
        categories.forEach(item => categoryMap[item.id] = item);
        categories = categoryMap;
        
        let category = null;
        let selected_subcategories = [];
        let subcategories = []
        if(user.category){
            category = `${user.category.id}`;
            subcategories = categories[user.category.id]["subcategories"];

            user.subcategory_list.forEach(item => selected_subcategories.push(item.id))
        }

        this.setState({
            categories,
            category,
            subcategories,
            selected_subcategories, 
            isLoading: false,
            categoryList
        });
    }

    async loadUser() {
        const user = this.props.userProfile;
        const language = await settings.getLanguage();

        this.setState({user, language, driver_license: user.driver_license});
        return user;
    }

    showAlertMessage(text){
        Alert.alert(
            "",
            text,
            [{text: "Ok", onPress: null}]
        )
    }

    changePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            return;
        }

        const image = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            base64: true
        });

        if (!image.canceled) {
            const resizedImage = await ImageManipulator.manipulateAsync(
                image.assets[0].uri,
                [{resize: {width: 256, height: 256}}],
                { format: "jpeg", base64: true }
            );

            this.setState({
                newAvatar: {
                    uri: resizedImage.uri,
                    base64: resizedImage.base64
                }
            });
        }
    }

    saveEdit = async () => {
        const { language } = this.state;
        this.setState({validate: true});

        await settings.setLanguage(language);

        if (!this.state.user["first_name"] || !this.state.user["last_name"]) {
            return;
        }

        let params = {
            "first_name": this.state.user["first_name"],
            "last_name": this.state.user["last_name"],
            "experience": this.state.user["experience"],
            "region": this.state.user["region"],
            "category": this.state.category,
            "subcategory_list": this.state.selected_subcategories,
            "min_rate_day": this.processPriceData(this.state.user.min_rate_day),
            "min_rate_hour": this.processPriceData(this.state.user.min_rate_hour),
            "driver_license": this.state.driver_license
        }

        if(this.state.newAvatar){
            params["avatar"] = `data:image/jpeg;base64,${this.state.newAvatar.base64}`
        }

        const result = await this.updateUserEndpoint(params);

        console.log("get updated profile")
        const profile = await API.getMyProfile();
        this.props.updateProfile(profile);
        
        let reloadUser = this.props.route.params?.reloadUser || null;
        if(reloadUser !== null){
            await reloadUser();
        }
        console.log("saveEdit")
        this.props.navigation.goBack()
    }

    setUser(userChange) {
        this.setState({
            user: {
                ...this.state.user,
                ...userChange
            }
        });
    }

    render() {

        if(this.state.isLoading || !this.state.user){
            return <Loader/>;
        }

        return (
            <KeyboardAvoidingView behavior="padding" style={{backgroundColor: 'white', flex: 1}}>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <View style={{
                        flex: 1,
                        flexDirection: "column",
                        paddingTop: unit(16),
                        paddingLeft: unit(16),
                        paddingRight: unit(16),
                        paddingBottom: unit(16)
                    }}>
                        <View>
                            <View style={{flex: 1, alignItems: 'center', marginBottom: 12}}>
                                <Avatar size={100} src={this.state.newAvatar || this.state.user["avatar"]}/>
                                <SimpleButton 
                                    style={{marginTop: 6}} 
                                    title={strings["change_avatar"]} 
                                    onPress={this.changePhoto}/>
                            </View>

                            <View style={{paddingHorizontal: 8}}>
                                <Text style={styles.fieldLabel}>
                                    {strings["name"]}
                                </Text>
                                <TextInput style={styles.fieldInput}
                                    onChangeText={value => this.setUser({"first_name": value})}
                                    value={this.state.user["first_name"]}
                                />
                                {
                                    this.state.validate && !this.state.user["first_name"] &&
                                    <Text style={styles.validationMessage}>
                                    {strings["val_name"]}
                                    </Text>
                                }
                        
                                <Text style={styles.fieldLabel}>
                                    {strings["surname"]}
                                </Text>
                                <TextInput style={styles.fieldInput}
                                    onChangeText={value => this.setUser({"last_name": value})}
                                    value={this.state.user["last_name"]}
                                />
                                {
                                    this.state.validate && !this.state.user["last_name"] &&
                                    <Text style={styles.validationMessage}>
                                    {strings["val_surname"]}
                                    </Text>
                                }
                                

                                <View style={{
                                    marginVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'}}>

                                    <Text style={[styles.fieldLabel]}>
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

                                <Text style={styles.fieldLabel}>
                                    {strings["profile_choose_your_direction"]}
                                </Text>
                                <View style={{marginBottom: 16, marginTop: 16}}>
                                    {this.renderCategories()}
                                </View>

                                <Text style={styles.fieldLabel}>
                                    {strings["profile_exp"]}
                                </Text>
                                <View style={[styles.fieldPicker, {paddingLeft: 0}]}>
                                    <RNPickerSelect
                                        placeholder={{}}
                                        items={this.state.experienceOption}
                                        onValueChange={this.selectExperience}
                                        value={this.state.user.experience}
                                    />
                                </View>
                        
                                <Text style={styles.fieldLabel}>
                                    {strings["region"]}
                                </Text>
                                <View style={[styles.fieldPicker, { paddingLeft: 0 }]}>
                                    <RNPickerSelect
                                        placeholder={{key: "none", value: null, label: strings["quest_add_info_picker_none"]}}
                                        items={[
                                            { value: "any", label: strings["profile_any_region"] },
                                            { value: "centre", label: strings["centre"] },
                                            { value: "region_jerusalem", label: strings["region_jerusalem"] },
                                            { value: "north", label: strings["north"] },
                                            { value: "region_sharon", label: strings["region_sharon"] },
                                            { value: "south", label: strings["south"] },
                                            { value: "region_arava", label: strings["region_arava"] },
                                        ]}
                                        onValueChange={this.selectRegion}
                                        value={this.state.user.region}
                                    /> 
                                </View>

                                <Text style={styles.fieldLabel}>
                                    {strings["profile_hour_price_title"]}
                                </Text>
                                <TextInput 
                                    style={styles.fieldInput}
                                    keyboardType="numeric"
                                    onChangeText={value => this.setUser({"min_rate_hour": value})}
                                    value={`${this.state.user["min_rate_hour"]}`}
                                />

                                <Text style={styles.fieldLabel}>
                                    {strings["profile_day_price_title"]}
                                </Text>
                                <TextInput style={styles.fieldInput}
                                    keyboardType="numeric"
                                    onChangeText={value => this.setUser({"min_rate_day": value})}
                                    value={`${this.state.user["min_rate_day"]}`}
                                />
                            </View>
                        </View>                    
                    </View>

                    <View style={{height: 60}}/>
                </ScrollView>
            </KeyboardAvoidingView>
        );
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

    handleCategorySelect = (categoryID) => {
        this.setState({ 
            category: categoryID, 
            subcategories: categoryID? this.state.categories[categoryID]["subcategories"]: [],
            selected_subcategories: []
        }); 
    }

    selectExperience = experience => {
        this.setState({
            user: {
                ...this.state.user,
                experience
            }
        });
    }

    selectRegion = region => {
        this.setState({
            user: {
                ...this.state.user,
                region
            }
        });
    }

    getPermissions = async() => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    };
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

const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileEditScreen);