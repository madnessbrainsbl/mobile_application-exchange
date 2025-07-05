/**
 *  TasksCreatedScreen.js
 *  Success screen that is shown after task creation.
 * 
 *  Created by Dmitry Chulkov
 */
import React from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    Platform,
    Image
} from 'react-native';
import DoneImage from "../../assets/images/img_done.png";
import { CommonActions } from '@react-navigation/native';
import strings from "../../utils/Strings";
import { connect } from 'react-redux';
import { getTasks, getMyTasks } from '../../redux/task-handlers';

const style = StyleSheet.create({
    rootContainer:{
        backgroundColor: "#EFF0F4", 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    continueButtonContainer:{
        marginTop: 12,
        alignItems: 'center'
    },
    mainTitle:{
        color: "#42436A",
        fontSize: 26,
        fontWeight: "500",
        marginTop: 10
    },
    subtitle: {
        color: "rgba(66, 67, 106, 0.7)",
        fontSize: 20,
        textAlign: 'center',
        marginHorizontal: 20
    }

})

 class TaskCreatedSuccessScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "",
            headerRight: null,
            headerLeft: null
        };
    }

    componentDidMount(){
        this.props.getTasks(true);
        this.props.getMyTasks();
    }
    
    render(){
        return(
            <View style={{flex: 1}}>
                <View style={style.rootContainer}>

                    <View style={{alignItems: 'center'}}>
                        <Image source={DoneImage} style={{height: 100, width: 100}}/>
                        <Text style={style.mainTitle}>{strings["task_created_title"]}</Text>
                        <Text style={style.subtitle}>{strings.formatString(strings['viewer_count'], this.props.route.params?.userCount || 789)}</Text>
                    </View>

                    <View style={{alignItems: 'center', marginTop: 30}}>
                        <Text style={style.subtitle}>{strings["task_created_hint"]}</Text>
                    </View>

                    <View style={style.continueButtonContainer}>
                        <TouchableOpacity style={{padding: 8}} onPress={() => this.onContinuePress()}>
                            <Text style={{color: '#3B5998'}}>{strings["task_created_continue"]}</Text>
                        </TouchableOpacity>
                    </View>


                    {/* <View style={{marginTop: 28, alignItems: 'center'}}>
                        <Text style={style.mainTitle}>{strings["task_created_or"]}</Text>
                        <Text style={[style.subtitle, {}]}>{strings["task_created_pick_someone"]}</Text>
                        <View style={style.continueButtonContainer}>
                            <TouchableOpacity style={{padding: 8}} onPress={this.offerTaskPress}>
                                <Text style={{color: '#3B5998'}}>{strings["task_created_offer_task"]}</Text>
                            </TouchableOpacity>
                        </View>
                       
                    </View> */}
                    
                </View>

            </View>
        )
    }

    offerTaskPress = () => {
        this.props.navigation.dispatch(
            StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'PerformersList' })],
            })
        );
    }

    onContinuePress(){
        this.props.navigation.pop(2);
    }

    onDonePressed = () => {
        this.props.getTasks(false);
        this.props.getMyTasks(false);
        this.props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTaskList' }]
            })
        );
    };
}

const mapStateToProps = state => ({
})


const mapDispatchToProps = {
    getTasks,
    getMyTasks
}

export default connect(mapStateToProps, mapDispatchToProps) (TaskCreatedSuccessScreen);