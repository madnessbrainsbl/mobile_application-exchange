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
import Avatar from "../../../components/Avatar";
import Rating from "../../../components/Rating";
import moment from "moment";
import settings from "../../../../backend/Settings";
import strings from "../../../utils/Strings";

const style = StyleSheet.create({
    container:{
        paddingTop: 16,
        paddingBottom: 16,
        paddingStart: 24,
        paddingEnd: 24,
        backgroundColor: 'rgba(159, 190, 254, 0.28)',

    },
    title: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    rating: {
        flexDirection: "row",
        marginTop: 2
    },
    cancelButton: {
        color: '#EB5757'
    },
    performerName: {
        fontSize: 16
    },
    descriptionText:{
        color: 'rgba(0, 0, 0, 0.36)',
        
    }
})

export default class PerformerView extends React.Component{

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
        const {performer} = this.props;
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};

        let dateTime = this.formatDateTime(this.props.task["date_begin"], this.props.task["time_begin"]);
        let hint = strings.formatString(strings["confirm_done_hint_description"], dateTime, this.props.task.address);

        return(
            <View style={[style.container, columnAlign]}>
                <Text style={style.title}>{strings["you_are_performer"]}</Text>
                <View style={[rowAlign, {alignItems: 'center', marginTop: 10}]}>
                    <Avatar
                        src={performer["avatar"]}
                        style={{
                            marginRight: this.state.isHebrew ? 0 : 16,
                            marginLeft: this.state.isHebrew ? 16 : 0,
                        }}
                    />

                    <View style={{flex: 1}}>
                        <View style={columnAlign}>
                            <Text style={style.performerName}>{performer["first_name"]} {performer["last_name"]}</Text>
                            <Rating 
                                style={style.rating}
                                value={performer.rating}/>
                        </View>
                    </View>

                </View>

                <View style={{marginTop: 6}}>
                    
                    <Text style={[style.descriptionText, {textAlign: this.state.isHebrew? 'right': 'left'}]}>{hint}</Text>
                    
                </View>

                <View style={{marginTop: 6, flexDirection: this.state.isHebrew? 'row-reverse': 'row', justifyContent: 'flex-end', width: "100%"}}>

                    <TouchableOpacity onPress={() => this.openMap()}>
                        <Text style={{color: '#3B5998'}}>{strings["confirm_done_hint_open_map"]}</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        )
    }

    formatDateTime(date, time) {
        return moment(`${date} ${time}`).format("D MMMM H:mm");
    }

    openMap() {
        const url = `https://waze.com/ul?q=${this.props.task["address"]}&navigate=yes`;
        Linking.openURL(url);
    }
}