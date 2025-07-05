import React from 'react';
import {
    Text,
    TouchableOpacity,
    View, TextInput,
    DatePickerAndroid, TimePickerAndroid,
    Platform,
    Switch,
    ScrollView,
    KeyboardAvoidingView,
    Alert
} from 'react-native';
import DialogInput from "react-native-dialog-input";
import moment, { relativeTimeRounding } from "moment";
import BackendAPI from "../../../backend/BackendAPI";
import styleSheet from "../../../StyleSheet";
import Loader from "../../components/Loader";
import strings from "../../utils/Strings";
// import Toast from "../../../components/MyToast";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from '@react-native-community/datetimepicker';
import { HeaderTextButton } from '../../components/Buttons';

import { connect } from 'react-redux';
import { getTasks, getMoreTasks, getCategories, applyQuickFilter } from '../../redux/task-handlers';

const isIOS = Platform.OS === 'ios';

class TaskEditFormScreen extends React.Component {


    state = {
        isLoading: true,
        validate: false,
        subcategories: [],
        id: null,
        category: null,
        subcategory: null,
        region: "north",
        dateBegin: new Date(),
        beginHour: 10,
        beginMinute: '00',
        dateEnd: new Date(),
        endHour: 12,
        endMinute: '00',
        payType: "netto",
        gross: "net",
        price: null,
        address: null,
        about: null,
        showPriceDialog: false,
        endDateIsNeeded: false,
        contactPhone: "",
        contactName: ""
    };

    api = new BackendAPI(this);
    getCategoriesEndpoint = this.api.getCategories();
    getSubcategoriesEndpoint = this.api.getSubcategoriesEndpoint();
    editTaskEndpoint = this.api.getEditTaskEndpoint();
    deleteTaskEndpoint = this.api.getDeleteTaskEndpoint();

    componentDidMount() {
        this.props.navigation.setParams({submit: this.submitForm});

        this.init();
    }

    init = async () => {
        let task = this.props.route.params?.task || null;
        let {
            task: {
                about,
                address,
                id,
                category,
                sub_category,
                date_begin,
                date_end,
                time_begin,
                time_end,
                gross,
                pay_type,
                price,
                region,
                contact_phone,
                contact_name
            },
        } = {task};



        const categories = await this.getCategoriesEndpoint();

        const subcategories = await this.getSubcategoriesEndpoint({
            categoryId: category.id,
        });

        category = categories.find(item => item.id === category.id);
        let subcategory = category.subcategories.find(item => item.id === sub_category.id);

        this.setState({
            isLoading: false,
            id,
            categories,
            category,
            subcategory,
            about,
            address,
            gross,
            payType: pay_type,
            price,
            region,
            dateBegin: new Date(date_begin),
            dateEnd: new Date(date_end? date_end: date_begin),
            beginHour: time_begin.split(':')[0],
            beginMinute: time_begin.split(':')[1],
            endHour: time_end? time_end.split(':')[0]: (Number(time_begin.split(':')[0]) + 6),
            endMinute: time_end? time_end.split(':')[1]: '00',
            subcategories,
            endDateIsNeeded: date_end !== null,
            contactPhone: contact_phone,
            contactName: contact_name
        });
    };

