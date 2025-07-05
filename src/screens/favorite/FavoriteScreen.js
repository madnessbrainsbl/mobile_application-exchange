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
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import moment from "moment";
import { BurgerButton } from "../../components/Buttons";
import EmptyListView from "../../components/EmptyListView";
import Color from '../../constant/Color';
import FavoriteTasks from './FavoriteTasksSection';
import FavoriteUsers from './FavoriteUsersSection';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import { connect } from 'react-redux';
import { getFavoriteTasks } from '../../redux/task-handlers';


const isIOS = Platform.OS === 'ios';

class FavoriteScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["favorite_title"],
            headerStyle: {
                backgroundColor: Color.primary,
                elevation: 0,
                borderBottomWidth: 0,
            },
            headerLeft: (<BurgerButton openDrawer={() => navigation.openDrawer()}/>),
        };
    }

    state = {
        isHebrew: false,
        index: 0,
        routes: [
            {key: 'tasks', title: strings["favorite_tasks"]},
            {key: 'users', title: strings["favorite_users"]},
        ],
    };

    api = new BackendAPI(this);
    applyForTaskEndpoint = this.api.getApplyForTaskEndpoint();
    createDialogEndpoint = this.api.getCreateDialogEndpoint();

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    componentDidMount() {
        this.setLang();
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: "white"}}>
                <TabView
                    navigationState={this.state}
                    style={{flex: 1}}
                    renderScene={({route}) => {
                        switch(route.key){
                            case 'tasks':
                                return <FavoriteTasks 
                                    title={route.title} 
                                    openTask={this.openTask}
                                    openMap={this.openMap}
                                    applyForTask={this.applyForTask}
                                    startDialog={this.startDialog}
                                    />;
                            case 'users':
                                return <FavoriteUsers 
                                        title={route.title}  
                                        userList={this.state.userList}
                                        onUserPress={this.openProfile}
                                        // openTask={task => this.openTask(task)}
                                        // startDialog={task => this.startDialog(task)}
                                        />;
                            default:
                                return null;
                            
                        }
                    }}
                    onIndexChange={index => this.setState({ index })}
                    initialLayout={{ width: Dimensions.get('window').width }}
                    renderTabBar={props =>
                        <TabBar
                          {...props}
                          indicatorStyle={{ backgroundColor: 'white' }}
                          style={{ backgroundColor: Color.primary }}
                        />
                      }
                />
            </View>
        )
    }

    applyForTask = async(task) => {
        const profile = this.props.userProfile;
        if (!profile) {
            return;
        }

        if (task["applicants"]
            && task["applicants"].some(x => x["id"] === profile["id"])
        ) {
            // MyToast.show(strings["already_applied"]);
            return;
        }

        const result = await this.applyForTaskEndpoint({
            taskId: task.id,
        });

        if (result[0] === "applicant added") {
            //MyToast.show(strings["your_application_has_been_accepted_for_review"]);

            let dateTime = this.formatDateTime(task["date_begin"], task["time_begin"]);
            Alert.alert(
                strings["confirm_done_hint_title"],
                strings.formatString(strings["confirm_done_hint_description"], dateTime, task.address),
                [
                {text: strings["confirm_done_hint_open_map"], onPress: () => this.openMap(task)},
                {text: strings["ok"]},
                ],
                {cancelable: false},
            );

            // await this.loadTasks(task);
            this.props.getFavoriteTasks();
        } else {
            // MyToast.show(strings["unable_apply"]);
        }
    };

    openMap(task) {
        const url = `https://waze.com/ul?q=${task["address"]}&navigate=yes`;
        Linking.openURL(url);
    }

    formatDateTime(date, time) {
        return moment(`${date} ${time}`).format("D MMMM, H:mm");
    }

    startDialog = async(task) => {
        const profile = this.props.userProfile;
        if (!profile) {
            return;
        }

        const result = await this.createDialogEndpoint({
            userId: task.creator.id,
        }, {
            before: false,
            after: false,
        });

        if (result["dialog_id"]) {
            this.props.navigation.navigate("Dialog", {dialogId: result["dialog_id"]})
        } else if (result[0] && result[0]["id"]) {
            const dialog = result[0];
            this.props.navigation.navigate("Dialog", {dialogId: dialog["id"]})
        }
    };

    openTask = (task) => {
        this.props.navigation.navigate('TaskDetails', {task})
    };

    openProfile = (user) => {
        this.props.navigation.navigate('UserProfile', {prev: true, user_id: user.id, user, in_favorite: true})
    }
}



//Map the redux state to your props.
const mapStateToProps = state => ({
    favoriteTasks: state.taskReducer.favoriteTasks,
    loading: state.taskReducer.loading,
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getFavoriteTasks,
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteScreen);