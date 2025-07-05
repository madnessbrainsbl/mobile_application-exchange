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
    Image, 
    Alert
} from 'react-native';
import Avatar from "../../../components/Avatar";
import Rating from "../../../components/Rating";
import settings from "../../../../backend/Settings";
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

export default class PendingAppliesListView extends React.Component{

    state = {
        isHebrew: false
    }

    componentDidMount = () => {
        this.setLang();
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
                    {strings["pending_apply_list_view_title"]}
                </Text>
                <Text
                    style={[{color: 'rgba(66, 67, 106, 0.65)', fontSize: 12}, {textAlign: this.state.isHebrew? 'right': 'left'}]}>
                    {strings["performer_assigne_hint"]}
                </Text>

                <View style={{marginVertical: 10}}>
                    {this.renderApplyList()}
                </View>
            </View>
        )
    }

    // renderApplyItem(user){
    //     const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
    //     const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
    //     return(
    //         <View key={user.id} style={[rowAlign, {alignItems: 'center', justifyContent: 'space-between', marginTop: 16}]}>

    //             <View style={[rowAlign, {alignItems: 'center'}]}>
    //                 <Avatar
    //                     url={user.avatar}
    //                     style={{
    //                         marginRight: this.state.isHebrew ? 0 : 16,
    //                         marginLeft: this.state.isHebrew ? 16 : 0,
    //                     }}
    //                 />
            
    //                 <View>
    //                     <View style={columnAlign}>
    //                     <Text style={style.customerName}>{user["first_name"]} {user["last_name"]}</Text>
    //                     <Rating 
    //                         style={style.rating}
    //                         value={user.rating}/>
    //                     </View>
    //                     <View style={[columnAlign, {marginTop: 6}]}>
    //                         <TouchableOpacity onPress={() => this.props.showProfilePress(user)}>
    //                             <Text style={{fontSize: 12, color: '#3B5998'}}>{strings["show_profile"]}</Text>
    //                         </TouchableOpacity>

    //                         <TouchableOpacity onPress={() => this.props.onChatPressed(user)}>
    //                             <Text style={{fontSize: 12, marginTop: 6, color: '#3B5998'}}>{strings["ask_question"]}</Text>
    //                         </TouchableOpacity>
    //                     </View>
    //                 </View>

    //             </View>

    //             <TouchableOpacity onPress={() => this.props.onCancelPress(user)}>
    //                 <Text style={style.button}>Отменить</Text>
    //             </TouchableOpacity>
                
    //         </View>
            
    //     )
    // }

    renderApplyItem(apply){
        const columnAlign = {alignItems: this.state.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.state.isHebrew? 'row-reverse': 'row'};
        const {user} = apply
        return(
            <View key={user.id} style={{marginTop: 18}}>
                <View  style={[rowAlign, {alignItems: 'center', justifyContent: 'space-between'}]}>
                    <View style={[rowAlign, {alignItems: 'center'}]}>
                        <Avatar
                            src={user.avatar}
                            style={{
                                marginRight: this.state.isHebrew ? 0 : 16,
                                marginLeft: this.state.isHebrew ? 16 : 0,
                                width: 56,
                                height: 56,
                                borderRadius: 28
                            }}
                        />

                        <View>
                            <View style={columnAlign}>
                                <Text style={style.customerName}>{user["first_name"]} {user["last_name"]}</Text>
                                <Rating 
                                    style={style.rating}
                                    value={user.rating}/>
                                {apply.price > 0 && <Text style={style.price}>{`${apply.price}${strings["currency"]}/${strings[this.props.payType]}`}</Text>}
                            </View>
                        </View>

                    </View>

                    {   this.props.task.completed ? null :
                        <TouchableOpacity onPress={() => this.props.onCancelPress(apply)}>
                            <Text style={{
                                color: '#EB5757',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderColor: '#EB5757',
                                borderRadius: 6,
                                borderWidth: 1
                            }}>{strings["pending_apply_list_view_cancel"]}</Text>
                        </TouchableOpacity>
                    }

                    </View>
                
                <View style={[rowAlign, {alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginStart: 28}]}>

                    <TouchableOpacity onPress={() => this.props.showProfilePress(user)}>
                        <Text style={{fontSize: 12, color: '#3B5998'}}>{strings["show_profile"]}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.props.onChatPressed(user)}>
                        <Text style={{fontSize: 12, color: '#3B5998'}}>{strings["ask_question"]}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.props.onRemindPressed(apply)}>
                        <Text style={{
                            fontSize: 12, 
                            color: '#3B5998',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderColor: '#3B5998',
                            borderRadius: 6,
                            borderWidth: 1}}>{strings["pending_apply_list_view_remind"]}</Text>
                    </TouchableOpacity>

                </View>

                <View style={{flex: 1, height: 1, backgroundColor: 'rgba(59, 89, 152, 0.26)', marginTop: 18}}/>

            </View>
        )
    }

    renderApplyList(){
        if(!this.props.applies || this.props.applies.length === 0){
            return this.renderZeroState();
        }

        let items = [];
        this.props.applies.forEach(apply => items.push(this.renderApplyItem(apply)))

        return items;
    }

    renderZeroState(){
        return(
            <View style={{marginVertical: 20}}>
                <Text style={style.zeroStateText}>{strings["apply_list_view_zero_state"]}</Text>
            </View>
        )
    }
}