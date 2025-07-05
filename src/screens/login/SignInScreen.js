/**
 *  SignInScreen.js
 *  Screen for authenticate user. If user account does not exist it sends user to SignUpScreen
 * 
 *  Created by Dmitry Chulkov
 */
import React from "react";
import {
    Image,
    Text,
    View,
    SafeAreaView,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    DeviceEventEmitter,
    TouchableWithoutFeedback,
    Animated, 
    Keyboard,
    Platform,
    Alert
} from "react-native";
import { Notifications as ExpoNotifications } from 'expo';
import * as Notifications from 'expo-notifications';
import strings from "../../utils/Strings";
import API from "../../api";
import Storage from "../../utils/Storage";
import Color from "../../constant/Color";

import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';
import icon from "../../constant/Icons";

const IMAGE_HEIGHT = 180;
const IMAGE_HEIGHT_SMALL = 140;
const APP_NAME_FONT = 56;
const APP_NAME_FONT_SMALL = 36;

const CODE_REFRESH_TIME = 55; // In seconds

const STAGE = {
    PHONE: 0,
    CODE: 1,
    LOADING: 2
}

const ACCOUNT_TYPE = {
    EMPLOYER: 'creator',
    PERFORMER: 'performer'
}

const unit = val => val * 0.75;

const styles = StyleSheet.create({
    continueButton: {
        color: Color.accent,
        fontSize: 17,
        borderColor: Color.accent,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 32,
        paddingVertical: 10
    }
})

class SignInScreen extends React.Component {

    state = {
        stage: STAGE.PHONE,
        validationMessage: null,
        timeToResend: CODE_REFRESH_TIME,
        code: '',
        isNewUser: false,
        accountType: this.props.route?.params?.accountType || 'performer'
    };

