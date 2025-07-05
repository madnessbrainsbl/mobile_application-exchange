/**
 *  ExtendAction.js
 *  Shows user embedded dialog with task extend actions
 *  Created by Dmitry Chulkov 15/12/2019
 */

import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';

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
        fontWeight: 'bold',

    },
    actionButton: {
        width: 100,
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 6,
        marginHorizontal: 10,
        borderWidth: 1
    },
    confirmButton:{
        borderColor: "#3B5998",
    },
    confirmButtonText:{
        color: "#3B5998",
        // fontWeight: 'bold',
        fontSize: 12
    },
    denyButton: {
        borderColor: '#EB5757',
    },
    denyButtonText: {
        color: '#EB5757',
        // fontWeight: 'bold',
        fontSize: 12
    },
    descriptionText:{
        color: 'rgba(0, 0, 0, 0.36)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 6,
    }
})

export default class ExtendAction extends React.PureComponent {

    render(){
        const rowAlign = {flexDirection: this.props.isHebrew? 'row': 'row-reverse'};
        return(
            <View style={style.container}>
                <Text style={style.title}>{strings["task_view_expiring_title"]}</Text>
                <Text style={style.descriptionText}>{strings["task_view_expiring_body"]}</Text>

                <View style={[rowAlign, {alignItems: 'center', marginTop: 10}]}>
                    <TouchableOpacity style={[style.actionButton, style.confirmButton]} onPress={this.props.accept}>
                        <Text style={style.confirmButtonText}>{strings["common_yes"]}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.actionButton, style.denyButton]} onPress={this.props.refuse}>
                        <Text style={style.denyButtonText}>{strings["common_no"]}</Text>
                    </TouchableOpacity>

                </View>
                
            </View>
        )
    }

}