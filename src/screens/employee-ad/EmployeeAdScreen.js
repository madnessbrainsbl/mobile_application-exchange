/**
 *  EmployeeAdScreen.js
 *  Screen for displaying full info about ad and comments
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
    ScrollView,
    TextInput,
    Linking,
    StyleSheet,
    Alert
} from 'react-native';
import moment from 'moment';
import { Header } from '@react-navigation/native';
import Avatar from '../../components/Avatar';
import CommentItem from './CommentItem';
import Color from '../../constant/Color';
import icon from '../../constant/Icons';
import settings from "../../../backend/Settings";
import API from '../../../backend/BackendAPI';

import { connect } from 'react-redux';
import { incrementCommentCounter, removeAd} from '../../redux/employee-ad-handlers';
import strings from '../../utils/Strings';


const styles = StyleSheet.create({
    username: {
        fontWeight:'bold',
        fontSize: 14,
        color: '#42436A'
    },
    date: {
        fontSize: 12,
        color: Color.secondaryText
    },
    text: {
        color: Color.primaryText,
        fontSize: 14
    },
    comments: {
        fontSize: 12,
        color: Color.secondaryText
    },
    inputContainer: {
        flexDirection: "row",
        borderTopColor: '#d9d9d9',
        borderTopWidth: 1,
        height: 54,
        padding: 16
    },
    input: {
        fontSize: 16,
        color: Color.primaryText,
        height: "100%",
    },
    topMenuButton: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
})

class EmployeeAdScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        let ad = navigation.getParam("ad", null);
        let notificationEnabled = navigation.getParam("notificationEnabled", true);
        return {
            headerRight: (
                <View style={{flexDirection: 'row'}}>
                    {
                        (ad !== null && ad.author.id === this.props.userProfile.id) && 
                        <TouchableOpacity
                            style={{
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 8,
                                paddingBottom: 8,
                            }}
                            onPress={navigation.getParam("deletePress", null)}>
                            <Image style={{height: 24, width: 24}} source={icon("trash")}/>
                        </TouchableOpacity>
                    }
                    {
                         (ad !== null && ad.author.id === this.props.userProfile.id) && 
                        <TouchableOpacity
                            style={{
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 8,
                                paddingBottom: 8,
                            }}
                            onPress={navigation.getParam("changeNotificationSetting", null)}>
                            <Image style={{height: 24, width: 24}} source={icon(notificationEnabled? "notification-fill":"notification-disabled")}/>
                        </TouchableOpacity>
                    }

                    {
                        (ad !== null && ad.author.id === this.props.userProfile.id) && 
                        <TouchableOpacity
                            style={{
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 8,
                                paddingBottom: 8,
                            }}
                            onPress={navigation.getParam("editPress", null)}>
                            <Image style={{height: 24, width: 24}} source={icon("edit")}/>
                        </TouchableOpacity>
                    }
                </View>
            )
          };
    }

    state = {
        isHebrew: false,
        commentMessage: '',
        data: [],
        noAd: false,
    }

    componentDidMount(){
        this.setLang();
        const ad = this.props.route?.params?.ad || null;
        if(ad !== null){
            this.loadComments(ad);
            this.loadNotificationSetting(ad);
        }else{
            const adID = this.props.route?.params?.ad_id || -1;
            if(adID != -1){
                this.loadAd(adID);
            }else{
                this.setState({noAd: true})
            }
        }
        

        this.updateText = this.updateText.bind(this);
        this.props.navigation.setParams({
            "deletePress": this.onDeletePressed,
            "editPress": this.onEditPressed,
            "changeNotificationSetting": this.onNotificationIconPressed
        })
    }

    onDeletePressed = () => {
        Alert.alert(
            strings["employee_ad_delete_title"],
            strings["employee_ad_delete_description"],
            [
                {text: strings["employee_ad_delete_ok"], onPress: this.deleteAd},
                {text: strings["employee_ad_delete_cancel"]},
            ]
        )
    }

    deleteAd = async () => {
        const adID = this.state.data[0].id;
        this.props.removeAd(adID)
        try{
            const result = await API.deleteEmployeeAd(adID);
            console.log(result);
        }catch(error){
            console.log(error)
        }
        this.props.navigation.goBack();
    }

    loadAd = async (adID) => {
        const ad = await API.getEmployeeAdDetails(adID);
        this.loadComments(ad);
        this.loadNotificationSetting(ad);
    }

    onEditPressed = () => {
        let ad = this.state.data[0];
        this.props.navigation.navigate("CreateEmployeeAd", {ad: ad, text: ad.text, updateCallback: this.updateText})
    }

    onNotificationIconPressed = async () => {
        let { notificationEnabled } = this.state;
        this.props.navigation.setParams({"notificationEnabled": !notificationEnabled})
        try{
            const result = await API.updateAdCommentsNotificationSetting(this.state.data[0].id, !notificationEnabled);
        }catch(error){
            console.log(error)
        }
        this.setState({notificationEnabled: !notificationEnabled});
    }

    loadNotificationSetting = async (ad) => {
        const result = await API.getAdCommentsNotificationSetting(ad.id)
        this.props.navigation.setParams({"notificationEnabled": result["notification_enabled"]})
        this.setState({notificationEnabled: result["notification_enabled"]});
    }

    async loadComments(ad){
        this.setState({data: [ad]})

        if(ad !== null){
            const result = await API.getAdComments(ad.id)
            this.setState({data: [...this.state.data, ...result]})
        }
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    renderAd(ad){
        let { isHebrew } = this.state;
        return(
            <View style={{paddingHorizontal: 16, paddingVertical: 12}}>
                <TouchableOpacity onPress={() => this.openProfile(ad.author.id)}>
                <View style={{flexDirection: isHebrew? 'row-reverse': 'row', marginBottom: 8}}> 
                    <Avatar
                        src={ad.author.avatar}
                        size={36} 
                        style={{
                            marginRight: isHebrew? 0: 8,
                            marginLeft: isHebrew? 8: 0,
                        }}/>
                    <View>
                        <Text style={styles.username}>{`${ad.author.first_name} ${ad.author.last_name}`}</Text>
                        <Text style={styles.date}>{moment(ad.timestamp).fromNow()}</Text>
                    </View>
                </View>
                </TouchableOpacity>

                <Text style={[styles.text, {textAlign: isHebrew? 'right': 'left'}]}>{ad.text}</Text>
                

                <View style={{marginTop: 8}}>
                    {/* <Text style={styles.comments}>{`Comments: ${75}`}</Text> */}
                </View>
                
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled keyboardVerticalOffset = {Header.HEIGHT + 20}>
                    <View style={{flex: 1}}>
                        <FlatList
                            ref={ref => this.itemList = ref}
                            data={this.state.data}
                            style={{flex: 1, backgroundColor: 'white'}}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this._renderItem}/>
                        {this.renderInput()}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    updateText = (newText) => {
        let {data} = this.state;
        let updatedAd = {...data[0], text: newText};
        data.splice(0, 1, updatedAd);
        this.setState({data})
    }

    _renderItem = ({item, index}) => {
        if(index === 0){
            return this.renderAd(item)
        }else{
            return <CommentItem isHebrew={this.state.isHebrew} comment={item} openProfile={this.openProfile}/>
        }
    }

    scrollToEnd = () => {
        setTimeout(() => {
            this.itemList.scrollToEnd({animated: true});
        }, 500);
    }

    openProfile = (id) => {
        this.props.navigation.navigate("UserProfile", {
            user_id: id,
            prev: true,
        })
    }

    submitComment = async() => {
        let {data, commentMessage} = this.state;
        if(!commentMessage) return;
        let comment = {
            id: -1,
            author: this.props.userProfile,
            timestamp: moment().format(),
            text: commentMessage,
            employee_ad: data[0].id
        }
        this.setState({data: [...this.state.data, comment], commentMessage: ''}, this.scrollToEnd)
        const result = await API.postAdComment(data[0].id, commentMessage);

        const ad = this.props.route?.params?.ad || null;
        if(ad !== null){
            this.props.incrementCommentCounter(ad.id);
        }
    }

    renderInput(){
        let {isHebrew} = this.state;
        return(
            <View style={[styles.inputContainer, isHebrew? {flexDirection: 'row-reverse'}: {}]}>
                <View style={{flex: 1}}>
                    <TextInput
                        style={[styles.input, isHebrew? {textAlign: 'right'}: {}]}
                        placeholder={"Leave your comment"}
                        placeholderTextColor={Color.mutedText}
                        onChangeText={commentMessage => this.setState({commentMessage})}
                        value={this.state.commentMessage}
                        onFocus={this.scrollToEnd}
                        />
                </View>
                <TouchableOpacity
                    onPress={this.submitComment}
                    style={{
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        marginHorizontal: 4,
                        paddingHorizontal: 4,
                    }}>
                    <Image
                        style={[{width: 24, height: 24 }, isHebrew? {transform: [{rotate: '180deg'}]}: {}]}
                        source={icon("send")}/>
                </TouchableOpacity>
            </View>
        )
    }


}

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    incrementCommentCounter,
    removeAd
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeAdScreen);