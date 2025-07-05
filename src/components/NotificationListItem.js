import React from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
    StyleSheet,
    Platform,
    Switch,
    FlatList
} from 'react-native';
// import Toast from "../../components/MyToast";
import moment from "moment";
import strings from "../utils/Strings";
// import Swipeout from 'react-native-swipeout';

const styles = StyleSheet.create({
    time: {
        color: 'rgba(66, 67, 106, 0.65)',
        fontSize: 12
    },
    actionButton: {
        color: '#3B5998'
    },
    itemTitle:{
        color: 'rgb(66, 67, 106)',
        fontSize: 18
    },
    bodyText: {
        color: 'rgba(66, 67, 106, 0.87)',
    }
})


export default class NotificationListItem extends React.PureComponent {

    render(){
        let {item} = this.props
        let buttonLabel = strings["notification_screen_more"];
        if(item["notification_type"] === "task"){
            buttonLabel = strings["notification_screen_open_task"];
        }else if(item["notification_type"] === "message"){
            buttonLabel = strings["notification_screen_open_dialog"];
        }

        const swipeSettings = {
            autoClose: true,
            sectionId: 1,
            right: [{
                text: strings["remove"],
                type: 'delete',
                onPress: () => this.props.deleteNotification(item.id)
            }]
        }

        return(
            // <Swipeout {...swipeSettings}>
            <TouchableWithoutFeedback onPress={() => this.props.readNotification(item.id)}>
                <View style={{padding: 20, backgroundColor: item["is_read"]? 'white':'rgba(159, 190, 254, 0.28)'}}>
                    <Text style={styles.itemTitle}>{item.title}</Text>

                    <View style={{paddingTop: 10, paddingBottom: 10}}>
                        <Text style={styles.bodyText}>{item.body}</Text>
                    </View>

                    <View style={{flexDirection: this.props.isHebrew? "row-reverse": "row", justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={styles.time}>{this.formatDateTime(item.created)}</Text>
                        <TouchableOpacity onPress={() => this.props.readNotification(item.id)}>
                            <Text style={styles.actionButton}>{buttonLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            // </Swipeout>
        )
    }

    formatDateTime(date) {
        return moment(`${date}`).format("DD.MM.YYYY");
    }

}
