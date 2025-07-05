import React from 'react';
import {
    Modal,
    SafeAreaView,
    Share,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Image
} from 'react-native';
import * as Linking from 'expo-linking';
import { connect } from 'react-redux';

import moment from "moment";
import settings from "../../../../backend/Settings";
import strings from "../../../utils/Strings";
import Color from '../../../constant/Color';

import icon from '../../../constant/Icons';

const style = StyleSheet.create({
    taskContainer: {
        backgroundColor: 'white',
        paddingTop: 30,
        paddingBottom: 30,
        paddingStart: 24,
        paddingEnd: 24,
        flexDirection: 'column',
    },
    title: {
        color: '#42436A',
        fontSize: 24,
        fontWeight: 'bold'
    },
    subcategory:{
        color: "rgba(66, 67, 106, 0.76)",
        fontSize: 14
    },
    price:{
        color: "#2E8F1E",
        fontSize: 16,
        fontWeight: 'bold'
    },
    detailsItemContainer:{
        marginTop: 20,
    },
    detailTitle:{
        color: 'rgba(66, 67, 106, 0.65)',
    },
    detailItem:{
        color: '#000',
    },
    mapIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    button: {
        color: '#3B5998'
    }
})

class TaskView extends React.Component{

    state = {
        isHebrew: false
    }

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
        const {task} = this.props;
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        const profile = this.props.userProfile;
        const {category, sub_category} = task;
        
        return(
            <View style={{backgroundColor: 'white'}}>
                {this.renderCompletedLabel()}
                <View style={[style.taskContainer]}>
                
                <View style={[rowAlign, { justifyContent: 'space-between'}]}>
                    <View style={columnAlign}>
                        <Text style={style.title}>{strings.getCategory(category["name"]? category["name"]: category)}</Text>
                        <Text style={style.subcategory}>{strings["direction"]} {strings.getCategory(sub_category["name"]? sub_category["name"]: sub_category)}</Text>
                        <View style={[{rowAlign}, {flexDirection: 'row', alignItems: 'center'}]}>
                            <Text style={style.price}>{this.formatPrice(this.props.task["price"], this.props.task["pay_type"], this.props.task["gross"])}</Text>
                            {this.renderCustomPriceApply()}
                        </View>
                        
                        
                    </View>

                    {(profile && task.creator.id === profile.id) &&
                        <View style={{alignItems: 'flex-end', justifyContent: 'space-between', flex: 1}}>
                            <TouchableOpacity onPress={() => this.props.onEditPress(this.props.task)}>
                                <View style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 4,
                                    borderWidth: 1,
                                    borderColor: Color.primary,
                                    borderStyle: 'solid'
                                }}>
                                    <Text style={[style.button, {fontSize: 12}]}>{strings["task_view_edit_delete"]}</Text>
                                </View>
                                
                            </TouchableOpacity>

