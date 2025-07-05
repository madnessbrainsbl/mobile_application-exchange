import React from 'react';
import {
    Modal,
    SafeAreaView,
    Share,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    View,
    Image,
    Alert,
    Platform,
    ScrollView
} from 'react-native';
import { Linking } from 'expo';
import {
    FontAwesome
} from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import moment from "moment";
import { connect } from 'react-redux';
// import { withNavigation } from '@react-navigation/native';

import BackendAPI from "../../../backend/BackendAPI";
// import Toast from "../../../components/MyToast";
import TaskView from "./task-components/TaskView";
import SeparatorView from "./task-components/SeparatorView";
import ApplyDialog from "./task-components/ApplyDialog";
import ApplyView from "./task-components/ApplyView";
import PerformerView from "./task-components/PerformerView";
import ConfirmView from "./task-components/ConfirmView";
import ApplyListView from './task-components/ApplyListView';
import RefusedApplicantListView from './task-components/RefusedApplicantListView';
import PendingAppliesListView from "./task-components/PendingAppliesListView";
import AssignedPerformersListView from "./task-components/AssignedPerformersListView";
import ReviewListView from "./task-components/ReviewListView";
import strings from '../../utils/Strings';
import settings from "../../../backend/Settings";
import Color from '../../constant/Color';
import ExtendAction from './task-components/ExtendAction';
import ReviewItem from '../../components/ReviewItem';
import ReviewForUserItem from '../../components/ReviewForUserItem';

const styles = StyleSheet.create({
    reviewTitle: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 6
    },
    switchContainer: {
        marginTop: 6, 
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 6
    },
    reviewSwitchButtonContainer:{
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'transparent'
    },
    reviewSwitchButtonContainer_selected: {
        backgroundColor: '#3B5998'
    },
    reviewSwitchButtonText: {
        color: 'rgba(0, 0, 0, 0.65)',
    },
    reviewSwitchButtonText_selected: {
        color: 'white',
    },
})

// Review types
const REVIEW_TYPE = {
    BY_ME: 'by me',
    FOR_ME: 'for me'
}

class TaskDetailsOwner extends React.Component{

    state = {
        task: this.props.task,
        index: 0,
        applyForMoreDialog: null,
        showExtendDialog: this.props.showExtendDialog? this.props.showExtendDialog: false,
        isHebrew: false,
        reviews: [],
        isLoadingReviews: false,
        reviewListType: REVIEW_TYPE.FOR_ME
    };

    api = new BackendAPI(this);
    createDialogEndpoint = this.api.getCreateDialogEndpoint();
    completeTaskEndpoint = this.api.getCompleteTaskEndpoint();
    refuseApplicantEndpoint = this.api.getRefuseApplicantEndpoint();

    manageApplyEndpoint = this.api.getApplyAction_TaskOwnerEndpoint();
    deleteApplyEndpoint = this.api.getDeleteApply_TaskOwnerEndpoint();
    editTaskEndpoint = this.api.getEditTaskEndpoint();

    componentDidMount(){
        this.setLang()
        this.loadReviews()
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({isHebrew: lang === 'he'});
    };

    loadReviews = async () => {
        this.setState({isLoadingReviews: true})
        const reviews = await BackendAPI.loadReviewsForTask(this.state.task.id)
        this.setState({reviews, isLoadingReviews: false})
    }

    render(){
        let assigned = []
        if(this.state.task.applies){
            assigned = this.state.task.applies.filter(apply => apply.status === 'assigned');
        }
        return(
            <View style={{flex: 1}}>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {!this.state.task.completed && this.state.showExtendDialog && 
                    [
                        <ExtendAction 
                            key={'extend-view'} 
                            isHebrew={this.state.isHebrew} 
                            accept={this.extendTask} 
                            refuse={() => this.setState({showExtendDialog: false})}/>,
                        <SeparatorView key={'separator-extend'}/>
                    ]}
                <TaskViewAndRatings 
                    task={this.state.task} 
                    onEditPress={task => this.props.editTask()}
                    onCompletePress={task => this.completeTask()}/>

                {this.renderReviewButtonOrList()}

                <SeparatorView/>

                {assigned && assigned.length > 0? 
                    <View>
                        <AssignedPerformersListView 
                            task={this.state.task} 
                            openDialog={user => this.props.openDialogWith(user.id)}
                            openProfile={user => this.props.openUserProfile(user.id)}
                            changeApply={this.changeApply}
                            removePerformer={this.removePerformer}
                            />
                        <SeparatorView key="1"/>
                    </View>
                    : null }
                <ApplyManagementView 
                    task={this.state.task}
                    onMorePressed={this.onMorePressed}
                    openDialog={user => this.props.openDialogWith(user.id)}
                    openProfile={user => this.props.openUserProfile(user.id)}
                    refuseApplicant={apply => this.refuseApplicatn(apply)}
                    changeApply={this.changeApply}/>
                {this.renderCompleteButton()}
                
            </View>
           

            </ScrollView>
            {this.renderMoreDialog()}
            </View>
            
            
        )
    }

