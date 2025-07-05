/**
 *  ReviewDoneScreen.js
 *  Success screen that is shown after leaving reviews
 * 
 *  Created by Dmitry Chulkov
 */
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Image
} from 'react-native';
import DoneImage from "../../assets/images/img_done.png";
import strings from "../../utils/Strings";

const style = StyleSheet.create({
    rootContainer:{
        backgroundColor: "#EFF0F4", 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    continueButtonContainer:{
        marginTop: 12,
        alignItems: 'center'
    },
    mainTitle:{
        color: "#42436A",
        fontSize: 26,
        fontWeight: "500",
        marginTop: 10
    },
    subtitle: {
        color: "rgba(66, 67, 106, 0.7)",
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 30
    }

})

 class ReviewDoneScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "",
            headerRight: null,
            headerLeft: null
        };
    }
    
    render(){
        let reviewType = this.props.route.params?.reviewType || "Performer"
        let reviewForEmployer = reviewType === "Employer"
        return(
            <View style={{flex: 1}}>
                <View style={style.rootContainer}>

                    <View style={{alignItems: 'center'}}>
                        <Image source={DoneImage} style={{height: 100, width: 100}}/>
                        <Text style={style.mainTitle}>{strings["review_done_title"]}</Text>
                        <Text style={style.subtitle}>{reviewForEmployer? strings["review_done_description_employer"]: strings["review_done_description"]}</Text>
                    </View>


                    <View style={style.continueButtonContainer}>
                        <TouchableOpacity style={{marginTop: 26}} onPress={this.onContinuePress}>
                            <Text style={{
                                color: "#3B5998",
                                borderColor: "#3B5998",
                                borderWidth: 1,
                                borderRadius: 6,
                                paddingVertical: 10,
                                paddingHorizontal: 32
                            }}>
                               {strings["review_done_continue_button"]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        )
    }

    onContinuePress = () => {
        this.props.navigation.popToTop()
    }


}

export default ReviewDoneScreen