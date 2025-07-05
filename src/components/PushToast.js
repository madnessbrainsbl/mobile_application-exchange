// import Toast from 'react-native-smart-toast';
import { Dimensions, Text, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo';
import React from 'react';

const screenWidth = Math.round(Dimensions.get('window').width);

export default class PushToast {
    static toast = null;

    static show(data) {
        // PushToast.toast.show({
        //     position: Toast.constants.gravity.top,
        //     children: (
        //         <View style={{flex: 1}}>
        //             <View style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0, 0, 0, .4)'}]}/>

        //             <BlurView tint="default" intensity={100} style={[StyleSheet.absoluteFill, {paddingVertical: 10, paddingHorizontal: 15}]}>
        //                 <View>
        //                     <Text style={{color: '#FFF', fontSize: 16}}>{data.title}</Text>
        //                     <Text style={{color: '#FFF', fontSize: 14, marginTop: 6,}}>{data.body}</Text>
        //                 </View>
        //             </BlurView>
        //         </View>
        //     ),

        // });
    }

    static style = {
        width: screenWidth - 30,
        minHeight: 65,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        borderRadius: 4,
        padding: 0,
    };
}
