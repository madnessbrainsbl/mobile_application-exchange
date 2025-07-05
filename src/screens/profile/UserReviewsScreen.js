import React from 'react';
import {
    View,
    ScrollView,
    Image,
    StyleSheet,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TouchableHighlight,
    FlatList,
    TextInput,
    Switch,
    Platform,
    Alert
} from 'react-native';
import { Linking } from 'react-native';
import BackendAPI from "../../../backend/BackendAPI";
import settings from "../../../backend/Settings";
import ReviewItem from './../../components/ReviewItem';

const REVIEWS_COUNT = 30

class UserReviewsScreen extends React.Component{

    api = new BackendAPI(this);
    reviewsEndpoint = this.api.getUserReviews();

    state = {
        reviews: [],
        isHebrew: false,
        offset: 0,
        endIsReached: false,
        isLoading: false
    }

    componentDidMount(){
        this.setLang()
        this.loadReviews()
    }

    loadReviews = async () => {
        let userObject = this.props.route.params?.user || null;
        if(userObject !== null){
            let userID = userObject.id;
            this.setState({isLoading: true})
            const reviews = await this.reviewsEndpoint({userID, offset: this.state.offset, count: REVIEWS_COUNT});
            if(reviews.length === 0){
                this.setState({endIsReached: true, isLoading: false})
            }else{
                let oldReviews = this.state.reviews
                this.setState({
                    reviews: oldReviews.concat(reviews),
                    offset: this.state.offset + REVIEWS_COUNT,
                    isLoading: false
                })
            }
            
        }
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    render(){
        return (
            <View style={{flex: 1, paddingHorizontal: 26}}>
                <FlatList
                    style={{flex: 1}}
                    data={this.state.reviews}
                    keyExtractor={item => item.id.toString()}
                    renderItem={this.renderReviewItem}
                    onEndReachedThreshold={10}
                    onEndReached={this.onEndReached}
                />
            </View>
        )
    }

    onEndReached = () => {
        if(this.state.isLoading) return
        if(!this.state.endIsReached){
            console.log(`offset: ${this.state.offset}`)
            this.loadReviews();
        }else{
            console.log("End is reached")
            console.log(`offset: ${this.state.offset}`)
        }
    }

    renderReviewItem = ({item}) => (
            <View style={{marginVertical: 10}}>
                <ReviewItem isHebrew={this.state.isHebrew} review={item}/>
            </View>
        )
        

}

export default UserReviewsScreen;