import React from 'react';
import {
    Modal,
    SafeAreaView,
    Share,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Image
} from 'react-native';
import { Linking } from 'expo';
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
        flexDirection: "row",
        marginTop: 2
    },
    button: {
        color: '#3B5998'
    },
    customerName: {
        fontSize: 16
    }
})

export default class ReviewView extends React.PureComponent{

    state = {
        isHebrew: false,
        rating: this.props.rating? this.props.rating: 0,
        editable: this.props.editable
    }

    api = new BackendAPI(this);
    performerReviewEndpoint = this.api.getPerformerReviewEndpoint();

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
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};

        return(
            <View style={[style.container]}>
                <Text style={[style.title, {textAlign: this.state.isHebrew? 'right': 'left'}]}>{this.props.title}</Text>
                <View style={{alignItems: 'center', marginTop: 10}}>
                    {this.state.editable? this.renderEditableStars(): this.renderStaticStars()}
                </View>

                {this.state.editable && <View style={{marginTop: 12, flexDirection: this.state.isHebrew? 'row-reverse': 'row', justifyContent: 'flex-end', width: "100%"}}>
                    <TouchableOpacity onPress={() => this.postPerformerReview()}>
                        <Text style={style.button}>{strings["post_review"]}</Text>
                    </TouchableOpacity>
                </View>}
                
            </View>
        )
    }

    renderEditableStars(){
        let items = []
        for(let i = 1; i <= 5; i++){
            items.push(
                <TouchableOpacity key={i} onPress={() => this.setState({rating: i})}>
                    <Image source={i <= this.state.rating? icon("star-full"):icon("star-blank")} style={style.starSize}/>
                </TouchableOpacity>
            )
        }

        return(
            <View style={{ flexDirection: this.state.isHebrew? 'row-reverse': 'row'}}>
                {items}
            </View>
        )
    }

    renderStaticStars(){

        let items = [];
        for(let i = 1; i <= 5; i++){
            items.push(
                <Image source={i <= this.state.rating? icon("star-full"):icon("star-blank")} style={style.starSize}/>
            )
        }

        return(
            <View style={{ flexDirection: this.state.isHebrew? 'row-reverse': 'row'}}>
                {items}
            </View>
        )
    }

    async postPerformerReview(){
        if(this.state.rating === 0 || !this.props.customer_id) return;
        this.setState({editable: false})

        const result = await this.performerReviewEndpoint({
            taskId: this.props.taskId,
            "rating": this.state.rating,
	        "for_customer": this.props.customer_id
        });
    }

}