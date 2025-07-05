import React from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    DatePickerAndroid,
    TimePickerAndroid,
    StyleSheet,
    Platform,
    Switch,
    ScrollView,
    Alert,
    KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';
import styleSheet from "../../../StyleSheet";
import Loader from "../../components/Loader";
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import MyToast from "../../components/MyToast";
import moment, { duration } from "moment";
import strings from "../../utils/Strings";
import DialogInput from "react-native-dialog-input";
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import Color from "../../constant/Color";
import { HeaderTextButton } from '../../components/Buttons';
import {getPlaces, getPlaceDetails} from '../../utils/google-places';
import * as Location from 'expo-location';
import Autocomplete from 'react-native-autocomplete-input';

const isIOS = Platform.OS === 'ios';
const styles = StyleSheet.create({
    sectionTitle: {
        color: "#42436A",
        fontSize: 16
    }
})

class TaskCreateFormScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        let options = {
            title: strings["create_task"],
            headerStyle: {
              backgroundColor: Color.primary,
            },
            headerTintColor: Color.headerTintColor,
            headerRight: (
                <HeaderTextButton onPress={navigation.getParam('submitForm')} title={strings["task_form_done"]}/>
            ),
        }

        return options
    }

    state = {
        isLoading: true,
        validate: false,
        subcategories: [],
        regions: [],
        category: null,
        subcategory: null,
        region: "centre",
        startDateTime: moment().seconds(0).add(1,'day'),
        endDateTime: moment().seconds(0).add(1,'day').add(12,'hours'),
        duration: 1,
        payType: "day",
        gross: "net",
        price: 40,
        address: null,
        about: null,
        showPriceDialog: false,
        endDateIsNeeded: true,
        useMyContactData: false,
        contactName: null,
        contactPhone: null,
        location: null,
        language: null,
        placePredictions: [],
        showPredictions: false,
        place_id: null,
    };

    api = new BackendAPI(this);
    createTaskEndpoint = this.api.getCreateTask();
    getCategoriesEndpoint = this.api.getCategories();
    getSubcategoriesEndpoint = this.api.getSubcategoriesEndpoint();
    getUsersCountEndpoint = this.api.getUsersCountEndpoint();

    setLang = async() => {
        const lang = await settings.getLanguage();
        let language = lang;
        if(lang === 'he'){
            lang = 'iw'; // Hebrew in Google
        }
        this.setState({lang, language});
    };

    async componentDidMount() {
        this.props.navigation.setParams({ submitForm: this.submitForm });

        //const category = this.props.history.location.state.category;
        var categories = await this.getCategoriesEndpoint();
        var subcategories = await this.getSubcategoriesEndpoint({
            categoryId: "all",
        });

        if (!subcategories || subcategories.length === 0) {
            MyToast.show(strings["no_subs"]);
            this.props.navigation.goBack();
            return;
        }

        const profile = this.props.userProfile;
        console.log(profile);
        let contactPhone = (profile && profile["phone"])? profile["phone"].toString(): "";
        if(contactPhone && contactPhone.startsWith("972")){
            contactPhone = "0" + contactPhone.substr("972".length)
        }else if(contactPhone){
            contactPhone = "+" + contactPhone;
        }
        let contactName = profile? profile["first_name"]: "";
        
        let arrangedSubcategories = this.arrangeSubcategories(subcategories);
        const category = categories[0].id;
        subcategories = arrangedSubcategories[category];
        const subcategory = subcategories[0].name;

        let categoryMap = {};
        categories.forEach(item => categoryMap[item.id] = item);
        categories = categoryMap;

        this.setState({
            categories,
            category,
            arrangedSubcategories,
            subcategories,
            subcategory,
            contactName,
            contactPhone,
            isLoading: false
        });

        const userCount = await this.getUsersCountEndpoint();
        this.setState({
            userCount: userCount[0]["count"]
        })

        this.setLang();
        this.getUserLocation();
    }

    arrangeSubcategories(subcategories){
        let arranged = {};
        subcategories.forEach(sub => {
            let categoryID = sub.category;
            if(arranged[categoryID] === undefined){
                arranged[categoryID] = []
            }
            arranged[categoryID].push(sub);
        })
        return arranged;
    }

    submitForm = async() => {
        if(this.state.isLoading) return;
        this.setState({ validate: true });

        if (!this.state.category
            || !this.state.subcategory
            || !this.state.region
            || !this.state.price
            || !this.state.payType) {
            return;
        }

        if(!this.state.address){
            Alert.alert(
                '',
                strings["val_addr"]
            )
            return;
        }

        const { startDateTime, endDateTime } = this.state;
        // if (!startDateTime.isBefore(endDateTime)) {
        //     Alert.alert(
        //         '',
        //         strings["val_date03"]
        //     )
        //     return;
        // }

        // if(endDateTime.diff(startDateTime, 'hours') > 10){
        //     Alert.alert(
        //         "",
        //         strings["task_form_max_duration"]
        //     )
        //     return;
        // }

        const endTime = moment(startDateTime).add(this.state.duration, 'hours');
        

        const profile = this.props.userProfile;
        this.setState({isLoading: true});

        const result = await this.createTaskEndpoint({
            "category": this.state.categories[this.state.category]["name"],
            "sub_category": this.state.subcategory,
            "region": this.state.region,
            "date_begin": startDateTime.format("YYYY-MM-DD"),
            "date_end":  endTime.format("YYYY-MM-DD"),
            "time_begin": startDateTime.format("HH:mm:ss"),
            "time_end": endTime.format("HH:mm:ss"),
            "pay_type": this.state.payType,
            "gross": this.state.gross,
            "price": this.state.price,
            "address": this.state.address,
            "about": this.state.about,
            "creator": profile["id"],
            "use_my_contact_data": this.state.useMyContactData,
            "contact_name": this.state.contactName,
            "contact_phone": this.state.contactPhone
        });

        if (result["id"]) {
            this.props.navigation.navigate("SuccessScreen", {
                userCount: this.state.userCount,
                fromOptionScreen: this.props.route.params?.fromOptionScreen || false 
            });
        }
    }

    pickStartDateAndroid = async () => {
        const { startDateTime } = this.state;
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: startDateTime.toDate(),
                maxDate: moment().add(10, 'day').valueOf(),
                minDate: moment().valueOf()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                // Do this stuff for handling date update in one place
                this._handleStartDateSelect(new Date(year, month, day).toString())
            }
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }

    _pickEndDateAndroid = async () => {
        const { endDateTime } = this.state;
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: endDateTime.toDate(),
                maxDate: moment().add(10, 'day').valueOf(),
                minDate: moment().valueOf()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                this._handleEndDateSelect(new Date(year, month, day).toString())
            }
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }

    _pickStartTimeAndroid = async() => {
        try {
            const { startDateTime } = this.state;
            const { action, hour, minute } = await TimePickerAndroid.open({
                hour: startDateTime.hour(),
                minute: startDateTime.minute(),
                is24Hour: true,
            });
            if (action !== TimePickerAndroid.dismissedAction) {
                this.setTimeStart(`${hour}:${minute}`);
            }
        } catch ({ code, message }) {
            console.warn('Cannot open time picker', message);
        }
    };

    _pickEndTimeAndroid = async() => {
        try {
            const { endDateTime } = this.state;
            const { action, hour, minute } = await TimePickerAndroid.open({
                hour: endDateTime.hour(),
                minute: endDateTime.minute(),
                is24Hour: true,
            });
            if (action !== TimePickerAndroid.dismissedAction) {
                this._setTimeEnd(`${hour}:${minute}`);
            }
        } catch ({ code, message }) {
            console.warn('Cannot open time picker', message);
        }
    };

    setInputPrice = (price) => {
        price = parseInt(price);

        if (this.state.payType === "day") {
            this.setState({
                showPriceDialog: false,
                price: price > 1000 ? price : 1000,
            });
        } else {
            this.setState({
                showPriceDialog: false,
                price: price > 60 ? price : 60,
            });
        }
    };

    getDayPrices = () => {
        const prices = [];

        if (this.state.price > 1000)
            prices.push({ value: this.state.price, label: this.state.price.toString() });

        for (let price = 150; price <= 1000; price += 25)
            prices.push({ value: price, label: price.toString() });

        prices.push({ value: 0, label: strings["gt1000"] });

        return prices;
    };

    getHourPrices = () => {
        const prices = [];

        if (this.state.price > 60){
            prices.push({ value: this.state.price, label: this.state.price.toString() });
        }
            
        let startPrice = (this.state.category && (this.state.category == 1))? 40: 35
        for (let price = startPrice; price <= 60; price += 5)
            prices.push({ value: price, label: price.toString() });

        prices.push({ value: 0, label: strings["gt60"] });

        return prices;
    };

    setPickerPayType = (payType) => {
        this.setState({
            price: payType === "day" ? 150 : 40,
            payType,
        });
    };

    isDateInFuture = (date, hour, minute) => {
        if (!date || !hour || !minute)
            return false;

        date = moment(date);
        date.hours(parseInt(hour));
        date.minutes(parseInt(minute));


        return date.isAfter(moment());
    };

    isDateRangeCorrect = () => {
        const { startDateTime, endDateTime } = this.state;
        return startDateTime.isBefore(endDateTime);
    };

    _handleStartDateSelect = (newDateString) => {
        const newDate = moment(newDateString);
        let {startDateTime} = this.state;
        startDateTime.set({
            'year': newDate.year(),
            'month': newDate.month(),
            'date': newDate.date()
        })

        this.setState(startDateTime);
    }

    _handleEndDateSelect = (newDateString) => {
        const newDate = moment(newDateString);
        let {endDateTime} = this.state;
        endDateTime.set({
            'year': newDate.year(),
            'month': newDate.month(),
            'date': newDate.date()
        })

        this.setState({endDateTime});
    }

    setTimeStart = time => {
        const beginHour = time.split(":")[0];
        const beginMinute = time.split(":")[1];

        let { startDateTime } = this.state;
        startDateTime.hours(beginHour);
        startDateTime.minutes(beginMinute);
        this.setState({startDateTime});
    };

    _setTimeEnd = time => {
        const endHour = time.split(":")[0];
        const endMinute = time.split(":")[1];

        let { endDateTime } = this.state;
        endDateTime.hours(endHour);
        endDateTime.minutes(endMinute);
        this.setState({endDateTime});
    };

    getCategoriesForPicker(){
        let arr = [];
        let categoryList = this.state.categories;
        for(let id in categoryList){
            arr.push({
                value: id,
                label: strings.getCategory(categoryList[id]["name"]),
            })
        }

        return arr;
    }

    handleCategorySelect(categoryID){
        let price = categoryID == 1 ? 40: 35
        this.setState({ 
            price: price,
            category: categoryID, 
            subcategories: this.state.arrangedSubcategories[categoryID],
        }); 
    }

    render() {
        const content =  (
                <ScrollView style={{backgroundColor: '#EFF0F4'}} contentContainerStyle={{flexGrow: 1}}>
                    <View style={styleSheet.formContainer}>
                    {
                        this.state.isLoading || !this.state.category
                            ? (
                                <Loader/>
                            )
                            : (
                                <View>
                                    <Text style={styleSheet.fieldLabel}>
                                        {strings["category"]}
                                    </Text>
                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                        <RNPickerSelect
                                            placeholder={{}}
                                            items={this.getCategoriesForPicker()}
                                            onValueChange={categoryId => this.handleCategorySelect(categoryId)}
                                            value={this.state.category}
                                        />
                                    </View>
                                    {/* <TextInput
                                        style={[styleSheet.fieldInput, { opacity: 0.7 }]}
                                        editable={false}
                                        value={strings.getCategory(this.state.category["name"])}
                                    /> */}

                                    <Text style={styleSheet.fieldLabel}>
                                        {strings["direction"]}
                                    </Text>
                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                        <RNPickerSelect
                                            placeholder={{}}
                                            items={this.state.subcategories.map(sc => ({
                                                value: sc["name"],
                                                label: strings.getCategory(sc["name"]),
                                            }))}
                                            onValueChange={subcategory => this.setState({ subcategory })}
                                            value={this.state.subcategory}
                                        />
                                    </View>
                                    {
                                        this.state.validate && !this.state.subcategory &&
                                        <Text style={styleSheet.validationMessage}>
                                            {strings["val_sc"]}
                                        </Text>
                                    }

                                    {/* <Text style={styleSheet.fieldLabel}>
                                        {strings["region"]}
                                    </Text>
                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                        <RNPickerSelect
                                            placeholder={{}}
                                            items={[
                                                { value: "north", label: strings["north"] },
                                                { value: "centre", label: strings["centre"] },
                                                { value: "south", label: strings["south"] },
                                            ]}
                                            onValueChange={region => this.setState({ region })}
                                            value={this.state.region}
                                        />
                                    </View>
                                    {
                                        this.state.validate && !this.state.region &&
                                        <Text style={styleSheet.validationMessage}>
                                            {strings["val_region"]}
                                        </Text>
                                    } */}

                                    <View style={{ flex: 1, flexDirection: "row" }}>
                                        <View style={{ flex: 1, flexDirection: "column", paddingRight: 10 }}>
                                            <Text style={styleSheet.fieldLabel}>
                                                {strings["date_start"]}
                                            </Text>
                                            {
                                                isIOS
                                                    ? (
                                                        <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                            <DateTimePicker
                                                                value={this.state.startDateTime.toDate()}
                                                                customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                                                                maxDate={moment().add(10, 'day').format("YYYY-MM-DD")}
                                                                minDate={moment().format("YYYY-MM-DD")}
                                                                mode="date"
                                                                format="YYYY-MM-DD"
                                                                locale={this.state.lang}
                                                                confirmBtnText={strings["done"]}
                                                                cancelBtnText={strings["cancel"]}
                                                                showIcon={false}
                                                                onDateChange={this._handleStartDateSelect}
                                                            />
                                                        </View>
                                                    )
                                                    : (
                                                        <TouchableOpacity
                                                            onPress={this.pickStartDateAndroid}
                                                        >
                                                            <TextInput style={styleSheet.fieldInput}
                                                                    pointerEvents="none"
                                                                    editable={false}
                                                                    value={this.state.startDateTime.format("DD.MM.YYYY")}
                                                            />
                                                        </TouchableOpacity>
                                                    )
                                            }
                                            {
                                                this.state.validate && !this.state.dateBegin &&
                                                <Text style={styleSheet.validationMessage}>
                                                    {strings["val_date_start"]}
                                                </Text>
                                            }
                                        </View>

                                        <View style={{ flex: 1, flexDirection: "column", paddingLeft: 10 }}>
                                            <Text style={styleSheet.fieldLabel}>
                                                {strings["time_start"]}
                                            </Text>
                                            {
                                                isIOS
                                                    ? (
                                                        <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                            <DateTimePicker
                                                                value={this.state.startDateTime.toDate()}
                                                                customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                                                                mode="time"
                                                                format="HH:mm"
                                                                locale={this.state.lang}
                                                                confirmBtnText={strings["done"]}
                                                                cancelBtnText={strings["cancel"]}
                                                                showIcon={false}
                                                                onDateChange={this.setTimeStart}
                                                            />
                                                        </View>
                                                    )
                                                    : (
                                                        <TouchableOpacity
                                                            onPress={this._pickStartTimeAndroid}
                                                        >
                                                            <TextInput
                                                                style={styleSheet.fieldInput}
                                                                placeholder="9:00"
                                                                pointerEvents="none"
                                                                editable={false}
                                                                value={this.state.startDateTime.format("HH:mm")}
                                                            />
                                                        </TouchableOpacity>
                                                    )
                                            }
                                            {
                                                this.state.validate && (!this.state.beginHour || !this.state.beginMinute) &&
                                                <Text style={styleSheet.validationMessage}>
                                                    {strings["val_time_start"]}
                                                </Text>
                                            }
                                        </View>
                                    </View>
                                    {/* <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12}}>
                                        <Text style={styleSheet.fieldLabel}>{strings["add_end_time"]}</Text>
                                        <Switch value={this.state.endDateIsNeeded} trackColor={{false: "#b3b3b3", true: "#3B5998"}} thumbColor={isIOS?'': '#e6e6e6'} onValueChange={newValue => this.setState({endDateIsNeeded: newValue})}/>
                                    </View> */}
                                    {/* {this.renderEndDate()} */}

                                    <View style={{ flex: 1, flexDirection: "column", paddingRight: 10 }}>
                                            <Text style={styleSheet.fieldLabel}>
                                                {strings["task_form_duration_label"]}
                                            </Text>
                                            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                <RNPickerSelect
                                                    placeholder={{}}
                                                    items={[
                                                        { value: 1, label: strings.formatString(strings["task_form_duration_singular"], 1)},
                                                        { value: 2, label: strings.formatString(strings["task_form_duration_plural_small"], 2)},
                                                        { value: 3, label: strings.formatString(strings["task_form_duration_plural_small"], 3)},
                                                        { value: 4, label: strings.formatString(strings["task_form_duration_plural_small"], 4)},
                                                        { value: 5, label: strings.formatString(strings["task_form_duration_plural"], 5)},
                                                        { value: 6, label: strings.formatString(strings["task_form_duration_plural"], 6)},
                                                        { value: 7, label: strings.formatString(strings["task_form_duration_plural"], 7)},
                                                        { value: 8, label: strings.formatString(strings["task_form_duration_plural"], 8)},
                                                        { value: 9, label: strings.formatString(strings["task_form_duration_plural"], 9)},
                                                        { value: 10, label: strings.formatString(strings["task_form_duration_plural"], 10)},
                                                    ]}
                                                    onValueChange={duration => this.setState({duration})}
                                                    value={this.state.duration}
                                                />
                                            </View>
                                            {/* {
                                                this.state.validate && !this.state.payType &&
                                                <Text style={styleSheet.validationMessage}>
                                                    {strings["val_pay_var"]}
                                                </Text>
                                            } */}
                                        </View>


                                    <View style={{ flex: 1, flexDirection: "row" }}>
                                        <View style={{ flex: 1, flexDirection: "column", paddingRight: 10 }}>
                                            <Text style={styleSheet.fieldLabel}>
                                                {strings["pay"]}
                                            </Text>
                                            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                <RNPickerSelect
                                                    placeholder={{}}
                                                    items={[
                                                        { value: "day", label: strings["day"] },
                                                        { value: "hour", label: strings["hour"] },
                                                    ]}
                                                    onValueChange={payType => this.setPickerPayType(payType)}
                                                    value={this.state.payType}
                                                />
                                            </View>
                                            {
                                                this.state.validate && !this.state.payType &&
                                                <Text style={styleSheet.validationMessage}>
                                                    {strings["val_pay_var"]}
                                                </Text>
                                            }
                                        </View>
                                        <View style={{ flex: 1, flexDirection: "column", paddingLeft: 10 }}>
                                            <Text style={styleSheet.fieldLabel}>
                                                {strings["pay_type"]}
                                            </Text>
                                            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                <RNPickerSelect
                                                    placeholder={{}}
                                                    items={[
                                                        { value: "net", label: strings["net"] },
                                                        { value: "gross", label: strings["gross"] },
                                                    ]}
                                                    onValueChange={gross => this.setState({ gross })}
                                                    value={this.state.gross}
                                                />
                                            </View>
                                            {
                                                this.state.validate && !this.state.gross &&
                                                <Text style={styleSheet.validationMessage}>
                                                    {strings["val_pay_type"]}
                                                </Text>
                                            }
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: "column" }}>
                                        <Text style={styleSheet.fieldLabel}>
                                            {strings["sum"]}
                                        </Text>
                                        <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                            <RNPickerSelect
                                                placeholder={{}}
                                                items={this.state.payType === "day"
                                                    ? this.getDayPrices()
                                                    : this.getHourPrices()}
                                                onDonePress={() => {
                                                    const { price } = this.state;
                                                    if (!price) {
                                                        this.setState({ showPriceDialog: true });
                                                    }
                                                }}
                                                onValueChange={price => {
                                                    this.setState({ price }, () => {
                                                        if (!isIOS && !price) {
                                                            this.setState({ showPriceDialog: true });
                                                        }
                                                    });
                                                }}
                                                value={this.state.price}
                                            />
                                        </View>
                                        {
                                            this.state.validate && !this.state.price &&
                                            <Text style={styleSheet.validationMessage}>
                                                {strings["val_price"]}
                                            </Text>
                                        }
                                    </View>

                                    <Text style={styleSheet.fieldLabel}>
                                        {strings["region"]}
                                    </Text>
                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                        <RNPickerSelect
                                            placeholder={{}}
                                            items={[
                                                { value: "region_all", label: strings["region_all"] },
                                                { value: "centre", label: strings["centre"] },
                                                { value: "region_jerusalem", label: strings["region_jerusalem"] },
                                                { value: "north", label: strings["north"] },
                                                { value: "region_sharon", label: strings["region_sharon"] },
                                                { value: "south", label: strings["south"] },
                                                { value: "region_arava", label: strings["region_arava"] },
                                            ]}
                                            onValueChange={region => this.setState({ region })}
                                            value={this.state.region}
                                        />
                                    </View>
                                    {
                                        this.state.validate && !this.state.region &&
                                        <Text style={styleSheet.validationMessage}>
                                            {strings["val_region"]}
                                        </Text>
                                    }

                                    <Text style={styleSheet.fieldLabel}>
                                        {strings["address"]}
                                    </Text>
                                    <View style={{height: 38, marginBottom: 62}}>
                                        {this.renderAutoCompleteInput()}
                                        {
                                            this.state.validate && !this.state.address &&
                                            <Text style={styleSheet.validationMessage}>
                                                {strings["val_addr"]}
                                            </Text>
                                        }
                                    </View>

                                    <Text style={styleSheet.fieldLabel}>
                                        {strings["description"]}
                                    </Text>
                                    <TextInput
                                        style={[styleSheet.fieldInput, { textAlignVertical: "top", height: 38 * 2 }]}
                                        placeholder={strings["description"]}
                                        multiline={true}
                                        numberOfLines={5}
                                        onChangeText={about => this.setState({ about })}
                                        value={this.state.about}
                                    />

                                    <DialogInput
                                        isDialogVisible={this.state.showPriceDialog}
                                        title={strings["set_price"]}
                                        message={
                                            this.state.payType === "day"
                                                ? strings["set_price1000"]
                                                : strings["set_price60"]
                                        }
                                        submitInput={price => this.setInputPrice(price)}
                                        closeDialog={() => this.setInputPrice()}
                                        cancelText={strings["cancel"]}
                                        submitText={strings["ok"]}
                                    />

                                    {this.renderContactsInput()}
                                    
                                </View>
                            )
                    }
                </View>
                </ScrollView>
        );

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

    renderContactsInput(){
        const profile = this.props.userProfile;
        return(
            <View style={{marginTop: 16}}>
                <Text style={styleSheet.fieldLabel}>{strings["new_task_form_contact_phone_label"]}</Text>
                
                {!this.state.useMyContactData && 
                <View style={{marginTop: 8}}>
                    {/* <Text style={[styleSheet.fieldLabel]}>{strings["new_task_form_contact_data"]}</Text> */}

                    <TextInput
                        editable={!(profile && profile["phone"])}
                        style={[styleSheet.fieldInput]}
                        placeholder={strings["new_task_form_phone"]}
                        onChangeText={contactPhone => this.setState({ contactPhone })}
                        value={this.state.contactPhone}
                    />

                    
                    <TextInput
                        editable={false}
                        style={[styleSheet.fieldInput]}
                        onChangeText={contactName => this.setState({ contactName })}
                        placeholder={strings["new_task_form_name"]}
                        value={this.state.contactName}
                    />

                    

                    {/* <Text style={styleSheet.fieldLabel}>{strings["new_task_form_phone"]}</Text>
                    <TextInput
                        style={[styleSheet.fieldInput]}
                        placeholder={strings["new_task_form_phone"]}
                        onChangeText={contactPhone => this.setState({ contactPhone })}
                        value={this.state.contactPhone}
                    /> */}

                </View>}
                <View style={{ height: 60 }} />
                {/* <View style={{marginTop: 8}} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={styleSheet.fieldLabel}>{strings["new_task_form_use_my_data"]}</Text>
                    <Switch 
                        value={this.state.useMyContactData} 
                        trackColor={{false: "#b3b3b3", true: "#3B5998"}} 
                        thumbColor={isIOS?'': '#e6e6e6'} 
                        onValueChange={newValue => this.setState({useMyContactData: newValue})}/>
                </View> */}

            </View>
        )
    }

    renderEndDate(){
        return(
            <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ flex: 1, flexDirection: "column", paddingRight: 10 }}>
            <Text style={styleSheet.fieldLabel}>
            {strings["date_end"]}
            </Text>
            {
                isIOS
                ? this.renderEndIOSDatePicker()
                    : (
                        <TouchableOpacity onPress={this._pickEndDateAndroid}>
                            <TextInput style={styleSheet.fieldInput}
                                pointerEvents="none"
                                editable={false}
                                value={moment(this.state.endDateTime).format("DD.MM.YYYY")}
                            />
                        </TouchableOpacity>
                    )
                    }
                    {
                        this.state.validate && !this.state.dateEnd &&
                        <Text style={styleSheet.validationMessage}>
                        {strings["val_date_end"]}
                        </Text>
                    }
                    </View>
                    
                    <View style={{ flex: 1, flexDirection: "column", paddingLeft: 10 }}>
                    <Text style={styleSheet.fieldLabel}>
                    {strings["time_end"]}
                    </Text>
                    {
                        isIOS
                        ? this.renderEndIOSTimePicker()
                        :   (
                                <TouchableOpacity onPress={this._pickEndTimeAndroid}>
                                    <TextInput
                                        style={styleSheet.fieldInput}
                                        pointerEvents="none"
                                        editable={false}
                                        value={this.state.endDateTime.format("HH:mm")}
                                    />
                                </TouchableOpacity>
                            )
                        }
                        {
                            this.state.validate && (!this.state.endHour || !this.state.endMinute) &&
                            <Text style={styleSheet.validationMessage}>
                            {strings["val_time_end"]}
                            </Text>
                        }
                            </View>
            </View>
        )
    }

    renderEndIOSDatePicker(){
        return (
            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                <DateTimePicker
                    value={this.state.endDateTime.toDate()}
                    customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                    maxDate={moment().add(10, 'day').format("YYYY-MM-DD")}
                    minDate={moment().format("YYYY-MM-DD")}
                    mode="date"
                    locale={this.state.lang}
                    format="YYYY-MM-DD"
                    confirmBtnText={strings["done"]}
                    cancelBtnText={strings["cancel"]}
                    showIcon={false}
                    onDateChange={this._handleEndDateSelect}
                />
            </View>
        )
    }

    renderEndIOSTimePicker(){
        return (
            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                <DateTimePicker
                    value={this.state.endDateTime.toDate()}
                    customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                    mode="time"
                    format="HH:mm"
                    confirmBtnText={strings["done"]}
                    cancelBtnText={strings["cancel"]}
                    showIcon={false}
                    onDateChange={this._setTimeEnd}
                />
            </View>
        )
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
                    <TextInput style={[styleSheet.fieldInput, {marginBottom: 0}]}
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
}

const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TaskCreateFormScreen);