    extendTask = async () => {
        let {task} = this.state
        let newStartDate = moment(task.date_begin).add(1,'days').format("YYYY-MM-DD")
        let newEndDate = null
        if(task.date_end){
            newEndDate = moment(task.date_end).add(1,'days').format("YYYY-MM-DD")
        }

        task.date_begin = newStartDate
        task.date_end = newEndDate
        this.setState({
            task,
            showExtendDialog: false
        })

        const result = await this.editTaskEndpoint({
            "id": this.state.task.id,
            "date_begin": newStartDate,
            "date_end": newEndDate,
        });

        this.props.updateTaskList()
    }

    changeApply = async (apply, status) => {
        let {task} = this.state
        let {applies} = task;
        let applyIndex = applies.findIndex(item => apply.id === item.id)
        task.applies[applyIndex].status = status

        this.setState({task}, this.forceUpdate());

        const result = await this.manageApplyEndpoint({
            'new_status': status,
            'apply_id': apply.id
        })

        console.log(result)
    }

    renderMoreDialog(){
        if(this.state.applyForMoreDialog){
            return (
                <ApplyDialog 
                    apply={this.state.applyForMoreDialog}
                    payType={this.state.task.pay_type}
                    close={() => this.setState({applyForMoreDialog: null})}/>)
        }

        return null
    }

    onMorePressed = (apply) => {
        this.setState({
            applyForMoreDialog: apply
        })
    }

    removePerformer = async (apply) => {
        let {task} = this.state
        let {applies} = task;
        let applyIndex = applies.findIndex(item => apply.id === item.id)
        applies.splice(applyIndex, 1)
        task.applies = applies

        this.setState({task}, this.forceUpdate())

        const result = await this.deleteApplyEndpoint({
            'apply_id': apply.id
        })

        console.log(result)
    }

    async refuseApplicatn(apply){
        let {task} = this.state
        let {applies} = task;
        let applyIndex = applies.findIndex(item => apply.id === item.id)
        applies.splice(applyIndex, 1)
        task.applies = applies

        // let {task} = this.state;
        // let {applicants} = task;
        // let index = applicants.indexOf(user);
        // applicants.splice(index, 1);
        // task.applicants = applicants;
        this.setState({task})

        const result = await this.deleteApplyEndpoint({
            'apply_id': apply.id
        })
        // const result = await this.refuseApplicantEndpoint({
        //     taskId: task.id,
        //     applicantId: user.id
        // }); 


        console.log(result);
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({task: nextProps.task})
    }

    async completeTask(){
        let {task} = this.state;
        const result = await this.completeTaskEndpoint(task.id);
        task.completed = true;
        this.setState({task}, () => {
            this.forceUpdate();
        })
       
    }


    renderReviewButtonOrList(){
        let {isLoadingReviews, reviews, reviewListType} = this.state
        if(isLoadingReviews) return
        if(!isLoadingReviews && reviews.length > 0){
            // Render reviews
            let reviewViewList = []
            let listDescription = reviewListType === REVIEW_TYPE.BY_ME? strings["task_view_reviews_by_me_description"]: strings["task_view_reviews_performers_description"]
            const profile = this.props.userProfile;
            if(reviewListType === REVIEW_TYPE.BY_ME){
                let reviewsToRender = reviews.filter(item => item.author.id === profile.id)
                reviewViewList = this.renderReviewsForUsers(reviewsToRender)
            }else{
                let reviewsToRender = reviews.filter(item => item.author.id !== profile.id)
                reviewViewList = this.renderReviewItems(reviewsToRender)
            }

            return (
                <View>
                    <SeparatorView/>
                    <View style={{backgroundColor: 'white', padding: 24, flexDirection: 'column', alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}}>
                        <Text style={styles.reviewTitle}>{strings["task_view_reviews_title"]}</Text>
                        {this.renderReviewListTypeSwitch()}
                        <View style={{marginBottom: 6}}>
                            <Text style={{color: 'rgba(66, 67, 106, 0.65)', fontSize: 12}}>{listDescription}</Text>
                        </View>
                        {reviewViewList}
                    </View>
                </View>
            )
        }else{
            // Render rerview button
            return this.renderLeaveReviewsButton()
        }
    }

