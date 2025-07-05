/**
 *  EmployeeAdListScreen.js
 *  Screen with list of employee ads. Latest ads first.
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
    Linking,
    StyleSheet,
    Alert
} from 'react-native';
import EmployeeAdListItem from "./EmployeeAdListItem";
import icon from '../../constant/Icons';
import settings from "../../../backend/Settings";
import { BurgerButton } from "../../components/Buttons";
import { connect } from 'react-redux';
import { getEmployeeAds, getMoreEmployeeAds } from '../../redux/employee-ad-handlers';
import strings from '../../utils/Strings';
import Color from '../../constant/Color';

class EmployeeAdListScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: strings["employee_ad_title"],
            headerLeft: (
                <BurgerButton openDrawer={() => navigation.openDrawer()}/>
            ),
            headerRight: (
                <TouchableOpacity
                        style={{
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 8,
                            paddingBottom: 8,
                        }}
                        onPress={() => navigation.navigate("CreateOption", {prev: true})}>
                    <Image source={icon("add")}/>
                </TouchableOpacity>
            )
          };
    }


    state = {
        isHebrew: false,
    }

    componentDidMount(){
        this.setLang()
        this.props.getEmployeeAds();
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    render(){
        return(
            <FlatList
                data={this.props.ads}
                style={{flex: 1, backgroundColor: '#ffe4cc'}}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this._renderItem}
                ItemSeparatorComponent={this._itemSeparator}
                onEndReachedThreshold={20}
                onEndReached={this._onListEndReached}
                ListHeaderComponent={this.listHeader()}
            />
        )
    }

    listHeader(){
        return(
            <View>
                <View style={{flexDirection: 'row', marginVertical: 8, marginHorizontal: 2, alignItems: 'center'}}>    

                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        borderRadius: 6, 
                        borderColor: Color.primary,
                        borderStyle: 'solid',
                        borderWidth: 1,
                        height: 40,
                        paddingHorizontal: 6,
                        justifyContent: 'center'
                        }} onPress={() => this.props.navigation.navigate("MainTaskList")}>
                        <View>
                            <Text style={{
                                color: Color.primary,
                                fontSize: 14
                            }}>{strings["main_task_list_tasks"]}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{width: 2}}/>

                    <View style={{
                        flex: 1, 
                        alignItems: 'center', 
                        borderRadius: 6, 
                        backgroundColor: Color.primary,
                        height: 40,
                        paddingHorizontal: 6,
                        justifyContent: 'center'
                        }}>

                        <Text style={{
                                color: "white",
                                fontSize: 14,
                                textAlign: 'center'
                        }}>{strings["main_task_list_ads"]}</Text>
                        
                    </View>
                </View>
            </View>
        )
    }

    _onListEndReached = () => {
        if(this.props.loading || this.props.endReached) return;
        this.props.getMoreEmployeeAds();
    }

    _renderItem = ({item}) => <EmployeeAdListItem ad={item} isHebrew={this.state.isHebrew} onPress={this.onAdPress}/>

    _itemSeparator = () => <View style={{height: 20}}/>

    onAdPress = (ad) => {
        this.props.navigation.navigate("EmployeeAd", {ad})
    }
}


//Map the redux state to your props.
const mapStateToProps = state => ({
    ads: state.employeeAdReducer.ads,
    loading: state.employeeAdReducer.loading,
    endReached: state.employeeAdReducer.endReached
})

//Map your action creators to your props.
const mapDispatchToProps = {
    getEmployeeAds,
    getMoreEmployeeAds,
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeAdListScreen);

