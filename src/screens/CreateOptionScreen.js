import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import strings from "../utils/Strings";

import Color from '../constant/Color';

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Color.primary,
        borderStyle: 'solid'
    },
    buttonText: {
        color: Color.primary,
        fontSize: 16,
        textAlign: 'center'
    }
})

export default class CreateOptionScreen extends React.Component {

    render(){
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: "center"}}>
                <View>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("CreateTask", {fromOptionScreen: true})}>
                        <View style={styles.button}>
                            <Text style={{color: Color.primary, fontSize: 16}}>{strings["create_option_task"]}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={{marginTop: 16}} onPress={() => this.props.navigation.navigate("CreateEmployeeAd",  {fromOptionScreen: true})}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>{strings["create_option_ad"]}</Text>
                        </View>
                    </TouchableOpacity>

                </View>
                
            </View>
        )
    }
}