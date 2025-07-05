import React from 'react';
import {
    Modal,
    SafeAreaView,
    Share,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Image
} from 'react-native';
import Avatar from "../../../components/Avatar";
import Rating from "../../../components/Rating";
import settings from "../../../../backend/Settings";
import BackendAPI from "../../../../backend/BackendAPI";
import strings from "../../../utils/Strings";

const style = StyleSheet.create({
    container:{
        paddingTop: 16,
        paddingBottom: 16,
        paddingStart: 24,
        paddingEnd: 24,
        backgroundColor: 'white',
    },
    title: {
        color: "#42436A",
        fontWeight: 'bold'
    },
    zeroStateText: {
        color: "rgba(0, 0, 0, 0.36)",
        textAlign: 'center'
    },
    rating: {
        flexDirection: "row",
        marginTop: 2
    },
    button: {
        color: '#EB5757'
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E8F1E'
    },
})

export default class AssignedPerformersListView extends React.Component{


    api = new BackendAPI(this);
    cancelAssignedPerformerEndpoint = this.api.getCancelAssignedPerformerEndpoint();

    state = {
        isHebrew: false,
        // applies: this.props.task.applies? this.props.task.applies.filter(apply => apply.status === 'assigned'): []
    }

    componentDidMount = () => {
        this.setLang();

        // if(this.props.task.applies){
        //     this.setState({
        //         applies: this.props.task.applies.filter(apply => apply.status === 'assigned')
        //     })
        // }
    };

    setLang = async() => {
        const lang = await settings.getLanguage();
        this.setState({
            isHebrew: lang === 'he',
        });
    };

    render(){
        
        return(
            <View style={style.container}>
                <Text 
                    style={[style.title, {textAlign: this.state.isHebrew? 'right': 'left'}]}>
                    {strings["assigned_performers_view_title"]}
                </Text>

                <View style={{marginVertical: 10}}>
                    {this.renderAssignedList()}
                </View>
            </View>
        )
    }

    renderPerformerItemView(apply){
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        let {user} = apply
        return(
            <View key={apply.id} style={[rowAlign, {alignItems: 'center', justifyContent: 'space-between', marginTop: 16}]}>

                <View style={[rowAlign, {alignItems: 'center'}]}>
                    <Avatar
                        src={user.avatar}
                        style={{
                            marginRight: this.state.isHebrew ? 0 : 16,
                            marginLeft: this.state.isHebrew ? 16 : 0,
                        }}
                    />
            
                    <View>
                        <View style={columnAlign}>
                            <Text style={style.customerName}>{user["first_name"]} {user["last_name"]}</Text>
                            <Rating 
                                style={style.rating}
                                value={user.rating}/>
                            {apply.price > 0 && <Text style={style.price}>{`${apply.price}${strings["currency"]}/${strings[this.props.task.pay_type]}`}</Text>}
                        </View>
                        <View style={[columnAlign, {marginTop: 6}]}>
                            <TouchableOpacity onPress={() => this.props.openProfile(user)}>
                                <Text style={{fontSize: 12, color: '#3B5998'}}>{strings["show_profile"]}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.props.openDialog(user)}>
                                <Text style={{fontSize: 12, marginTop: 6, color: '#3B5998'}}>{strings["ask_question"]}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
                
                {
                    this.props.task.completed ? null :
                    <TouchableOpacity onPress={() => this.props.removePerformer(apply)}>
                        <Text style={{
                            color: '#EB5757',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderColor: '#EB5757',
                            borderRadius: 6,
                            borderWidth: 1
                        }}>{strings["assigned_performers_view_cancel"]}</Text>
                    </TouchableOpacity>
                }
                
                
            </View>
            
        )
    }

    renderAssignedList(){
        let applies = this.props.task.applies? this.props.task.applies.filter(apply => apply.status === 'assigned'):[]
        if(!applies || applies.length === 0){
            return this.renderZeroState();
        }

        let items = [];
        applies.forEach(apply => items.push(this.renderPerformerItemView(apply)))

        return items;
    }

    renderZeroState(){
        return(
            <View style={{marginVertical: 20}}>
                <Text style={style.zeroStateText}>{strings["assigned_performers_view_zero_state"]}</Text>
            </View>
        )
    }

    // async removePerformer(performer) {

    //     let performerList = this.state.performers;
    //     let performerIndex = performerList.indexOf(performer);
    //     performerList.splice(performerIndex, 1);
    //     this.setState({performers: performerList});

    //     await this.cancelAssignedPerformerEndpoint({
    //         taskId: this.props.task["id"],
    //         performerId: performer["id"]
    //     });
    // }
}