/**
 *  ApplyDialog.js
 *  View for rendering full information about apply and actions
 *  Created by Dmitry Chulkov 15/12/2019
 */

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
    Dimensions
} from 'react-native';
import Rating from "../../../components/Rating";

import Avatar from '../../../components/Avatar';

import strings from "../../../utils/Strings";

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    layoutContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 14,
        width: Dimensions.get('window').width - 100
    },
    name: {
        fontSize: 18,
        color: '#42436A',
        fontWeight: '600'
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E8F1E'
    },
    category:{
        color: "rgba(66, 67, 106, 0.76)",
        fontSize: 14
    },
    button: {
        color: '#3B5998'
    },
    buttonDanger: {
        color: '#EB5757'
    },
    buttonCancel: {
        color: 'rgba(0, 0, 0, 0.56)'
    },
    buttonContainer: {
        paddingVertical: 14,
    }
})

export default class ApplyDialog extends React.Component{

    render(){
        const columnAlign = {alignItems: this.props.isHebrew? 'flex-end': 'flex-start'};
        const rowAlign = {flexDirection: this.props.isHebrew? 'row-reverse': 'row'};
        const {apply} = this.props

        return(
            <View style={styles.overlay}>
                <TouchableWithoutFeedback style={{flex: 1}} onPress={this._close}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        
                            <TouchableWithoutFeedback  style={{}} onPress={() => {}}>
                            <View style={styles.layoutContainer}>
                                
                                <Text style={{fontWeight: 'bold', color: 'rgba(0, 65, 201, 0.65)', marginBottom: 12}}>{"Новый отклик"}</Text>

                                <View style={[rowAlign, {justifyContent: 'space-between', alignItems :'flex-start', width: '100%'}]}>
                                    <View style={[rowAlign, {alignItems: 'center'}]}>

                                        <Avatar src={apply.user.avatar}/>
                                        <View style={[columnAlign, {marginHorizontal: 0, maxWidth: '100%', }]}>
                                            <Text style={[styles.name, {maxWidth: '100%'}]}>{apply.user.first_name}</Text>
                                            {apply.user.category &&
                                                <Text style={styles.category}>{strings.getCategory(apply.user.category.name)}</Text>
                                            }
                                            <Rating value={apply.user.rating} style={rowAlign}/>
                                        </View>

                                    </View>

                                    <Text style={styles.price}>{`${apply.price}${strings["currency"]}/${strings[this.props.payType]}`}</Text>
                                </View>

                                {apply.user.about && <View style={{marginTop: 8}}>
                                    <Text style={styles.category}>{apply.user.about}</Text>
                                </View>}

                                <View style={{alignItems: 'center', marginTop: 16, paddingHorizontal: 16, width: '100%'}}>

                                    {apply.status === 'new' && 
                                        <View style={{width: '100%', alignItems: 'center'}}>
                                            <TouchableOpacity>
                                                <View style={styles.buttonContainer}>
                                                    <Text style={styles.button}>{strings["appoint"]}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <ButtonSeparator />

                                            <TouchableOpacity>
                                                <View style={styles.buttonContainer}>
                                                    <Text style={styles.buttonDanger}>{strings["apply_list_view_refuse"]}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <ButtonSeparator />
                                        </View>
                                    }

                                    {
                                        apply.status === 'pending' && 
                                        <View>
                                            <TouchableOpacity>
                                                <View style={styles.buttonContainer}>
                                                    <Text style={styles.button}>{strings["pending_apply_list_view_remind"]}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <ButtonSeparator />
                                        </View>
                                    }

                                    <TouchableOpacity>
                                        <View style={styles.buttonContainer}>
                                            <Text style={styles.button}>{strings["show_profile"]}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <ButtonSeparator />

                                    <TouchableOpacity>
                                        <View style={styles.buttonContainer}>
                                            <Text style={styles.button}>{strings["ask_question"]}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <ButtonSeparator />

                                    <TouchableOpacity onPress={this._close}>
                                        <View style={styles.buttonContainer}>
                                            <Text style={styles.buttonCancel}>{"Cancel"}</Text>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                                

                            </View>
                            </TouchableWithoutFeedback>

                        
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    // renderButtonSeparator(){
    //     return(
    //         <View style={{
    //             height: 1,
    //             width: '100%',
    //             backgroundColor: 'rgba(59, 89, 152, 0.26)'
    //         }}
    //         />
    //     )
    // }

    _close = () => {
        if(this.props.close){
            this.props.close()
        }
    }
}

function ButtonSeparator(props){
    return(
        <View style={{
            height: 1,
            width: '100%',
            backgroundColor: 'rgba(59, 89, 152, 0.26)'
        }}
        />
    )
}