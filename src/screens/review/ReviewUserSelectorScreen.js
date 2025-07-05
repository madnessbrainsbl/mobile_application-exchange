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
    Alert,
    SectionList,
    ActivityIndicator
} from 'react-native';
import BackendAPI from "../../../backend/BackendAPI";
import Color from '../../constant/Color';
import Avatar from '../../components/Avatar';
import strings from '../../utils/Strings';
import icon from '../../constant/Icons';

class ReviewUserSelectorScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "",
            // headerLeft: (
            //     <BurgerButton openDrawer={() => navigation.openDrawer()}/>
            // ),
            headerRight: (
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    {
                        <TouchableOpacity
                            style={{
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 8,
                                paddingBottom: 8
                            }}
                            onPress={navigation.getParam("continuePressed", () => {})}>
                    <Text style={{color: 'white'}}>{strings["review_selector_continue_button"]}</Text>
                    </TouchableOpacity>
    
                    }
                </View>
            )
          };
    }

    state = {
        taskID: this.props.route.params?.taskID || -1,
        performers: [],
        selected: [],
        isHebrew: false,
        loading: false,
    }

    componentDidMount() {
        this.loadPossiblePerformers()

        this.props.navigation.setParams({'continuePressed': this.continuePressed})
    }

    continuePressed = () => {
        // TODO: Add validation for no selections
        this.props.navigation.navigate("Review", {
            users: this.state.selected,
            taskID: this.state.taskID,
            reviewType: "Performer"
        })
    }

    async loadPossiblePerformers(){
        this.setState({loading: true});
        let result = await BackendAPI.getPossiblePerformers(this.state.taskID);
        this.setState({performers: result, loading: 'false'});
    }

    render(){
        return(
            <SafeAreaView style={{flex: 1}}>
                <FlatList
                    data={this.state.performers}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._renderHeader}
                    ListEmptyComponent={this._renderZeroState}
                    ItemSeparatorComponent={() => <View style={styles.separator}/>}
                />

            </SafeAreaView>
        )
    }

    _renderHeader = () => {
        return(
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{strings["review_selector_list_title"]}</Text>
                <Text style={styles.headerDescription}>{strings["review_selector_list_description"]}</Text>
            </View>
        )
    }

    _renderZeroState = () => {
        if(this.state.loading){
            return (
                <View style={{marginTop: 30}}>
                    <ActivityIndicator size="large" color={Color.primary}/>
                </View>
            )
        }else{
            return (
                <View>
                    
                </View>
            )
        }
    }

    _keyExtractor = (item, index) => {
        return item.id.toString()
    }

    _renderItem = ({item}) => {
        let direction = item.category? strings.getCategory(item.category.name): strings["performer"]
        const {isHebrew} = this.state
        const rowAlign = isHebrew? 'row-reverse': 'row'
        const isSelected = this.state.selected.find(user => user === item)
        return (
            <View style={{marginVertical: 16, marginHorizontal: 24, flex: 1}}>

                    <View style={{flexDirection: rowAlign, justifyContent: 'space-between', alignItems: 'center', flex: 1}}>
                        <View style={{flexDirection: rowAlign, flex: 1}}>
                            <Avatar size={40} src={item.avatar}/>
                            <View style={{marginHorizontal: 20, flex: 1, alignItems: isHebrew? 'flex-end' : 'flex-start'}}>
                                <Text style={[styles.name, {textAlign: isHebrew? 'right': 'left'}]}>{`${item.first_name} ${item.last_name}`}</Text>
                                <Text style={styles.category}>{direction}</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => this.selectUser(item)} style={{padding: 6}}>
                            <Image source={isSelected? icon("check-square"): icon("square")} style={{height: 24, width: 24}}/>
                        </TouchableOpacity>
                        

                    </View>
                    
                </View>
          )
    }

    selectUser = (user) => {
        let {selected} = this.state
        let index = selected.findIndex(item => item === user)
        if(index >= 0){
            // remove from selected
            selected.splice(index, 1)
        }else{
            // add to selected
            selected.push(user)
        }
        this.setState({selected})
    }

}

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: "#42436A"
    },
    headerDescription: {
        color: "rgba(66, 67, 106, 0.65)"
    },
    headerContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginTop: 12
    },
    name: {
        color: '#42436A',
        fontSize: 14,
    },
    category: {
        color: 'rgba(66, 67, 106, 0.76)',
        fontSize: 14,
    },
    about: {
        color: 'rgba(66, 67, 106, 0.86)',
        fontSize: 14,
    },
    price: {
        color: '#2E8F1E',
        fontSize: 14,
        fontWeight: 'bold'
    },
    actionButton: {
        color: '#3B5998',
    },
    separator: {
        backgroundColor: 'rgba(66, 67, 106, 0.16)',
        height: 1,
        marginVertical: 6,
        marginHorizontal: 18
    }
  });  

export default ReviewUserSelectorScreen