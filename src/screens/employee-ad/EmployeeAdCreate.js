/**
 *  EmployeeAdCreate.js
 *  
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
    KeyboardAvoidingView,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Linking,
    StyleSheet,
    Alert
} from 'react-native';
import API from '../../../backend/BackendAPI';
import settings from '../../../backend/Settings';
import Color from '../../constant/Color';
import { connect } from 'react-redux';
import { pushNewAd, updateAd } from '../../redux/employee-ad-handlers';
import strings from '../../utils/Strings';

class EmployeeAdCreate extends React.Component {

    static navigationOptions = ({navigation}) => {
        let ad = navigation.getParam("ad", null)
        return {
            title: ad === null? strings["employee_ad_new"]: strings["employee_ad_edit"],
            headerRight: (
                <TouchableOpacity
                        style={{
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 8,
                            paddingBottom: 8,
                        }}
                        onPress={navigation.getParam("publishHandler", null)}>
                    <Text style={{color: 'white', fontSize: 14}}>{ad === null? strings["employee_ad_publish"]: strings["employee_ad_save"]}</Text>
                </TouchableOpacity>
            )
          };
    }

    state = {
        text: this.props.route?.params?.text || "",
        ad: this.props.route?.params?.ad || null,
        loading: false,
    }

    componentDidMount(){
        this.props.navigation.setParams({publishHandler: this.onPublishPressed})
    }

    render(){
        return(
            <KeyboardAvoidingView behavior="padding" style={{flex: 1}} keyboardVerticalOffset={90}>
                <View style={{flex: 1}}>
                    <TextInput 
                        multiline 
                        placeholder={strings["employee_ad_enter_your_text"]}
                        value={this.state.text}
                        onChangeText={text => this.setState({text})}
                        style={{flex: 1, textAlignVertical: 'top', paddingTop: 16, marginHorizontal: 16}}/>

                    {
                        this.state.loading && 
                        <View style={{
                            position: 'absolute',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent:'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.24)',
                            top: 0, bottom: 0, left: 0, right: 0
                        }}><ActivityIndicator size="large" color={Color.primary}/></View>
                    }
                </View>
            </KeyboardAvoidingView>
        )
    }

    onPublishPressed = async () => {
        let {text, ad, loading} = this.state;
        if(text === '' || loading) return;

        this.setState({loading: true});
        if(ad === null){
            // Create new ad
            const result = await API.publishEmployeeAd(text);
            result.author = this.props.userProfile;
            this.props.pushNewAd(result);
            if(this.props.route?.params?.fromOptionScreen || false){
                this.props.navigation.pop(2);
            }else{
                this.props.navigation.goBack();
            }

           
        }else{
            // update ad
            const result = await API.updateEmployeeAd(ad.id, text);
            this.props.updateAd(ad.id, text);
            let updateCallback = this.props.route?.params?.updateCallback || null;
            if(updateCallback) updateCallback(text);

            this.props.navigation.goBack();
            
        }
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    pushNewAd,
    updateAd,
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeAdCreate);