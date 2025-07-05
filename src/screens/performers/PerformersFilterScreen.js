import React from "react";
import {
    StyleSheet,
    FlatList,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    TextInput,
    View,
    KeyboardAvoidingView,
    ScrollView
} from "react-native";

import strings from "../../utils/Strings";
import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
import moment from "moment";
import Color from "../../constant/Color";
import { HeaderTextButton } from '../../components/Buttons';
import { connect } from 'react-redux';
import { updateFilters } from '../../redux/task-handlers';

const styles = StyleSheet.create({
    container:{
        backgroundColor: 'white',
        paddingTop: 30,
        paddingBottom: 30,
        paddingStart: 24,
        paddingEnd: 24,
        flexDirection: 'column',
    },
    filterCategoryTitle: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    filterCategoryContainer: {
        marginBottom: 20
    },
    categoryItem:{
        borderRadius: 12,  
        marginRight: 8, 
        marginBottom: 8,
        borderColor: '#3B5998', 
        borderWidth: 1,
    },
    categoryItemText: {
        paddingHorizontal: 20, 
        paddingVertical: 4
    },
    priceSubtitle:{
        color: 'rgba(59, 89, 152, 0.65)'
    },
    price: {
        color: "#2E8F1E",
        fontSize: 16,
        fontWeight: "bold"
    }
})

class PerformersFilterScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["performers_filter"],
            headerRight: (
                <HeaderTextButton onPress={navigation.getParam("storeFilters")} title={strings["apply_filters"]}/>
            )
          };
    }

    api = new BackendAPI(this);
    tasksCountEndpoint = this.api.getTasksCountEndpoint();
    getCategoriesEndpoint = this.api.getCategories();

    state = {
        categories: [],
        selectedCategories: [],
        selected_subcategories: [],
        selectedDays: [],
        regions:[
            { value: "region_all", label: strings["region_all"] },
            { value: "centre", label: strings["centre"] },
            { value: "region_jerusalem", label: strings["region_jerusalem"] },
            { value: "north", label: strings["north"] },
            { value: "region_sharon", label: strings["region_sharon"] },
            { value: "south", label: strings["south"] },
            { value: "region_arava", label: strings["region_arava"] }
        ],
        selectedRegions: [],
        hourPrice: "",
        dayPrice: "",
        isHebrew: false,
    };

    render(){
        return(
            <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
                <ScrollView style={{flex: 1}}>
            <View>
                <View style={styles.container}>
                    {/* <View style={styles.filterCategoryContainer}>
                        <Text style={styles.filterCategoryTitle}>{strings["categories"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', flexWrap: 'wrap', marginTop: 8}}>
                            {this.renderCategories()}
                        </View>
                    </View> */}

                    <View style={[styles.filterCategoryContainer,{flexDirection: this.state.isHebrew? 'row-reverse':'row'}]}>
                        <Text style={[styles.priceSubtitle, {fontSize: 16}]}>{strings["filters_description"]}</Text>
                    </View>

                    <View style={styles.filterCategoryContainer}>
                        <Text style={styles.filterCategoryTitle}>{strings["performers_filter_availability"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', flexWrap: 'wrap', marginTop: 8}}>
                            {this.renderWeekDays()}
                        </View>
                    </View>

                    <View style={styles.filterCategoryContainer}>
                        <Text style={styles.filterCategoryTitle}>{strings["region"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', flexWrap: 'wrap', marginTop: 8}}>
                            {this.renderRegions()}
                        </View>
                    </View>

                    <View>
                        <Text style={styles.filterCategoryTitle}>{strings["performers_filter_rates"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', marginTop: 8}}>
                            <View>
                                <Text style={styles.priceSubtitle}>{strings["performers_filter_rate_not_more"]}</Text>
                                <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', alignItems: 'center'}}>
                                    <TextInput 
                                        value={this.state.hourPrice}
                                        onChangeText={(text) => this.setState({hourPrice: text})}
                                        keyboardType="numeric"
                                        style={{borderBottomWidth: 1, borderBottomColor: '#3B5998', width: 50}}/>
                                    <Text style={styles.price}>{strings["filter_hour_price"]}</Text>
                                </View>
                            </View>

                            <View style={{marginHorizontal: 16}}>
                                <Text style={styles.priceSubtitle}>{strings["performers_filter_rate_not_more"]}</Text>
                                <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', alignItems: 'center'}}>
                                    <TextInput 
                                        value={this.state.dayPrice}
                                        onChangeText={(text) => this.setState({dayPrice: text})}
                                        keyboardType="numeric"
                                        style={{borderBottomWidth: 1, borderBottomColor: '#3B5998', width: 50}}/>
                                    <Text style={styles.price}>{strings["filter_day_price"]}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.filterCategoryContainer, {marginTop: 20}]}>
                        <Text style={styles.filterCategoryTitle}>{strings["categories"]}</Text>
                        <View style={{marginTop: 8}}>
                            {this.renderCategories()}
                        </View>
                    </View>
                    
                </View>
                <View style={{marginTop: 10, marginBottom: 30, alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => this.resetFilters()}>
                        <Text style={{color: "#EB5757"}}>{strings["reset_filters"]}</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
            </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    // renderCategories(){
    //     let items = []
    //     this.state.categories.forEach(item => items.push(this.renderCategoryItem(item)))
    //     return items;
    // }

    renderCategoryItem(category){
        let {selectedCategories} = this.state
        let isSelected = selectedCategories? selectedCategories.findIndex(item => item.id === category.id) !== -1: false;


        return(
            <View key={category.id.toString()} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={() => this.onCategoryPressed(category)}>
                    <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{ strings.getCategory(category["name"])}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }



    renderCategories(){
        return this.state.categories.map((category, index) => {
            return (
                <View key={category.id.toString()} style={{marginBottom: 10}}>
                    <View style={{
                            marginBottom: 6,
                            backgroundColor: 'rgba(18, 144, 203, 0.2)',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                            borderRadius: 4
                        }}>
                        <Text style={{fontWeight: 'bold'}}>
                            {strings.getCategory(category.name)}
                        </Text>
                    </View>
                    
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {this.renderSubcategories(category)}
                    </View>
                </View>
            )
        })
    }

    renderSubcategories(category){
        return category.subcategories.map((item, index) => {
            let background = 'transparent';
            let text = 'black';
            if(this.state.selected_subcategories.find(selected => selected.id === item.id)){
                background = 'rgba(0, 65, 201, 0.56)';
                text = 'white'
            }
            return (
                <TouchableOpacity 
                    key={item.id} 
                    style={{marginVertical: 2, marginHorizontal: 2}} 
                    onPress={() => this.handleSubcategoryPress(item)}>
                        
                    <View style={{
                        borderRadius: 6,
                        backgroundColor: background,
                    }}>
                        <Text style={{
                        marginVertical: 4, 
                            marginHorizontal: 8, 
                            color: text
                            }}>{strings.getCategory(item.name)}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    handleSubcategoryPress = (subcategory) => {
        let {selected_subcategories} = this.state;
        let subcategoryIndex = selected_subcategories.findIndex(selected => selected.id === subcategory.id);
        if(subcategoryIndex > -1){
            selected_subcategories.splice(subcategoryIndex, 1)
        }else{
            if(selected_subcategories.length <= 7){
                selected_subcategories.push(subcategory);
            }
        }

        this.setState({selected_subcategories});
    }

    onCategoryPressed(category){
        let selected = this.state.selectedCategories
        let position = selected.findIndex(item => item.id === category.id);
        if(position === -1){
            selected.push(category);
        }else{
            selected.splice(position, 1);
        }

        this.setState({selectedCategories: selected})
    }

    renderWeekDays(){
        let items = []
        let weekDays = [
            { key: "sunday", value: strings["sunday_short"] },
            { key: "monday", value: strings["monday_short"] },
            { key: "tuesday", value: strings["tuesday_short"] },
            { key: "wednesday", value: strings["wednesday_short"] },
            { key: "thursday", value: strings["thursday_short"] },
            { key: "friday", value: strings["friday_short"] },
            { key: "saturday", value: strings["saturday_short"] },
        ]

        weekDays.forEach(item => {
            let isSelected = this.state.selectedDays? this.state.selectedDays.includes(item.key): false;
            items.push(
                <TouchableWithoutFeedback key={item.key} onPress={() => this.onSelectDay(item.key)}>
                    <View style={{borderRadius: 50,  marginRight: 8, marginBottom: 8, borderColor: '#3B5998', borderWidth: 1, backgroundColor: isSelected? "#3B5998": 'white'}}>
                        <Text style={{marginHorizontal: 8, marginVertical: 6, color: isSelected? 'white': "#3B5998" }}>{item.value}</Text>
                    </View>
                </TouchableWithoutFeedback>
            )
        })

        return items;
    }

    onSelectDay(day){
        let selected = this.state.selectedDays;
        let position = selected.indexOf(day);
        if(position === -1){
            selected.push(day);
        }else{
            selected.splice(position, 1);
        }
        this.setState({selectedDays: selected});
    }



    onRegionPress(region){
        let selected = this.state.selectedRegions
        let position = selected.findIndex(item => region.value === item.value)
        // let position = selected.indexOf(region);
        if(position === -1){
            selected.push(region);
        }else{
            selected.splice(position, 1);
        }

        this.setState({selectedRegions: selected})
    }

    renderRegions(){
        let items = [];
        this.state.regions.forEach(region => {
            let {selectedRegions} = this.state
            let isSelected = selectedRegions? selectedRegions.findIndex(item => item.value === region.value) !== -1 : false;

            items.push(
                <View key={region.value} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                    <TouchableWithoutFeedback onPress={() => this.onRegionPress(region)}>
                        <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{region.label}</Text>
                    </TouchableWithoutFeedback>
                </View>
            )
        })

        return items;
    }

    componentDidMount(){
        this.props.navigation.setParams({storeFilters: this.storeFilters});
        this.setLang();
        this.loadCategories();
        let filters = this.props.route.params?.filters || {}
        console.log(filters)
        if(filters && Object.keys(filters).length > 0){
            this.setState({
                selected_subcategories: filters.selected_subcategories? filters.selected_subcategories: [],
                selectedDays: filters.selectedDays? filters.selectedDays: [],
                selectedRegions: filters.selectedRegions? filters.selectedRegions: [],
                hourPrice: filters.hourPrice? filters.hourPrice: "",
                dayPrice: filters.dayPrice? filters.dayPrice: "",
            })
        }       
    }



    async loadCategories() {
        const categories = await this.getCategoriesEndpoint();
        this.setState({categories});
    }

    storeFilters = async () => {
        let filtersObject = {
            selected_subcategories: this.state.selected_subcategories,
            selectedDays: this.state.selectedDays,
            selectedRegions: this.state.selectedRegions,
            hourPrice: this.state.hourPrice,
            dayPrice: this.state.dayPrice
        }

        let callback = this.props.route.params?.setCallback || null;
        if(callback){
            callback(filtersObject)
        }

        this.props.navigation.goBack();
    }

    async resetFilters(){
        let callback = this.props.route.params?.setCallback || null;
        if(callback){
            callback({})
        }

        this.props.navigation.goBack();
    }

    async loadFilters(){
        let filtersObject = this.props.filters;
        if(filtersObject !== null){
            this.setState({
                // selectedCategories: filtersObject.selectedCategories,
                selectedDays: filtersObject.selectedDays,
                selectedRegions: filtersObject.selectedRegions,
                hourPrice: filtersObject.hourPrice,
                dayPrice: filtersObject.dayPrice
            })
        }
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

}

export default PerformersFilterScreen;