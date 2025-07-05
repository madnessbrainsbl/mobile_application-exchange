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
    photo: {
        height: 64,
        width: 64,
        borderRadius: 32,
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

export default class CustomerView extends React.Component {

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
        const {customer} = this.props;
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};

        return(
            <View style={[style.container, columnAlign]}>
                <Text style={style.title}>{strings["customer"]}</Text>
                <View style={[rowAlign, {alignItems: 'center', marginTop: 10}]}>
                    <Avatar
                        src={customer["avatar"]}
                        style={{
                            marginRight: this.state.isHebrew ? 0 : 16,
                            marginLeft: this.state.isHebrew ? 16 : 0,
                        }}
                    />

                    <View style={{flex: 1}}>
                        <View style={columnAlign}>
                            <Text style={style.customerName}>{customer["first_name"]} {customer["last_name"]}</Text>
                            <Rating 
                                style={style.rating}
                                value={customer.rating}/>
                        </View>
                        
                    </View>
                </View>

                <View style={{marginTop: 6, flexDirection: this.state.isHebrew? 'row-reverse': 'row', justifyContent: 'flex-end', width: "100%"}}>
                    <TouchableOpacity onPress={() => this.props.onShowProfile(customer)}>
                        <Text style={[style.button, {marginStart: 10, marginEnd: 10}]}>{strings["show_profile"]}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.props.askQuestion()}>
                        <Text style={style.button}>{strings["ask_question"]}</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        )
    }

}