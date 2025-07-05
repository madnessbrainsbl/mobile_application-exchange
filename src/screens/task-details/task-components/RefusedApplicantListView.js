import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import Avatar from '../../../components/Avatar';
import Rating from "../../../components/Rating";
import settings from "../../../../backend/Settings";
import strings from "../../../utils/Strings";

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
    rating: {
        flexDirection: "row",
        marginTop: 2
    },
    
})

export default class RefusedApplicantListView extends React.Component{

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
        
        return(
            <View style={style.container}>
                <Text 
                    style={[style.title, {textAlign: this.state.isHebrew? 'right': 'left'}]}>
                    {strings["rejected_applicants_view_title"]}
                </Text>

                <View style={{marginVertical: 10}}>
                    {this.renderApplyList()}
                </View>
            </View>
        )
    }

    renderApplyItem(apply){
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        const applicant = apply.user
        return(
            <View key={applicant.id} style={[rowAlign, {alignItems: 'center', justifyContent: 'space-between', marginTop: 16}]}>

                <View style={[rowAlign, {alignItems: 'center'}]}>
                    <Avatar
                        src={applicant.avatar}
                        style={{
                            marginRight: this.state.isHebrew ? 0 : 16,
                            marginLeft: this.state.isHebrew ? 16 : 0,
                        }}
                    />
            
                    <View>
                        <View style={columnAlign}>
                        <Text style={style.customerName}>{applicant["first_name"]} {applicant["last_name"]}</Text>
                        <Rating 
                            style={style.rating}
                            value={applicant.rating}/>
                        </View>
                        <View style={[columnAlign, {marginTop: 6}]}>
                            <TouchableOpacity onPress={() => this.props.showProfilePress(applicant)}>
                                <Text style={{fontSize: 12, color: '#3B5998'}}>{strings["show_profile"]}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.props.onChatPressed(applicant)}>
                                <Text style={{fontSize: 12, marginTop: 6, color: '#3B5998'}}>{strings["ask_question"]}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>
            
        )
    }

    renderApplyList(){
        if(!this.props.applies || this.props.applies.length === 0){
            return this.renderZeroState();
        }

        let items = [];
        this.props.applies.forEach(apply => items.push(this.renderApplyItem(apply)))

        return items;
    }

    renderZeroState(){
        return(
            <View style={{marginVertical: 20}}>
                <Text style={style.zeroStateText}>{strings["apply_list_view_zero_state"]}</Text>
            </View>
        )
    }
}