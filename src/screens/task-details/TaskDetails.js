import React from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Share,
    Text,
    TouchableOpacity,
    View,
    Image,
    Alert,
    StyleSheet
} from 'react-native';
import * as Linking from 'expo-linking';
import {
    FontAwesome
} from "@expo/vector-icons";
import { connect } from 'react-redux';
import DialogInput from 'react-native-dialog-input';
import moment from "moment";
import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
// import Toast from "../../../components/MyToast";
import TaskView from "./task-components/TaskView";
import CustomerView from "./task-components/CustomerView";
import SeparatorView from "./task-components/SeparatorView";
import ApplyView from "./task-components/ApplyView";
import PerformerView from "./task-components/PerformerView";
import ConfirmView from "./task-components/ConfirmView";
import ReviewView from "./task-components/ReviewView";
import strings from '../../utils/Strings';
import ApplyListView from './task-components/ApplyListView';
// import { withNavigation } from '@react-navigation/native';
// import { withNavigation } from 'react-navigation';
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
    EMPLOYER: 'employer',
    PERFORMERS: 'performers'
}

class TaskDetails extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            applyInProgress: false,
            task: this.props.task,
            isDialogVisible: false,
            myApply: null,
            reviews: [],
            reviewListType: REVIEW_TYPE.PERFORMERS,
            isHebrew: false
        }

        this.api = new BackendAPI(this);
        this.applyForTaskEndpoint = this.api.getApplyForTaskEndpoint();
        this.createDialogEndpoint = this.api.getCreateDialogEndpoint();
        this.acceptTaskEndpoint = this.api.getAcceptTaskEndpoint();
        this.refuseTaskEndpoint = this.api.getRefuseTaskEndpoint();
        this.removeApplyFromTaskEndpoint = this.api.getRemoveApplyForTaskEndpoint();
        this.remindApplyEndpoint = this.api.getRemindAboutApplyEndpoint();
        this.applyEndpoint = this.api.getApplyEndpoint();
        this.removeApplyEndpoint = this.api.getRemoveApplyEndpoint();
        this.confirmDenyApplyEndpoint = this.api.getConfirmDenyApplyEndpoint();
    }

    componentDidMount(){
        let {applies} = this.props.task
        const profile = this.props.userProfile;
        if(applies){
            let myApply = applies.find(item => item.user.id === profile.id)
            if(myApply){
                this.setState({myApply})
            }
        }

        this.loadReviews();
        this.setLang();
    }

    loadReviews = async () => {
        const reviews = await BackendAPI.loadReviewsForTask(this.state.task.id);
        this.setState({reviews});
    }

    setLang = async () => {
        const lang = await settings.getLanguage();
        this.setState({isHebrew: lang === 'he'});
    }

    componentWillReceiveProps(nextProps){
        let {applies} = nextProps.task
        const profile = this.props.userProfile;
        if(applies){
            let myApply = applies.find(item => item.user.id === profile.id)
            if(myApply){
                this.setState({myApply, task: {
                    ...this.state.task,
                    applies: applies
                }})
            }
        }
    }

    render(){
        return(
            <View style={{flex: 1}}>
                <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 56}}>
                    <View style={{paddingBottom: 0}}>
                        <TaskView task={this.state.task} applyWithCustomPrice={this.applyWithCustomPrice}/>
                        <SeparatorView/>

                        {this.renderPerformerView()}

                        <CustomerView 
                            customer={this.props.task.creator} 
                            onShowProfile={user => this.props.openUserProfile(user.id)} 
                            askQuestion={() => this.startDialog()}/>
                        
                        {this.renderReviewsSection()}
                        
                        {/* <SeparatorView/>
                        <ReviewView title="Reviews" editable={true}/> */}
                    </View>
                    
                </ScrollView>

                {this.renderApplyAction()}

            </View>
            
        )
    }

    renderReviewsSection(){
        let {reviewListType, reviews, task} = this.state
        const now = moment()
        const taskStartDate = moment(task.date_begin);
        taskStartDate.add(6, 'hours');
        if(now.isBefore(taskStartDate)) return null;

        let listDescription = reviewListType === REVIEW_TYPE.PERFORMERS? strings["task_view_reviews_performers_description_"]: strings["task_view_reviews_employer_description"]
        let reviewViewList = []
        if(reviewListType === REVIEW_TYPE.PERFORMERS){
            let reviewsToRender = reviews.filter(item => item.author.id !== task.creator.id)
            reviewViewList = this.renderPerformerReviewItems(reviewsToRender)

        }else{
            let reviewsToRender = reviews.filter(item => item.author.id === task.creator.id)
            reviewViewList = this.renderEmployerReviewItems(reviewsToRender)
        }
        const profile = this.props.userProfile;
        const hasReviewFromEmployer = reviews.some(item => profile.id === item.recipient.id)
        const hasReviewFromPerformer = reviews.some(item => profile.id === item.author.id)
        const shouldRenderLeaveAction = hasReviewFromEmployer && !hasReviewFromPerformer

        return (
            <View>
                <SeparatorView/>
                <View style={{backgroundColor: 'white', padding: 24,}}>
                    <View style={{flexDirection: 'column', alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}}>
                        <Text style={styles.reviewTitle}>{strings["task_view_reviews_title"]}</Text>
                        {this.renderReviewListTypeSwitch()}
                        <View style={{marginBottom: 6}}>
                            <Text style={{color: 'rgba(66, 67, 106, 0.65)', fontSize: 12}}>{listDescription}</Text>
                        </View>
                        {reviewViewList}
                    </View>
                    {shouldRenderLeaveAction? this.renderLeaveReviewForCustomerAction(): null}
                </View>
            </View>
        )

    }

    renderPerformerReviewItems(itemList){
        return itemList.map(item => {
            return (
                <View key={item.id.toString()} style={{marginVertical: 10}}>
                    <ReviewItem isHebrew={this.state.isHebrew} review={item}/>
                </View>
            )
        })
    }

    renderEmployerReviewItems(itemList){
        return itemList.map(item => {
            return (
                <View key={item.id.toString()} style={{marginVertical: 10}}>
                    <ReviewForUserItem isHebrew={this.state.isHebrew} review={item}/>
                </View>
            )
        })
    }

    renderReviewListTypeSwitch(){
        let {reviewListType} = this.state
        return(
            <View style={{alignItems: this.state.isHebrew? 'flex-end': 'flex-start'}}>
                <View style={styles.switchContainer}>
                    <TouchableOpacity onPress={() => this.setState({reviewListType: REVIEW_TYPE.PERFORMERS})}>
                        <View style={[styles.reviewSwitchButtonContainer, 
                            reviewListType === REVIEW_TYPE.PERFORMERS? styles.reviewSwitchButtonContainer_selected: {}]}>
                            <Text style={[styles.reviewSwitchButtonText, 
                                reviewListType === REVIEW_TYPE.PERFORMERS? styles.reviewSwitchButtonText_selected: {}]}>
                                {strings["task_view_reviews_performers"]}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setState({reviewListType: REVIEW_TYPE.EMPLOYER})}>
                        <View style={[styles.reviewSwitchButtonContainer, 
                        reviewListType === REVIEW_TYPE.EMPLOYER? styles.reviewSwitchButtonContainer_selected: {}]}>
                            <Text style={[styles.reviewSwitchButtonText,
                            reviewListType === REVIEW_TYPE.EMPLOYER? styles.reviewSwitchButtonText_selected: {}]}>
                                {strings["task_view_reviews_employer"]}
                            </Text>
                        </View>
                    </TouchableOpacity>
                         
                </View>
            </View>
            
        )
    }

    //! Deprecated
    renderReviews(){

        // 1. Check if I'm assigned performer
        // 2. Check if start date is passed
        // 3. Render My review or form
        // 4. Render customer review if it exists

        const profile = this.props.userProfile;
        if(profile == null) return;

        let {task} = this.props
        let iAmAssignedPerformer =  task.assigned_performers? task.assigned_performers.some(user => user.id === profile.id): false;
        let taskDate = moment(task.date_begin);
        taskDate.hours(task.time_begin.split(':')[0]);
        taskDate.minutes(task.time_begin.split(':')[1]);
        let startDatePassed = taskDate.unix() < moment().unix();
        if(iAmAssignedPerformer && startDatePassed){

            let items = []
            
            let customerReview = task.customer_reviews.find(r => r.for_performer.id === profile.id)
            if(customerReview){
                items.push(
                    <View>
                        <SeparatorView/>
                        <ReviewView title={strings["customer_rating"]} editable={false} rating={customerReview.rating}/>
                    </View>
                )
            }
            
            let performerReview = task.performer_reviews.find(r => r.performer.id === profile.id);
            if(performerReview){
                items.push(
                    <View>
                        <SeparatorView/>
                        <ReviewView title={strings["your_rating"]} editable={false} rating={performerReview.rating}/>
                    </View>
                )
            }else{
                items.push(
                    <View>
                        <SeparatorView/>
                        <ReviewView title={strings["rate_customer"]} editable={true} customer_id={this.props.task.creator.id} taskId={this.props.task.id}/>
                    </View>
                )
            }

            items.push(<SeparatorView/>);
            
            return items;
        }

    }

    renderPerformerView(){
        const profile = this.props.userProfile;
        if(profile == null) return;
        if(this.state.myApply !== null && (this.state.myApply.status === 'new' || this.state.myApply.status === 'seen')){
            return [
                <ApplyView key={"apply_view"} 
                    applicant={profile} 
                    payType={this.state.task.pay_type}
                    apply={{...this.state.myApply, user: profile}} 
                    onCancelPress={this.onRemoveApplyClick} 
                    onRemindPress={this.onRemindPress}/>, 
                <SeparatorView key={"apply_view_separator"}/>]
        }

        if(this.state.myApply !== null && this.state.myApply.status === 'pending'){
            return [
                <ConfirmView key={"confirm_view"} onConfirmPress={() => this.acceptTask()} onRefusePress={() => this.refuseTask()}/>, 
                <SeparatorView key={"confirm_view_separator"}/>]
        }

        if(this.state.myApply !== null && this.state.myApply.status === 'assigned'){
            return [
            <PerformerView key={"performer_view"} performer={this.state.myApply.user} task={this.props.task}/>, 
            <SeparatorView key={"performer_view_separator"}/>]
        }
    }

    renderApplyAction(){
        const profile = this.props.userProfile;
        if(profile == null) return;
        if(this.state.reviews.length > 0) return
        if(!this.state.myApply && !this.props.task.completed){
            return this.state.applyInProgress? this.renderProgressItem(): this.renderApplyButton();
        }
    }

    renderApplyButton(){
        return(
            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0
            }}>
                
                <View style={{backgroundColor: '#3B5998', height: 56}}>
                    <TouchableOpacity style={{flex: 1, justifyContent: 'center'}} onPress={() => this.applyForTask()}>
                        <Text style={{color: 'white', fontSize: 16, textAlign: 'center', }}>{strings["apply"]}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderProgressItem(){
        return(
            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                backgroundColor: '#3B5998'
            }}>
                <ActivityIndicator size="large" color="white" />
            </View>
            // [<View key="container" style={{ 
            //     backgroundColor: 'white',
            //     paddingTop: 30,
            //     paddingBottom: 30,
            //     alignItems: 'center'}}>
                    
            //     <ActivityIndicator size="large" color="#3B5998" />
            //     {/* <Text style={{color: "rgba(66, 67, 106, 0.76)", marginTop: 10}}>Минуточку ...</Text> */}

            // </View>,
            // <SeparatorView key="loader-separator"/>
            // ]
        )
    }

    renderLeaveReviewForCustomerAction(){
        return(
            <View style={{marginVertical: 18, alignItems: 'center'}}>
                <View style={{
                    marginTop: 12,
                    alignItems: 'center'
                }}>
                        <TouchableOpacity style={{marginTop: 26}} onPress={this.handleLeaveReviewPress}>
                            <Text style={{
                                color: "#3B5998",
                                borderColor: "#3B5998",
                                borderWidth: 1,
                                borderRadius: 6,
                                paddingVertical: 10,
                                paddingHorizontal: 32,
                                fontSize: 12
                            }}>
                               {strings["task_view_leave_review_for_employer_button"]}
                            </Text>
                        </TouchableOpacity>
                    </View>
            </View>
        )
    }

    handleLeaveReviewPress = () => {
        this.props.navigation.navigate("Review", {
            users: [this.state.task.creator],
            taskID: this.state.task.id,
            reviewType: "Employer"
        })
    }

    onRemindPress = () => {
        if(this.state.myApply){
            this.remindApplyEndpoint(this.state.myApply.id);
        }
        
        Alert.alert(
            '',
            strings["apply_remind_description"],
            [{text: 'OK', onPress: () => {}}],
            {cancelable: true},
        );
    }

    onRemoveApplyClick = async (apply) => {
        let {task} = this.state;
        task.applies = []
        this.setState({task, myApply: null});

        const result = await this.removeApplyEndpoint({
            apply_id: apply.id
        })
    }

    acceptTask = async () => {
        let {task, myApply} = this.state;
        myApply.status = 'assigned'
        task.applies = [myApply]
        this.setState({task, myApply});

        // const result = await this.acceptTaskEndpoint({
        //     taskId: task.id
        // })

        this.confirmDenyApplyEndpoint({
            apply_id: myApply.id,
            action: 'confirm'
        })

        let dateTime = this.formatDateTime(this.props.task["date_begin"], this.props.task["time_begin"]);
        Alert.alert(
            strings["confirm_done_hint_title"],
            strings.formatString(strings["confirm_done_hint_description"], dateTime, this.props.task.address),
            [
              {text: strings["confirm_done_hint_open_map"], onPress: () => this.openMap()},
              {text: strings["ok"]},
            ],
            {cancelable: false},
        );

    }

    refuseTask = async () => {
        let {task, myApply} = this.state;
        myApply.status = 'refused'
        task.applies = [myApply]
        this.setState({task, myApply});

        this.confirmDenyApplyEndpoint({
            apply_id: myApply.id,
            action: 'refuse'
        })
    }   


    applyWithCustomPrice = () => {
        this.props.navigation.navigate("CustomPrice", {task: this.props.task, callback: this.submitApply})
    }

    submitApply = async (apply) => {
        this.setState({applyInProgress: true})
        const result = await this.applyEndpoint(apply)
        if(result['result'] === 'success'){
            let myApply = {
                ...apply,
                id: result['id'],
                task: this.state.task,
                user: this.props.userProfile,
                status: 'new'
            }
            this.setState({myApply,
                task: {
                    ...this.state.task,
                    applies: [myApply]
                },
                applyInProgress: false
            })
        }else{
            this.setState({applyInProgress: false})
            Alert.alert(
                '',
                strings["error02"],
                [{text: 'OK', onPress: () => {}}],
                {cancelable: true},
            );
        }
    }

    async applyForTask() {
        let apply = {
            task_id: this.state.task.id,
            price: 0
        }

        this.submitApply(apply)
    }

    async startDialog() {
        let {task} = this.state
        let userId =  typeof(task["creator"]) === 'number'? task["creator"] : task["creator"]["id"]
        this.props.openDialogWith(userId)
        return;
    }

    openMap() {
        const url = `https://waze.com/ul?q=${this.props.task["address"]}&navigate=yes`;
        Linking.openURL(url);
    }

    formatDateTime(date, time) {
        return moment(`${date} ${time}`).format("D MMMM, H:mm");
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
    userProfile: state.profileReducer,
})

//Map your action creators to your props.
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TaskDetails);

// export default withNavigation(TaskDetails);