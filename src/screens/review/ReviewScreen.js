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
    ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import BackendAPI from "../../../backend/BackendAPI";
import ReviewForm from "./ReviewForm";
import strings from "../../utils/Strings";
import settings from "../../../backend/Settings";

const styles = StyleSheet.create({
    titlePrimary: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    titleSecondary: {
        color: 'white', 
        fontSize: 10
    },
    titleContainer: {
        alignItems: Platform.OS === 'ios'? 'center': 'flex-start'
    },

})

class ReviewScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        let users = navigation.getParam("users", [])
        let counterString = strings.formatString(strings["review_title_counter"], navigation.getParam("current", 1), users.length)
        return {
            title: "%Review counter%",
            headerTitle: ({ style, children : title }) => {
                return (
                    <View style={styles.titleContainer}>
                        <Text style={styles.titlePrimary}>{strings["review_title"]}</Text>
                        <Text style={styles.titleSecondary}>{counterString}</Text>
                    </View>
                )
            },
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
                <Text style={{color: 'white'}}>{navigation.getParam("continueLabel", strings["review_continue_button"])}</Text>
                </TouchableOpacity>

                }
            </View>
            )
          };
    }

    state = {
        users: this.props.route.params?.users || [],
        currentIndex: 0,
        reviewType: this.props.route.params?.reviewType || 'Performer',
        personalQualities: [],
        isLoading: false,
        isHebrew: false
    }

    reviewFormLink = null

    componentDidMount(){
        this.props.navigation.setParams({"continuePressed": this.continueHandler})
        this.setContinueLabel()
        this.loadPersonalQualities()
        this.setLang()
    }

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    setContinueLabel(){
        let {users, currentIndex} = this.state
        let reviewsLeft = users.length - (currentIndex + 1)
        let continueLabel = reviewsLeft > 0? strings["review_continue_button"]: strings["review_done_button"]
        this.props.navigation.setParams({"continueLabel": continueLabel})
    }

    async loadPersonalQualities(){
        this.setState({isLoading: true})
        let personalQualities = await BackendAPI.getPersonalQualities(this.state.reviewType)
        personalQualities = personalQualities.map(item => item.text)
        this.setState({personalQualities, isLoading: false})
    }

    render(){
        return(
            <View style={{flex: 1}}>
                {this.state.isLoading? 
                    <View style={{flex: 1, alignItems: "center", justifyContent: 'center'}}>
                        <ActivityIndicator size='large'/>
                    </View>
                    :
                    <ReviewForm
                        isHebrew={this.state.isHebrew}
                        ref={ref => this.reviewForm = ref}
                        linkFunction={getRevieFunction => this.getReview = getRevieFunction}
                        user={this.state.users[this.state.currentIndex]}
                        personalQualities={this.state.personalQualities}
                        reviewType={this.state.reviewType}
                    />
                }
            </View>
        )
    }

    submitReview = (review) => {
        let taskID = this.props.route.params?.taskID || -1

        BackendAPI.postReview(
            this.props.userProfile.id,
            review.rating,
            review.text,
            taskID,
            review.user.id,
            this.state.reviewType,
            review.selectedQualities)
    }

    continueHandler = () => {

        let review = this.getReview()

        if(!this.isReviewValid(review)) return

        this.submitReview(review)
        let {currentIndex, users} = this.state;
        if(currentIndex + 1 >= users.length){
            this.props.navigation.navigate("ReviewDone", {reviewType: this.state.reviewType})
        }else{
            currentIndex++;
            this.setState({currentIndex}, () => {
                this.setContinueLabel();
            })
            this.props.navigation.setParams({"current": currentIndex + 1})
        }
    }

    isReviewValid(review){
        if(review.rating === 0) return false
        return true
    }

}

const mapStateToProps = state => ({
    userProfile: state.profileReducer
})

//Map your action creators to your props.
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewScreen);
// export default ReviewScreen