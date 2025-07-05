import React from "react";
import {
    ListView,
    StyleSheet,
    FlatList,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    TextInput,
    View,
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

class FilterScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["filters"],
            headerRight: (
                <HeaderTextButton onPress={navigation.getParam("storeFilters")} title={strings["apply_filters"]}/>
            )
          };
    }

    api = new BackendAPI(this);
    tasksCountEndpoint = this.api.getTasksCountEndpoint();

    state = {
        categories: [],
        selectedCategories: [],
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
            <View>
                <View style={styles.container}>
                    {/* <View style={styles.filterCategoryContainer}>
                        <Text style={styles.filterCategoryTitle}>{strings["categories"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', flexWrap: 'wrap', marginTop: 8}}>
                            {this.renderCategories()}
                        </View>
                    </View> */}

                    <View style={{marginBottom: 12}}>
                        <Text style={{color: 'rgba(59, 89, 152, 0.65)'}}>{strings["task_filters_hint"]}</Text>
                    </View>

                    <View style={styles.filterCategoryContainer}>
                        <Text style={styles.filterCategoryTitle}>{strings["week_days"]}</Text>
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
                        <Text style={styles.filterCategoryTitle}>{strings["price"]}</Text>
                        <View style={{flexDirection: this.state.isHebrew? 'row-reverse':'row', marginTop: 8}}>
                            <View>
                                <Text style={styles.priceSubtitle}>{strings["filter_price_greater"]}</Text>
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
                                <Text style={styles.priceSubtitle}>{strings["filter_price_greater"]}</Text>
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
                    
                </View>
                <View style={{marginTop: 30, alignItems: 'center'}}>
                    <TouchableOpacity onPress={() => this.resetFilters()}>
                        <Text style={{color: "#EB5757"}}>{strings["reset_filters"]}</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        )
    }

    renderCategories(){
        let items = []
        this.state.categories.forEach(item => items.push(this.renderCategoryItem(item)))
        return items;
    }

    renderCategoryItem(category){
        let {selectedCategories} = this.state
        let isSelected = selectedCategories? selectedCategories.findIndex(item => item.id === category.id) !== -1: false;


        return(
            <View key={category.id.toString()} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={() => this.onCategoryPressed(category)}>
                    <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{ strings.getCategory(category["category"])}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    onCategoryPressed(category){
        let selected = this.state.selectedCategories
        let position = selected.indexOf(category);
        if(position === -1){
            selected.push(category);
        }else{
            selected.splice(position, 1);
        }

        this.setState({selectedCategories: selected})
    }

    renderWeekDays(){
        let items = []
        //let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        let weekDays = [
            {id: "1", name: strings["sunday_short"]},
            {id: "2", name: strings["monday_short"]},
            {id: "3", name: strings["tuesday_short"]},
            {id: "4", name: strings["wednesday_short"]},
            {id: "5", name: strings["thursday_short"]},
            {id: "6", name: strings["friday_short"]},
            {id: "7", name: strings["saturday_short"]}
        ]
        
        for(let i = 0; i < weekDays.length; i++){
            let isSelected = this.state.selectedDays? this.state.selectedDays.find(selected => selected.id === weekDays[i].id): false;
            items.push(
                <View key={weekDays[i].id} style={{borderRadius: 50,  marginRight: 8, marginBottom: 8, borderColor: '#3B5998', borderWidth: 1, backgroundColor: isSelected? "#3B5998": 'white'}}>
                    <TouchableWithoutFeedback onPress={() => this.onSelectDay(weekDays[i])}>
                        <Text style={{marginHorizontal: 8, marginVertical: 6, color: isSelected? 'white': "#3B5998" }}>{weekDays[i].name}</Text>
                    </TouchableWithoutFeedback>
                </View>
            )
        }

        return items;
    }

    onSelectDay(day){
        let selected = this.state.selectedDays;
        let position = selected.findIndex(selectedDay => selectedDay.id === day.id);
        if(position === -1){
            selected.push(day);
        }else{
            selected.splice(position, 1);
        }
        this.setState({selectedDays: selected});
    }



    onRegionPress(region){
        let selected = this.state.selectedRegions
        let position = selected.indexOf(region);
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
        this.loadFilters();        
    }



    async loadCategories() {
        const categories = await this.tasksCountEndpoint();
        let withoutAllItem = categories.filter(item => item.category !== "all")
        this.setState({
            categories: withoutAllItem,
        });
    }

    storeFilters = async () => {
        let filtersObject = {
            selectedCategories: this.state.selectedCategories,
            selectedDays: this.state.selectedDays,
            selectedRegions: this.state.selectedRegions,
            hourPrice: this.state.hourPrice,
            dayPrice: this.state.dayPrice
        }

        await settings.setFilters(filtersObject);
        this.props.updateFilters(filtersObject);
        this.props.navigation.goBack();
    }

    async resetFilters(){
        await settings.setFilters(null);
        this.props.updateFilters(null);
        this.props.navigation.goBack();
    }

    async loadFilters(){
        let filtersObject = this.props.filters;
        if(filtersObject !== null){
            this.setState({
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

const mapStateToProps = state => ({
    filters: state.taskReducer.filters
})

//Map your action creators to your props.
const mapDispatchToProps = {
    updateFilters
}

export default connect(mapStateToProps, mapDispatchToProps) (FilterScreen);