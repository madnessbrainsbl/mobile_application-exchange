/**
 *  Buttons.js
 *  This file contains app buttons
 * 
 *  Created by Dmitry Chulkov
 *  14/08/2019
 */

import React from 'react';
import {
    ActivityIndicator, 
    Image, 
    Text, 
    TouchableOpacity, 
    View
} from 'react-native';
import PropTypes from 'prop-types';
import icon from "../constant/Icons";
import Color from "../constant/Color";

function HeaderTextButton(props){
    let containerStyle = {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
    }

    let textStyle = {
        fontSize: 17,
        color: "white"
    }

    return(
        <View>
            <TouchableOpacity style={containerStyle} onPress={props.onPress}>
                <Text style={textStyle} >{props.title}</Text>
            </TouchableOpacity>
        </View>
    )
}

function SimpleButton(props){

    let textStyle = {
        fontSize: 14,
        color: Color.primary,
        fontWeight: props.bold? "bold": "normal"
    }

    return(
        <View style={props.style}>
            <TouchableOpacity onPress={props.onPress}>
                <Text style={textStyle} >{props.title}</Text>
            </TouchableOpacity>
        </View>
    )
}

SimpleButton.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func
}

function PrimaryButton(props){
    return(
        <View style={props.style}>
            <TouchableOpacity 
                onPress={props.onPress}
                style={{
                    backgroundColor: Color.primary,
                    borderRadius: 6,
                }}
            >
                <Text style={{
                    fontSize: 17,
                    color: "white",
                    marginHorizontal: 34,
                    marginVertical: 12
                }} >{props.title}</Text>
            </TouchableOpacity>
        </View>
    )
}

function BurgerButton(props){
    return(
        <TouchableOpacity
            style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,}}
                onPress={() => props.openDrawer()}
            >
            <Image source={icon("burger")}/>
        </TouchableOpacity>
    )
}


export {
    HeaderTextButton,
    SimpleButton,
    BurgerButton,
    PrimaryButton
}