                            {!task.completed && 
                            <TouchableOpacity onPress={() => this.props.onCompletePressed(this.props.task)}>
                                <Text style={{fontWeight: 'bold', color: Color.taskCompletedColor}}>{strings["task_view_complete"]}</Text>
                            </TouchableOpacity>}
                        </View>
                    }
                </View>

                <View style={[style.detailsItemContainer, columnAlign]}>
                    <Text style={style.detailTitle}>{strings["start"]}</Text>
                    <Text style={style.detailItem}>{this.formatDateTime(task["date_begin"], task["time_begin"])}</Text>
                </View>

                {(task["date_end"] != null) && 
                    <View style={[style.detailsItemContainer, columnAlign]}>
                        <Text style={style.detailTitle}>{strings["finish"]}</Text>
                        <Text style={style.detailItem}>{this.formatDateTime(task["date_end"], task["time_end"])}</Text>
                    </View>
                }

                <View style={[style.detailsItemContainer, columnAlign]}>
                    <Text style={style.detailTitle}>{strings["region"]}</Text>
                    <Text style={style.detailItem}>{strings[task["region"]] || task["region"]}</Text>
                </View>

                <View style={[style.detailsItemContainer, rowAlign, {alignItems: 'center', justifyContent: 'space-between'}]}>
                    <View style={columnAlign}>
                        <Text style={style.detailTitle}>{strings["address"]}</Text>
                        <Text style={style.detailItem}>{task["address"]}</Text>
                    </View>

                    <TouchableOpacity onPress={() => this.openMap()}>
                        <Image style={style.mapIcon} source={icon("map")}/>
                    </TouchableOpacity>
                    
                </View>

                {(task.about && task.about.length > 0)? 
                    <View style={[style.detailsItemContainer, columnAlign]}>
                        <Text style={style.detailTitle}>{strings["description"]}</Text>
                        <Text style={style.detailItem}>{task.about}</Text>
                    </View>
                    : null
                }

                {this.renderContactsInput()}

                {task["views_count"] > 0 &&  
                    <View style={[style.detailsItemContainer, columnAlign]}>
                        <Text style={style.detailTitle}>{strings["task_view_views_count"]} {task["views_count"]}</Text>
                    </View>
                }

                {task["date_create"] && 
                    <View style={[style.detailsItemContainer, columnAlign]}>
                        <Text style={style.detailTitle}>{strings["created"]} {moment(task["date_create"]).fromNow()}</Text>
                    </View>
                }

            </View>

            </View>
            
        )
    }

    renderCompletedLabel(){
        if(this.props.task.completed){
            return(
                <View style={{backgroundColor: Color.taskCompletedColor, alignItems: 'center'}}>
                    <Text style={{color: 'white', marginTop: 8, marginBottom: 8, fontSize: 12, fontWeight: 'bold'}}>{strings["task_view_task_completed"]}</Text>
                </View>
            )
        }
    }

    renderContactsInput(){
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        // Show contactt information only to task owner and assigned performers
        
        if(!this.props.task.use_my_contact_data){
            if(this.props.task["contact_name"]){
                return(
                    <View style={[rowAlign, {alignItems: 'center', justifyContent: 'space-between'}]}>
                        <View style={[style.detailsItemContainer, columnAlign]}>
                            <Text style={style.detailTitle}>{strings["task_view_contact_info"]}</Text>
                            <Text style={style.detailItem}>{this.props.task["contact_name"]}</Text>
                            <Text style={style.detailItem}>{this.props.task["contact_phone"]}</Text>
                        </View>
                        <TouchableOpacity onPress={() => this.callPhone(this.props.task["contact_phone"])}>
                            <Image style={style.mapIcon} source={icon("phone")}/>
                        </TouchableOpacity>
                    </View>
                    
                )
            }
        }else{
            let phone = "+" + this.props.task["creator"]["phone"];
            return(
                <View style={[style.detailsItemContainer, columnAlign]}>
                    <Text style={style.detailTitle}>{strings["task_view_contact_info"]}</Text>
                    <Text style={style.detailItem}>{this.props.task["creator"]["first_name"]} {this.props.task["creator"]["last_name"]}</Text>
                    <Text style={style.detailItem}>{phone}</Text>
                </View>
            )
        }
    }

    renderCustomPriceApply(){
        const profile = this.props.userProfile;
        if(profile == null) return;
        if(this.props.task.applies && !this.props.task.applies.find(item => item.user.id === profile.id) &&
        this.props.task.creator.id !== profile.id && !this.props.task.completed){
            let views = []
        views.push(<Text key="or" style={{marginHorizontal: 4}}>{strings["task_view_or"]}</Text>)
            views.push(
                <TouchableOpacity key="btn" style={{
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    backgroundColor: '#3B5998'
                }} onPress={() => this.props.applyWithCustomPrice()}>
                    <Text style={{color: 'white', fontSize: 12}}>{strings["task_view_raise_price"]}</Text>
                </TouchableOpacity>
            )
            return views;
        }                   
    }

    callPhone(phoneNumber){
        Linking.openURL(`tel:${phoneNumber}`)
    }

    formatPrice = (price, payType, gross) => {
        return `${price}${strings["currency"]}/${strings[payType]} ${strings[gross]}`;
    };

    formatDateTime(date, time) {
        return moment(`${date} ${time}`).format("D MMMM, H:mm");
    }

    openMap() {
        const url = `https://waze.com/ul?q=${this.props.task["address"]}&navigate=yes`;
        Linking.openURL(url);
    }
}

const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TaskView);