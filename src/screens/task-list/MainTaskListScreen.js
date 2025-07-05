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
    StyleSheet,
    Alert
} from 'react-native';
import BackendAPI from "../../../backend/BackendAPI";
import MyToast from "../../components/MyToast";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import icon from "../../constant/Icons";
import TaskCardItem from "../../components/TaskCardItem";
import moment from "moment";
import { Linking } from "expo";
import { BurgerButton } from "../../components/Buttons";
import DynamicFilterIcon from "../../components/DynamicFilterIcon";
import EmptyListView from "../../components/EmptyListView";
import Color from '../../constant/Color';
import Triangle from '../../assets/images/triangle.png'

import API from '../../api';
import {isCurrentAppVersionLowerThan} from '../../utils/Helpers';

import { Notifications as ExpoNotifications } from 'expo';
import * as Notifications from 'expo-notifications';

import { connect } from 'react-redux';
import { getTasks, getMoreTasks, getCategories, applyQuickFilter } from '../../redux/task-handlers';
import { QUICK_FILTER } from '../../redux/task-reducer';


const isIOS = Platform.OS === 'ios';
const styles = StyleSheet.create({
    categoryItem:{
        borderRadius: 12,  
        marginRight: 8, 
        marginBottom: 8,
        borderColor: '#3B5998', 
        borderWidth: 1,
    },
    categoryItemText: {
        paddingHorizontal: 20, 
        paddingVertical: 4
    },
    topMenuButton: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
    }
})

class MainTaskListScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["all_tasks_screen_title"],
            headerLeft: (
                <BurgerButton openDrawer={() => navigation.openDrawer()}/>
            ),
            headerRight: (
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <TouchableOpacity
                        style={styles.topMenuButton}
                        onPress={() => navigation.navigate("Filters")}
                    >
                        <DynamicFilterIcon/>
                    </TouchableOpacity>
    
                    {/* <TouchableOpacity
                        style={[styles.topMenuButton, {marginLeft: 6}]}
                        onPress={() => navigation.navigate("CreateTask", {prev: true})}
                    >
                        <Image source={icon("add")}/>
                    </TouchableOpacity> */}
                </View>
            )
          };
    }


    state = {
        isHebrew: false,
        showCreateTaskHint: false
    };

    api = new BackendAPI(this);
    applyForTaskEndpoint = this.api.getApplyForTaskEndpoint();
    createDialogEndpoint = this.api.getCreateDialogEndpoint();
    getAdsEndpoint = this.api.getAdsEndpoint();
    tasksCountEndpoint = this.api.getTasksCountEndpoint();
    taskSeenEndpoint = this.api.getTaskSeenEndpoint();
    getUsersCountEndpoint = this.api.getUsersCountEndpoint();

    seenItems = {}

    viewabilityConfigCallbackPairs = [{
        viewabilityConfig: {
          minimumViewTime: 500,
          itemVisiblePercentThreshold: 100
        },
        onViewableItemsChanged: this.handleItemsInViewPort.bind(this)
      },
    ];

    handleItemsInViewPort(smth){
        let changed = smth["changed"];
        changed.forEach(item => {
            if(!this.seenItems.hasOwnProperty(item.item.id)){
                this.seenTask(item.item.id);
            }
        })
    }

    seenTask = async(taskID) => {
        this.seenItems[taskID] = true;
        // Publish to server
        await this.taskSeenEndpoint(taskID);
    }

    async componentDidMount() {
        this.setLang();

        this.props.getCategories();
        this.props.getTasks(this.props.tasks.length === 0)

        const result = await this.getUsersCountEndpoint();
        if(result && result[0]){
            const userCount = result[0]["count"];
            MyToast.show(strings.formatString(strings["extra_count"], userCount));
        }

        this.registerForPushNotificationsAsync();

        // Check deeplink
        const url = await Linking.getInitialURL();
        const { path, queryParams } = await Linking.parse(url);
        if(path != null){
            const arr = path.split('/');
            const pathItem = arr[arr.length - 1];

            if (pathItem === 'share-task') {
                this.props.navigation.navigate('TaskDetails', {task: null, taskID: queryParams.id})
            }
        }else{
            if(this.props.checkNewVersion){
                const appVersion = await API.getLatestAppVersion();
                if(isCurrentAppVersionLowerThan(appVersion.version)){
                    this.props.navigation.navigate("UpdateApp", {appVersion});
                }
            }
        }
    }
    

    registerForPushNotificationsAsync = async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return;
        }

        //token = await Notifications.getExpoPushTokenAsync();
        const {userProfile} = this.props;
        const lang = await settings.getLanguage();
        //await BackendAPI.updateToken(userProfile.id, token, lang);

        // if (Platform.OS === 'android') {
        //     Notifications.createChannelAndroidAsync('default', {
        //         name: 'default',
        //         sound: true,
        //         priority: 'max',
        //         vibrate: [0, 250, 250, 250],
        //     });
        // }
    };

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };


    openAd = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };


    applyForTask = async(task) => {
        const profile = this.props.userProfile;
        if (!profile) {
            //MyToast.show(strings["auth_required"]);
            //this.props.history.push("/internal/errors/unauthorized");
            return;
        }

        if (task["applicants"]
            && task["applicants"].some(x => x["id"] === profile["id"])
        ) {
            //MyToast.show(strings["already_applied"]);
            return;
        }

        const result = await this.applyForTaskEndpoint({
            taskId: task.id,
        });

        if (result[0] === "applicant added") {
            //MyToast.show(strings["your_application_has_been_accepted_for_review"]);

            //let dateTime = this.formatDateTime(task["date_begin"], task["time_begin"]);
            // Alert.alert(
            //     strings["confirm_done_hint_title"],
            //     strings.formatString(strings["confirm_done_hint_description"], dateTime, task.address),
            //     [
            //     {text: strings["confirm_done_hint_open_map"], onPress: () => this.openMap(task)},
            //     {text: strings["ok"]},
            //     ],
            //     {cancelable: false},
            // );
            Alert.alert(
                '',
                strings["apply_description"],
                [
                  {text: strings["ok"]},
                ],
                {cancelable: false},
            );

            await this.props.getTasks(true);
        } else {
            MyToast.show(strings["unable_apply"]);
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
            userId: task.creator,
        }, {
            before: false,
            after: false,
        });

        if (result["dialog_id"]) {
            this.props.navigation.navigate("Dialog", {dialogId: result["dialog_id"]})
        } else if (result[0] && result[0]["id"]) {
            const dialog = result[0];
            this.props.navigation.navigate("Dialog", {dialogId: dialog.id})
        } else if (result[0]) {
            //MyToast.show(result[0]);
        } else {
            //MyToast.show(strings["dialog_error"]);
        }
    };

    openTask = (task) => {
        this.props.navigation.navigate('TaskDetails', {task: task, taskID: task.id})
    };

    

    render(){
        this.profile = this.props.userProfile;
        return (
            <View style={{flex: 1}}>
                <FlatList
                style={{ flex: 1, backgroundColor: "#f9f9f9",}}
                onRefresh={() => setTimeout(() => { this.refresh() }, 200) }
                refreshing={this.props.loading}
                data={this.props.tasks}
                removeClippedSubviews={false}
                ListHeaderComponent={this.listHeader()}
                ListEmptyComponent={(!this.props.loading)?<EmptyListView title={strings["no_tasks"]}/>: null}
                keyExtractor={(item, index) => item.id.toString()}
                viewabilityConfigCallbackPairs={this.viewabilityConfigCallbackPairs}
                renderItem={this.renderItem}
                onEndReachedThreshold={10}
                onEndReached={this.onEndReached}
            />

            {this.state.showCreateTaskHint && this.renderOverlayWithHint()}

            </View>
            
        )
    }

    renderOverlayWithHint(){
        return(
            <TouchableWithoutFeedback onPress={() => this.setState({showCreateTaskHint: false})}>
                <View style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, .3)'}}>
                    <View style={{alignItems: 'flex-end', paddingHorizontal: 16}}>
                        <Image source={Triangle} style={{marginEnd: 0}}/>
                        <View style={{
                            backgroundColor: 'rgba(255, 208, 51, .8)',
                            padding: 16,
                            borderTopLeftRadius: 12,
                            borderBottomLeftRadius: 12,
                            borderBottomRightRadius: 12,
                        }}>
                        <Text style={{color: 'rgba(0, 0, 0, 0.9)'}}>{strings["hint_create_task"]}</Text>
                        </View>
                    </View>
                    
                </View>
            </TouchableWithoutFeedback>
        )
    }

    onEndReached = () => {
        this.props.getMoreTasks();
    }

    renderItem = ({item}) => (
        <TaskCardItem
            key={item.id.toString()} 
            task={item} 
            isHebrew={this.state.isHebrew}
            userProfile={this.profile}
            onMorePress={this.openTask}
            onQuestionPress={this.startDialog}
            onApplyPress={task => this.applyForTask(task)}/>
    )

    refresh(){
       this.props.getTasks(true);
    }

    listHeader(){
        const shouldShowAuthBanner = 
            this.props.userProfile !== null &&
            this.props.userProfile["account_type"] === 'creator' &&
            (this.props.userProfile["first_name"] == "" || 
            this.props.userProfile["last_name"] == "");
        
        return(
            <View>

                {shouldShowAuthBanner? this.authBanner(): null}

                <View style={{flexDirection: 'row', marginTop: 8, marginHorizontal: 2, alignItems: 'center'}}>
                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        borderRadius: 6, 
                        borderColor: Color.primary,
                        borderStyle: 'solid',
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 6,
                        justifyContent: 'center'
                        }} onPress={() => this.props.navigation.navigate("PerformersList")}>
                        <View style={{flexDirection: "row", alignItems: 'center'}}>
                            {/* {
                                this.props.filtersApplied && 
                                <View style={{
                                    height: 14,
                                    width: 14,
                                    borderRadius: 7,
                                    backgroundColor: '#F6AC19',
                                    marginHorizontal: 8
                                }}/>
                            } */}
                            <Text style={{
                                color: Color.primary,
                                fontSize: 14,
                                textAlign: 'center'
                            }}>{strings["performers"]}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{width: 2}}/>

                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        borderRadius: 6, 
                        borderColor: Color.primary,
                        borderStyle: 'solid',
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 6,
                        justifyContent: 'center'
                        }} onPress={this.onCreateTaskPressed}>
                        <View>
                            <Text style={{
                                color: Color.primary,
                                fontSize: 14,
                                textAlign: 'center'
                            }}>{strings["main_create_task"]}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 0, backgroundColor: "#f9f9f9"}}>
                    <View style={{flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8}}>
                        {this.renderCategories()}
                    </View>
                </ScrollView>
            </View>
        )
    }

    onCreateTaskPressed = () => {
        if(this.props.userProfile.account_type === 'creator'){
            if(this.props.userProfile["first_name"] == "" || 
                this.props.userProfile["last_name"] == ""){
                Alert.alert(
                    "",
                    strings["auth_banner"],
                    [
                        {text: strings["cancel"]},
                        {text: strings["ok"], onPress: () => this.props.navigation.navigate("EmployerInfo")}
                    ]
                )
            }else{
                this.props.navigation.navigate("CreateTask", {prev: true})
            }   
        }else if(this.props.userProfile.account_type === 'performer'){
            Alert.alert(
                "",
                strings["performer_alert_message"],
                [
                    {text: strings["performer_alert_cancel"]},
                    {text: strings["performer_alert_continue"], onPress: () => this.props.navigation.navigate("EmployerInfo")}
                ]
            )
        }       
    }


    authBanner(){
        return(
            <TouchableOpacity onPress={() => this.props.navigation.navigate("EmployerInfo")}>
                <View style={{
                    margin: 6,
                    backgroundColor: 'rgba(18, 144, 203, 0.3)',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: '#1290cb'
                }}>
                    <Text style={{
                        color: "#1290cb"
                    }}>{strings["auth_banner"]}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    renderCategories(){
        let views = [];
        views.push(
            <View key={"-1"} style={[styles.categoryItem, {backgroundColor: this.props.quickFilter === QUICK_FILTER.ALL? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={() =>  this.props.applyQuickFilter({FILTER: QUICK_FILTER.ALL, category: null})}>
                    <Text style={[styles.categoryItemText, {color: this.props.quickFilter === QUICK_FILTER.ALL? 'white': "#3B5998" }]}>{ strings["all"]}</Text>
                </TouchableWithoutFeedback>
            </View>
        )

        this.props.categories.forEach(category => {
            views.push(this.renderCategoryItem(category));
        })

        views.push(
            <View key={"-2"} style={[styles.categoryItem, {backgroundColor: this.props.quickFilter === QUICK_FILTER.MY? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={this.onMyTasksPressed}>
                    <Text style={[styles.categoryItemText, {color: this.props.quickFilter === QUICK_FILTER.MY? 'white': "#3B5998" }]}>{ strings["my_tasks"]}</Text>
                </TouchableWithoutFeedback>
            </View>
        )

        return views;
    }

    renderCategoryItem(category){
        let isSelected = this.props.quickFilterCategory && (this.props.quickFilterCategory.id === category.id);
        return(
            <View key={category.id.toString()} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={() => this.onCategoryPressed(category)}>
                    <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{ strings.getCategory(category["category"])}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    onMyTasksPressed = () => {
        this.props.applyQuickFilter({FILTER: QUICK_FILTER.MY, category: null})
    }

    onCategoryPressed = (category) => {
        this.props.applyQuickFilter({FILTER: QUICK_FILTER.CATEGORY, category: category})
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    tasks: state.taskReducer.tasks,
    loading: state.taskReducer.loading,
    quickFilter: state.taskReducer.quickFilter,
    quickFilterCategory: state.taskReducer.quickFilterCategory,
    categories: state.taskReducer.categories,
    filtersApplied: state.taskReducer.filters !== null,
    userProfile: state.profileReducer,
    checkNewVersion: state.configReducer.checkNewVersion
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getTasks,
    getMoreTasks,
    getCategories,
    applyQuickFilter
}

//connect(mapStateToProps, mapDispatchToProps)
//export default MainTaskListScreen;
export default connect(mapStateToProps, mapDispatchToProps)(MainTaskListScreen);