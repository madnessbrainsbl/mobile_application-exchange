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
    TimePickerAndroid,
    TextInput,
    Image,
    SafeAreaView
} from 'react-native';
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import { HeaderTextButton, SimpleButton } from "../../components/Buttons";
import DateTimePicker from '@react-native-community/datetimepicker';
import icon from "../../constant/Icons";
import Color from "../../constant/Color";

const unit = val => val * 0.75;

const DEFAULT_SCHEDULE = {
    "sunday": {
        "end": null,
        "full_day": true,
        "start": null,
        "unavailable": false,
    },
    "monday":  {
      "end": null,
      "full_day": true,
      "start": null,
      "unavailable": false,
    },
    "tuesday": {
        "end": null,
        "full_day": true,
        "start": null,
        "unavailable": false,
    },
    "wednesday": {
        "end": null,
        "full_day": true,
        "start": null,
        "unavailable": false,
    },
    "thursday": {
      "end": null,
      "full_day": true,
      "start": null,
      "unavailable": false,
    },
    "friday": {
        "end": null,
        "full_day": true,
        "start": null,
        "unavailable": false,
    },
    "saturday": {
        "end": null,
        "full_day": true,
        "start": null,
        "unavailable": false,
    },
}

class ScheduleEditScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "",
            headerStyle: {
                backgroundColor: Color.primary,
            },
            headerTintColor: Color.headerTintColor,
            headerBackTitle: null,
            headerRight : (<HeaderTextButton onPress={navigation.getParam("savePress")} title={strings["quest_edit_schedule_save"]}/>),
        };
    }

    api = new BackendAPI(this);
    updateScheduleEndpoint = this.api.getUpdateScheduleEndpoint();

    state = {
        availability: null,
        isHebrew: false
    }

    componentDidMount(){
        this.setLang();

        let schedule = this.props.route.params?.schedule || DEFAULT_SCHEDULE;
        if(schedule === null){
            schedule = DEFAULT_SCHEDULE;
        }
        this.setState({availability: schedule})
        this.props.navigation.setParams({"savePress": this.saveEdit})
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
            <SafeAreaView style={{flex: 1}}>
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
            </SafeAreaView>
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
                            style={{width: 50}}
                            customStyles={{ dateInput: { borderWidth: 0, alignItems: "center",} }}
                            date={this.state.availability[day].start}
                            mode="time"
                            placeholder="00:00"
                            format="H:mm"
                            locale={this.state.lang}
                            confirmBtnText={strings["done"]}
                            cancelBtnText={strings["cancel"]}
                            showIcon={false}
                            onDateChange={(time) => this.selectStartTIme(time, day)}
                        />

                        <Text> - </Text>

                        <DateTimePicker
                            style={{width: 50,}}
                            customStyles={{ dateInput: { borderWidth: 0, alignItems: "center"} }}
                            date={this.state.availability[day].end}
                            mode="time"
                            placeholder="00:00"
                            format="H:mm"
                            locale={this.state.lang}
                            confirmBtnText={strings["done"]}
                            cancelBtnText={strings["cancel"]}
                            showIcon={false}
                            onDateChange={(time) => this.selectEndTIme(time, day)}
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


    saveEdit = async () => {
        const result = await this.updateScheduleEndpoint({
            "availability": this.state.availability
        });

        let updateSchedule = this.props.route.params?.updateSchedule || null;
        if(updateSchedule !== null){
            await updateSchedule(this.state.availability);
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

export default ScheduleEditScreen;