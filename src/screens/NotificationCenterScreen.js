import React from 'react';
import {
    Text,
    Alert,
    TouchableOpacity,
    View,
    Image,
    FlatList
} from 'react-native';
import BackendAPI from "../../backend/BackendAPI";
import settings from "../../backend/Settings";

import strings from "../utils/Strings";
import { BurgerButton } from "../components/Buttons";
import NotificationListItem from '../components/NotificationListItem';
import { connect } from 'react-redux';
import { getNotifications, readNotification, deleteNotification, readAllNotifications } from '../redux/notification-handlers'; 
import icon from '../constant/Icons';

class NotificationCenterScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["notification_screen_title"],
            headerLeft: (
                <BurgerButton openDrawer={() => navigation.openDrawer()}/>
            ),
            headerRight: (
                <TouchableOpacity style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    }} onPress={navigation.getParam("readAllAction")}>
                    <Image style={{height: 24, width: 24}} source={icon("done")}/>
                </TouchableOpacity>
            )
          };
    }

    state = {
        isHebrew: false,
        loadingInProgress: true,
        notificationItemList: []
    }

    api = new BackendAPI(this);
    notificationsEndpoint = this.api.getNotificationsEndpoint();
    readNotificationEndpoint = this.api.makeReadNotificationEndpoint();
    deleteNotificationEndpoint = this.api.getDeleteNotificationEndpoint();
    dialogsEndpoint = this.api.getDialogsEndpoint();

    componentDidMount = () => {
        this.setLang();
        //this.loadNotifications();
        this.props.getNotifications(false);
        this.props.navigation.setParams({readAllAction: this.readAllAction})
    };

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    loadNotifications = async() => {
        const notificationList = await this.notificationsEndpoint();
        let list = [];
        notificationList.forEach(item => {
            list.unshift(item);
        })
        this.setState({
            loadingInProgress: false,
            notificationItemList: list
        })
    }

    _keyExtractor = (item, index) => {
        return item.id.toString();
    }

    readNotification = async (id) => {
        // let item = this.notificationItemList.find(i => i.id === id);
        let item = this.props.notifications.find(i => i.id === id);
        if(item["notification_type"] === "task"){
            this.openTask(item.parameter);
        }else if(item["notification_type"] === "message"){
            this.loadDialog(item.parameter);
        }else if(item["notification_type"] === "ad_comment"){
            this.props.navigation.navigate("EmployeeAd", {ad_id: item.parameter});
        }

        this.props.readNotification(id);
    }


    readAllAction = () => {
        Alert.alert(
            strings['notification_screen_read_all_title'],
            strings['notification_screen_read_all_message'],
            [
                {
                    text: strings['notification_screen_read_all_cancel'],
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: strings['notification_screen_read_all_ok'], onPress: () => this.props.readAllNotifications()},
            ]
        )
    }

    loadDialog = async (dialog_id) =>{
        if(dialog_id != undefined && dialog_id != null){
            this.props.navigation.navigate("Dialog", {dialogId: dialog_id})
        }
    }

    render(){
        return(
            <FlatList
                onRefresh={() => this.refreshList()}
                refreshing={this.props.loading}
                data={this.props.notifications}
                keyExtractor={this._keyExtractor}
                renderItem={({item}) => <NotificationListItem 
                    isHebrew={this.state.isHebrew} 
                    item={item} 
                    readNotification={(id) => this.readNotification(id)} 
                    deleteNotification={(id) => this.props.deleteNotification(id)}/>}
                ItemSeparatorComponent={this.renderSeparator}
                ListEmptyComponent={this.renderEmptyListComponent}
            />
        )
    }

    deleteNotification = async (id) => {
        let {notificationItemList} = this.state;
        let index = notificationItemList.findIndex(item => item.id === id);
        if(index > -1){
            notificationItemList.splice(index, 1);
            this.setState({notificationItemList}, () => {
                this.deleteNotificationEndpoint(id);
            });
        }
    }

    renderEmptyListComponent = () => {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{
                        fontSize: 16,
                        color: "#4F5267",
                        textAlign: "center",
                        marginTop: 130,
                        }}>
                            {strings["notification_screen_no_items"]}
                </Text>
            </View>
        )
    }

    renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "rgba(66, 67, 106, 0.16)",
            }}
          />
        );
      };

    refreshList(){
        this.props.getNotifications(true);
        // this.setState({loadingInProgress: true})
        // this.loadNotifications();
    }

    openTask(id){
        this.props.navigation.navigate("TaskDetails", {task: null, taskID: id});
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    notifications: state.notificationReducer.notifications,
    loading: state.notificationReducer.loading,
  })

//Map your action creators to your props.
const mapDispatchToProps = {
    getNotifications,
    readNotification,
    deleteNotification,
    readAllNotifications
}


export default connect(mapStateToProps, mapDispatchToProps) (NotificationCenterScreen);