import React from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Share,
    Alert,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    View,
    Image,
    FlatList,
    TouchableWithoutFeedback
} from 'react-native';
import settings from "../../../backend/Settings";
import BackendAPI from "../../../backend/BackendAPI";
import strings from "../../utils/Strings";
import {BurgerButton} from '../../components/Buttons';
import PerformerCard from '../../components/PerformerCard';
import EmptyListView from '../../components/EmptyListView';
import icon from '../../constant/Icons';

import { connect } from 'react-redux';
import { getPerformers, getMorePerformers, selectCategory, applyFilters } from '../../redux/performers-handlers';

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
        marginBottom: 10
    },
    categoryItem:{
        borderRadius: 12,  
        marginRight: 8, 
        marginBottom: 4,
        borderColor: '#3B5998', 
        borderWidth: 1,
    },
    categoryItemText: {
        paddingHorizontal: 10, 
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

class PerformersListScreen extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["performer_list_title"],
            // headerLeft: (<BurgerButton openDrawer={() => navigation.openDrawer()}/>),
            headerRight: (
            <TouchableOpacity
                style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,}}
                onPress={navigation.getParam("openFilters")}
            >
                <Image 
                    source={navigation.getParam("filtersAreSet", false)? icon("filter-applied"): icon("filter-idle")} 
                    style={{height: 24, width: 24, resizeMode: "contain"}}/>
            </TouchableOpacity>)
        }
    }

    api = new BackendAPI(this);
    performersEndpoint = this.api.getPerformersEndpoint();
    userEndpoint = this.api.getUserEndpoint();
    getCategoriesEndpoint = this.api.getCategories();

    state = {
        performers: [],
        loading: true,
        filters: {},
        categories: [],
        selectedCategory: null,
        isHebrew: false
    }

    componentDidMount(){
        this.props.navigation.setParams({"openFilters": this.openFilters})
        this.props.getPerformers(true)
        this.setLang();
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({isHebrew: lang === 'he'});
    };

    async loadCategories() {
        const categories = await this.getCategoriesEndpoint();
        this.setState({categories});
    }

    openMyProfile = () => {
        this.props.navigation.navigate("UserProfile", {prev: true});
    }

    async loadPerformers() {
        this.setState({loading: true})
        let params = {}
        let {filters, selectedCategory} = this.state
        if(selectedCategory) {
            params.categories = selectedCategory.id
        }
        if(Object.keys(filters).length > 0){
            // params.categories = selectedCategories.map(category => category.id).join(',');
            params.regions = filters.selectedRegions.map(region => region.value).join(',')
            params.days = filters.selectedDays.join(',')
            params.price_hour = filters.hourPrice
            params.price_day = filters.dayPrice
        }
        const performers = await this.performersEndpoint(params);
        this.setState({performers, loading: false})
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: "#f9f9f9"}}>
                <View style={{}}>
                    {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingHorizontal: 12, paddingTop: 4, paddingBottom: 2}}>
                        <View style={{flexDirection: 'row'}}>
                            {this.renderCategories()}
                        </View>
                    </ScrollView> */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingHorizontal: 12, paddingTop: 2, paddingBottom: 4}}>
                        <View style={{flexDirection: 'row'}}>
                            {this.renderFilters()}
                        </View>
                    </ScrollView>
                </View>
                <FlatList
                    style={{ flex: 1, backgroundColor: "#f9f9f9",}}
                    data={this.props.performers}
                    onRefresh={() => setTimeout(() => { this.props.getPerformers(true) }, 200) }
                    refreshing={this.props.loading}
                    removeClippedSubviews={false}
                    ListEmptyComponent={(!this.props.loading)?<EmptyListView title={strings["performer_list_empty"]}/>: null}
                    keyExtractor={(item, index) => `${item.id}`}
                    renderItem={this.renderItem}
                    onEndReachedThreshold={15}
                    onEndReached={this.onEndReached}
                />
            </View>
        )
    }

    onEndReached = () => {
        this.props.getMorePerformers()
    }

    renderCategories(){
        let items = []
        items.push(this.renderCategoryItem({id: -1}))
        this.props.categories.forEach(category => items.push(this.renderCategoryItem(category)))
        return items;
    }

    renderCategoryItem(category){
        let {selectedCategory} = this.props
        let isSelected = selectedCategory === category.id
        return(
            <View key={category.id.toString()} style={[styles.categoryItem, {backgroundColor: isSelected? '#3B5998': 'white'}]}>
                <TouchableWithoutFeedback onPress={() => this.onCategoryPressed(category)}>
                    <Text style={[styles.categoryItemText, {color: isSelected? 'white': "#3B5998" }]}>{ category.id !== -1? strings.getCategory(category.category): strings["all"]}</Text>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    onCategoryPressed = (category) => {
        this.props.selectCategory(category.id)
    }

    onPerformerPress = (performer) => {
        this.props.navigation.navigate('UserProfile', {user_id: performer.id, prev: true})
    }

    renderItem = ({item}) => {
        return(
            <PerformerCard user={item} isHebrew={this.state.isHebrew} onPress={() => this.onPerformerPress(item)}/>
        )
    }

    openFilters = () => {
        this.props.navigation.navigate("PerformersFilter", {filters: this.props.filters, setCallback: this.setFilters})
    }

    setFilters = (filters) => {
        if(Object.keys(filters).length > 0){
            if(filters.dayPrice || 
                filters.hourPrice || 
                (filters.selectedRegions && filters.selectedRegions.length > 0) || 
                (filters.selectedDays && filters.selectedDays.length > 0)){
                    this.props.navigation.setParams({'filtersAreSet': true})
            }else{
                this.props.navigation.setParams({'filtersAreSet': false})
            }
        }else{
            this.props.navigation.setParams({'filtersAreSet': false})
        }
        
        this.props.applyFilters(filters)
    }

    renderFilters = () => {
        let views = [];
        let {filters} = this.props
        if(!filters || Object.keys(filters).length === 0) return 

        filters.selected_subcategories.forEach(category => {
            views.push(
                this.renderFilterItem(
                    category.id.toString(), 
                    strings.getCategory(category["name"]), 
                    () => this.removeFilterCategory(category)))
        })

        filters.selectedRegions.forEach(region => {
            views.push(
                this.renderFilterItem(
                    region.value, 
                    strings[region.value], 
                    () => this.removeFilterRegion(region)))
        })

        const weekDays = {
            "monday": strings["monday_short"],
            "tuesday": strings["tuesday_short"],
            "wednesday": strings["wednesday_short"],
            "thursday": strings["thursday_short"],
            "friday": strings["friday_short"],
            "saturday": strings["saturday_short"],
            "sunday": strings["sunday_short"],
        }

        filters.selectedDays.forEach(day => {
            views.push(this.renderFilterItem(day, weekDays[day], () => this.removeFilterWeekday(day)))
        })

        if(filters.hourPrice !== ""){
            let priceString = strings.formatString(strings["performer_list_hour_price"], filters.hourPrice)
            views.push(this.renderFilterItem("hour_price", priceString, () => this.removeFilterPrice("hourPrice")))
        }

        if(filters.dayPrice !== ""){
            let priceString = strings.formatString(strings["performer_list_day_price"], filters.dayPrice)
            views.push(this.renderFilterItem("day_price", priceString, () => this.removeFilterPrice("dayPrice")))
        }

        return views;
    }

    renderFilterItem = (key, label, onRemove) => {
        return (
            <View key={key} style={[styles.categoryItem, {backgroundColor: '#3B5998'}]}>
                <View style={{flexDirection: 'row', paddingHorizontal: 10, alignItems: 'center'}}>
                    <Text style={[styles.categoryItemText, {color: 'white' }]}>{label}</Text>
                    <TouchableOpacity onPress={onRemove} style={{paddingVertical: 4}}>
                        <Image source={icon("remove_white")} style={{height: 8, width: 8}}/>
                    </TouchableOpacity>
                </View>
                
            </View>
        )
    }

    removeFilterCategory = (category) => {
        let filters = {...this.props.filters};
        let index = filters.selected_subcategories.findIndex(item => item.id === category.id)
        if(index !== -1){
            filters.selected_subcategories.splice(index, 1);
            this.setFilters(filters)
        }
    }

    removeFilterWeekday = (day) => {
        let filters = {...this.props.filters};
        let index = filters.selectedDays.findIndex(d => d === day);
        if(index !== -1){
            filters.selectedDays.splice(index, 1);
            this.setFilters(filters)
        }
    }

    removeFilterRegion = (region) => {
        let filters = {...this.props.filters};
        let index = filters.selectedRegions.findIndex(item => item.value === region.value)
        if(index !== -1){
            filters.selectedRegions.splice(index, 1);
            this.setFilters(filters)
        }
    }

    removeFilterPrice = (item) => {
        let filters = {...this.props.filters};
        filters[item] = "";
        this.setFilters(filters)
    }
}

const mapStateToProps = state => ({
    loading: state.performersReducer.loading,
    performers: state.performersReducer.performers,
    selectedCategory: state.performersReducer.category,
    categories: state.taskReducer.categories,
    filters: state.performersReducer.filters
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getPerformers, 
    getMorePerformers, 
    selectCategory, 
    applyFilters,
    applyFilters
}

export default connect(mapStateToProps, mapDispatchToProps)(PerformersListScreen);