    submitForm = async () => {
        this.setState({ validate: true });

        

        if (!this.state.category
            || !this.state.subcategory
            || !this.state.region
            || !this.state.dateBegin
            || !this.state.beginHour || !this.state.beginMinute
            // || !this.state.dateEnd
            // || !this.state.endHour || !this.state.endMinute
            || !this.state.price
            || !this.state.payType
            || !this.state.address) {
            return;
        }


        if (this.state.endDateIsNeeded && !this.isDateRangeCorrect()) {
            MyToast.show(strings["val_date03"]);
            return;
        }


        const result = await this.editTaskEndpoint({
            "id": this.state.id,
            "category": this.state.category.name,
            "sub_category": this.state.subcategory.name,
            "region": this.state.region,
            "date_begin": moment(this.state.dateBegin).format("YYYY-MM-DD"),
            "date_end": this.state.endDateIsNeeded? moment(this.state.dateEnd).format("YYYY-MM-DD"): null,
            "time_begin": `${this.state.beginHour}:${this.state.beginMinute}:00`,
            "time_end": this.state.endDateIsNeeded? `${this.state.endHour}:${this.state.endMinute}:00`: null,
            "pay_type": this.state.payType,
            "gross": this.state.gross,
            "price": this.state.price,
            "address": this.state.address,
            "about": this.state.about,
            "contact_phone": this.state.contactPhone,
            "contact_name": this.state.contactName
        });



        if (result["id"]) {
            let updateFunction = this.props.route.params?.updateTask || null;
            if(updateFunction){
                await updateFunction(result);
            }
            this.props.getTasks(true);
            this.props.navigation.goBack();
        }
    };

