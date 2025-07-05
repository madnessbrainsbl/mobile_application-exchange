import React from 'react';
import {
    Image,
    Text,
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import strings from "../utils/Strings";
import Color from '../constant/Color';
import Avatar from '../components/Avatar';

const styles = StyleSheet.create({
    name: {
        color: '#42436A',
        fontSize: 20,
        fontWeight: '500',
    },
    category: {
        color: 'rgba(66, 67, 106, 0.86)',
        fontSize: 14,
    },
    about: {
        color: 'rgba(66, 67, 106, 0.86)',
        fontSize: 14,
    },
    price: {
        color: '#2E8F1E',
        fontSize: 14,
        fontWeight: 'bold'
    },
    actionButton: {
        color: 'rgba(59, 89, 152, 0.76)',
        fontWeight: 'bold',
        fontSize: 14
    },
    separator: {
        backgroundColor: 'rgba(66, 67, 106, 0.16)',
        height: 1
    }
})

export default class PerformerCard extends React.PureComponent{
    render(){

        let direction = this.props.user.category? strings.getCategory(this.props.user.category.name): strings["performer"]
        const {isHebrew} = this.props
        const rowAlign = isHebrew? 'row-reverse': 'row'
        return(
            <TouchableOpacity onPress={this.props.onPress}>
                <View style={{marginVertical: 16, marginHorizontal: 24, flex: 1}}>

                    <View style={{flexDirection: rowAlign, justifyContent: 'space-between', flex: 1}}>
                        <View style={{flexDirection: rowAlign, flex: 1}}>
                            <Avatar size={60} src={this.props.user.avatar}/>
                            <View style={{marginHorizontal: 20, flex: 1, alignItems: isHebrew? 'flex-end' : 'flex-start'}}>
                                <Text style={[styles.name, {textAlign: isHebrew? 'right': 'left'}]}>{`${this.props.user.first_name} ${this.props.user.last_name}`}</Text>
                                <Text style={styles.category}>{direction}</Text>
                            </View>
                        </View>

                        <View>
                            <Text style={styles.price}>{this.props.user.min_rate_hour? strings.formatString(strings["profile_min_rate_hour"], this.props.user.min_rate_hour): ""}</Text>
                            <Text style={styles.price}>{this.props.user.min_rate_day? strings.formatString(strings["profile_min_rate_day"], this.props.user.min_rate_day): ""}</Text>
                        </View>
                    </View>

                    <View style={{marginTop: 6, alignItems: isHebrew? 'flex-end':'flex-start',}}>
                        <Text style={styles.about}>{this.props.user.about}</Text>
                    </View>
                    <View style={{alignItems: isHebrew? 'flex-start':'flex-end', marginTop: 6}}>
                        <Text style={styles.actionButton}>{strings["performer_card_open_profile"]}</Text>
                    </View>
                    
                </View>
                <View style={[styles.separator, {marginStart: 24}]}/>
            </TouchableOpacity>
        )
    }
}