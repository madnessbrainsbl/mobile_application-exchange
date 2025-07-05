/**
 *  ApplyItem.js
 *  View for rendering information about apply
 *  Created by Dmitry Chulkov 15/12/2019
 */

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
import Rating from "../../../components/Rating";
import Avatar from "../../../components/Avatar";
import icon from '../../../constant/Icons';
import strings from "../../../utils/Strings";

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingStart: 24,
        paddingEnd: 24,
        flex: 1
    },
    name: {
        fontSize: 18,
        color: 'rgba(0, 0, 0, 0.9)',//'#42436A',

    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E8F1E'
    },
    button: {
        color: '#3B5998'
    },
    assignButton: {
        borderRadius: 8,
        borderColor: '#3B5998',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6
    }
})



export default class ApplyItem extends React.PureComponent {

    render(){
        const columnAlign = {alignItems: this.props.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.props.isHebrew? 'row-reverse': 'row'};
        const {apply} = this.props
        let background = apply.status === "new"? 'rgba(159, 190, 254, 0.28)': 'white'
        return(
            <View key={String(apply.id)} style={[styles.container, {backgroundColor: background}]}>
                <View>
                    <View style={[rowAlign, {justifyContent: 'space-between', flex: 1}]}>
                        <View style={[rowAlign, {flex: 1}]}>
                            <Avatar src={apply.user.avatar}/>
                            <View style={[columnAlign, {marginHorizontal: 16, flex: 1}]}>
                                <Text style={styles.name}>{apply.user.first_name}</Text>
                                <Rating value={apply.user.rating} style={rowAlign}/>
                                <Text style={styles.price}>{apply.price}</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={this.onMorePressed}>
                            <Image source={icon("more")}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1, alignItems: this.props.isHebrew? 'flex-start': 'flex-end'}}>
                        <TouchableOpacity style={styles.assignButton}>
                            <Text style={styles.button}>{strings["appoint"]}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    onMorePressed = () => {
        this.props.onMorePressed(this.props.apply)
    }

}