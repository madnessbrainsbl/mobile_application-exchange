
/**
 *  ProposeTaskScreen.js
 *  Screen with user's active tasks for selecting it to propose
 * 
 *  Created by Dmitry Chulkov 14/10/2019
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
    ScrollView,
    Linking,
    StyleSheet,
    Alert,
    Dimensions,
    SectionList
} from 'react-native';
import BackendAPI from "../../backend/BackendAPI";
import settings from "../../backend/Settings";
import strings from "../utils/Strings";
import TaskCardItem from "../components/TaskCardItem";
import EmptyListView from "../components/EmptyListView";
import Color from '../constant/Color';

import { connect } from 'react-redux';
import { getMyTasks } from '../redux/task-handlers';

class OfferTaskScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["propose_task_title"],
          };
    }

    state = {
        isHebrew: false,
        user: null
    }

    api = new BackendAPI(this);
    offerTaskEndpoint = this.api.getOfferTaskEndpoint();


    componentDidMount(){
        this.props.getMyTasks();
        let user = this.props.route?.params?.user || null
        this.setState({user});
        this.setLang();
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    render(){
        return(
            <FlatList
                style={{ flex: 1, backgroundColor: "#f9f9f9",}}
                data={this.props.myTasks.active}
                removeClippedSubviews={false}
                ListEmptyComponent={<EmptyListView title={strings["propose_task_no_task"]}/>}
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={this.renderItem}
            />
        )
    }

    renderItem = ({item}) => (
        <TaskCardItem
            key={item.id.toString()} 
            task={item} 
            isHebrew={this.state.isHebrew}
            userProfile={this.profile}
            onMorePress={this.pickTask}
            pickMode
            />
    )

    pickTask = async (task) => {
        if(!this.state.user){
            this.props.navigation.goBack();
            return;
        }

        await this.offerTaskEndpoint({
            userId: this.state.user.id, 
            taskId: task.id
        });

        Alert.alert(
            strings["propose_task_alert_title"],
            strings["propose_task_alert_message"],
            [
                {text: 'OK', onPress: () => this.props.navigation.goBack()},
            ],
            {cancelable: false},
        )
    }


}

const mapStateToProps = state => ({
    myTasks: state.taskReducer.myTasks,
})


const mapDispatchToProps = {
    getMyTasks,
}

export default connect(mapStateToProps, mapDispatchToProps)(OfferTaskScreen);