    renderReviewListTypeSwitch(){
        let {reviewListType} = this.state
        return(
            <View style={{alignItems: 'flex-start'}}>
                <View style={styles.switchContainer}>
                    <TouchableOpacity onPress={() => this.setState({reviewListType: REVIEW_TYPE.FOR_ME})}>
                        <View style={[styles.reviewSwitchButtonContainer, 
                            reviewListType === REVIEW_TYPE.FOR_ME? styles.reviewSwitchButtonContainer_selected: {}]}>
                            <Text style={[styles.reviewSwitchButtonText, 
                                reviewListType === REVIEW_TYPE.FOR_ME? styles.reviewSwitchButtonText_selected: {}]}>
                                {strings["task_view_reviews_performers"]}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setState({reviewListType: REVIEW_TYPE.BY_ME})}>
                        <View style={[styles.reviewSwitchButtonContainer, 
                        reviewListType === REVIEW_TYPE.BY_ME? styles.reviewSwitchButtonContainer_selected: {}]}>
                            <Text style={[styles.reviewSwitchButtonText,
                            reviewListType === REVIEW_TYPE.BY_ME? styles.reviewSwitchButtonText_selected: {}]}>
                                {strings["task_view_reviews_by_me"]}
                            </Text>
                        </View>
                    </TouchableOpacity>
                         
                </View>
            </View>
            
        )
    }

    renderLeaveReviewsButton(){
        let {task} = this.state

        let taskDate = moment(`${task.date_begin} ${task.time_begin}`)
        taskDate.add(6, "hour");
        const now = moment();
        if(now.isAfter(taskDate)){
            return(
                <View>
                    <View style={{backgroundColor: '#3B5998', height: 56}}>
                        <TouchableOpacity style={{flex: 1, justifyContent: 'center'}} onPress={() => this._leaveReviewPressed()}>
                            <Text style={{color: 'white', fontSize: 16, textAlign: 'center', }}>{strings["task_view_leave_reviews"]}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }else{
            return null;
        }
    }

    renderReviewItems(itemList){
        return itemList.map(item => {
            return (
                <View key={item.id.toString()} style={{marginVertical: 10}}>
                    <ReviewItem isHebrew={this.state.isHebrew} review={item}/>
                </View>
            )
        })
    }

    renderReviewsForUsers(reviewList){
        return reviewList.map(item => {
            return (
                <View key={item.id.toString()} style={{marginVertical: 10}}>
                    <ReviewForUserItem isHebrew={this.state.isHebrew} review={item}/>
                </View>
            )
        })
    }

    _leaveReviewPressed = () => {
        this.props.navigation.navigate("ReviewUserSelector", {taskID: this.state.task.id})
    }

    renderCompleteButton(){
        const profile = this.props.userProfile;
        if(profile == null) return;
        if((this.state.task["creator"].id === profile.id) && !this.state.task.completed){
            return(
                <View>
                    <View style={{backgroundColor: Color.taskCompletedColor}}>
                        <View style={{ height: 50}}>
                            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}} onPress={() => this.completeTask()}>
                                <Text style={{color: 'white', fontSize: 18, textAlign: 'center', }}>{strings["task_view_complete_task"]}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <SeparatorView key="1"/>
                </View>
            )
        }
    }
}

class TaskViewAndRatings extends React.PureComponent{
    render(){
        return(
            <View>
                <TaskView 
                    task={this.props.task} 
                    onEditPress={task => this.props.onEditPress(task)}
                    onCompletePressed={task => this.props.onCompletePress(task)}/>
                {/* <SeparatorView/> */}
                {/* {this.props.task.assigned_performers? <ReviewListView task={this.props.task}/>: null} */}
                {/* <SeparatorView/> */}
            </View>
        )
    }
}

