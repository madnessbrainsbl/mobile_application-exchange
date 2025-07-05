import React from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    View,
    Image
} from 'react-native';

import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
import strings from "../../utils/Strings";

import icon from '../../constant/Icons';
import LikeButton from '../../components/LikeButton';

import TaskDetails from './TaskDetails';
import TaskDetailsOwner from './TaskDetailsOwner';

import { connect } from 'react-redux';
import { getTasks } from '../../redux/task-handlers';

class TaskDetailsScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        let task = navigation.getParam("task", null);
        let title = "";
        let buttons = [];
        if(task){
            let {category} = task;
            title = strings.getCategory(category["name"]? category["name"]: category)
            buttons.push(<LikeButton key={"like"} task={task}/>)
        }

        buttons.push(
            <TouchableOpacity
                    key={"share"}
                    style={{
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 8,
                        paddingBottom: 8,
                    }}
                    onPress={navigation.getParam("ShareTask")}
                >
                    <Image style={{height: 20, width: 20, resizeMode: 'contain'}} source={icon("share")}/>
            </TouchableOpacity>
        )
        return {
            title: title,
            headerRight: (
                <View style={{flexDirection: 'row'}}>
                    {buttons}
                </View>
            )
      };
    }

    state = {
        task: this.props.route?.params?.task || null,
        isLoading: this.props.route?.params?.task === null,
        name: "TaskDetailsScreen",
        taskIsDeleted: false,
        applies: [],
        extraPayload: this.props.route?.params?.extraPayload || null
    }

    api = new BackendAPI(this);
    taskEndpoint = this.api.getTaskEndpoint();
    applyListEndpoint = this.api.getApplyListEndpoint();
    logEeConnectionEndpoint = this.api.getLogEeConnectionEndpoint();
    createDialogEndpoint = this.api.getCreateDialogEndpoint();

    render(){
        
        if(this.state.isLoading){
            return(
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="large" color="#3B5998"/>
                </View>
            )
        }else if(this.state.taskIsDeleted){
            return(
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: 'rgba(66, 67, 106, 0.65)'}}>{strings["task_not_found"]}</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{marginTop: 8}}>
                        <Text>{strings["back"]}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        else{
            const {task, extraPayload} = this.state;
            const { fromShare } = task;
            const profile = this.props.userProfile;
            let showExtendDialog = false;
            console.log(extraPayload)
            if(extraPayload && extraPayload.action === 'extend_task_time'){
                showExtendDialog = true
            }

            console.log("showExtendDialog: " + showExtendDialog)
            
            const taskComponentView = (profile !== null && (task.creator === profile.id || task.creator.id === profile.id))? 
                <TaskDetailsOwner 
                    task={task} 
                    editTask={() => this.editTask()} 
                    updateTaskList={() => this.props.getTasks(false)}
                    showExtendDialog={showExtendDialog}
                    openUserProfile={this.openUserProfile}
                    openDialogWith={this.openDialogWith}/>
                : <TaskDetails 
                    task={task}
                    openUserProfile={this.openUserProfile}
                    openDialogWith={this.openDialogWith}/>
            return (
                <View style={{flex: 1, backgroundColor: '#EFF0F4'}}>
                    {taskComponentView}
                </View>
            );
        }
        
    }

    openUserProfile = (id) => {
        this.props.navigation.navigate("UserProfile", {
            user_id: id,
            prev: true,
            fromTask: this.state.task.id
        })
    }

    openDialogWith = async (id) => {

        this.logChatConnection(id);

        const result = await this.createDialogEndpoint({
            userId: id
        });

        if (result["dialog_id"]) {
            this.props.navigation.navigate("Dialog", {dialogId: result["dialog_id"]})
        }
        else if (result[0] && result[0]["id"]) {
            const dialog = result[0];
            this.props.navigation.navigate("Dialog", {dialogId: dialog.id})
        }
    }

    logChatConnection = async (userID) => {
        const profile = this.props.userProfile;
        const result = await this.logEeConnectionEndpoint({
            "initiator": profile.id,
            "task": this.state.task.id,
            "target_user": userID,
            "channel_type": "chat"
        })
        console.log(result)
    }

    editTask(){
        this.props.navigation.navigate("EditTask", {
            task: this.state.task, 
            updateTask: this.updateTask.bind(this),
            onTaskDeleted: this.onTaskDeleted.bind(this)
        })
    }

    onTaskDeleted(){
        let updateCallback = this.props.route?.params?.updateCallback || null;
        if(updateCallback){
            updateCallback();
        }
        this.props.navigation.goBack();
    }

    updateTask(task){
        let updateCallback = this.props.route?.params?.updateCallback || null;
        if(updateCallback){
            updateCallback();
        }
        this.setState({task})
    }

    componentDidMount(){
        const taskID = this.props.route?.params?.taskID || -1;
        if(taskID !== -1){
            this.loadTask(taskID);
            this.loadApplies(taskID)
        }else{
            this.loadApplies(this.state.task.id)
        }

        this.props.navigation.setParams({ShareTask: this.shareTask});
    }

    // componentDidUpdate(prevProps) {
    //     let task = this.props.route.params?.task || null
    //     let taskID = this.props.route.params?.taskID || -1

    //     if (task === null && this.props !== prevProps) {
    //         this.setState({task: null});
    //         this.loadTask(taskID);
    //     }
    // }

    async loadTask(id){
        if(!this.state.task){
            this.setState({isLoading: true})
        }
        const task = await this.taskEndpoint(id);

        if(!task.id){
            this.setState({taskIsDeleted: true, isLoading: false})
        }else{
            task.fromShare = true
            task.applies = this.state.applies
            this.setState({ task, isLoading: false });
        }
    }

    async loadApplies(taskId){
        const applies = await this.applyListEndpoint(taskId)
        let {task} = this.state
        if(task){
            task.applies = applies
            this.setState({task, applies})
        }else{
            this.setState({applies})
        }
    }

    shareTask = async () => {
        const { task } = this.state
        let url = "";
        if(!task){
            url = BackendAPI.API_BASE + 'share-task';
        }else{
            url = BackendAPI.API_BASE + 'share-task?id=' + task.id;
        }
        await Share.share({
            title: strings["share_title"],
            message: url,
            url
        });
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getTasks,
}
export default connect(mapStateToProps, mapDispatchToProps)(TaskDetailsScreen);