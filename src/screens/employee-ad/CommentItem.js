/**
 *  CommentItem.js
 *  
 */
import React from 'react';
import {
    Image,
    FlatList,
    Text,
    View,
    Platform,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import moment from 'moment';
import Avatar from '../../components/Avatar';
import Color from '../../constant/Color';


const styles = StyleSheet.create({
    username: {
        fontWeight:'bold',
        fontSize: 12,
        color: '#42436A'
    },
    date: {
        fontSize: 12,
        color: Color.secondaryText
    },
    text: {
        color: Color.primaryText,
        fontSize: 14
    },
})

export default class CommentItem extends React.PureComponent {

    render(){
        let { isHebrew, comment } = this.props;
        return(
            <View style={{flexDirection: isHebrew? "row-reverse": "row", paddingHorizontal: 12, paddingVertical: 12}}>
                <TouchableOpacity onPress={() => this.props.openProfile(comment.author.id)}>
                    <Avatar src={comment.author.avatar} size={24} style={{ marginRight: isHebrew? 0: 8, marginLeft: isHebrew? 8: 0}}/>
                </TouchableOpacity>
                <View style={{flex: 1, alignItems: isHebrew?'flex-end': 'flex-start'}}>
                    <Text style={styles.username}>{`${comment.author.first_name} ${comment.author.last_name}`}</Text>
                    <Text style={styles.text}>{comment.text}</Text>
                    <Text style={styles.date}>{moment(comment.timestamp).fromNow()}</Text>
                </View>
            </View>
        )
    }
}