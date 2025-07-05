import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    FlatList
} from 'react-native';
import { connect } from 'react-redux';
import Loader from "../../components/Loader";
import Avatar from '../../components/Avatar';
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import { BurgerButton } from "../../components/Buttons";

class DialogsListScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["messages"],
            headerLeft: (
                <BurgerButton openDrawer={() => navigation.openDrawer()}/>
            ),
          };
    }

    state = {
        isLoading: false,
        dialogs: []
    };

    api = new BackendAPI(this);
    dialogsEndpoint = this.api.getDialogsEndpoint();

    componentDidMount() {
        this.loadDialogs();
    }

    render() {
        const profile = this.props.userProfile;
        return this.state.isLoading
            ? (
                <View style={{
                    flex: 1,
                    paddingLeft: 15,
                    paddingRight: 15,
                    justifyContent: "center"
                }}>
                    <Loader/>
                </View>
            )
            : (
                this.state.dialogs.length === 0
                    ? (
                        <View style={{
                            flex: 1,
                            paddingLeft: 15,
                            paddingRight: 15,
                            justifyContent: "center"
                        }}>
                            <Text style={{fontSize: 24, color: "#4F5267", textAlign: 'center'}}>
                                {strings["no_dialogs"]}
                            </Text>
                        </View>
                    )
                    : (
                        <View style={{flex: 1}}>
                            <FlatList
                                data={this.state.dialogs}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({item: dialog}) => {
                                    const peer = dialog["members"].find(x => x["id"] !== profile["id"]) || dialog["members"][0];
                                    return (
                                        <TouchableHighlight
                                            onPress={() => this.openDialog(dialog)}
                                        >
                                            <View style={{padding: 16 * 0.75, flex: 1, flexDirection: "row"}}>
                                                <Avatar src={peer["avatar"]}/>
                                                <View style={{flex: 1, flexDirection: "column"}}>
                                                    <Text style={{color: "#333333", fontSize: 16, marginBottom: 7 * 0.75}}>
                                                        {peer["first_name"]} {peer["last_name"]}
                                                    </Text>
                                                    <Text style={{color: "#848484", fontSize: 14}}>
                                                        {dialog["last_message"] || strings["no_messages"]}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableHighlight>
                                    );
                                }}
                                ItemSeparatorComponent={() => (
                                    <View style={{
                                        flex: 1,
                                        height: StyleSheet.hairlineWidth,
                                        backgroundColor: '#8E8E8E',
                                    }}/>
                                )}
                            />
                        </View>
                    )
            );
    }

    async loadDialogs() {
        const dialogs = await this.dialogsEndpoint();
        this.setState({
            dialogs: dialogs
        });
    }

    openDialog(dialog) {
        const profile = this.props.userProfile;
        const peer = dialog["members"].find(x => x["id"] !== profile["id"])
        this.props.navigation.navigate("Dialog", {dialogId: dialog.id, companion: peer})
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer,
})

//Map your action creators to your props.
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(DialogsListScreen);