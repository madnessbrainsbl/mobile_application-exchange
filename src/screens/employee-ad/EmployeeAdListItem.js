/**
 *  EmployeeAdListItem.js
 *  Item for employee ad list screen
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
    Alert
} from 'react-native';
import moment from 'moment';
import Avatar from '../../components/Avatar';
import Color from '../../constant/Color';
import strings from '../../utils/Strings';

const styles = StyleSheet.create({
    username: {
        fontWeight:'bold',
        fontSize: 14,
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
    comments: {
        fontSize: 12,
        color: Color.primary
    },
    more: {
        color: '#3B5998'
    }
})

const MAX_LENGTH = 270;

export default class EmployeeAdListItem extends React.Component {

    render(){
        let { isHebrew, ad } = this.props;
        let showMore = ad.text.length > MAX_LENGTH;
        return(
            <TouchableOpacity onPress={() => this.props.onPress(this.props.ad)}>
            <View style={{paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white'}}>
                <View style={{flexDirection: isHebrew? 'row-reverse': 'row', marginBottom: 8}}> 
                    <Avatar
                        src={ad.author.avatar}
                        size={36} 
                        style={{
                            marginRight: isHebrew? 0: 8,
                            marginLeft: isHebrew? 8: 0,
                        }}/>
                    <View style={{alignItems: isHebrew? 'flex-end': 'flex-start'}}>
                        <Text style={styles.username}>{`${ad.author.first_name} ${ad.author.last_name}`}</Text>
                        <Text style={styles.date}>{moment(ad.timestamp).fromNow()}</Text>
                    </View>
                </View>
                {
                    showMore? 
                    <Text style={{textAlign: isHebrew? 'right': 'left'}}>
                        <Text style={styles.text}>{ad.text.substr(0, MAX_LENGTH)} ... </Text>
                        <Text style={styles.more}>{strings["employee_ad_show_more"]}</Text>
                    </Text>
                    : <Text style={[styles.text, {textAlign: isHebrew? 'right': 'left'}]}>{ad.text}</Text>
                }
                     
                    <View style={{marginTop: 8, flex: 1, alignItems: isHebrew? 'flex-start':'flex-end'}}>
                        <View style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: Color.primary,
                            borderStyle: 'solid'
                        }}>
                            <Text style={styles.comments}>
                                {ad.comment_count > 0?
                                strings.formatString(strings["employee_ad_comments_with_counter"], ad.comment_count)
                                : strings["employee_ad_comments"]}
                            </Text>
                        </View>
                    </View>
            </View>
            </TouchableOpacity>
        )
    }
}