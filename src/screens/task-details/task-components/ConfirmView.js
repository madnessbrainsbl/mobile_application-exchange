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
import settings from "../../../../backend/Settings";
import strings from "../../../utils/Strings";

const style = StyleSheet.create({
    container:{
        paddingTop: 16,
        paddingBottom: 16,
        paddingStart: 24,
        paddingEnd: 24,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    title: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    actionButton: {
        width: 130,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 4,
        marginHorizontal: 10
    },
    confirmButton:{
        backgroundColor: "#3B5998",
    },
    denyButton: {
        backgroundColor: '#EB5757',
    },
    descriptionText:{
        color: 'rgba(0, 0, 0, 0.36)',
        fontSize: 11,
        textAlign: 'center'
    }
})

export default class ConfirmView extends React.Component{

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
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};

        return(
            <View style={style.container}>
                <Text style={style.title}>{strings["confirm_view_title"]}</Text>
                <View style={[rowAlign, {alignItems: 'center', marginTop: 20}]}>
                    

                    <TouchableOpacity style={[style.actionButton, style.confirmButton]} onPress={() => this.props.onConfirmPress()}>
                        <Text style={{color: 'white'}}>{strings["confirm_view_button_confirm"]}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.actionButton, style.denyButton]} onPress={() => this.props.onRefusePress()}>
                        <Text style={{color: 'white'}}>{strings["confirm_view_button_deny"]}</Text>
                    </TouchableOpacity>

                    

                </View>

                <View style={{marginTop: 20}}>
                    
                    <Text style={style.descriptionText}>{strings["confirm_view_description"]}</Text>
                    
                </View>
                
            </View>
        )
    }
}