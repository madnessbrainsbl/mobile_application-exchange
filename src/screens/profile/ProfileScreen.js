import React from 'react';
import {
    View,
    ScrollView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TouchableHighlight,
    TextInput,
    Switch,
    Platform,
    Alert
} from 'react-native';
import { Linking } from 'react-native';

import BackendAPI from "../../../backend/BackendAPI"; // TODO: refactor

import strings from "../../utils/Strings";
import { BurgerButton } from "../../components/Buttons";
import { HeaderTextButton, SimpleButton } from '../../components/Buttons';
import icon from "../../constant/Icons";
import Rating from "../../components/Rating";
import Avatar from "../../components/Avatar";
import PersonalQualitiesView from './components/PersonalQualitiesView';
import ReviewItem from './../../components/ReviewItem';

import API from '../../api';
import Storage from '../../utils/Storage';

import { connect } from 'react-redux';
import { getFavoriteUsers, addUserToFavoriteList, removeUserFromFavoriteList } from '../../redux/favorite-users-handlers';
import { updateProfile, loadProfile } from '../../redux/profile/handlers';

import Color from '../../constant/Color';
import moment from 'moment';


const CONTENT_MARGIN_X = 24;
const CONTENT_MARGIN_Y = 26;

const style = StyleSheet.create({
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    name: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 24,
    },
    sectionTitle: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 6
    },
    bodyText: {
        color: 'rgba(66, 67, 106, 0.86)',
    },
    actionTitle:{
        color: 'rgba(66, 67, 106, 0.86)',
    },
    actionContainer: {
        paddingVertical: 14,
        borderBottomColor: 'rgba(66, 67, 106, 0.16)',
        borderBottomWidth: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        color: "#2E8F1E",
        fontWeight: 'bold',
        fontSize: 18
    },
    mutedText: {
        color: 'rgba(66, 67, 106, 0.36)',
    },
    itemContainer: {
        marginHorizontal: CONTENT_MARGIN_X,
        marginTop: CONTENT_MARGIN_Y
    },
    rating: {
        color: '#42436A',
        fontSize: 18,
        marginHorizontal: 3,
    },
    ratingDescription: {
        fontSize: 12,
        color: 'rgba(66, 67, 106, 0.86)',
        textAlign: 'center'
    }
})

class ProfileScreen extends React.Component {

    // static navigationOptions = ({navigation}) => {
    //     let userID = navigation.getParam("user_id", "me");
    //     let options = {
    //         title: strings["profile"]
    //     }

    //     if(userID === "me"){
    //         options.headerRight = <HeaderTextButton onPress={navigation.getParam("editPress")} title={strings["change"]}/>
    //     }

    //     return options
    // }

    state = {
        user: null,
        reviews: [], 
        showAccountTypeDialog: false,
        accountTypeOption: null
    };

    api = new BackendAPI(this);

    createDialogEndpoint = this.api.getCreateDialogEndpoint();

    blockUserEndpoint = this.api.getBlockUserEndpoint();
    unblockUserEndpoint = this.api.getUnblockUserEndpoint();

    updateUserEndpoint = this.api.getUpdateUserEndpoint(); //! Move to redux
    reviewsEndpoint = this.api.getUserReviews();
    logEeConnectionEndpoint = this.api.getLogEeConnectionEndpoint();

    componentDidMount() {          
        this.props.navigation.setParams({editPress: this.editUser})
        this.props.getFavoriteUsers();
        this.loadReviews()
        this.loadUser();
    }

    loadReviews = async () => {
        let userID = -1;
        const userFromParams = this.props.route?.params?.user || null;
        if(userFromParams !== null){
            userID = userFromParams.id;
        } else if (this.props.route?.params?.user_id === "me") {
            userID = this.props.currentUser.id;
        } else if(this.props.route?.params?.user_id !== -1) {
            userID = this.props.route?.params?.user_id || -1;
        }else{
            userID =  this.props.currentUser.id;
        }

        const reviews = await this.reviewsEndpoint({userID, count: 2, offset: 0});
        this.setState({reviews})
    }