class ApplyManagementView extends React.Component{

    state = {
        task: this.props.task,
        applies: [],
        pending: [],
        refused: []
    }

    api = new BackendAPI(this);
    makeApplicantPerformerEndpoint = this.api.getMakeApplicantPerformerEndpoint();
    removePendingApplicantEndpoint = this.api.getRemovePendingApplicantEndpoint();
    remindToConfirmEndpoint = this.api.getRemindToConfirmEndpoint();

    componentDidMount(){
        let applies = []
        let pending = []
        let refused = []
        if(this.props.task.applies){
            applies = this.props.task.applies.filter(apply => apply.status === 'new' || apply.status === 'seen');
            pending = this.props.task.applies.filter(apply => apply.status === 'pending'),
            refused = this.props.task.applies.filter(apply => apply.status === 'refused')
        }

        this.setState({
            applies,
            pending,
            refused
        })
    }

    componentWillReceiveProps(nextProps){
        let {task} = nextProps;
        let applies = []
        let pending = []
        let refused = []
        if(task.applies){
            applies = task.applies.filter(apply => apply.status === 'new' || apply.status === 'seen');
            pending = task.applies.filter(apply => apply.status === 'pending'),
            refused = task.applies.filter(apply => apply.status === 'refused')
        }
        this.setState({
            task: nextProps.task,
            applies,
            pending,
            refused
        })
    }

    render(){
        return(
            <View>
                {this.state.applies && this.state.applies.length > 0?
                    <View>
                    <ApplyListView
                        key="apply_list" 
                        task={this.state.task}
                        applies={this.state.applies} 
                        payType={this.state.task.pay_type}
                        onMorePressed={this.props.onMorePressed}
                        onAssignPress={apply => this.setPerformer(apply)}
                        showProfilePress={applicant => this.props.openProfile(applicant)}
                        onChatPressed={applicant => this.props.openDialog(applicant)}
                        onRefuseApplicantPressed={apply => this.props.refuseApplicant(apply)}/>
                    <SeparatorView key="1"/>
                    </View>
                    : null
                }
                

                {(this.state.pending && this.state.pending.length > 0)?
                [<PendingAppliesListView 
                    key="pending_applies" 
                    task={this.state.task}
                    onCancelPress={this.props.refuseApplicant} 
                    applies={this.state.pending}
                    payType={this.state.task.pay_type}
                    showProfilePress={applicant => this.props.openProfile(applicant)}
                    onRemindPressed={this.onRemindPressed}
                    onChatPressed={applicant => this.props.openDialog(applicant)}/>,
                    <SeparatorView key="2"/>]
                : null}

                {(this.state.refused && this.state.refused.length > 0)?
                [<RefusedApplicantListView 
                    key="refused_applicants" 
                    applies={this.state.refused}
                    showProfilePress={applicant => this.props.openProfile(applicant)}
                    onChatPressed={applicant => this.props.openDialog(applicant)}/>, <SeparatorView key="3"/>]
                :null}
            </View>
        )
    }

    async setPerformer(apply) {
        this.props.changeApply(apply, 'pending')

        Alert.alert(
            '',
            strings["performer_assigne_hint"],
            [
              {text: strings["ok"]},
            ],
            {cancelable: false},
        );  
    }

    //! Deprecated
    async removePendingPerformer(applicant){
        let {task} = this.state;
        let pendingApplicantsList = task["pending_applicants"];
        let applicantIndex = pendingApplicantsList.indexOf(applicant);
        pendingApplicantsList.splice(applicantIndex, 1);
        task["pending_applicants"] = pendingApplicantsList;
        this.setState({task}, this.forceUpdate());

        const result = await this.removePendingApplicantEndpoint({
            taskId: task["id"],
            applicantId: applicant["id"]
        });

    }

    onRemindPressed = async (apply) => {
        await this.remindToConfirmEndpoint(apply.id);
        
        Alert.alert(
            '',
            strings["pending_apply_list_view_remind_message"],
            [{text: 'OK', onPress: () => {}}],
            {cancelable: true},
        );
    }

}

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer,
})

//Map your action creators to your props.
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TaskDetailsOwner);

// export default withNavigation(TaskDetailsOwner);