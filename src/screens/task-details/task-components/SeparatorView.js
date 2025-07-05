import React from 'react';
import {
    Modal,
    SafeAreaView,
    Share,
    Text,
    TouchableOpacity,
    View,
    Image
} from 'react-native';

export default class SeparatorView extends React.Component{
    render(){
        const {height} = this.props;
        return(
            <View style={{backgroundColor: '#EFF0F4', height: height? Number(height): 20}}>
            </View>
        )
    }
}