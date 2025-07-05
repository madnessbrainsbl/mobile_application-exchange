/**
 *  LanguageSelectorDialog.js
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
} from "react-native";
import strings from "../utils/Strings";

export default class LanguageSelectorDialog extends React.Component{

    state = {
        isShowing: false
    }

    languagePickCallback = null;

    render(){
        if(!this.state.isShowing){
            return null;
        }

        return(
            <View style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <View style={{
                    backgroundColor: 'rgb(239, 239, 239)',
                    borderRadius: 16,
                    minWidth: 270
                }}>
                    <View style={{
                        paddingVertical: 20,
                        alignItems: 'center',
                        borderBottomColor: 'rgba(0, 0, 0, 0.16)',
                        borderBottomWidth: 1}}>
                        <Text style={{
                            fontWeight: '600',
                            color: 'black',
                            fontSize: 16}}>
                                {strings["change_language"]}
                        </Text>
                    </View>
                    
                    {this.renderLangButton(strings["russian"], "ru")}
                    {this.renderLangButton(strings["english"], "en")}
                    {this.renderLangButton(strings["hebrew"], "he")}

                    <View style={{
                        borderBottomColor: 'rgba(0, 0, 0, 0.16)',
                        borderBottomWidth: 1
                    }}>
                        <TouchableOpacity onPress={this.onCancelPress}>
                            <View style={{paddingVertical: 14, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: 'rgb(10, 132, 255)'
                                    }}>
                                        {strings["cancel"]}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    renderLangButton = (label, lang) => {
        return(
            <View style={{
                borderBottomColor: 'rgba(0, 0, 0, 0.16)',
                borderBottomWidth: 1
            }}>
                <TouchableOpacity onPress={() => this.onLangPress(lang)}>
                    <View style={{paddingVertical: 14, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{
                            textAlign: 'center',
                            fontSize: 16,
                            color: 'rgb(10, 132, 255)'
                            }}>
                                {label}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    onLangPress = (lang) => {
        if(this.languagePickCallback){
            this.languagePickCallback(lang);
        }

        this.setState({isShowing: false})
    }

    onCancelPress = () => {
        this.setState({isShowing: false})
    }

    show = () => {
        this.setState({isShowing: true})
    }
}

export class LanguageDialogHandler {
    static languageDialogRef = null;

    static show(callback){
        if(LanguageDialogHandler.languageDialogRef){
            LanguageDialogHandler.languageDialogRef.languagePickCallback = callback;
            LanguageDialogHandler.languageDialogRef.show()
        }
    }
}