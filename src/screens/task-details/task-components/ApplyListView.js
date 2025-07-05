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
        paddingHorizontal: 24,
        backgroundColor: 'white',
    },
    title: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    zeroStateText: {
        color: "rgba(0, 0, 0, 0.36)",
        textAlign: 'center'
    },
    rating: {
        flexDirection: "row",
        marginTop: 2
    },
    button: {
        color: '#3B5998'
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E8F1E'
    },
})

export default class ApplyListView extends React.Component{

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
                <View>
                    <Text 
                        style={[style.title, {textAlign: this.state.isHebrew? 'right': 'left'}]}>
                        {strings["apply_list_view_title"]}
                    </Text>
                </View>

                <View style={{marginVertical: 10}}>
                    {this.renderApplyList()}
                </View>
            </View>
        )
    }

    /**
     * 
     * @param {Object} apply
     */
    renderApplyItem(apply){
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        const applicant = apply.user
        // return <ApplyItem key={String(apply.id)} apply={apply} onMorePressed={this.props.onMorePressed}/>
        return(
            <View key={apply.id} style={[rowAlign, {justifyContent: 'space-between', marginTop: 16}]}>

                <View style={[rowAlign, {alignItems: 'center'}]}>
                    <Avatar
                        src={apply.user.avatar}
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
                        {apply.price > 0 && <Text style={style.price}>{`${apply.price}${strings["currency"]}/${strings[this.props.payType]}`}</Text>}
                        <View style={[columnAlign, {marginTop: 6}]}>
                            <TouchableOpacity onPress={() => this.props.showProfilePress(applicant)}>
                                <Text style={[style.button, {fontSize: 12}]}>{strings["show_profile"]}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.props.onChatPressed(applicant)}>
                                <Text style={[style.button, {fontSize: 12, marginTop: 6}]}>{strings["ask_question"]}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                
                {   this.props.task.completed ? null :
                    <View style={{alignItems: 'flex-end', justifyContent: 'space-evenly',}}>

                        <TouchableOpacity onPress={() => this.props.onAssignPress(apply)}>
                            <Text style={{
                                ...style.button,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderColor: style.button.color,
                                borderRadius: 6,
                                borderWidth: 1
                            }}>{strings["appoint"]}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.props.onRefuseApplicantPressed(apply)}>
                            <Text style={{
                                color: '#EB5757',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderColor: '#EB5757',
                                borderRadius: 6,
                                borderWidth: 1
                            }}>{strings["apply_list_view_refuse"]}</Text>
                        </TouchableOpacity>

                    </View>
                }
                {/* <TouchableOpacity onPress={() => this.props.onAssignPress(applicant)}>
                    <Text style={style.button}>{strings["appoint"]}</Text>
                </TouchableOpacity> */}
                
            </View>
            
        )
    }

    renderApplyList(){

        if(this.props.applies.length === 0){
            return this.renderZeroState();
        }

        let items = [];
        this.props.applies.forEach(apply => {
            if(items.length > 0){
                items.push(
                    <View 
                        key={apply.id + "_separator"} 
                        style={{
                            flex: 1, 
                            height: 1, 
                            backgroundColor: 'rgba(59, 89, 152, 0.26)', 
                            marginVertical: 12, 
                            marginHorizontal: 24}}/>
                )
            }
            items.push(this.renderApplyItem(apply))
        })

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