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
import Avatar from "../../../components/Avatar";
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
    cancelButton: {
        color: '#EB5757'
    },
    applicantName: {
        fontSize: 16
    },
    descriptionText:{
        color: 'rgba(0, 0, 0, 0.36)',
        fontSize: 11
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E8F1E'
    },
})

export default class ApplyView extends React.Component{

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
        const {apply} = this.props
        const applicant = apply.user;
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};

        return(
            <View style={[style.container, columnAlign]}>
                <Text style={style.title}>{strings["apply_view_title"]}</Text>
                <View style={[rowAlign, {alignItems: 'center', marginTop: 18}]}>
                    <Avatar
                        src={applicant["avatar"]}
                        style={{
                            marginRight: this.state.isHebrew ? 0 : 16,
                            marginLeft: this.state.isHebrew ? 16 : 0,
                        }}
                    />

                    <View style={{flex: 1}}>
                        <View style={columnAlign}>
                            <Text style={style.applicantName}>{applicant["first_name"]} {applicant["last_name"]}</Text>
                            <Rating 
                                style={style.rating}
                                value={applicant.rating}/>
                            {apply.price > 0 && <Text style={style.price}>{`${apply.price}${strings["currency"]}/${strings[this.props.payType]}`}</Text>}
                        </View>

                        <View style={{flex: 1, alignItems: this.state.isHebrew? 'flex-start': 'flex-end'}}>
                            <View style={[{flexDirection: this.state.isHebrew? 'row': 'row-reverse'}]}>
                                <TouchableOpacity onPress={() => this.props.onCancelPress(apply)}>
                                    <Text style={[style.cancelButton, {marginStart: 10, marginEnd: 10}]}>{strings["cancel_apply"]}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.props.onRemindPress}>
                                    <Text style={[{marginStart: 10, marginEnd: 10, color: '#3B5998'}]}>{strings["apply_remind"]}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        

                    </View>

                    

                </View>


                <View style={{marginTop: 6}}>
                    <Text style={[style.descriptionText, {textAlign: this.state.isHebrew? 'right': 'left'}]}>{strings["apply_description"]}</Text>
                </View>
                
            </View>
        )
    }
}