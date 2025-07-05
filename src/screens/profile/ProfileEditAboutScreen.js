/**
 *  ProfileEditAboutScreen.js
 *  Screen for editing 'about' item of user information
 * 
 *  Created by Dmitry Chulkov 07/10/19
 */
import React from 'react';
import {
    View,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView
} from 'react-native';
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import MyToast from "../../components/MyToast";
import strings from "../../utils/Strings";
import { HeaderTextButton} from '../../components/Buttons';
import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';


class ProfileEditAboutScreen extends React.Component {

    api = new BackendAPI(this);
    updateUserEndpoint = this.api.getUpdateUserEndpoint();

    state = {
        isLoading: false,
        isHebrew: false,
        text: this.props.route.params?.about || ""
    };

    render(){
        if(this.state.isLoading){
            return(
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        }

        return(
            <KeyboardAvoidingView behavior="height" style={{flex: 1}} keyboardVerticalOffset="50">
            <View style={{flex: 1}}>
                <View style={{flex: 1, paddingTop: 20, paddingBottom: 20}}>
                <TextInput 
                        style={{flex: 1, width: "100%", paddingHorizontal: 24, paddingBottom: 50}}
                        placeholder={strings["profile_about_empty"]}
                        onChangeText={this.onChangeText}
                        value={this.state.text}
                        editable 
                        multiline />
                </View>
            </View>
            </KeyboardAvoidingView>
        )
    }

    onChangeText = text => {
        this.setState({text})
    }


    componentDidMount(){
        this.setLang();
        this.props.navigation.setParams({"donePress": this.onSavePress})
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    onSavePress = async() => {
        if(this.state.isLoading) {
            // Do not allow users to press on save button while updating user info
            return;
        }
        this.setState({isLoading: true})

        const result = await this.updateUserEndpoint({
            "about": this.state.text,
        });

        let { currentUser } = this.props;
        currentUser.about = this.state.text;
        this.props.updateProfile(currentUser);

        let reloadUser = this.props.route.params?.reloadUser || null;
        if(reloadUser !== null){
            await reloadUser();
        }
        this.props.navigation.goBack();
    }
}

const mapStateToProps = state => ({
    currentUser: state.profileReducer,
    rtl: state.configReducer.rtl,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
}
export default connect(mapStateToProps, mapDispatchToProps)(ProfileEditAboutScreen);