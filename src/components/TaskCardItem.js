import React from 'react';
import {
    Image,
    Text,
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import moment from "moment";
import strings from "../utils/Strings";
import DoneIcon from "../assets/images/icons/done.png";
import WaitingIcon from "../assets/images/icons/waiting.png";
import AppliesIcon from "../assets/images/icons/applies.png";
import icon from "../constant/Icons";
import Color from '../constant/Color';
import Avatar from './Avatar';
import AvatarCompany from './AvatarCompany';

const style = StyleSheet.create({
    card: {
        marginStart: 8,
        marginEnd: 8,
        marginTop: 8,
        marginBottom: 8,
        
        backgroundColor: 'white',
        borderRadius: 8,
        flexDirection: 'column',
    },
    cardShadow:{
        elevation: 3, // Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
    },
    cardTitle:{
        color: '#42436A',
        fontSize: 20,
        fontWeight: '500'
    },
    cardTitleSubcategory: {
        color: '#42436A', 
        fontSize: 16, 
        fontWeight: '500'
    },
    cardSubtitle: {
        color: 'rgba(66, 67, 106, 0.76)',
        fontSize: 14
    },
    description: {
        color: 'rgba(66, 67, 106, 0.6)',
        fontSize: 14
    },
    button: {
        color: 'rgba(59, 89, 152, 0.76)',
        fontSize: 12,
        fontWeight: 'bold',
    },
    labelContainerYourTask: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 4,
        backgroundColor: 'rgba(0, 65, 201, 0.56)'
    },
    labelYourTask: {
        //color: 'rgba(0, 65, 201, 0.36)',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    labelContainerPerformerFound: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 4,
        backgroundColor: Color.taskCompletedColor
    },
    labelPerformerFound: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusLabelContainer:{
        borderRadius: 14, 
        paddingHorizontal: 14, 
        paddingVertical: 6,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusLabelText:{
        fontWeight: "500", 
        color: 'white', 
        fontSize: 10,
        marginHorizontal: 3,
    },
    statusLabelIcon:{
        width: 14,
        height: 14,
        resizeMode: 'contain'
    },
    mapIcon: {
        height: 24,
        width: 24,
        resizeMode: 'contain'
    },
})

export default class TaskCardItem extends React.PureComponent{

    render(){
        let { category, sub_category } = this.props.task;
        let categoryName = strings.getCategory(category["name"]? category["name"]: category);
        let subCategoryName = strings.getCategory(sub_category["name"]? sub_category["name"]: sub_category);
        if(categoryName === subCategoryName){
            subCategoryName = "";
        }else{
            subCategoryName = this.props.isHebrew?subCategoryName + ' \\ ' :' / ' + subCategoryName;
        }

        let startTime = moment(this.props.task["date_begin"] + " " + this.props.task["time_begin"])
        let today = moment().startOf('day');   
        let cardBackground = startTime.isBefore(today)? "rgba(0, 0, 0, 0.1)" :"white";
        // if(startTime.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")){
        //     cardBackground = 'rgba(159, 190, 254, 0.28)';
        // }

        let title = [];
        if(this.props.isHebrew){
            title.push(<Text key="subcategory" style={style.cardTitleSubcategory}>{subCategoryName}</Text>);
            title.push(<Text key="category" style={style.cardTitle}>{categoryName}</Text>);
        }else{
            title.push(<Text key="category" style={style.cardTitle}>{categoryName}</Text>);
            title.push(<Text key="subcategory" style={style.cardTitleSubcategory}>{subCategoryName}</Text>);
        }

        const desc = this.props.task.about  + this.props.task.about + this.props.task.about + this.props.task.about
        return(
            <View>
                <TouchableWithoutFeedback onPress={() => this.props.onMorePress(this.props.task)}>
                    <View style={[style.card, style.cardShadow]}>
                        <View style={{
                            backgroundColor: cardBackground, 
                            paddingTop: 16,
                            paddingBottom: 16, 
                            paddingStart: 10,
                            paddingEnd: 10, 
                            borderRadius: 8,
                            flexDirection: 'column'
                        }}>
                        
                        {this.props.showOwnerLabels? this.renderOwnerLabelSet(): this.renderLabels()}

                        <View style={{flexDirection: this.props.isHebrew? 'row-reverse':'row', alignItems: 'flex-start', justifyContent: 'space-between'}}>
                            
                                <View style={{flexDirection: this.props.isHebrew? 'row-reverse':'row', maxWidth: '60%'}}>
                                    <AvatarCompany size={86} src={this.props.task.creator.avatar} style={{marginEnd: 4}}/>
                                    <View style={{flexDirection: 'column', marginHorizontal: 6, alignItems: this.props.isHebrew? 'flex-end': 'flex-start'}}>
                                        <Text style={[style.cardTitleSubcategory, { fontWeight: 'bold'}]}>{this.props.task.creator.company_name}</Text>
                                        <Text>{title}</Text>
                                        <Text style={style.cardSubtitle}>{strings["start"]} {this.formatDateTime(this.props.task["date_begin"], this.props.task["time_begin"])}</Text>
                                        <Text style={style.cardSubtitle}>{this.props.task.address}</Text>
                                    </View>
                                </View>
                                

                                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                                    <PriceView
                                        price={this.props.task.price}
                                        payType={this.props.task.pay_type}
                                        gross={this.props.task.gross}
                                    />

                                    <TouchableOpacity style={{width: 24, marginTop: 12}} onPress={this.openMap}>
                                        <Image style={style.mapIcon} source={icon("map")}/>
                                    </TouchableOpacity>
                                </View>
                                
                        </View>

                        <View style={{flexDirection: this.props.isHebrew? 'row' :'row-reverse', justifyContent: 'space-between', marginTop: 10}}>
                            {this.renderActionButtons()}
                        </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    renderActionButtons(){
        const { task } = this.props;
        let buttons = [];
        buttons.push(
            <TouchableOpacity key="more" onPress={() => this.props.onMorePress(task)}>
                <Text style={style.button}>{this.props.pickMode? strings["task_card_pick"]: strings["more_details"]}</Text>
            </TouchableOpacity>
        )

        const creatorID = typeof(task.creator) === "object"? task.creator.id: task.creator;

        if(this.props.userProfile && this.props.userProfile.id !== creatorID){
            buttons.push(
                <TouchableOpacity key="question" onPress={() => this.props.onQuestionPress(this.props.task)}>
                    <Text style={style.button}>{strings["question_to_the_employer"]}</Text>
                </TouchableOpacity>
            )
        }
        
        return buttons;

        // if(this.props.userProfile && this.props.userProfile.id !== this.props.task.creator.id){

        //     buttons.push(
        //         <TouchableOpacity key="question" onPress={() => this.props.onQuestionPress(this.props.task)}>
        //             <Text style={style.button}>{strings["question_to_the_employer"]}</Text>
        //         </TouchableOpacity>
        //     )

        //     if(!this.props.task["applicants"].some(x => x["id"] === this.props.userProfile.id) &&
        //         !this.props.task["pending_applicants"].some(applicant => applicant.id === this.props.userProfile.id) && 
        //         !this.props.task["assigned_performers"].some(performer => performer.id === this.props.userProfile.id) && 
        //         !this.props.task.completed){
        //         buttons.push(
        //             <TouchableOpacity key="apply" onPress={() => this.props.onApplyPress(this.props.task)}>
        //                 <Text style={style.button}>{strings["apply"]}</Text>
        //             </TouchableOpacity>
        //         )
        //     }
        // }

        // return buttons
    }

    renderPerformerFoundLabel(){
        return(
            <View key="performer-found-label" style={{marginLeft: this.props.isHebrew? 4: 0, marginRight: this.props.isHebrew? 0: 4}}>
                <View style={style.labelContainerPerformerFound}>
                    <Text style={[style.labelPerformerFound]}>{strings["task_card_item_performer_found"]}</Text>
                </View>
            </View>
        )
    }

    renderOwnerLabelSet(){
        let color = '';
        let icon = '';
        let text = '';
        let nothingToRender = true

        if(this.props.task.assigned_performers.length > 0){
            color = '#5A4FCF';
            icon = DoneIcon;
            text = strings["status_label_confirmed"];
            nothingToRender = false;
        }else if(this.props.task.pending_applicants.length > 0){
            color = '#34AFD6';
            icon = WaitingIcon;
            text = strings["status_label_pending"];
            nothingToRender = false;
        }else if(this.props.task.applicants.length > 0){
            color = '#099D32';
            icon = AppliesIcon;
            text = strings["status_label_applies"];
            nothingToRender = false;
        }


        if(!nothingToRender){
            return(
                <View style={{alignItems: this.props.isHebrew? 'flex-end': 'flex-start'}}>
                    <View style={[style.statusLabelContainer, {backgroundColor: color}]}>
                        <Image source={icon} style={style.statusLabelIcon}/>
                        <Text style={style.statusLabelText}>{text}</Text>
                    </View>
                </View>
            )
        }
    }

    renderDateLabel(day, labelColor){
        return(
            <View key="date-label" style={{marginLeft: this.props.isHebrew? 4: 0, marginRight: this.props.isHebrew? 0: 4}}>
                <View style={[style.labelContainerYourTask, {backgroundColor: labelColor}]}>
                    <Text style={style.labelYourTask}>{day}</Text>
                </View>
            </View>
        )
    }

    renderLabels(){
        let labelViews = []
        let {task, userProfile} = this.props
        if(userProfile && (userProfile.id === task.creator.id || userProfile.id === task.creator)){
            labelViews.push(this.renderYourTaskLabel())
        }

        let today = moment()
        let tomorrow = moment().add(1, 'day')
        if(moment(task.date_begin).isSame(today, 'day')){
            labelViews.push(this.renderDateLabel(strings["today"], 'rgba(179, 36, 36, 0.9)'))
        }else if(moment(task.date_begin).isSame(tomorrow, 'day')){
            labelViews.push(this.renderDateLabel(strings["tomorrow"], 'rgba(101, 0, 201, 0.66)'))
        }

        if(task.completed){
            labelViews.push(this.renderPerformerFoundLabel())
        }

        return(
            <View style={{flexDirection: this.props.isHebrew? 'row-reverse': 'row', marginBottom: 4}}>
                {labelViews}
            </View>
        )

    }


    renderYourTaskLabel(){
        return(
            <View key="task-label" style={{marginLeft: this.props.isHebrew? 4: 0, marginRight: this.props.isHebrew? 0: 4}}>
                <View style={style.labelContainerYourTask}>
                    <Text style={style.labelYourTask}>{strings["your_task"]}</Text>
                </View>
            </View>
        )
    }

    formatPrice = (price, payType) => {
        return `${price}${strings["currency"]}/${strings[payType]}`;
    };

    formatDateTime(date, time) {
        return moment(`${date} ${time}`).format("D MMMM, H:mm");
    }

    openMap = () => {
        const url = `https://waze.com/ul?q=${this.props.task["address"]}&navigate=yes`;
        Linking.openURL(url);
    }
}

function PriceView(props){
    const { price, payType, gross } = props;
    const formattedPrice = `${price}${strings["currency"]}/${strings[payType]}`;

    return (
        <View style={{alignItems: 'center'}}>
            <Text style={{color: '#2E8F1E', fontSize: 14, fontWeight: 'bold'}}>
                {formattedPrice}
            </Text>
            {gross && (
                <Text style={{color: '#2E8F1E', fontSize: 10, fontWeight: 'bold'}}>
                    {strings[gross]}
                </Text>
            )}                   
        </View>
    )
}