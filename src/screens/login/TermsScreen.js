import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    SafeAreaView,
    StyleSheet
} from 'react-native';
import { WebView } from 'react-native-webview';
import strings from "../../utils/Strings";
import { HeaderTextButton } from "../../components/Buttons";
import Color from '../../constant/Color';
import BackendAPI from '../../../backend/BackendAPI';
import { CommonActions } from '@react-navigation/native';
import API from '../../api';
import Storage from '../../utils/Storage';
import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 16,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'center'
    }
})

class TermsScreen extends React.Component {
    render(){
        return(
            <SafeAreaView style={{ flex: 1 }}>
                <WebView source={{uri: "https://sites.google.com/view/jobeapp/pp-and-tos"}}/>
                <View style={{
                    height: 56,
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>

                    <View style={{flex: 1, alignItems: 'flex-start'}}>
                        <TouchableOpacity onPress={this.onDeclinePressed}>
                            <View style={styles.button}>
                            <Text style={[styles.buttonText, {color: Color.danger}]}>{strings["terms_decline"]}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress={this.onAcceptPressed}>
                            <View style={styles.button}>
                                <Text style={[styles.buttonText, {color: Color.accent}]}>{strings["terms_accept"]}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    onAcceptPressed = async () => {
        const { facebook_token, code } = this.props.route.params;
        if (facebook_token) {
            const result = await API.acceptTermsWithFacebook(facebook_token);
            const apiKey = result["auth_token"];
            if (apiKey) {
                Storage.setApiKey(apiKey);
                API.setToken(apiKey);
                const profile = await API.getMyProfile();
                this.props.updateProfile(profile);
                this.props.navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'PerformerQuest' }]
                    })
                );
            }
        } else {
            const result = await API.acceptTerms(code);
            const apiKey = result["auth_token"];
            if (apiKey) {
                Storage.setApiKey(apiKey);
                API.setToken(apiKey);
                const profile = await API.getMyProfile();
                this.props.updateProfile(profile);
                this.props.navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'PerformerQuest' }]
                    })
                );
            }
        }
    };

    onDeclinePressed = async () => {
        // Delete account
        // Logout
        const code = this.props.route?.params?.code || '';
        const fbToken = this.props.route?.params?.facebook_token || '';
        if(code !== ''){
            BackendAPI.deleteUser(code);
        }else{
            API.deleteUserWithFacebookToken(fbToken);
        }
        API.setToken(null);
        Storage.setApiKey(null);
        this.props.updateProfile(null);

        // this.props.navigation.navigate("SignIn");
        this.props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'SignIn' }]
            })
        );
    }
}

const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
}

export default connect(mapStateToProps, mapDispatchToProps)(TermsScreen);