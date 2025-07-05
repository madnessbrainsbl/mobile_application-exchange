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
    StyleSheet,
    Alert,
    Dimensions,
    SectionList,
    ActivityIndicator
} from 'react-native';
import strings from "../../utils/Strings";
import Color from '../../constant/Color';

const styles = StyleSheet.create({
    title: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center'
    },
    action: {
        fontWeight: 'bold',
        color: 'rgba(66, 67, 106, 0.86)',
    },
    skip: {
        color: 'rgba(66, 67, 106, 0.46)',
        paddingHorizontal: 12, 
        paddingVertical: 6
    },
    continueButton: {
        color: '#059e30',
        fontSize: 16,
    },
    description: {
        marginTop: 8,
        color: 'rgba(66, 67, 106, 0.86)',
        textAlign: 'center'
    },
    idleButtonContainer: {
        borderColor: Color.primary,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 24,
        paddingVertical: 8,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    idleButton: {
        fontSize: 16,
        color: Color.primary,
    },
    selectedButtonContainer: {
        borderColor: Color.primary,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 24,
        paddingVertical: 8,
        backgroundColor: Color.primary,
        alignItems: 'center'
    },
    selectedButton: {
        fontSize: 16,
        color: 'white',
    }
})

export default class AccountTypeScreen extends React.Component {

    state = {
        type: null,
        loading: false
    }

    render(){

        return (
            <View style={{flex: 1}}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24}}>

                    <Image source={require("../../assets/images/splash.jpg")} style={{width: 220, height: 220, resizeMode: 'contain'}}/>
                    {/* <Text style={styles.title}>{strings["quest_account_title"]}</Text>
                    <Text style={styles.description}>{strings["quest_account_description"]}</Text> */}

                    <View>
                        <TouchableOpacity onPress={this.employerPress} style={{marginTop: 8}}>
                            <View style={this.state.type === "creator"? styles.selectedButtonContainer: styles.idleButtonContainer}>
                            <Text style={this.state.type === "creator"? styles.selectedButton: styles.idleButton}>
                                {strings["quest_account_i_am_employer"]}
                            </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.employeePress} style={{marginTop: 8}}>
                            <View style={this.state.type === "performer"? styles.selectedButtonContainer: styles.idleButtonContainer}>
                                <Text style={this.state.type === "performer"? styles.selectedButton: styles.idleButton}>
                                    {strings["quest_account_i_am_employee"]}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        )
    }

    employerPress = () => {
        this.props.navigation.navigate("SignIn", {accountType: 'creator'})
    }

    employeePress = () => {
        this.props.navigation.navigate("SignIn", {accountType: 'performer'})
    }
}