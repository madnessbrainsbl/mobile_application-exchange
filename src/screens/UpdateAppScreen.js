/**
 *  UpdateAppScreen.js
 * 
 *  Created by Dmitry Chulkov
 */
import React from 'react';
import {
    View, 
    Text,
    TouchableOpacity,
    Image,
    Platform
} from 'react-native';
import { Linking } from "expo";
import strings from '../utils/Strings';
import Color from '../constant/Color';
import { PrimaryButton } from '../components/Buttons';


import { connect } from 'react-redux';
import { doNotCheckNewVersionAgain } from '../redux/config/handlers';


class UpdateAppScreen extends React.Component {

    render() {
        const appVersion = this.props.route?.params?.appVersion || null;
        return (
            <View style={{alignItems:'center', justifyContent: 'center', flex: 1}}>
                <Image source={require('../assets/images/update.png')}
                    style={{
                        height: 100,
                        resizeMode: 'contain'
                    }}
                />

                <Text style={{
                    color: Color.primaryText,
                    fontSize: 24,
                    marginHorizontal: 26,
                    marginTop: 24,
                    textAlign: 'center'
                }}>
                    {strings["new_version_available"]}
                </Text>
                <Text style={{
                    fontWeight: 'bold',
                    color: Color.secondaryText
                }}>
                    {appVersion.version}
                </Text>

                <Text style={{
                    marginTop: 20,
                    marginHorizontal: 36
                }}>
                    {appVersion.description}
                </Text>

                <PrimaryButton 
                    title={strings["new_version_update"]} 
                    style={{marginTop: 24}}
                    onPress={this.openStore}/>

                {
                    appVersion.required? null:
                    <TouchableOpacity 
                        onPress={this.later}
                        style={{marginTop: 34}}>
                        <Text style={{color: Color.secondaryText}}>{strings["new_version_later"]}</Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    later = () => {
        this.props.doNotCheckNewVersionAgain();
        this.props.navigation.navigate("App")
    }

    openStore = () => {
        if(Platform.OS === 'ios'){
            // Open AppStore
            Linking.openURL('https://apps.apple.com/us/app/jobe/id1455612575');
        }else{
            // Open PlayMarket
            Linking.openURL('https://play.google.com/store/apps/details?id=com.ansim.extra');
        }
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
})

//Map your action creators to your props.
const mapDispatchToProps = {
    doNotCheckNewVersionAgain,
}

//connect(mapStateToProps, mapDispatchToProps)
//export default MainTaskListScreen;
export default connect(mapStateToProps, mapDispatchToProps)(UpdateAppScreen);