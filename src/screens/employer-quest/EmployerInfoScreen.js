/**
 *  EmployerInfoScreen.js
 *  Screen with adding information about creator
 * 
 */
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
    ActivityIndicator,
    KeyboardAvoidingView,
    TextInput,
    Switch
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from "react-native-picker-select";
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import strings from "../../utils/Strings";
import Avatar from '../../components/Avatar';
import {SimpleButton} from "../../components/Buttons";
import Color from '../../constant/Color';
import {getPlaces, getPlaceDetails} from '../../utils/google-places';
import * as Location from 'expo-location';
import Autocomplete from 'react-native-autocomplete-input';
import { CommonActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import { updateProfile } from '../../redux/profile/handlers';
import NotificationHelper from '../../utils/NotificationHelper';

const styles = StyleSheet.create({
    title: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 20,
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
        color: Color.accent,
        fontSize: 17,
        borderColor: Color.accent,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 32,
        paddingVertical: 10
    },
    description: {
        marginTop: 8,
        color: 'rgba(66, 67, 106, 0.86)',
        textAlign: 'center'
    },
    sectionTitle: {
        color: "#42436A",
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionDescription: {
        color: 'rgba(66, 67, 106, 0.86)',
    },
    fieldPicker: {
        height: 38,
        padding: 5,
        justifyContent: "center",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0",
        paddingHorizontal: 16
    },
    fieldInput: {
        height: 38,
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0",
        paddingHorizontal: 16
    },

    
    fieldInputMultiline: {
        paddingVertical: 20,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0",
        paddingHorizontal: 16
    }
})

export default class EmployerInfoScreen extends React.Component {

    state = {
        loading: false,
        first_name: '',
        last_name: '',
        company_name: '',
        address: '',
        city: '',
        street: '',
        building_number: '',
        location: null,
        photo: null,
        language: null,
        placePredictions: [],
        showPredictions: false,
        place_id: null,
    }

    api = new BackendAPI(this);
    updateUserEndpoint = this.api.getUpdateUserEndpoint();

    requestPredictionsTimer = null;

    componentDidMount(){
        this.getUserLocation();
        this.setLanguage();
    }

    setLanguage = async () => {
        let lang = await settings.getLanguage();
        if(lang === 'he'){
            lang = 'iw'; // Hebrew in Google
        }
        this.setState({language: lang});
    }

    render(){

        let content = (
            <ScrollView>
                <TouchableWithoutFeedback onPress={() => this.setState({showPredictions: false})} style={{flex: 1}}>
                <View style={{
                    flex: 1,
                    padding: 24,
                    marginTop: 0
                }}>
                    <View>
                        <View style={{alignItems: 'center'}}>
                            <Image source={require("../../assets/images/splash.jpg")} style={{width: 180, height: 110, resizeMode: 'contain'}}/>
                        </View>

                        <View style={{marginBottom: 16, flexDirection: 'column', alignItems: 'center'}}>
                                <Avatar size={80} src={this.state.photo}/>

                                <TouchableOpacity onPress={this.changePhoto} style={{marginTop: 8}}>
                                        <View style={{
                                            borderColor: Color.primary,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            paddingHorizontal: 20,
                                            paddingVertical: 4,
                                            backgroundColor: 'white',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ fontSize: 16, color: Color.primary}}>
                                                {strings["employer_quest_photo_button"]} 
                                            </Text>
                                        </View>
                                </TouchableOpacity>
                                
                            </View>

                        

                        <View style={{paddingHorizontal: 8}}>

                            <View style={{marginBottom: 16}}>
                                <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                    {strings["company_name"]}
                                </Text>
                                <TextInput style={styles.fieldInput}
                                    onChangeText={value => this.setState({"company_name": value})}
                                    value={this.state["company_name"]}
                                />

                                <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                    {strings["company_address"]}
                                </Text>
                                <View style={{height: 38, marginBottom: 62}}>
                                    {this.renderAutoCompleteInput()}
                                </View>
                                

                                <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                    {strings["name"]}
                                </Text>
                                <TextInput style={styles.fieldInput}
                                    onChangeText={value => this.setState({"first_name": value})}
                                    value={this.state["first_name"]}
                                />
                        
                                <Text style={[styles.sectionTitle, {marginBottom: 6}]}>
                                    {strings["surname"]}
                                </Text>
                                <TextInput style={styles.fieldInput}
                                    onChangeText={value => this.setState({"last_name": value})}
                                    value={this.state["last_name"]}
                                /> 

                            </View>


                            <View style={{alignItems: 'center'}}> 
                                {
                                    this.state.loading?
                                    <ActivityIndicator style={{marginTop: 40}} color={Color.primary}/> :
                                    <View style={{alignItems: 'center'}}>
                                        {this.getContinueButton()}
                                    </View>
                                }
                            </View>

                        </View>
                    </View>                    
                </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        )

        if(Platform.OS === 'ios'){
            return (
                <KeyboardAvoidingView behavior="padding" style={{backgroundColor: 'white', flex: 1}}>
                    {content}
                </KeyboardAvoidingView>
            );
        }else{
            return content;
        }
        
    }

    getUserLocation = async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') return;

        let location = await Location.getLastKnownPositionAsync();
        
        const {
            coords: {
                latitude,
                longitude
            }
        } = location;
        this.setState({location: `${latitude},${longitude}`});
    }


    changePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    strings["permission_required"],
                    strings["photo_permission_required"],
                    [{ text: strings["ok"] }]
                );
                return;
            }

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
                this.setState({ photo: manipResult.uri });
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

    changePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            return;
        }

        const image = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            base64: true
        });

        if (!image.canceled) {
            const resizedImage = await ImageManipulator.manipulateAsync(
                image.assets[0].uri,
                [{resize: {width: 256, height: 256}}],
                { format: "jpeg", base64: true }
            );

            this.setState({
                photo: {
                    uri: resizedImage.uri,
                    base64: resizedImage.base64
                }
            });
        }
    }

    onAddressInputChange = async (text) => {
        this.setState({address: text});
        if(this.requestPredictionsTimer !== null){
            clearTimeout(this.requestPredictionsTimer);
        }
        this.requestPredictionsTimer = setTimeout(this.getPlacePredictions, 2000);
    }

    getPlacePredictions = async () => {
        const text = this.state.address;
        if(text.length < 3) return;
        const predictions = await getPlaces(text, this.state.location, this.state.language);
        this.setState({placePredictions: predictions, showPredictions: true});
        console.log(JSON.stringify(predictions));
    }

    renderAutoCompleteInput = () => {
        const data = this.state.placePredictions;
        const autocompleteInput = (
            <Autocomplete
                data={data}
                defaultValue={this.state.address}
                hideResults={!this.state.showPredictions || this.state.placePredictions.length === 0}
                renderItem={({ item, i }) => (
                    <TouchableOpacity onPress={() => this.setState({
                        address: item["description"],
                        showPredictions: false,
                        place_id: item["place_id"]
                        })}>
                        <Text style={{
                            paddingVertical: 3
                        }}>{item["description"]}</Text>
                    </TouchableOpacity>
                )}
                renderTextInput={(props) => (
                    <TextInput style={[styles.fieldInput, {marginBottom: 0}]}
                        onFocus={() => this.setState({showPredictions: true})}
                        onChangeText={this.onAddressInputChange}
                        value={this.state["address"]}
                    />
                )}
                inputContainerStyle={{ borderWidth: 0, marginBottom: 4}}
                listContainerStyle={{
                    padding: 0,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderRadius: 4,
                    marginTop: 0,
                    borderColor: 'rgba(0, 0, 0, 0.2)'
                }}
                listStyle={{
                    borderWidth: 0
                }}
            />
        )

        return(
            <View style={{
                flex: 1,
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 100
            }}>
               {autocompleteInput}
            </View>
        )
    }


    getContinueButton(){
        let disabledButton = (
            <View style={{marginTop: 40}}>
                <Text style={{...styles.continueButton, color: "rgba(5, 158, 48, 0.3)", borderColor: "rgba(5, 158, 48, 0.5)"}}>{strings["quest_continue"]}</Text>
            </View>
        )

        if(this.state.first_name === ''){
            return disabledButton;
        }

        if(this.state.last_name === ''){
            return disabledButton;
        }

        if(this.state.company_name === 'null'){
            return disabledButton;
        }

        return (
            <TouchableOpacity style={{marginTop: 40}} onPress={this.continuePress}>
                <Text style={styles.continueButton}>{strings["quest_continue"]}</Text>
            </TouchableOpacity>
        )
    }

    requestPlaceDetails = async (place_id) => {
        const addressComponents = await getPlaceDetails(place_id, this.state.language);
        if(addressComponents.length === 0) return null;

        let streetNumber = '';
        let street = '';
        let city = '';
        addressComponents.forEach(component => {
            if(component["types"].includes("street_number")){
                streetNumber = component["short_name"];
                return;
            }

            if(component["types"].includes("route")){
                street = component["short_name"];
                return;
            }

            if(component["types"].includes("locality")){
                city = component["short_name"];
                return;
            }
        })

        return {streetNumber, street, city}

    }

    continuePress = async() => {
        if(this.state.first_name === '' || 
            this.state.last_name === '' || 
            this.state.company_name === '' ||
            this.state.address === '' ||
            this.state.loading) return

        this.setState({loading: true})

        const params = {
            "first_name": this.state.first_name,
            "last_name": this.state.last_name,
            "company_name": this.state.company_name,
            "address": this.state.address,
            "account_type": "creator"
        }

        if(this.state.place_id !== null){
            const addressComponensts = await this.requestPlaceDetails(this.state.place_id);
            if(addressComponensts !== null){
                params["city"] = addressComponensts["city"];
                params["street"] = addressComponensts["street"];
                params["building_number"] = addressComponensts["streetNumber"];
            }
        }
        
        if(this.state.photo){
            params["avatar"] = `data:image/jpeg;base64,${this.state.photo.base64}`
        }
        
        const result = await this.updateUserEndpoint(params);

        this.props.navigation.replace("CreateTask",  {prev: true});
    }

    getPermissions = async() => {
        const { status: existingStatus } = await NotificationHelper.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await NotificationHelper.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    };
}