    async selectDate(date, callback) {
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: date || new Date(),
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                callback(new Date(year, month, day));
            }
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }

    selectTime = async(callback) => {
        try {
            const now = new Date();
            const { action, hour, minute } = await TimePickerAndroid.open({
                hour: now.hour,
                minute: now.minute,
                is24Hour: true,
            });
            if (action !== TimePickerAndroid.dismissedAction) {
                const newHour = hour.toString().length === 1 ? ('0' + hour.toString()) : hour.toString();
                const newMinute = minute.toString().length === 1 ? ('0' + minute.toString()) : minute.toString();
                callback(newHour, newMinute);
            }
        } catch ({ code, message }) {
            console.warn('Cannot open time picker', message);
        }
    };

    setInputPrice(price) {
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
    }

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

        if (this.state.price > 60)
            prices.push({ value: this.state.price, label: this.state.price.toString() });

        for (let price = 40; price <= 60; price += 5)
            prices.push({ value: price, label: price.toString() });

        prices.push({ value: 0, label: strings["gt60"] });

        return prices;
    };

    isDateInFuture(date, hour, minute) {
        if (!date || !hour || !minute)
            return false;

        date = moment(date);
        date.hours(hour);
        date.minutes(minute);

        return date.isAfter(moment());
    }

    isDateRangeCorrect() {
        const begin = moment(this.state.dateBegin);
        begin.hours(this.state.beginHour);
        begin.minutes(this.state.beginMinute);

        
        const end = moment(this.state.dateEnd);
        end.hour(this.state.endHour);
        end.minutes(this.state.endMinute);

        return begin.isBefore(end);
    }

    setPickerPayType = (payType) => {
        this.setState({
            price: payType === "day" ? 150 : 40,
            payType,
        });
    };

    setTimeStart = time => {
        const beginHour = time.split(":")[0];
        const beginMinute = time.split(":")[1];

        let endHour = parseInt(beginHour) + 6;
        let dateEnd = this.state.dateEnd;
        if (endHour >= 24) {
            endHour = endHour - 24;
            dateEnd.setHours(dateEnd.getHours() + 24);
        }

        this.setState({
            beginHour,
            beginMinute,
            endHour,
            dateEnd,
        });
    };

    onCategoryChanged = (category) => {

        this.setState({ category })
    }

    render() {
        return (
            <KeyboardAvoidingView behavior="padding">
            <View>
                <ScrollView style={{backgroundColor: '#EFF0F4', /* marginTop: styleSheet.topMenu.height */}} contentContainerStyle={{flexGrow: 1}}>
                <View style={styleSheet.formContainer}>
                {
                    this.state.isLoading || !this.state.subcategories.length
                        ? (
                            <Loader/>
                        )
                        : (
                            <View>
                                <Text style={styleSheet.fieldLabel}>
                                    {strings["category"]}
                                </Text>
                                {/* <TextInput
                                    style={[styleSheet.fieldInput, { opacity: 0.7 }]}
                                    editable={false}
                                    value={strings.getCategory(this.state.category)}
                                /> */}
                                <View style={[styleSheet.fieldPicker]}>
                                    <RNPickerSelect
                                        placeholder={{}}
                                        items={this.state.categories.map(item => (
                                            {label: strings.getCategory(item.name), value: item}
                                        ))}
                                        onValueChange={this.onCategoryChanged}
                                        value={this.state.category}
                                    />
                                </View>

                                <Text style={styleSheet.fieldLabel}>
                                    {strings["direction"]}
                                </Text>
                                <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                    <RNPickerSelect
                                        placeholder={{}}
                                        items={this.state.category.subcategories.map(item => (
                                            {label: strings.getCategory(item.name), value: item}
                                        ))}
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
                                            { value: 'north', label: strings['north'] },
                                            { value: 'centre', label: strings['centre'] },
                                            { value: 'south', label: strings['south'] },
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

                                <View style={{flex: 1, flexDirection: "row"}}>
                                    <View style={{flex: 1, flexDirection: "column", paddingRight: 10}}>
                                        <Text style={styleSheet.fieldLabel}>
                                            {strings["date_start"]}
                                        </Text>
                                        {
                                            isIOS
                                                ? (
                                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                        <DateTimePicker
                                                            value={this.state.dateBegin}
                                                            customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                                                            mode="date"
                                                            format="YYYY-MM-DD"
                                                            confirmBtnText={strings["done"]}
                                                            cancelBtnText={strings["cancel"]}
                                                            showIcon={false}
                                                            onDateChange={dateBegin => this.setState({ dateBegin })}
                                                        />
                                                    </View>
                                                )
                                                : (
                                                    <TouchableOpacity
                                                        onPress={() => this.selectDate(this.state.dateBegin, dateBegin => {
                                                            this.setState({ dateBegin });
                                                        })}
                                                    >
                                                        <TextInput style={styleSheet.fieldInput}
                                                                   pointerEvents="none"
                                                                   editable={false}
                                                                   value={
                                                                       this.state.dateBegin
                                                                           ? moment(this.state.dateBegin).format("DD.MM.YYYY")
                                                                           : ""
                                                                   }
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

                                    <View style={{flex: 1, flexDirection: "column", paddingLeft: 10}}>
                                        <Text style={styleSheet.fieldLabel}>
                                            {strings["time_start"]}
                                        </Text>
                                        {
                                            isIOS
                                                ? (
                                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                        <DateTimePicker
                                                            value={moment(this.state.dateBegin).hours(this.state.beginHour).minutes(this.state.beginMinute).toDate()}
                                                            customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                                                            mode="time"
                                                            format="H:mm"
                                                            locale={'RU'}
                                                            confirmBtnText={strings["done"]}
                                                            cancelBtnText={strings["cancel"]}
                                                            showIcon={false}
                                                            onDateChange={this.setTimeStart}
                                                        />
                                                    </View>
                                                )
                                                : (
                                                    <TouchableOpacity
                                                        onPress={() => this.selectTime((hour, minute) => {
                                                            this.setTimeStart(`${hour}:${minute}`);
                                                        })}
                                                    >
                                                        <TextInput
                                                            style={styleSheet.fieldInput}
                                                            placeholder="9:00"
                                                            pointerEvents="none"
                                                            editable={false}
                                                            value={
                                                                this.state.beginHour.toString() && this.state.beginMinute.toString()
                                                                    ? `${this.state.beginHour}:${this.state.beginMinute}`
                                                                    : ""
                                                            }
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
                                {/* <View style={{flex: 1, flexDirection: "row"}}>
                                    <View style={{flex: 1, flexDirection: "column", paddingRight: 10}}>
                                        <Text style={styleSheet.fieldLabel}>
                                            {strings["date_end"]}
                                        </Text>
                                        {
                                            isIOS
                                                ? (
                                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                        <DatePicker
                                                            customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                                                            date={this.state.dateEnd}
                                                            mode="date"
                                                            format="YYYY-MM-DD"
                                                            confirmBtnText={strings["done"]}
                                                            cancelBtnText={strings["cancel"]}
                                                            showIcon={false}
                                                            onDateChange={dateEnd => this.setState({ dateEnd })}
                                                        />
                                                    </View>
                                                )
                                                : (
                                                    <TouchableOpacity
                                                        onPress={() => this.selectDate(this.state.dateEnd, dateEnd => {
                                                            this.setState({ dateEnd });
                                                        })}
                                                    >
                                                        <TextInput style={styleSheet.fieldInput}
                                                                   pointerEvents="none"
                                                                   editable={false}
                                                                   value={
                                                                       this.state.dateEnd
                                                                           ? moment(this.state.dateEnd).format("DD.MM.YYYY")
                                                                           : ""
                                                                   }
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

                                    <View style={{flex: 1, flexDirection: "column", paddingLeft: 10}}>
                                        <Text style={styleSheet.fieldLabel}>
                                            {strings["time_end"]}
                                        </Text>
                                        {
                                            isIOS
                                                ? (
                                                    <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                                        <DateTimePicker
                                                            customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                                                            date={`${this.state.endHour}:${this.state.endMinute}`}
                                                            mode="time"
                                                            format="H:mm"
                                                            confirmBtnText={strings["done"]}
                                                            cancelBtnText={strings["cancel"]}
                                                            showIcon={false}
                                                            onDateChange={time => this.setState({
                                                                endHour: time.split(":")[0],
                                                                endMinute: time.split(":")[1],
                                                            })}
                                                        />
                                                    </View>
                                                )
                                                : (
                                                    <TouchableOpacity
                                                        onPress={() => this.selectTime((hour, minute) => {
                                                            this.setState({
                                                                endHour: hour,
                                                                endMinute: minute,
                                                            });
                                                        })}
                                                    >
                                                        <TextInput
                                                            style={styleSheet.fieldInput}
                                                            placeholder="9:00"
                                                            pointerEvents="none"
                                                            editable={false}
                                                            value={
                                                                this.state.endHour.toString() && this.state.endMinute.toString()
                                                                    ? `${this.state.endHour}:${this.state.endMinute}`
                                                                    : ""
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                )
                                        }
                                        {
                                            this.state.validate && (!this.state.endHour || !this.state.endMinute) &&
                                            <Text style={styleSheet.validationMessage}>
                                                {strings["val_date_end"]}
                                            </Text>
                                        }
                                    </View>
                                </View> */}

                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12}}>
                                    <Text style={styleSheet.fieldLabel}>{strings["add_end_time"]}</Text>
                                    <Switch value={this.state.endDateIsNeeded} trackColor={{false: "#b3b3b3", true: "#3B5998"}} thumbColor={isIOS?'': '#e6e6e6'} onValueChange={newValue => this.setState({endDateIsNeeded: newValue})}/>
                                </View>
                                {this.state.endDateIsNeeded && this.renderEndDate()}

                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <View style={{ flex: 1, flexDirection: "column", paddingRight: 10 }}>
                                        <Text style={styleSheet.fieldLabel}>
                                            {strings["pay"]}
                                        </Text>
                                        <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                                            <RNPickerSelect
                                                placeholder={{}}
                                                items={[
                                                    { value: 'day', label: strings['day'] },
                                                    { value: 'hour', label: strings['hour'] },
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
                                                    { value: 'net', label: strings['net'] },
                                                    { value: 'gross', label: strings['gross'] },
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
                                <TextInput
                                    style={styleSheet.fieldInput}
                                    onChangeText={address => this.setState({ address })}
                                    value={this.state.address}
                                />
                                {
                                    this.state.validate && !this.state.address &&
                                    <Text style={styleSheet.validationMessage}>
                                        {strings["val_addr"]}
                                    </Text>
                                }

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
                                <TouchableOpacity style={{marginTop: 30}} onPress={() => this.showDeleteAlert()}>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{color: 'red'}}>{strings["remove_task"]}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                           
                        )
                }
                </View>
                
                <View style={{ height: 60 }} />
                </ScrollView>
            </View>
            </KeyboardAvoidingView>
        );
    }


    showDeleteAlert(){
        Alert.alert(
            strings["remove_task_alert_title"],
            strings["remove_task_alert_description"],
            [
              {
                text: strings["remove_task_alert_cancel"],
                onPress: () => {},
                style: 'cancel',
              },
              {
                text: strings["remove_task_alert_confirm"], 
                onPress: () => this.deleteTask(),
                style: 'destructive'
              }
            ],
            {cancelable: true},
        );
    }

    deleteTask = async() => {
        await this.deleteTaskEndpoint(this.state.id);
        let callback = this.props.route.params?.onTaskDeleted || null;
        if(callback){
            callback();
        }
        this.props.getTasks(true);
        this.props.navigation.goBack();
    }

    renderContactsInput(){
        return(
            <View style={{marginTop: 16}}>
                <Text style={styleSheet.fieldLabel}>{strings["new_task_form_contact_phone_label"]}</Text>
                
                {!this.state.useMyContactData && 
                <View style={{marginTop: 8}}>

                    <TextInput
                        style={[styleSheet.fieldInput]}
                        placeholder={strings["new_task_form_phone"]}
                        onChangeText={contactPhone => this.setState({ contactPhone })}
                        value={this.state.contactPhone}
                    />
                    
                    <TextInput
                        style={[styleSheet.fieldInput]}
                        onChangeText={contactName => this.setState({ contactName })}
                        placeholder={strings["new_task_form_name"]}
                        value={this.state.contactName}
                    />

                </View>}

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
                ? this.renderIOSDatePicker()
                    : (
                        <TouchableOpacity
                            onPress={() => this.selectDate(this.state.dateEnd, dateEnd => {
                                this.setState({ dateEnd });
                            })}
                        >
                            <TextInput style={styleSheet.fieldInput}
                                pointerEvents="none"
                                editable={false}
                                value={
                                    this.state.dateEnd
                                    ? moment(this.state.dateEnd).format("DD.MM.YYYY")
                                    : ""
                                }
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
                        ? this.renderIOSTimePicker()
                            : (
                                <TouchableOpacity
                                onPress={() => this.selectTime((hour, minute) => {
                                    this.setState({
                                        endHour: hour,
                                        endMinute: minute,
                                    });
                                })}
                                >
                                <TextInput
                                style={styleSheet.fieldInput}
                                placeholder="9:00"
                                pointerEvents="none"
                                editable={false}
                                value={
                                    this.state.endHour.toString() && this.state.endMinute.toString()
                                    ? `${this.state.endHour}:${this.state.endMinute}`
                                    : ""
                                }
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

    renderIOSDatePicker(){
        return (
            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                <DateTimePicker
                    value={this.state.dateEnd}
                    customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                    mode="date"
                    format="YYYY-MM-DD"
                    confirmBtnText={strings["done"]}
                    cancelBtnText={strings["cancel"]}
                    showIcon={false}
                    onDateChange={dateEnd => this.setState({ dateEnd })}
                />
            </View>
        )
    }

    renderIOSTimePicker(){
        return (
            <View style={[styleSheet.fieldPicker, { paddingLeft: 0 }]}>
                <DateTimePicker
                    value={moment(this.state.dateEnd).hours(this.state.endHour).minutes(this.state.endMinute).toDate()}
                    customStyles={{ dateInput: { borderWidth: 0, alignItems: "left" } }}
                    mode="time"
                    format="H:mm"
                    confirmBtnText={strings["done"]}
                    cancelBtnText={strings["cancel"]}
                    showIcon={false}
                    onDateChange={time => this.setState({
                        endHour: time.split(":")[0],
                        endMinute: time.split(":")[1],
                    })}
                />
            </View>
        )
    }
}

//Map the redux state to your props.
const mapStateToProps = state => ({
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getTasks,
}
export default connect(mapStateToProps, mapDispatchToProps)(TaskEditFormScreen);