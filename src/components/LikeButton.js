/**
 *  LikeButton.js
 *  Button for adding/removing tasks to favorite
 *  Created by Dmitry Chulkov 01/09/2019
 */
import React from 'react';
import {
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import icon from "../constant/Icons";
import strings from "../utils/Strings";
import { connect } from 'react-redux';
import {addTaskToFavoriteList, removeTaskFromFavoriteList} from '../redux/task-handlers';

class LikeButton extends React.Component{

    constructor(props){
        super(props);
        this.state = {}
        onLikePress = this.onLikePress.bind(this)
    }
    

    render(){
        let isLiked = this.props.favoriteTasks.find(task => task.id === this.props.task.id);
        return(
            <TouchableOpacity
                    style={{
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 8,
                        paddingBottom: 8,
                    }}
                    onPress={this.onLikePress}
                >
                    <Image 
                        source={isLiked? icon("heart-white"): icon("heart-outline-white")} 
                        style={{height: 24, width: 24, resizeMode: "contain"}}/>
            </TouchableOpacity>
        )
    }

    onLikePress = () => {
        let inFavorite = this.props.favoriteTasks.find(task => task.id === this.props.task.id);
        let message = "";
        if(inFavorite){
            this.props.removeTaskFromFavoriteList(this.props.task.id);
            message = strings["favorite_task_removed"];
        }else{
            this.props.addTaskToFavoriteList(this.props.task);
            message =  strings["favorite_task_added"];
        }

        Alert.alert(
            '',
            message,
            [{text: 'OK', onPress: () => {}},],
            {cancelable: true},
          );
       
    }
}

const mapStateToProps = state => ({
    favoriteTasks: state.taskReducer.favoriteTasks,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    addTaskToFavoriteList,
    removeTaskFromFavoriteList
}

export default  connect(mapStateToProps, mapDispatchToProps) (LikeButton)