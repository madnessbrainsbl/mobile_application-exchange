import React from 'react';
import {
    FlatList,
    Platform,
} from 'react-native';
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import TaskCardItem from "../../components/TaskCardItem";
import EmptyListView from "../../components/EmptyListView";

import { connect } from 'react-redux';
import { getFavoriteTasks } from '../../redux/task-handlers';


const isIOS = Platform.OS === 'ios';

class FavoriteTasks extends React.PureComponent {
    
    state = {
        isHebrew: false
    }

    componentDidMount() {
        this.setLang();
        this.props.getFavoriteTasks();
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    refresh = () => {
        this.props.getFavoriteTasks();
    }

    render(){
        const profile = this.props.userProfile;
        return(
            <FlatList
                style={{ flex: 1, backgroundColor: "#f9f9f9",}}
                onRefresh={() => setTimeout(() => { this.refresh() }, 200) }
                refreshing={false}
                data={this.props.favoriteTasks}
                removeClippedSubviews={false}
                ListEmptyComponent={(!this.props.loading)?<EmptyListView title={strings["no_tasks"]}/>: null}
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={({item}) => (
                    <TaskCardItem
                    key={item.id.toString()} 
                    task={item} 
                    isHebrew={this.state.isHebrew}
                    userProfile={profile}
                    onMorePress={this.props.openTask}
                    onQuestionPress={this.props.startDialog}
                    onApplyPress={this.props.applyForTask}/>
                    )}
            />
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteTasks);