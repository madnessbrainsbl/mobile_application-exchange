import React from 'react';
import {
    Image, Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    View,
    KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';
import { Header } from '@react-navigation/native';
//import Toast from "../../components/MyToast";
import moment from "moment";
import Loader from "../../components/Loader";
import BackendAPI from "../../../backend/BackendAPI";
import icon from "../../constant/Icons";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";

class DialogScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        let title = ""
        let actionButton = null

        let companion = navigation.getParam("companion", null);
        if (companion) {
            title = `${companion.first_name} ${companion.last_name}`
            let imageSource = icon("profile-user")
            if(companion.avatar){
                imageSource = {uri: `${BackendAPI.API_BASE}${companion.avatar}`};
            }

            actionButton = (
                <View style={{display: 'flex', }}>
                    <TouchableOpacity
                        style={{
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 8,
                            paddingBottom: 8,
                            marginLeft: 6
                        }}
                        onPress={() => navigation.navigate("UserProfile", {prev: true, user_id: companion.id})}
                    >
                        <Image source={imageSource} style={{height: 24, width: 24, borderRadius: 12,}}/>
                    </TouchableOpacity>
                </View>
            )
        }
        
        return {
            title: title,
            headerRight: actionButton
          };
    }

    messageContainer;

    state = {
        isLoading: true,
        message: null,
        messages: []
    };

    api = new BackendAPI(this);
    dialogMessagesEndpoint = this.api.getDialogMessagesEndpoint();
    createDialogMessageEndpoint = this.api.getCreateDialogMessageEndpoint();
    dialogInfoEndpoint = this.api.getDialogInfoEndpoint();

    componentDidMount() {
        this.loadMessages();
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView style={{flex: 1}} behavior="padding" enabled>
                    <View style={{flex: 1}}>
                        {
                            this.state.isLoading? <Loader/> :
                            <ScrollView
                                ref={ref => this.messageContainer = ref}
                                style={[styles.scrollView, {flex: 1}]}
                                onContentSizeChange={() => this.messageContainer.scrollToEnd({animated: true})}>
                                    {this.renderMessages()}
                            </ScrollView>
                        }
                        {this.renderInput()}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    renderInput(){
        return(
            <View style={styles.footer}>
                <View style={{flex: 1}}>
                    <TextInput
                        style={styles.textBox}
                        placeholder={strings["message"]}
                        placeholderTextColor="#3B5998"
                        onChangeText={message => this.setState({message})}
                        value={this.state.message}
                        onFocus={() => {
                            setTimeout(() => {
                                this.messageContainer.scrollToEnd({animated: true});
                            }, 500);
                        }}/>
                </View>
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={this.sendMessage}>
                    <Image
                        style={styles.sendIcon}
                        source={icon("send")}/>
                </TouchableOpacity>
            </View>
        )
    }

    renderMessages(){
        const profile = this.props.userProfile;
        return this.state.messages.map(message => (
            <View
                key={message["id"]}
                style={[
                    styles.messageContainer,
                    message["author"]["id"] === profile["id"]
                        ? styles.myMessageContainer
                        : styles.peerMessageContainer
                ]}
            >
                <View
                    style={[
                        styles.message,
                        message["author"]["id"] === profile["id"]
                            ? styles.myMessage
                            : styles.peerMessage
                    ]}
                >
                    <Text style={styles.messageText}>
                        {message["text_message"]}
                    </Text>
                    <View style={styles.timestampContainer}>
                        <Text style={styles.timestampText}>
                            {moment(message["date_create"]).format("D MMMM HH:mm")}
                        </Text>
                    </View>
                </View>
            </View>
        ))
    }

    async loadMessages() {
        const dialogId = this.props.route?.params?.dialogId || -1;
        const messages = await this.dialogMessagesEndpoint({dialogId});
        await this.setState({messages, isLoading: false});

        let companion = this.props.route?.params?.companion || null;
        if (!companion) {
            const dialogInfo = await this.dialogInfoEndpoint({dialogId})
            console.log(dialogInfo)
            const profile = this.props.userProfile;
            companion = dialogInfo.members.find(user => user.id !== profile.id)
            if(companion){
                this.props.navigation.setParams({companion})
            }
        }

        
    }

    sendMessage = async() => {
        if (!this.state.message) return;

        const dialogId = this.props.route?.params?.dialogId || -1;
        const result = await this.createDialogMessageEndpoint({
            dialogId,
            "text_message": this.state.message
        }, {
            before: false,
            after: false
        });

        this.setState({message: null});

        await this.loadMessages({}, {
            before: false,
            after: false
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    messageContainer: {
        flexDirection: "row"
    },
    myMessageContainer: {
        justifyContent: "flex-end"
    },
    peerMessageContainer: {
        justifyContent: "flex-start"
    },
    message: {
        marginBottom: 16,
        padding: 10,
        borderRadius: 5,
        width: "75%"
    },
    myMessage: {
        backgroundColor: "#d3d5e3"
    },
    peerMessage: {
        backgroundColor: "#f2f2f2"
    },
    messageText: {
        color: "#333333",
        fontSize: 14
    },
    timestampContainer: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    timestampText: {
        color: "#000000",
        fontSize: 8,
    },
    footer: {
        flexDirection: "row",
        backgroundColor: '#EEE',
        height: 54,
        padding: 10,
    },
    textBox: {
        fontSize: 17,
        color: "#3B5998",
        backgroundColor: "#dbdce8",
        borderRadius: 4,
        height: "100%",
        paddingLeft: 14,
        paddingRight: 14
    },
    sendButton: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        marginLeft: 4,
        paddingLeft: 4,
        paddingRight: 4
    },
    sendIcon: {
        width: 24,
        height: 24
    }
});

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer,
})

//Map your action creators to your props.
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(DialogScreen);