import React from 'react';
import {
    Image,
    Text,
    View,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    TouchableWithoutFeedback,
    ScrollView,
    Linking,
    StyleSheet,
    Alert,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native';
import icon from '../../constant/Icons';
import strings from '../../utils/Strings';

const styles = StyleSheet.create({
    titlePrimary: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    titleSecondary: {
        color: 'white', 
        fontSize: 10
    },
    titleContainer: {
        alignItems: Platform.OS === 'ios'? 'center': 'flex-start'
    },
    doneButtonContainer: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        
    },
    doneButtonImage:{
        width: 24,
        height: 24,
        resizeMode: 'contain',
    }
})

class ReviewTextEditScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        let user = navigation.getParam("user", null)
        let username = user? `${user.first_name} ${user.last_name}` : ""
        return {
            title: "%Username%",
            headerTitle: ({ style, children : title }) => {
                return (
                    <View style={styles.titleContainer}>
                        <Text style={styles.titlePrimary}>{strings["your_review_title"]}</Text>
                        <Text style={styles.titleSecondary}>{username}</Text>
                    </View>
                )
              },
            headerRight: (
                <TouchableOpacity
                    style={styles.doneButtonContainer}
                        onPress={() => navigation.getParam("donePressed", () => {})()}
                    >
                        <Image 
                            source={icon("done")}
                            style={styles.doneButtonImage}/>
                    </TouchableOpacity>
            )
          };
    }

    state = {
        text: this.props.route.params?.text || "",
        user: this.props.route.params?.user || null
    }

    componentDidMount(){
        this.props.navigation.setParams({"donePressed": this.donePressed})
    }

    donePressed = () => {
        if(!this.state.text) return

        let reviewCallback = this.props.route.params?.reviewCallback || null
        if(reviewCallback){
            reviewCallback(this.state.text)
        }
        this.props.navigation.goBack()
    }

    render(){
        let {user} = this.state
        let username = user?`${user.first_name} ${user.last_name}`:""
        return(
            <KeyboardAvoidingView behavior="padding" style={{flex: 1}} keyboardVerticalOffset={90}>
                <View style={{flex: 1, marginHorizontal: 16}}>
                    <TextInput 
                        multiline 
                        placeholder={strings.formatString(strings["your_review_placeholder"], username)}
                        value={this.state.text}
                        onChangeText={text => this.setState({text})}
                        style={{flex: 1, textAlignVertical: 'top', paddingTop: 16}}/>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

export default ReviewTextEditScreen
