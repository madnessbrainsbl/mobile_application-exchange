/**
 *  ProfileScheduleEditScreen.js
 *  Screen for editing user schedule
 * 
 *  Created by Dmitry Chulkov 08/10/2019
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Image
} from 'react-native';
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import { HeaderTextButton } from "../../components/Buttons";
import DateTimePicker from '@react-native-community/datetimepicker';
import icon from "../../constant/Icons";
import API from "../../api";

import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';

const unit = val => val * 0.75;

const DEFAULT_SCHEDULE = {
    "sunday": {
        "end": new Date(2000, 0, 1, 17, 0),
        "full_day": true,
        "start": new Date(2000, 0, 1, 9, 0),
        "unavailable": false,
    },
    "monday":  {
      "end": new Date(2000, 0, 1, 17, 0),
      "full_day": true,
      "start": new Date(2000, 0, 1, 9, 0),
      "unavailable": false,
    },
    "tuesday": {
        "end": new Date(2000, 0, 1, 17, 0),
        "full_day": true,
        "start": new Date(2000, 0, 1, 9, 0),
        "unavailable": false,
    },
    "wednesday": {
        "end": new Date(2000, 0, 1, 17, 0),
        "full_day": true,
        "start": new Date(2000, 0, 1, 9, 0),
        "unavailable": false,
    },
    "thursday": {
      "end": new Date(2000, 0, 1, 17, 0),
      "full_day": true,
      "start": new Date(2000, 0, 1, 9, 0),
      "unavailable": false,
    },
    "friday": {
        "end": new Date(2000, 0, 1, 17, 0),
        "full_day": true,
        "start": new Date(2000, 0, 1, 9, 0),
        "unavailable": false,
    },
    "saturday": {
        "end": new Date(2000, 0, 1, 17, 0),
        "full_day": true,
        "start": new Date(2000, 0, 1, 9, 0),
        "unavailable": false,
    },
}

class ProfileScheduleEditScreen extends React.Component {

    api = new BackendAPI(this);
    updateScheduleEndpoint = this.api.getUpdateScheduleEndpoint();

    state = {
        availability: null,
    }

    componentDidMount(){
        this.props.navigation.setParams({donePress: this.saveEdit});
        this.setLang();

        let schedule = this.props.route?.params?.schedule || DEFAULT_SCHEDULE;
        if(schedule === null){
            schedule = DEFAULT_SCHEDULE;
        }
        this.setState({availability: schedule})
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({lang});
    };

    render(){
        let rows = [];
        for(let day in this.state.availability){
            rows.push(this.renderRow(day, this.state.availability[day]));
        }

        return(
            <KeyboardAvoidingView behavior="padding" style={{backgroundColor: 'white', flex: 1}}>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <View style={{
                        flex: 1,
                        flexDirection: "column",
                        paddingTop: unit(16),
                        paddingLeft: unit(16),
                        paddingRight: unit(16),
                        paddingBottom: unit(16)
                    }}>
                        {rows}
                    </View>
                    <View style={{height: 60}}/>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    renderRow(day, schedule){
        const iconSize = 24;
        return(
            <View key={day} style={{marginHorizontal: 8, marginTop: 8, marginBottom: 12}}>
                <Text style={{
                    color: "#42436A",
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginBottom: 6}}>{strings[day]}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 6}}>
                    <TouchableOpacity onPress={() => this.handleOptionSelect(day, "unavailable")}>
                    <View style={{alignItems: 'center'}}>
                        <View style={{marginBottom: 6}}>
                        {
                            schedule.unavailable ? 
                            <Image style={{height: iconSize, width: iconSize}} source={icon("unavailable")}/> 
                            : <EmptySelection size={iconSize}/>
                        }
                        </View>
                        <Text style={{color: 'rgba(66, 67, 106, 0.86)', fontSize: 16, marginTop: 6}}>{strings["unavailable"]}</Text>
                    </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.handleOptionSelect(day, "full_day")}>
                    <View style={{alignItems: 'center'}}>
                        <View style={{marginBottom: 6}}>
                        {
                            schedule.full_day ? 
                            <Image style={{height: iconSize, width: iconSize}} source={icon("available")}/> 
                            : <EmptySelection size={iconSize}/>
                        }
                        </View>
                        <Text style={{color: 'rgba(66, 67, 106, 0.86)', fontSize: 16, marginTop: 6}}>{strings["available"]}</Text>
                    </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.handleOptionSelect(day, "time")}>
                    <View style={{alignItems: 'center'}}>
                        <View style={{marginBottom: 6}}>
                        {
                            (!schedule.unavailable &&  !schedule.full_day)? 
                            <FilledSelection size={iconSize}/> 
                            : <EmptySelection size={iconSize}/>
                        }
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <DateTimePicker
                                value={this.state.availability[day].start}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        this.selectStartTIme(selectedTime, day);
                                    }
                                }}
                            />

                            <Text style={{marginHorizontal: 8}}> - </Text>

                            <DateTimePicker
                                value={this.state.availability[day].end}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        this.selectEndTIme(selectedTime, day);
                                    }
                                }}
                            />
                        </View>
                    </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    selectStartTIme = (time, day) => {
        let {availability} = this.state; 
        availability[day].start = time 
        this.setState({availability});
    }

    selectEndTIme = (time, day) => {
        let {availability} = this.state; 
        availability[day].end = time 
        this.setState({availability});
    }

    handleOptionSelect = (day, option) => {
        let {availability} = this.state;
        switch(option){
            case "time":
                availability[day].unavailable = false;
                availability[day].full_day = false;
                break;
            case "full_day":
                availability[day].unavailable = false;
                availability[day].full_day = true;
                break;
            case "unavailable":
                availability[day].unavailable = true;
                availability[day].full_day = false;
                break;
        }

        this.setState({availability});
    }

    formatTime = (date) => {
        if (!date) return null;
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    formatAvailabilityForBackend = (availability) => {
        const formattedAvailability = {};
        for (const day in availability) {
            formattedAvailability[day] = {
                ...availability[day],
                start: this.formatTime(availability[day].start),
                end: this.formatTime(availability[day].end)
            };
        }
        return formattedAvailability;
    }

    saveEdit = async () => {
        const formattedAvailability = this.formatAvailabilityForBackend(this.state.availability);
        await API.updateSchedule({
            "availability": formattedAvailability
        });

        let { currentUser } = this.props;
        currentUser.availability = formattedAvailability;
        this.props.updateProfile(currentUser);

        const reloadUser = this.props.route.params?.reloadUser || null;
        if(reloadUser !== null){
            await reloadUser();
        }
        this.props.navigation.goBack();
    }
}

function EmptySelection(props){
    return(
        <View
            style={{
                height: props.size,
                width: props.size,
                borderRadius: props.size/2,
                borderColor: 'rgba(0, 0, 0, 0.3)',
                borderStyle: 'solid',
                borderWidth: 1
            }}
        />
    )
}

function FilledSelection(props){
    return(
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: props.size,
                width: props.size,
                borderRadius: props.size/2,
                borderColor: 'rgba(0, 65, 201, 0.56)',
                borderStyle: 'solid',
                borderWidth: 2
            }}
        >
            <View style={{
                height: props.size/2,
                width: props.size/2,
                borderRadius: props.size/4,
                backgroundColor: 'rgba(0, 65, 201, 0.56)',
            }}/>
        </View>
    )
}

const mapStateToProps = state => ({
    currentUser: state.profileReducer,
    rtl: state.configReducer.rtl,
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
}
export default connect(mapStateToProps, mapDispatchToProps)(ProfileScheduleEditScreen);