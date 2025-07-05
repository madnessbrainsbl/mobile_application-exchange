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
import BackendAPI from "../../../backend/BackendAPI";
import Avatar from '../../components/Avatar';
import icon from '../../constant/Icons';
import strings from '../../utils/Strings';
// import { withNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
    userName: {
        fontWeight: "bold",
        fontSize: 24,
        color: "#42436A"
    },
    secondaryLabel: {
        fontSize: 14,
        color: 'rgba(66, 67, 106, 0.76)'
    },
    text: {
        fontSize: 14,
        color: 'rgba(66, 67, 106, 0.86)',
        textAlign: 'center'
    },
    star: {
        width: 42,
        height: 42,
        resizeMode: 'contain',
    },
    writeReviewButton: {
        color: "#3B5998",
        borderColor: "#3B5998",
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 32
    },
    personalQuality: {
        borderColor: 'rgba(66, 67, 106, 0.86)',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginHorizontal: 4,
        marginVertical: 4
    },
    personalQualityText: {
        fontWeight: "bold",
        fontSize: 14,
        color: 'rgba(66, 67, 106, 1.0)',
    },
    personalQualitySelected: {
        backgroundColor: '#42436A',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginHorizontal: 4,
        marginVertical: 4
    },
    personalQualitySelectedText: {
        fontWeight: "bold",
        fontSize: 14,
        color: 'white',
    }
})

class ReviewForm extends React.Component {
    state = {
        rating: 0,
        reviewText: "",
        personalQualities: this.props.personalQualities,
        selectedQualities: [],
        user: this.props.user
    }

    componentDidMount(){
        // Do this stuff to have ability to get data from parent component
        this.getReview = this.getReview.bind(this)
        this.props.linkFunction(this.getReview)
    }

    getReview = () => {
        let {rating, reviewText, selectedQualities, user} = this.state
        return {
            rating,
            reviewText,
            selectedQualities,
            user
        }
    }

    render(){
        let {user} = this.props
        let direction = user.category? strings.getCategory(user.category.name): strings["performer"]
        if(this.props.reviewType === "Employer"){
            direction = strings["creator"]
        }
        return(
            <View style={{flex: 1}}>
                <ScrollView>
                    <View style={{alignItems: 'center', paddingBottom: 26}}>
                        <View style={{alignItems: 'center', marginTop: 24}}>
                            <Avatar size={120} src={user.avatar}/>
                        </View>

                        <View style={{alignItems: 'center', marginTop: 16}}>
                            <Text style={styles.userName}>{`${user.first_name} ${user.last_name}`}</Text>
                            <Text style={styles.secondaryLabel}>{direction}</Text>
                        </View>

                        <View style={{marginTop: 26, flexDirection: this.props.isHebrew? 'row-reverse' :'row'}}>
                            {this.renderStars()}
                        </View>

                        <View style={{marginTop: 36, alignItems: 'center', marginHorizontal: 30}}>
                            <Text style={[styles.secondaryLabel, {textAlign: 'center'}]}>
                                {strings.formatString(strings["choose_personal_qualities"], `${user.first_name} ${user.last_name}`)}
                            </Text>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16}}>
                                {this.renderQualities()}
                            </View>
                        </View>

                        {this.renderReviewText()}
                        
                        <TouchableOpacity style={{marginTop: 26}} onPress={this.reviewButtonPressed}>
                            <Text style={styles.writeReviewButton}>
                                {this.state.reviewText? strings["change_review"]: strings["write_review"]}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }

    setReviewText = (text) => {
        this.setState({reviewText: text})
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.user !== prevState.user){
            return { 
                rating: 0,
                reviewText: "",
                personalQualities: nextProps.personalQualities,
                selectedQualities: [],
                user: nextProps.user
            };
        }
        return null;
    }

    reviewButtonPressed = () => {
        this.setReviewText = this.setReviewText.bind(this);
        this.props.navigation.navigate("WriteReview", {
            reviewCallback: this.setReviewText,
            text: this.state.reviewText,
            user: this.state.user
        })
    }

    renderReviewText(){
        if(this.state.reviewText){
            return (
                <View style={{alignItems: 'center', marginHorizontal: 30, marginTop: 26}}>
                    <Text style={styles.text}>{this.state.reviewText}</Text>
                </View>
            )
        }
        return null
    }

    renderStars(){
        let items = []
        const starSpace = {marginHorizontal: 6}
        for(let i = 1; i <= 5; i++){
            items.push(
                <ReviewStar 
                    key={i.toString()}
                    number={i} 
                    empty={i > this.state.rating}
                    space={i <= 5? starSpace: {}} 
                    onStarPress={this.onStarPressed}/>
            )
        }
        return items
    }

    onStarPressed = rating => {
        this.setState({rating})
    }

    onQualityPressed = quality => {
        let position = this.state.selectedQualities.indexOf(quality)
        if(position == -1){
            this.setState({
                selectedQualities: [...this.state.selectedQualities, quality]
            })
        }else{
            let {selectedQualities} = this.state
            selectedQualities.splice(position, 1)
            this.setState({selectedQualities})
        }
    }

    renderQualities(){
        return this.state.personalQualities.map(quality => {
            let isSelected = this.state.selectedQualities.includes(quality)
            let containerStyle = isSelected?styles.personalQualitySelected: styles.personalQuality
            let textStyle = isSelected?styles.personalQualitySelectedText: styles.personalQualityText
            return(
                <TouchableOpacity 
                    key={quality}
                    style={containerStyle}  
                    onPress={() => this.onQualityPressed(quality)}>
                    <Text style={textStyle}>{strings[quality] || quality}</Text>
                </TouchableOpacity>
            )
        })
    }
}

function ReviewStar(props){
    return (
        <TouchableOpacity onPress={() => props.onStarPress(props.number)}>
            <Image source={props.empty? icon("star-blank"): icon("star-full")} style={[styles.star, props.space]}/>
        </TouchableOpacity>
    )
}

export default ReviewForm;