    render() {

        if(!this.state.user){
            return (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator/>
                </View>
            )
        }

        return (
            <View style={{flex: 1}}>
                <ScrollView style={{flex: 1}}>
                    <View style={{paddingTop: 20, paddingBottom: 20}}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 16}}>

                            
                            <View style={{alignItems: 'center'}}>
                                <Avatar src={this.state.user["avatar"]} size={120}/>
                                <View style={{position: 'absolute', bottom: -10}}>{this.renderSpecializationLabel()}</View>
                            </View>

                            <View style={{
                                position: 'absolute',
                                left: 20, 
                                right: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>

                                {this.renderPerformerRating()}
                                {this.renderEmployerRating()}

                            </View>
                            

                        </View>
                        
                        {/* {this.renderRating()} */}

                        <View style={{alignItems: 'center', marginTop: 6}}>
                            <Text style={style.name}>{`${this.state.user["first_name"]} ${this.state.user["last_name"]}`}</Text>
                        </View>

                        {this.renderSubcategories()}
                        {this.renderWorkExperience()}
                        {this.renderRegion()}

                        {
                            this.state.user.date_joined && 
                            <View style={{alignItems: 'center', marginTop: 6}}>
                                <Text style={[style.bodyText, {textAlign: 'center'}]}>{`In app from ${moment(this.state.user.date_joined).format("MMMM DD YYYY")}`}</Text>
                            </View>
                        }

                        {this.renderQualities()}

                        {
                            this.state.user.driver_license ? 
                            <View style={{
                                marginTop: 20,
                                marginHorizontal: 20,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'}}>

                                <Text style={{
                                    fontSize: 14,
                                    marginBottom: 5,
                                    color: "#888A92"
                                }}>
                                    {strings["driver_license"]}
                                </Text>
                                <Image style={{height: 24, width: 24}} source={icon("available")}/> 
                            </View>
                            : null
                        }

                        {this.renderAvailabilitySection()}
                        {this.renderMinPriceSection()}
                        {this.renderAboutSection()}
                        {/* {this.renderPrivacySection()} */}
                        {/* {this.renderContactsSection()} */}
                        {this.renderReviews()}
                        {this.renderExitButton()}
                    </View>
                </ScrollView>
                {this.renderAccountTypeDialog()}
            </View>
        )
    }

    renderAccountTypeDialog = () => {
        if(this.state.showAccountTypeDialog){
            let {accountTypeOption} = this.state;
            return (
                <View style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>

                    <View style={{
                        backgroundColor: 'white',
                        width: 270,
                        padding: 16,
                        borderRadius: 6,
                    }}>
                        {/* <Text style={{color: Color.primaryText, fontSize: 18, fontWeight: 'bold'}}>{strings["profile_account_type_title"]}</Text>
                        <Text style={{
                            color: Color.primaryText,
                            marginTop: 12
                        }}>
                            {strings["profile_account_type_description"]}
                        </Text> */}
                        
                        <View>
                            <TouchableOpacity onPress={() => this.setState({accountTypeOption: 'creator'})}>
                            <View style={{flexDirection: 'row', marginTop: 16, alignItems: 'center'}}>
                                <Image source={accountTypeOption === "creator"? icon("radio-button"): icon("radio-button-empty")} style={{height: 20, width: 20}}/>
                                <Text style={{marginHorizontal: 6, color: Color.primaryText}}>{strings["creator"]}</Text>
                            </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({accountTypeOption: 'performer'})}>
                            <View style={{flexDirection: 'row', marginTop: 12, alignItems: 'center'}}>
                                <Image source={accountTypeOption === "creator"? icon("radio-button-empty"): icon("radio-button")} style={{height: 20, width: 20}}/>
                                <Text style={{marginHorizontal: 6, color: Color.primaryText}}>{strings["performer"]}</Text>
                            </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{
                            marginTop: 16,
                            flexDirection: this.props.rtl? "row-reverse": 'row',
                            justifyContent: 'flex-end'
                        }}>
                            <TouchableOpacity style={{marginHorizontal: 12}} onPress={() => this.setState({showAccountTypeDialog: false})}>
                                <Text style={{color: Color.primary}}> {strings["pofile_account_type_cancel"]}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{marginHorizontal: 12}} onPress={this.changeAccountType}>
                                <Text style={{color: Color.primary}}> {strings["profile_account_type_change"]}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            )
        }
    }

    changeAccountType = async () => {
        let {accountTypeOption, user} = this.state;
        user.account_type = accountTypeOption;
        this.setState({user, showAccountTypeDialog: false});

        const result = await this.updateUserEndpoint({
            "account_type": accountTypeOption,
        });

        let profile = this.props.currentUser;
        profile.account_type = accountTypeOption;
        this.props.updateProfile(profile);
    }

    renderEmployerRating(){
        return (
            <View style={{alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={style.rating}>{this.state.user.employer_rating}</Text>
                    <Image source={icon("star-blank")} style={{height: 16, width: 16, resizeMode: 'contain'}}/>
                </View>
                <Text style={style.ratingDescription}>{strings["profile_rating_type_employer"]}</Text>
            </View>
        )
    }

    renderPerformerRating(){
        return (
            <View style={{alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={style.rating}>{this.state.user.performer_rating}</Text>
                    <Image source={icon("star-blank")} style={{height: 16, width: 16, resizeMode: 'contain'}}/>
                </View>
                <Text style={style.ratingDescription}>{strings["profile_rating_type_performer"]}</Text>
            </View>
        )
    }

    renderQualities(){
        let {user} = this.state
        let performerQualities = user["personal_qualities"].filter(item => item["quality_as"] == "Performer")
        let employerQualities = user["personal_qualities"].filter(item => item["quality_as"] == "Employer")
        return (
            <View>
                {
                    performerQualities.length > 0 && 
                    <PersonalQualitiesView 
                            isHebrew={this.props.rtl}
                            title={strings["qualities_title_in_profile_performer"]}
                            qualityList={performerQualities}
                            style={style.itemContainer}/>
                }
                {
                    employerQualities.length > 0 && 
                    <PersonalQualitiesView 
                            isHebrew={this.props.rtl}
                            title={strings["qualities_title_in_profile_employer"]}
                            qualityList={employerQualities}
                            style={style.itemContainer}/>
                }
            </View>
        )
    }

    renderReviews(){
        let { reviews } = this.state
        if(!reviews || reviews.length < 1){
            return null;
        }

        return (
            <View style={{marginHorizontal: CONTENT_MARGIN_X, marginTop: CONTENT_MARGIN_Y}}>
                <View style={{flexDirection: this.props.rtl? 'row-reverse': 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                    <Text style={style.sectionTitle}>{strings["profile_latest_reviews"]}</Text>
                    <SimpleButton title={strings["profile_all_reviews"]} onPress={this.openAllReviews}/>
                </View>
                <View>
                    {
                        this.state.reviews.map(review => (
                            <View style={{marginTop: 16}} key={review.id.toString()}>
                                <ReviewItem isHebrew={this.props.rtl} review={review}/>
                            </View>
                        ))
                    }
                    
                </View>
            </View>
        )
    }

    openAllReviews = () => {
        this.props.navigation.navigate("UserReviews", {user: this.state.user})
    }

    renderRating(){
        return(
            <View style={{alignItems: 'center', marginTop: 14}}>
                <Rating style={{flexDirection: 'row'}} value={this.state.user.rating}/>
            </View>
        )
    }

    renderAvailabilitySection(){
        if(!this.state.user) return null
        if(this.state.user.id !== this.props.currentUser.id && 
            this.state.user.availability === null){
            // Do not show sction for other users if it is empty
            return null
        }

        let {availability} = this.state.user
        let title = (
            <View style={{flexDirection: this.props.rtl? 'row-reverse': 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                <Text style={style.sectionTitle}>{strings["profile_availability"]}</Text>
                {this.state.user.id !== this.props.currentUser.id? null: <SimpleButton title={strings['change']} onPress={this.editAvailability}/>}
            </View>
        )

        if(!availability){
            return(
                <View style={{marginHorizontal: CONTENT_MARGIN_X, marginTop: CONTENT_MARGIN_Y}}>
                {title}
                <View style={{flex: 1, alignItems: 'center', padding: 12}}>
                    <Text style={[style.mutedText, {textAlign: 'center'}]}>{strings["profile_availability_empty"]}</Text>
                </View>
            </View>)
        }

        return(
            <View style={{marginHorizontal: CONTENT_MARGIN_X, marginTop: CONTENT_MARGIN_Y}}>
                {title}
                <View style={{flexDirection: this.props.rtl? "row-reverse":"row", justifyContent: 'space-between'}}>
                    <DayView key="sunday" params={availability["sunday"]} title={strings["profile_weekday_sunday"]}/>
                    <DayView key="monday" params={availability["monday"]} title={strings["profile_weekday_monday"]}/>
                    <DayView key="tuesday" params={availability["tuesday"]} title={strings["profile_weekday_tuesday"]}/>
                    <DayView key="wednesday" params={availability["wednesday"]} title={strings["profile_weekday_wednesday"]}/>
                    <DayView key="thursday" params={availability["thursday"]} title={strings["profile_weekday_thursday"]}/>
                    <DayView key="friday" params={availability["friday"]} title={strings["profile_weekday_friday"]}/>
                    <DayView key="saturday" params={availability["saturday"]} title={strings["profile_weekday_saturday"]}/>
                </View>
            </View>
        )
    }

    renderAboutSection(){
        if(!this.state.user) return null

        if(this.state.user.id !== this.props.currentUser.id && 
            this.state.user.about === null){
            
            // Do not show sction for other users if it is empty
            return null
        }
        
        let title = (
            <View style={{flexDirection: this.props.rtl? 'row-reverse': 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                <Text style={style.sectionTitle}>{strings["tell_us_about_yourself"]}</Text>
                {this.state.user.id !== this.props.currentUser.id? null: <SimpleButton title={strings['change']} onPress={this.editAbout}/>}
            </View>
        )

        if(this.state.user.about === null){
            return(
                <View style={{marginHorizontal: CONTENT_MARGIN_X, marginTop: CONTENT_MARGIN_Y}}>
                    {title}
                    <View style={{flex: 1, alignItems: 'center', padding: 12}}>
                        <Text style={style.mutedText}>{strings["profile_about_empty"]}</Text>
                    </View>
                </View>
            )
        }

        return(
            <View style={{marginHorizontal: CONTENT_MARGIN_X, marginTop: CONTENT_MARGIN_Y}}>
                {title}
                <Text style={style.bodyText}>{this.state.user.about}</Text>
            </View>
        )
    }

    renderMinPriceSection(){
        if(!this.state.user) return null

        if(this.state.user.id !== this.props.currentUser.id && 
            this.state.user.min_rate_hour === 0 && 
            this.state.user.min_rate_day === 0){
            
            // Do not show sction for other users if it is empty
            return null
        }

        let title = (
            <View style={{flexDirection: this.props.rtl? 'row-reverse': 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                <Text style={style.sectionTitle}>{strings["profile_min_rates"]}</Text>
                {
                    this.state.user.id !== this.props.currentUser.id? null: 
                    <SimpleButton title={strings['change']} onPress={this.editUser}/>
                }
            </View>
        )

        return(
            <View style={{marginHorizontal: CONTENT_MARGIN_X, marginTop: CONTENT_MARGIN_Y}}>
                {title}
                <View style={{flexDirection: this.props.rtl? 'row-reverse': 'row'}}>
                    <Text style={style.price}>{strings.formatString(strings['profile_min_rate_hour'], this.state.user.min_rate_hour)}</Text>
                    <View style={{width: 40}}/>
                    <Text style={style.price}>{strings.formatString(strings['profile_min_rate_day'], this.state.user.min_rate_day)}</Text>
                </View>
            </View>
        )
    }

    renderContactsSection(){
        console.log("rendering contacts")
        if(this.state.user.id === this.props.currentUser.id){
            // Do not show section for current user
            return null
        }
        let userInFavorite = this.props.favoriteUsers.some(user => user.id === this.state.user.id);
        let favoriteText = userInFavorite? strings["profile_remove_from_favorite"]: strings["profile_add_to_favorite"];
        let favoriteColor = userInFavorite? "#EB5757" : null;

        return(
            <View style={{marginTop: CONTENT_MARGIN_Y}}>
                <View style={{marginHorizontal: CONTENT_MARGIN_X, flexDirection: this.props.rtl? 'row-reverse': 'row'}}>
                    <Text style={style.sectionTitle}>{strings["profile_contacts"]}</Text>
                </View>
                <View style={{marginStart: this.props.rtl? 0 :CONTENT_MARGIN_X, marginEnd: this.props.rtl? CONTENT_MARGIN_X: 0}}>
                    <ActionItemWithLogo title={strings["profile_write_message"]} logo="dialogs" rtl={this.props.rtl} onPress={this.writeMessage.bind(this)}/>
                    {
                        this.state.user.privacy_show_phone_number &&
                        <ActionItemWithLogo title={strings["profile_call"]} logo="call" rtl={this.props.rtl} onPress={this.callUser.bind(this)}/>
                    }
                    {
                        this.state.user.privacy_show_phone_number &&
                        <ActionItemWithLogo title={strings["open_whatsapp"]} logo="whatsapp" rtl={this.props.rtl} onPress={this.openWhatsapp.bind(this)}/>
                    }
                    <ActionItemWithLogo title={favoriteText} color={favoriteColor} logo="heart" rtl={this.props.rtl} onPress={this.handleFavorite.bind(this)}/>
                    <ActionItemWithLogo title={strings["profile_offer_task"]} logo="performers" rtl={this.props.rtl} onPress={this.offerTask.bind(this)}/>
                </View>
            </View>
        )
    }

    renderPrivacySection(){
        if(this.state.user.id !== this.props.currentUser.id){
            // Do not show section for other users
            return null
        }
        const isIOS = Platform.OS === 'ios';
        return(
            <View style={{marginTop: CONTENT_MARGIN_Y}}>
                <View style={{marginHorizontal: CONTENT_MARGIN_X, flexDirection: this.props.rtl? 'row-reverse': 'row'}}>
                    <Text style={style.sectionTitle}>{strings["profile_privacy"]}</Text>
                </View>
                <View style={{marginStart: this.props.rtl? 0 :CONTENT_MARGIN_X, marginEnd: this.props.rtl? CONTENT_MARGIN_X: 0}}>
                    <View style={[style.actionContainer, {
                        flexDirection: this.props.rtl? "row-reverse": "row", 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingEnd: CONTENT_MARGIN_X
                        }]}>
                        <Text style={style.bodyText}>{strings["profile_show_profile_in_search"]}</Text>
                        <Switch 
                            value={this.state.user.privacy_show_profile_in_search}
                            trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                            thumbColor={isIOS?'': '#e6e6e6'}
                            onValueChange={this.changePrivacySearchSettings}/>
                    </View>

                    <View style={[style.actionContainer, {
                        flexDirection: this.props.rtl? "row-reverse": "row", 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingEnd: CONTENT_MARGIN_X
                        }]}>
                        <Text style={style.bodyText}>{strings["profile_show_phone_number"]}</Text>
                        <Switch 
                            value={this.state.user.privacy_show_phone_number}
                            trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                            thumbColor={isIOS?'': '#e6e6e6'}
                            onValueChange={this.changePrivacyPhoneSettings}/>
                    </View>
                </View>
            </View>
        )
    }

    renderExitButton(){
        if(this.state.user.id !== this.props.currentUser.id){
            // Do not show section for other users
            return null
        }

        return (
            <View style={{flex: 1, marginTop: 46, marginBottom: 32, alignItems: "center"}}>
                <TouchableOpacity onPress={this.onExitPressed}>
                    <Text style={{color: 'rgba(255, 59, 48, 1.0)'}}>{strings["exit"]}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    onExitPressed = () => {
        Alert.alert(
            strings["profile_exit_alert_title"],
            strings["profile_exit_alert_message"],
            [
                {text: strings["profile_exit_alert_cancel"]},
                {text: strings["profile_exit_alert_ok"], onPress: this.logout, style: 'cancel',},
              ],
        )
    }

    changePrivacySearchSettings = async (newValue) => {
        this.setState({
            user: {
                ...this.state.user,
                privacy_show_profile_in_search: newValue
            }
        })

        await this.updateUserEndpoint({
            "privacy_show_profile_in_search": newValue,
        });
    }

    changePrivacyPhoneSettings = async (newValue) => {
        this.setState({
            user: {
                ...this.state.user,
                privacy_show_phone_number: newValue
            }
        })

        await this.updateUserEndpoint({
            "privacy_show_phone_number": newValue,
        });
    }

    renderSpecializationLabel(){
        let text = "";
        if(this.state.user.category === null || this.state.user.account_type === 'creator'){
            // render account type label
            text = strings[this.state.user.account_type]
        }else{
            text = strings.getCategory(this.state.user.category.name);
        }
        return(
            <TouchableOpacity onPress={this.onAccountTypePressed}>
                <View style={{
                backgroundColor: "#3B5998",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: 'white'
                }}>
                    <Text style={{color: "white", fontSize: 12, marginHorizontal: 18, marginVertical: 4}}>{text}</Text>
                </View>
            </TouchableOpacity>
            
        )
    }

    
    onAccountTypePressed = () => {
        if(this.state.user.id === this.props.currentUser.id){
            this.setState({showAccountTypeDialog: true, accountTypeOption: this.state.user.account_type})
        }
    }

    renderSubcategories(){
        if (this.state.user.subcategory_list.length > 0){
            let itemList = "";
            this.state.user.subcategory_list.forEach(item => itemList += strings.getCategory(item.name) + ", ");
            itemList = itemList.substr(0, itemList.length - 2)
            return(
                <View style={{marginHorizontal: CONTENT_MARGIN_X, alignItems: "center"}}>
                    <Text style={[style.bodyText, {textAlign: "center"}]}>{itemList}</Text>
                </View>
            )
        }
    }

    renderWorkExperience(){
        if(this.state.user.experience !== null){
            return(
                <View style={{marginHorizontal: CONTENT_MARGIN_X, alignItems: "center", marginTop: 6}}>
                    <Text style={[style.bodyText, {textAlign: "center"}]}>{this.getWorkExperienceString(this.state.user.experience)}</Text>
                </View>
            )
        }
    }

    getWorkExperienceString(exp){
        switch(exp){
            case "0":
                return strings["profile_exp_no"];
            case "0-1":
                return `${strings["profile_exp"]} ${strings["profile_exp_0"]}`;
            case "1-2":
            case "2-3":
            case "3-4":
                return `${strings["profile_exp"]} ${exp} ${strings["profile_exp_1-4"]}`;
            case "4-5":
            case "5-6":
            case "6-7":
            case "7-8":
            case "8-9":
            case "9-10":
            case "10-11":
            case "11-12":
            case "12-13":
            case "13-14":
            case "14-15":
                return `${strings["profile_exp"]} ${exp} ${strings["profile_exp_5-15"]}`;
            case "15+":
                return `${strings["profile_exp"]} ${strings["profile_ext_15+"]}`;
            default:
                return "";

        }
    }

    renderRegion(){
        if (this.state.user.region !== null){
            let regionText = "";
            if(this.state.user.region === "any"){
                regionText = strings["profile_any_region"]
            }else{
                regionText = strings.getRegion(this.state.user.region);
            }
            return(
                <View style={{marginHorizontal: CONTENT_MARGIN_X, alignItems: "center", marginTop: 6}}>
                    <Text style={[style.bodyText, {textAlign: "center"}]}>{regionText}</Text>
                </View>
            )
        }
    }

    async loadUser() {
        const userFromParams = this.props.route?.params?.user || null;
        if(userFromParams !== null){
            this.setState({user: userFromParams})
            return;
        }

        let userID = this.props.route?.params?.user_id || -1;
        if(userID === -1 || userID === this.props.currentUser.id){
            this.setState({user: this.props.currentUser});
        }

        try{
            const user = await API.getUser(userID);
            this.setState({user});
        }catch(error){
            console.error(error);
        }
    }

    editUser = () => {
        this.props.navigation.navigate("EditProfile", {reloadUser: this.reloadUser.bind(this)})
    }

    editAbout = () => {
        this.props.navigation.navigate("EditAbout", {
            reloadUser: this.reloadUser.bind(this),
            about: this.state.user.about
        })
    }

    editAvailability = () => {
        this.props.navigation.navigate("ScheduleEdit", {
            reloadUser: this.reloadUser.bind(this),
            schedule: this.state.user.availability
        })
    }

    async reloadUser(){
        await this.loadUser();
    }

    logout = async () => {
        //await API.updateToken(null, await Storage.getLanguage());
        Storage.setApiKey(null);
        API.setToken(null);
        this.props.updateProfile(null);      
        this.props.navigation.navigate("Auth");
    }

    // async blockUser() {
    //     const result = await this.blockUserEndpoint({
    //         userId: this.state.user["id"]
    //     });

    //     MyToast.show(strings["user_blocked"]);
    //     await this.loadUser();
    // }

    // async unblockUser() {
    //     const result = await this.unblockUserEndpoint({
    //         userId: this.state.user["id"]
    //     });

    //     MyToast.show(strings["unblock_success"]);
    //     await this.loadUser();
    // }


    writeMessage = async () => {
        this.logEEConnection("chat");
        const result = await this.createDialogEndpoint({
            userId: this.state.user["id"]
        }, {
            before: false,
            after: false
        });

        if (result["dialog_id"]) {
            this.props.navigation.navigate("Dialog", {dialogId: result["dialog_id"]})
        } else if (result[0] && result[0]["id"]) {
            const dialog = result[0];
            this.props.navigation.navigate("Dialog", {dialogId: dialog["id"]})
        }
    }

    callUser = () => {
        this.logEEConnection("phone");
        Linking.openURL('tel:+' + this.state.user.phone) ;
    }

    openWhatsapp = () => {
        this.logEEConnection("whatsapp");
        Linking.openURL('whatsapp://send?phone=' + this.state.user.phone);
    }

    handleFavorite = () => {
        let userInFavorite = this.props.favoriteUsers.some(user => user.id === this.state.user.id);
        if(userInFavorite){
            this.props.removeUserFromFavoriteList(this.state.user.id);
        }else{
            this.props.addUserToFavoriteList(this.state.user)
        }
    }

    offerTask = () => {
        this.props.navigation.navigate("OfferTask", {"user": this.state.user});
    }

    logEEConnection = async (channel) => {
        console.log("Log EE")
        let taskID = this.props.route?.params?.fromTask || null;
        console.log("taskID: " + taskID);
        if(!taskID) return;
        console.log("going to log")
        const profile = this.props.currentUser;
        const currentUser = this.state.user
        if(profile.id === currentUser.id) return; 

        const result = await this.logEeConnectionEndpoint({
            "initiator": profile.id,
            "task": taskID,
            "target_user": currentUser.id,
            "channel_type": channel
        })
        console.log(result)
    }
}

function DayView(props){
    let view = null;
    if(props.params.unavailable){
        view = <Image style={{height: 18, width: 18}} source={icon("unavailable")}/>
    }else if(props.params.full_day){
        view = <Image style={{height: 18, width: 18}} source={icon("available")}/>
    }else if(props.params.start){
        view = (
        <View style={{alignItems: 'center'}}>
            <Text style={{color: 'rgba(66, 67, 106, 0.86)'}}>{props.params.start.substr(0, 5)}</Text>
            <Text style={{color: 'rgba(66, 67, 106, 0.86)'}}>{props.params.end? props.params.end.substr(0, 5): ""}</Text>
        </View>)
    }else{
        view = <Image style={{height: 18, width: 18}} source={icon("unavailable")}/>
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

function ActionItem(props){
    return(
        <TouchableOpacity onPress={props.onPress}>
            <View style={[style.actionContainer, {flexDirection: props.rtl? "row-reverse": "row"}]}>
                <Text style={{color: props.color? props.color: style.actionTitle.color}}>{props.title}</Text>
            </View>
        </TouchableOpacity>
        
    )
}

function ActionItemWithLogo(props){
    return(
        <TouchableOpacity onPress={props.onPress}>
            <View style={[style.actionContainer, {flexDirection: props.rtl? "row-reverse": "row"}]}>
                <Text style={{color: props.color? props.color: style.actionTitle.color}}>{props.title}</Text>
                <Image source={icon(props.logo)} style={{height: 28, width: 28, marginHorizontal: 24}}/>
            </View>
        </TouchableOpacity>
        
    )
}

const mapStateToProps = state => ({
    favoriteUsers: state.favoriteUserReducer.users,
    currentUser: state.profileReducer,
    rtl: state.configReducer.rtl,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getFavoriteUsers,
    addUserToFavoriteList, 
    removeUserFromFavoriteList,
    loadProfile,
    updateProfile,
}
export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);