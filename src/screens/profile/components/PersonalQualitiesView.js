import React from 'react';
import {
    Image,
    FlatList,
    Text,
    View,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    TouchableWithoutFeedback,
    ScrollView,
    Linking,
    StyleSheet,
    Alert
} from 'react-native';
import strings from '../../../utils/Strings';
import PropTypes from 'prop-types'

const styles = StyleSheet.create({
    personalQuality: {
        borderColor: 'rgba(66, 67, 106, 0.86)',
        borderWidth: 1,
        borderRadius: 14,

        flexDirection: 'row',
        alignItems: 'center',

        paddingStart: 12,
        paddingEnd: 2,
        paddingVertical: 2,

        marginHorizontal: 4,
        marginVertical: 4,
    },
    personalQualityRTL: {
        flexDirection: 'row-reverse',
    },
    personalQualityText: {
        fontWeight: "bold",
        fontSize: 14,
        color: 'rgba(66, 67, 106, 1.0)',
    },
    title: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 2
    },
    counterContainer: {
        backgroundColor: '#42436A',
        borderRadius:  100,
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
        width: 20,
        marginLeft: 4

    },
    counterContainerRTL: {
        marginRight: 4,
        marginLeft: 0
    },
    counter: {
        color: 'white',
        fontWeight: '600',
        fontSize: 10
    }
})

class PersonalQualitiesView extends React.Component {

    render(){
        return (
            <View style={[this.props.style, this.props.isHebrew? {alignItems: 'flex-end'}: {}]}>
                <Text style={[styles.title]}>{this.props.title}</Text>
                <View style={{flexDirection: this.props.isHebrew?'row-reverse':'row', flexWrap: 'wrap'}}>
                    {this.renderQualities()}
                </View>
            </View>
        )
    }

    renderQualities(){
        return this.props.qualityList.map(item => {
            let quality = item["quality_name"]
            return(
                <View key={quality} style={[styles.personalQuality, this.props.isHebrew? styles.personalQualityRTL: {}]}>
                    <Text style={styles.personalQualityText}>{strings[quality] || quality}</Text>
                    <View style={[styles.counterContainer, this.props.isHebrew? styles.counterContainerRTL: {}]}>
                        <Text style={styles.counter}>{item["counter"]}</Text>
                    </View>
                </View>
            )
        })
    }
}

PersonalQualitiesView.propTypes = {
    qualityList: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    isHebrew: PropTypes.bool
}

PersonalQualitiesView.defaultProps = {
    isHebrew: false
  };

export default PersonalQualitiesView