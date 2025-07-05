
/**
 *  MyTasksScreen.js
 *  Screen with user tasks: which he created and which he was assigned to
 * 
 *  Created by Dmitry Chulkov 03/10/2019
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
import BackendAPI from "../../../backend/BackendAPI";
import MyToast from "../../components/MyToast";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import icon from "../../constant/Icons";
import TaskCardItem from "../../components/TaskCardItem";
import moment from "moment";

import DynamicFilterIcon from "../../components/DynamicFilterIcon";
import EmptyListView from "../../components/EmptyListView";
import Color from '../../constant/Color';

import { connect } from 'react-redux';
import { getMyTasks, getAssignedTasks} from '../../redux/task-handlers';

class MyTasksScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["my_tasks"],
            headerStyle: {
                backgroundColor: Color.primary,
                elevation: 0,
                borderBottomWidth: 0,
            },
            // headerLeft: (
            //     <BurgerButton openDrawer={() => navigation.openDrawer()}/>
            // ),
            headerRight: (
                <TouchableOpacity
                    style={{
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 8,
                        paddingBottom: 8,
                        marginLeft: 6}}
                    onPress={() => navigation.navigate("CreateTask", {prev: true})}>
                    <Image source={icon("add")}/>
                </TouchableOpacity>
            )
          };
    }

    api = new BackendAPI(this);
    getMyTasksEndpoint = this.api.getMyTasksEndpoint();
    getAppointedTasksEndpoint = this.api.getAppointedTasksEndpoint();
    createDialogEndpoint = this.api.getCreateDialogEndpoint();


    state = {
        isHebrew: false,
        index: 0,
        routes: [
            {key: 'i_am_employee', title: strings["i_am_employee"]},
            {key: 'i_am_employer', title: strings["i_am_employer"]},
        ],
    };

    componentDidMount(){
        this.props.getAssignedTasks();
        this.props.getMyTasks();
    }

    render(){
        const profile = this.props.userProfile;
        if(profile.account_type === 'creator'){
            return this.renderEmployerLayout();
        }else{
            return this.renderPerformerLayout();
        }

        // return(
        //     <View style={{flex: 1, backgroundColor: "white"}}>
        //         <TabView
        //             navigationState={this.state}
        //             style={{flex: 1}}
        //             renderScene={({route}) => {
        //                 switch(route.key){
        //                     case 'i_am_employer':
        //                         return <SectionView 
        //                                 title={route.title}  
        //                                 taskList={this.props.myTasks}
        //                                 openTask={task => this.openTask(task)}
        //                                 startDialog={task => this.startDialog(task)}/>;
        //                     case 'i_am_employee':
        //                         return <SectionView 
        //                                 title={route.title}  
        //                                 taskList={this.props.assignedTasks}
        //                                 openTask={task => this.openTask(task)}
        //                                 startDialog={task => this.startDialog(task)}/>;
        //                     default:
        //                         return null;
                            
        //                 }
        //             }}
        //             onIndexChange={index => this.setState({ index })}
        //             initialLayout={{ width: Dimensions.get('window').width }}
        //             renderTabBar={props =>
        //                 <TabBar
        //                   {...props}
        //                   indicatorStyle={{ backgroundColor: 'white' }}
        //                   style={{ backgroundColor: Color.primary }}
        //                 />
        //               }
        //         />
        //     </View>
        // )
    }

    renderEmployerLayout(){
        return <SectionView 
                    title={""}  
                    taskList={this.props.myTasks}
                    openTask={task => this.openTask(task)}
                    startDialog={task => this.startDialog(task)}/>
    }

    renderPerformerLayout(){
        console.log("Performet layout")
        console.log(this.props.assignedTasks)
        return <SectionView 
                title={""}  
                taskList={this.props.assignedTasks}
                openTask={task => this.openTask(task)}
                startDialog={task => this.startDialog(task)}/>
    }

    openTask(task) {
        this.props.navigation.navigate("TaskDetails", {task})
    }

    startDialog = async(task) => {
        const profile = this.props.userProfile;
        if (!profile) {
            MyToast.show(strings["auth_required02"]);
            return;
        }

        const result = await this.createDialogEndpoint({
            userId: task.creator.id,
        }, {
            before: false,
            after: false,
        });

        if (result["dialog_id"]) {
            MyToast.show(strings["dialog_created"]);
            this.props.navigation.navigate("Dialog", {dialogId: result["dialog_id"]})
        } else if (result[0] && result[0]["id"]) {
            const dialog = result[0];

            MyToast.show(strings["dialog_return"]);
            this.props.navigation.navigate("Dialog", {dialogId: dialog["id"]})
        } else if (result[0]) {
            MyToast.show(result[0]);
        } else {
            MyToast.show(strings["dialog_error"]);
        }
    };
}

class SectionView extends React.PureComponent{

    state = {
        isHebrew: false
    }

    componentDidMount = () => {
        this.setLang();
    };

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    render(){
        this.profile = this.props.userProfile;
        let activeTasks = [];
        let outOfDateTasks = [];
        this.props.taskList.active.forEach(task => {
            let startTime = moment(task["date_begin"] + " " + task["time_begin"])
            if( startTime.isBefore(moment())){
                outOfDateTasks.push(task)
            }else{
                activeTasks.push(task)
            }
        })
        let sections = [{
            title: strings["active_tasks"],
            data: activeTasks
        },{
            title: strings["out_of_date"],
            data: outOfDateTasks
        },{
            title: strings["completed_tasks"],
            data: this.props.taskList.completed
        }]
        return(
            <View style={{flex: 1}}>
                <SectionList
                    style={{flex: 1}}
                    sections={sections}
                    keyExtractor={(item, index) => item.id + ""}
                    ListEmptyComponent={
                        <View style={{height: Dimensions.get('window').height - 140, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{color: "rgba(0, 0, 0, 0.36)"}}>{strings["no_tasks_msg"]}</Text>
                        </View>
                    }
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderHeader}
                    renderSectionFooter={this.renderNoContent}
                      />
                    
            </View>
        )
    }

    renderNoContent = ({section}) => {
        if(section.data.length === 0){
            return (<View style={{height: 100, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: "rgba(0, 0, 0, 0.36)"}}>{strings["no_tasks_msg"]}</Text>
        </View>)
        }

        return null;
    }

    renderHeader = ({ section: { title } }) => (
        <View style={{backgroundColor: "white"}}>
            <Text style={{
                fontWeight: 'bold', 
                fontSize: 22, 
                marginTop: 16, 
                marginBottom: 8,
                color: "#42436A",
                marginStart: 16}}>{title}</Text>
        </View>
        
    )

    renderItem = ({item}) => (
        <TaskCardItem 
            key={item.id}
            task={item} 
            isHebrew={this.state.isHebrew}
            userProfile={this.profile}
            onMorePress={item => this.props.openTask(item)}
            onQuestionPress={item => this.props.startDialog(item)}
            />
    )
}

const mapStateToProps = state => ({
    myTasks: state.taskReducer.myTasks,
    assignedTasks: state.taskReducer.assignedTasks,
    userProfile: state.profileReducer
})


const mapDispatchToProps = {
    getMyTasks,
    getAssignedTasks
}

export default connect(mapStateToProps, mapDispatchToProps)(MyTasksScreen);