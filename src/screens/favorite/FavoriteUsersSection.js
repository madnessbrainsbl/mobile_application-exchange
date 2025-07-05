/**
 *  FavoriteUsersSection.js
 *  Displays favorite user list
 *  
 *  Created by Dmitry Chulkov 13/10/2019
 */
import React from 'react';
import {
    Image,
    FlatList,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    TouchableWithoutFeedback,
    StyleSheet,
} from 'react-native';
import Avatar from "../../components/Avatar";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import icon from "../../constant/Icons";

import EmptyListView from "../../components/EmptyListView";
import Color from '../../constant/Color';

import { connect } from 'react-redux';
import { getFavoriteUsers } from '../../redux/favorite-users-handlers';

const styles = StyleSheet.create({
    name: {
        color: '#42436A',
        fontSize: 16,
        fontWeight: '500',
    },
    category: {
        color: 'rgba(66, 67, 106, 0.86)',
        fontSize: 14,
    },
    separator: {
        backgroundColor: 'rgba(66, 67, 106, 0.16)',
        height: 1
    }
})

class FavoriteUsers extends React.Component {
    
    state = {
        isHebrew: false,
    }

    componentDidMount = () => {
        this.setLang();
        this.props.getFavoriteUsers()
    };

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
                // onRefresh={() => setTimeout(() => { this.refresh() }, 200) }
                // refreshing={this.props.loading}
                data={this.props.userList}
                removeClippedSubviews={false}
                ListEmptyComponent={(!this.props.loading)?<EmptyListView title={strings["favorite_users_empty"]}/>: null}
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={this.renderUser}
            />
        )
    }

    renderUser = ({item}) => {
        let direction = strings[item.account_type]
        if(item.category){
            console.log
            direction = strings.getCategory(item.category.name)
        }
        return(
            <TouchableOpacity onPress={() => this.props.onUserPress(item)}>
                <View style={{marginVertical: 16, marginHorizontal: 24}}>
                    <View style={{flexDirection: this.state.isHebrew? 'row-reverse' :'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse': 'row', alignItems: 'center'}}>
                            <Avatar size={40} src={item.avatar}/>
                            <View style={{marginHorizontal: 20}}>
                                <Text style={styles.name}>{`${item.first_name} ${item.last_name}`}</Text>
                                <Text style={styles.category}>{direction}</Text>
                            </View>
                        </View>

                        <Image source={this.state.isHebrew? icon("chevron-left"): icon("chevron-right")} style={{height: 24, width: 24}}/>
                    </View>
                </View>
                <View style={[styles.separator, {marginStart: 24}]}/>
            </TouchableOpacity>
        )
    }
}

const mapStateToProps = state => ({
    userList: state.favoriteUserReducer.users,
    loading: state.favoriteUserReducer.loading,
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getFavoriteUsers,
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteUsers);