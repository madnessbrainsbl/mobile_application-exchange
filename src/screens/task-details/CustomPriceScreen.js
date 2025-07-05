/**
 *  CustomPriceScreen.js
 *  
 *  Created by Dmitry Chulkov 10/12/2019
 */

import React from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    View,
    TextInput,
    Image,
    KeyboardAvoidingView
} from 'react-native';

import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
import strings from "../../utils/Strings";

class CustomPriceScreen extends React.Component{

    state = {
        price: null,
        isHebrew: false,
        inProgress: false,
    }

    api = new BackendAPI(this);
    applyForTaskEndpoint = this.api.getApplyForTaskEndpoint();

    render(){
        let task = this.props.route.params?.task || null
        let priceString = strings["filter_day_price"]
        if(task && task["pay_type"] === "hour"){
            priceString = strings["filter_hour_price"]
        }
        return(
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
                <View style={{}}>

                    <View style={{marginTop: 46, alignItems: 'center', justifyContent: 'space-between',}}>

                        <View style={{marginHorizontal: 30, alignItems: 'center'}}>
                            <Text style={{fontSize: 20, fontWeight: '500', textAlign: 'center'}}>{strings["custom_price_title"]}</Text>
                            <Text style={{fontSize: 16, color: 'rgba(0, 0, 0, 0.65)', textAlign: 'center'}}>{strings["custom_price_description"]}</Text>
                        </View>

                        <View style={{alignItems: 'center', marginTop: 16}}>
                            <TextInput 
                                value={this.state.price}
                                onChangeText={(text) => this.setState({price: text})}
                                keyboardType="numeric"
                                placeholder="0"
                                ref={(ref)=>{this.priceInputRef = ref}}
                                style={{fontSize: 56, fontWeight: '500'}}/>

                            <Text style={{color: "#2E8F1E", fontSize: 38, marginTop: 8, fontWeight: "bold"}}>{priceString}</Text>
                        </View>  


                        {this.renderAction()}

                    </View>

                </View>
            </KeyboardAvoidingView>
            
        )
    }

    renderAction(){
        if(this.state.inProgress){
            return(
                <View style={{marginTop: 20}}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        }else{
            return(
                <View style={{backgroundColor: '#3B5998', padding: 12, borderRadius: 8, marginTop: 16}}>
                    <TouchableOpacity style={{justifyContent: 'center'}} onPress={this.submit}>
                        <Text style={{color: 'white', fontSize: 16, textAlign: 'center', }}>{strings["custom_price_submit"]}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    componentDidMount(){
        this.priceInputRef.focus()
    }

    submit = async () => {
        let task = this.props.route.params?.task || null
        if(!task) return

        this.setState({inProgress: true})

        let apply = {
            task_id: task.id,
            price: this.state.price
        }

        let callback = this.props.route.params?.callback || null
        if(callback){
            callback(apply)
        }

        this.props.navigation.goBack()
    }

}

export default CustomPriceScreen;