import React from 'react';
import {
    View,
    ScrollView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TouchableHighlight,
    TextInput,
    Switch,
    Platform
} from 'react-native';
import Avatar from './Avatar';
import Rating from './Rating';
import strings from '../utils/Strings';
import icon from "../constant/Icons";

const styles = StyleSheet.create({
    authorName: {
        color: "#42436A",
        fontSize: 14,
        fontWeight: '600'
    },
    authorRole: {
        color: "rgba(66, 67, 106, 0.86)",
        fontSize: 12
    },
    reviewText: {
        color: "rgba(66, 67, 106, 0.86)",
        fontSize: 14
    },
    personalQuality: {
        color: "rgba(66, 67, 106, 1)",
        borderColor: "rgba(66, 67, 106, 0.86)",
        borderWidth: 1,
        borderRadius: 24,
        fontSize: 12,
        paddingVertical: 3,
        paddingHorizontal: 12,
        marginVertical: 2,
        marginHorizontal: 2,
    },
    moderationLabelContainer: {
        marginVertical: 4,
        borderRadius: 4,
        backgroundColor: "rgba(66, 67, 106, 0.16)",
        paddingVertical: 4, 
        paddingHorizontal: 8
    },
    moderationLabelText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.36)'
    }
})

export default class ReviewForUserItem extends React.PureComponent {

    render(){
        let {isHebrew, review} = this.props
        let flexDirectionRow = isHebrew? 'row-reverse': 'row';
        let alignItemsColumn = isHebrew? 'flex-end': 'flex-start';
        let authorRole = strings.getRole(review.author_role);
        if(review.author_role === "Performer" && review.author.category !== null){
            authorRole = strings.getCategory(review.author.category.name)
        }

        let recipientRole = strings.getRole(review.recipient_role);
        if(review.recipient_role === "Performer" && review.recipient.category !== null){
            recipientRole = strings.getCategory(review.recipient.category.name)
        }
        let arrowName = isHebrew? "arrow-left": "arrow-right"
        return(
            <View>
                {/* <View style={{flexDirection: flexDirectionRow, justifyContent: 'flex-start', alignItems: 'center'}}>
                        <Avatar size={40} src={review.recipient.avatar}/>
                        <View style={{marginHorizontal: 16, alignItems: alignItemsColumn}}>
                            <Text style={styles.authorName}>{review.recipient.first_name} {review.recipient.last_name}</Text>
                            <Text style={styles.authorRole}>{recipientRole}</Text>
                        </View>
                    </View> */}

                {this.renderModerationLabel()}

                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

                    <View style={{flexDirection: flexDirectionRow, justifyContent: 'flex-start', alignItems: 'center'}}>
                        <Avatar size={40} src={review.author.avatar}/>
                        <View style={{marginHorizontal: 6, alignItems: alignItemsColumn}}>
                            <Text style={styles.authorName}>{review.author.first_name} {review.author.last_name}</Text>
                            <Text style={styles.authorRole}>{authorRole}</Text>
                        </View>
                    </View>

                    <Image source={icon(arrowName)} style={{height: 18, width: 18, marginHorizontal: 8}}/>

                    <View style={{flexDirection: flexDirectionRow, justifyContent: 'flex-start', alignItems: 'center'}}>
                        <Avatar size={40} src={review.recipient.avatar}/>
                        <View style={{marginHorizontal: 6, alignItems: alignItemsColumn}}>
                            <Text style={styles.authorName}>{review.recipient.first_name} {review.recipient.last_name}</Text>
                            <Text style={styles.authorRole}>{recipientRole}</Text>
                        </View>
                    </View>

                </View>
                


                <View style={{marginVertical: 6}}>
                    <Rating value={review.rating} style={{flexDirection: flexDirectionRow}}/>
                </View>
                <View>
                <Text style={[styles.reviewText, {textAlign: isHebrew? 'right': 'left'}]}>{review.text}</Text>
                </View>
                <View style={{flexDirection: flexDirectionRow, flexWrap: 'wrap', marginTop: 4}}>
                    {this.renderQualities()}
                </View>

            </View>
        )
    }

    renderModerationLabel(){
        if(this.props.review.status === 'pending'){
            return (
                <View style={{alignItems: this.props.isHebrew? 'flex-end': 'flex-start'}}>
                    <View style={styles.moderationLabelContainer}>
                        <Text style={styles.moderationLabelText}>{strings["review_item_moderation_label"]}</Text>
                    </View>
                </View>
                
            )
        }
        return null
    }

    renderQualities(){
        let {recipient_qualities} = this.props.review;
        if(recipient_qualities === null || recipient_qualities === '') return;
        let items = this.props.review.recipient_qualities.split(" ,")
        return items.map(item => (
            <Text key={item} style={styles.personalQuality}>{item}</Text>
        ))
    }

}