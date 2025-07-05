import React from 'react';
import {
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Image
} from 'react-native';
import Avatar from '../../../components/Avatar';
import Rating from "../../../components/Rating";
import moment from "moment";
import settings from "../../../../backend/Settings";
import BackendAPI from "../../../../backend/BackendAPI";
import strings from "../../../utils/Strings";

import icon from '../../../constant/Icons';

const style = StyleSheet.create({
    container:{
        paddingTop: 16,
        paddingBottom: 16,
        paddingStart: 24,
        paddingEnd: 24,
        backgroundColor: 'white',
    },
    title: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    starSize: {
        height: 40,
        width: 40,
        resizeMode: 'contain',
        marginHorizontal: 4,
    },
    rating: {
        marginTop: 2
    },
    button: {
        color: '#3B5998'
    },
    performerName: {
        fontSize: 14
    }
})

export default class ReviewListView extends React.PureComponent{
    state = {
        task: this.props.task,
        isHebrew: false,
        editableRatings: {}
    }

    api = new BackendAPI(this);
    customerReviewEndpoint = this.api.getCustomerReviewEndpoint();

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
        let taskDate = moment(this.props.task.date_begin);
        taskDate.hours(this.props.task.time_begin.split(':')[0]);
        taskDate.minutes(this.props.task.time_begin.split(':')[1]);
        let startDatePassed = taskDate.unix() < moment().unix();
        if(startDatePassed && this.props.task.assigned_performers && this.props.task.assigned_performers.length > 0){
            return(
                <View style={[style.container]}>
                    <Text style={[style.title, {textAlign: this.state.isHebrew? 'right': 'left'}]}>{strings["ratings"]}</Text>
                    <View style={{marginTop: 10}}>
                        {this.renderItemList()}
                    </View>
                </View>
            )
        }else{
            return(<View></View>)
        }
    }

    renderItem(performer, performerReview, customerReview){
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        return(
            <View key={performer.id.toString()}>
                <View style={[rowAlign, {alignItems: 'center', marginTop: 10, marginBottom: 6}]}>
                    <Avatar
                        src={performer["avatar"]}
                        style={{
                            marginRight: this.state.isHebrew ? 0 : 10,
                            marginLeft: this.state.isHebrew ? 10 : 0,
                            height: 36,
                            width: 36
                        }}
                    />
                    <Text style={style.performerName}>{performer["first_name"]} {performer["last_name"]}</Text>
                </View>
                {performerReview && 
                    <View style={[rowAlign, {alignItems: 'center'}]}>
                        <Text style={{marginHorizontal: 8}}>{strings["performer_rating"]}</Text>
                        <Rating 
                            style={[style.rating, {flexDirection: this.state.isHebrew? 'row-reverse': "row",}]}
                            value={performerReview.rating}/>
                    </View>
                }

                {customerReview ? 
                    <View style={[rowAlign, {alignItems: 'center'}]}>
                        <Text style={{marginHorizontal: 8}}>{strings["your_rating"]}</Text>
                        <Rating 
                            style={[style.rating, {flexDirection: this.state.isHebrew? 'row-reverse': "row",}]}
                            value={customerReview.rating}/>
                    </View>
                :
                    <EditableRating isHebrew={this.state.isHebrew} performer={performer} onPostRating={(performer, rating) => this.postRating(performer, rating)}/>
                }

                <View style={{marginTop: 16, height: 1, backgroundColor: 'rgba(66, 67, 106, 0.25);'}}></View>

            </View>
        )
    }

    async postRating(performer, rating){
        let {task} = this.state;
        let reviewItem = {
            "rating": rating,
	        "for_performer": performer
        }

        task.customer_reviews.push(reviewItem);
        this.setState({task}, () => {
            this.forceUpdate()
        })
        
        await this.customerReviewEndpoint({
            "taskId": task.id,
            "rating": rating,
	        "for_performer": performer.id
        });
    }

    renderItemList(){
        let items = [];
        let {assigned_performers} = this.state.task;
        assigned_performers.forEach(performer => {
            performerReview = this.state.task.performer_reviews.find(review => review.performer.id === performer.id);
            customerReview = this.state.task.customer_reviews.find(review => review.for_performer.id === performer.id);
            items.push(this.renderItem(performer, performerReview, customerReview))
        })

        return items;
    }
}

class EditableRating extends React.PureComponent{
    state = {
        rating: 0,
        isHebrew: this.props.isHebrew
    }

    render(){
        let items = []
        for(let i = 1; i <= 5; i++){
            items.push(
                <TouchableOpacity key={i} onPress={() => this.setState({rating: i})}>
                    <Image source={i <= this.state.rating? icon("star-full"):icon("star-blank")} style={style.starSize}/>
                </TouchableOpacity>
            )
        }

        return(
            <View style={{marginTop: 12}}>
                <Text style={{color: "#42436A", textAlign: this.props.isHebrew? 'right': 'left'}}>{strings["rate_performer"]}</Text>
                <View style={{ flexDirection: this.state.isHebrew? 'row-reverse': 'row', marginTop: 10}}>
                    {items}
                </View>
                <View style={{marginTop: 10, flexDirection: this.state.isHebrew? 'row-reverse': 'row', justifyContent: 'flex-end', width: "100%"}}>
                    <TouchableOpacity onPress={() => this.props.onPostRating(this.props.performer, this.state.rating)}>
                        <Text style={style.button}>{strings["post_review"]}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}