    keyboardHeight = new Animated.Value(0);
    imageHeight = new Animated.Value(IMAGE_HEIGHT);
    appNameFont = new Animated.Value(APP_NAME_FONT);

    
    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
        clearInterval(this.timerForResend);
    }

    keyboardWillShow = (event) => {
        Animated.parallel([
          Animated.timing(this.keyboardHeight, {
            duration: event.duration,
            toValue: event.endCoordinates.height,
            useNativeDriver: false
          }),
          Animated.timing(this.imageHeight, {
            duration: event.duration,
            toValue: IMAGE_HEIGHT_SMALL,
            useNativeDriver: false
          }),
          Animated.timing(this.appNameFont, {
            duration: event.duration,
            toValue: APP_NAME_FONT_SMALL,
            useNativeDriver: false
          }),
        ]).start();
    };
    
    keyboardWillHide = (event) => {
        let duration = 100;
        if(event && event.duration){
            duration = event.duration
        }
        Animated.parallel([
          Animated.timing(this.keyboardHeight, {
            duration: duration,
            toValue: 0,
            useNativeDriver: false
          }),
          Animated.timing(this.imageHeight, {
            duration: duration,
            toValue: IMAGE_HEIGHT,
            useNativeDriver: false
          }),
          Animated.timing(this.appNameFont, {
            duration: duration,
            toValue: APP_NAME_FONT,
            useNativeDriver: false
          }),
        ]).start();
    };

    componentDidMount = async () => {
        let token = null;
        if(Platform.OS === 'ios'){
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        }else{
            this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
        }

        const allowNotifications = await this.getPermissions();
        // if (allowNotifications) {
        //     token = await Notifications.getExpoPushTokenAsync();
        // }

        this.setState({ token })

        DeviceEventEmitter.addListener("onReturn", (event) => {
            this.setState({stage: STAGE.PHONE})
        })
    };


    // facebookLogin = async () => {
    //     try {
    //         await Facebook.initializeAsync('650026009183144');
    //         const {
    //             type,
    //             token,
    //             expires,
    //             permissions,
    //             declinedPermissions,
    //         } = await Facebook.logInWithReadPermissionsAsync({
    //             permissions: ['public_profile', 'email', ],
    //         });
    //         if (type === 'success') {
    //             this.setState({stage: STAGE.LOADING});
    //             // Get the user's name using Facebook's Graph API (via our backend)
    //             const result = await API.loginUserWithFacebook(token);
    //             console.log(result);
    //             const apiKey = result["auth_token"];
    //             const isNewUser = result["is_new_user"];
    //             if (apiKey) {
    //                 Storage.setApiKey(apiKey);
    //                 API.setToken(apiKey);
        
    //                 const profile = await API.getMyProfile();
    //                 this.props.updateProfile(profile);
    //                 //await API.updateToken(this.state.token, await Storage.getLanguage());
        
    //                 if(isNewUser){
    //                     this.props.navigation.navigate("Terms", {facebook_token: token})
    //                 }else{
    //                     this.props.navigation.navigate("App");
    //                 }
    //             }
    //             else {
    //                 this.setState({
    //                     validationMessage: strings["error02"],
    //                     stage: STAGE.PHONE
    //                 });
    //             }
    //         } else {
    //             // type === 'cancel'
    //             // Do nothing
    //         }
    //     } catch ({ message }) {
    //         console.log(message);
    //         this.setState({
    //             stage: STAGE.PHONE
    //         });
    //     }
    // }


    getPermissions = async() => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    };

    updateTimeToResend = () => {
        if(this.state.timeToResend > 0){
            this.setState({timeToResend: this.state.timeToResend - 1});
        }else{
            clearInterval(this.timerForResend);
            this.timerForResend = null;
        }
    }

    formatTimerString(time){
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        if(seconds < 10){
            seconds = "0" +seconds;
        }
        return minutes + ":" + seconds;
    }

    render() {
        if(this.state.stage === STAGE.CODE && this.state.timeToResend > 0 && !this.timerForResend){
            this.timerForResend = setInterval(this.updateTimeToResend, 1000)
        }
        return (
            <SafeAreaView style={{flex: 1}}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <Animated.View style={{display: 'flex', flex: 1, paddingBottom: this.keyboardHeight}}>
                    <View style={{justifyContent: "flex-end", alignItems: "center", marginTop: 56}}>
                        <Animated.Image source={require("../../assets/images/splash.jpg")} style={{width: this.imageHeight, height: this.imageHeight, resizeMode: 'contain'}}/>
                    </View>
                    

                    <View style={{paddingLeft: 20, paddingRight: 20, marginBottom: 20, paddingTop: 16}}>

                        {this.state.stage === STAGE.PHONE && this.renderPhoneInputSection()}
                        {this.state.stage === STAGE.CODE && this.renderCodeInputSection()}
                        {this.state.stage === STAGE.LOADING && <ActivityIndicator size="large" color="#42436a"/>}

                    </View>

                    {
                        // this.state.stage === STAGE.PHONE && 
                        // this.state.accountType === ACCOUNT_TYPE.PERFORMER &&
                        // <FacebookButton onPress={this.facebookLogin}/>
                    }

                    {this.state.stage === STAGE.CODE && 
                    <View style={{alignItems: 'center', marginBottom: 25, marginTop: 30}}>
                        {this.state.timeToResend === 0?
                            <TouchableOpacity style={{marginBottom: 25}} onPress={this.resendCode}>
                                <Text style={{color: "rgba(66, 67, 106, 0.65)"}}>{strings["resend_code"]}</Text>
                            </TouchableOpacity>
                        :
                            <View style={{marginBottom: 25, alignItems: 'center'}}>
                                <Text style={{color: "rgba(66, 67, 106, 0.65)"}}>{strings["resend_code_after"]}</Text>
                                <Text style={{color: "rgba(66, 67, 106, 0.65)"}}>{this.formatTimerString(this.state.timeToResend)}</Text>
                            </View>
                        }
                        
                        <TouchableOpacity style={{}} onPress={() => this.setState({stage: STAGE.PHONE})}>
                            <Text style={{color: "rgba(66, 67, 106, 0.56)"}}>{strings["signin_back"]}</Text>
                        </TouchableOpacity>
                    </View>}
                </Animated.View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        );
    }

    renderCodeInputSection(){
        return(
            <View style={{ alignItems: "center", justifyContent: 'space-evenly', flexDirection: 'column'}}>
                <Text style={{marginBottom: 20, color: "rgba(66, 67, 106, 0.76)", textAlign: 'center', marginHorizontal: 20}}>{ strings["sms02"].replace('{0}', `${this.state.phoneNumber}`) }</Text>
                <TextInput
                    style={{fontSize: 28, color: '#42436A', textAlign: 'center', padding: unit(14), flexGrow: 1}}
                    keyboardType="numeric"
                    placeholder="SMS code"
                    onChangeText={this._handleCodeInput}
                    value={this.state.code}
                    
                />

                {/* <TouchableOpacity style={{marginTop: 20}} onPress={() => this.submitCode()}>
                    <Text style={styles.continueButton}>{strings["signin_continue"]}</Text>
                </TouchableOpacity> */}
            </View>
        )
    }

    _handleCodeInput = (code) => {
        this.setState({ code }, () => {
            if(code.length == 4){
                this.submitCode();
            }
        })
    }

    renderPhoneInputSection(){
        return(
            <View style={{ alignItems: "center", }}>
                <Text style={{marginBottom: 20, color: "rgba(66, 67, 106, 0.76)",}}>{strings["signin_enter_phone"]}</Text>
                <TextInput
                    style={{fontSize: 20, color: '#42436A', padding: unit(14), flexGrow: 1}}
                    keyboardType="phone-pad"
                    placeholder={strings["sign_in_phone_input_placeholder"]}
                    onChangeText={phoneNumber => this.setState({ phoneNumber })}
                    value={this.state.phoneNumber}
                />
                {
                    this.state.validationMessage &&
                    <Text style={{
                        fontSize: 12,
                        color: "#FFAAAA",
                        marginTop: unit(-16),
                        marginBottom: unit(16)
                    }}>
                        {this.state.validationMessage}
                    </Text>
                }

                <TouchableOpacity style={{marginTop: 20}} onPress={() => this.subminPhone()}>
                    <Text style={styles.continueButton}>{strings["signin_continue"]}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    async subminPhone(){
        try {
            let phoneNumber = this.state.phoneNumber;
            const badPhone = !phoneNumber || phoneNumber.length < 5;

            if (badPhone) {
                this.setState({
                    validationMessage: strings["valid_number01"],
                });
                return;
            } else {
                this.setState({
                    validationMessage: null,
                });
            }
            this.setState({stage: STAGE.LOADING})

            const result = await API.sendSMSCode(this.formatPhone(phoneNumber));
            if (result["code"] === "udne") {
                // User not registered. Sign up him
                await this.setState({isNewUser: true})
                this.signUp();
                
            }else {
                this.setState({stage: STAGE.CODE})
            }
        } catch (error) {
            console.log(error)
        }

    }

    async signUp(){
        const fullPhone = this.formatPhone(this.state.phoneNumber);
        const result = await API.createUser(fullPhone, this.state.accountType);
        const { code } = result;
        const errorCodes = {
            tnae: 'valid_number04',
            ipn: 'valid_number03',
        };

        if (errorCodes[code]) {
            this.setState({ validationMessage: strings[errorCodes[code]], stage: STAGE.PHONE });
        } else {
            this.setState({ stage: STAGE.CODE });
        }
    }

    async submitCode() {
        const { code, phoneNumber, token } = this.state;
        if (!code) {
            this.setState({
                validationMessage: strings["val_code"]
            });
            return;
        }

        this.setState({stage: STAGE.LOADING});
        const result = await API.loginUser(this.formatPhone(phoneNumber), code);
        const apiKey = result["auth_token"];
        if (apiKey) {
            Storage.setApiKey(apiKey);
            API.setToken(apiKey);

            const profile = await API.getMyProfile();
            this.props.updateProfile(profile);
            //await API.updateToken(this.state.token, await Storage.getLanguage());

            // if(this.state.isNewUser){
            //     this.props.navigation.navigate("Terms", {code})
            // }else{
            //     this.props.navigation.navigate("App");
            // }
            this.props.navigation.navigate("App");
        }
        else {
            this.setState({
                validationMessage: strings["error_code"],
                stage: STAGE.CODE
            });
        }
    }

    resendCode = async () => {
        this.setState({timeToResend: CODE_REFRESH_TIME})
        const result = await API.sendSMSCode(this.formatPhone(this.state.phoneNumber));
        if (result["code"] === "udne") {
            this.setState({
                validationMessage: strings["valid_number02s"]
            });
        }
        else {
            this.setState({
                validationMessage: null
            });
        }
    }

    formatPhone(phoneNumber){
        if(phoneNumber.startsWith("+")){
            phoneNumber = phoneNumber.substring(1);
        }

        if(phoneNumber.startsWith("0")){
            phoneNumber = "972" + phoneNumber.substring(1);
        }

        return phoneNumber;
    }
}

function FacebookButton(props){
    return(
        <View style={{alignItems: 'center', marginTop: 50}}>
            <TouchableOpacity onPress={props.onPress}>
                <View style={{
                    flexDirection: 'row',
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 3,
                    backgroundColor: '#1877f2',
                    alignItems: 'center'
                }}>
                    <Image source={icon("facebook")} style={{height: 16, width: 16, marginRight: 6}}/>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13}}>{strings["login_with_facebook"]}</Text>
                </View>
            </TouchableOpacity>
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

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);