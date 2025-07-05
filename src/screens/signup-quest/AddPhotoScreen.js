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
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import BackendAPI from "../../../backend/BackendAPI";
import strings from "../../utils/Strings";
import Avatar from '../../components/Avatar';
import {SimpleButton} from "../../components/Buttons";
import Color from '../../constant/Color';
import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';
import { Notifications as ExpoNotifications } from 'expo';
import * as Notifications from 'expo-notifications';

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
    }
})

class AddPhotoScreen extends React.Component {

    static navigationOptions = {
        header: null
    };

    api = new BackendAPI(this);
    updateUserEndpoint = this.api.getUpdateUserEndpoint();

    state = {
        avatar:  this.props.userProfile !== null? this.props.userProfile["avatar"]: null,
        isLoading: false
    }
 
    async componentDidMount() {
        // Request permissions when component mounts
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    strings["permission_required"],
                    strings["photo_permission_required"],
                    [{ text: strings["ok"] }]
                );
            }
        }
    }

    render(){
        return (
            <View style={{flex: 1}}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24}}>
                    <Text style={styles.title}>{strings["quest_add_photo_title"]}</Text>
                    <View style={{marginTop: 24}}>
                        <Avatar size={140} src={this.state.avatar}/>
                    </View>
                    <SimpleButton 
                        style={{marginTop: 24}}
                        title={strings["pick_photo"]} 
                        bold
                        onPress={this.pickImage}/>

                    <SimpleButton 
                        style={{marginTop: 24}}
                        title={strings["take_photo"]} 
                        bold
                        onPress={this.takePhoto}/>

                    {
                        this.state.isLoading?
                        <ActivityIndicator style={{marginTop: 50}} color={Color.primary}/> :
                        <TouchableOpacity style={{marginTop: 50}} onPress={this.continuePress}>
                            <Text style={{...styles.continueButton, color: this.state.avatar? styles.continueButton.color: "rgba(5, 158, 48, 0.5)"}}>{strings["quest_continue"]}</Text>
                        </TouchableOpacity>
                    }

                    
                    
                </View>

                {
                    !this.state.isLoading && 
                    <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center'}}>
                        <TouchableOpacity style={{marginBottom: 46}} onPress={this.skipStep}>
                            <Text style={styles.skip}>{strings["quest_skip"]}</Text>
                        </TouchableOpacity>
                    </View>
                }

                

            </View>
        )
    }

    showAlertMessage(text){
        Alert.alert(
            "",
            text,
            [{text: "Ok", onPress: null}]
        )
    }

    pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const manipResult = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 400 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                this.setState({ avatar: manipResult.uri });
            }
        } catch (error) {
            console.log('Error picking image:', error);
            Alert.alert(
                strings["error"],
                strings["error_picking_image"],
                [{ text: strings["ok"] }]
            );
        }
    };

    takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    strings["permission_required"],
                    strings["camera_permission_required"],
                    [{ text: strings["ok"] }]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const manipResult = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 400 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                this.setState({ avatar: manipResult.uri });
            }
        } catch (error) {
            console.log('Error taking photo:', error);
            Alert.alert(
                strings["error"],
                strings["error_taking_photo"],
                [{ text: strings["ok"] }]
            );
        }
    };

    continuePress = async () => {
        if(!this.state.avatar) return
        
        this.setState({isLoading: true})

        const updatedProfile = await this.updateUserEndpoint({
            "avatar": `data:image/jpeg;base64,${this.state.avatar}`
        });
        this.props.updateProfile(updatedProfile);

        this.props.navigation.navigate("AddInfo");
    }

    skipStep = () => {
        this.props.navigation.navigate("AddInfo")
    }

    getPermissions = async() => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    };
}

const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateProfile,
}

export default connect(mapStateToProps, mapDispatchToProps)(AddPhotoScreen);