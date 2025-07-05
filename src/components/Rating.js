import React from "react";
import {
    Image,
    Button,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    View,
} from "react-native";

import icon from "../constant/Icons";

const style = StyleSheet.create({
    starSize: {
        height: 16,
        width: 16,
        resizeMode: 'contain',
    },
    starSpace: {
        marginRight: 4
    }
})

class Rating extends React.Component {
    render() {
        const {value, ...props} = this.props;
        return (
            <View {...props}>
                {
                    Rating.getRating(value).map((x, i) => (
                        Rating.getImage(x, i)
                    ))
                }
            </View>
        );
    }

    static getRating(value) {
        const result = [];
        const rating = Math.floor((value || 0) * 2) / 2.0;

        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                result.push(1);
            }
            else if (i - 0.5 === rating) {
                result.push(0.5);
            }
            else {
                result.push(0);
            }
        }

        return result;
    }

    static getImage(value, index) {
        switch (value) {
            case 1:
                return (
                    <Image key={index} source={icon("star-full")} style={[style.starSize, style.starSpace]}/>
                );
            case  0.5:
                return (
                    <Image key={index} source={icon("star-half")} style={[style.starSize, style.starSpace]}/>
                );
            default:
                return (
                    <Image key={index} source={icon("star-blank")} style={[style.starSize, style.starSpace]}/>
                );
        }
    }
}

export default Rating;