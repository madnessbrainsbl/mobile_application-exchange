// import Toast from 'react-native-smart-toast';
import { 
    Dimensions, 
    Text, 
    View, 
    StyleSheet, 
    TouchableWithoutFeedback,
    Image 
} from 'react-native';
import { BlurView } from 'expo';
import React from 'react';

const screenWidth = Math.round(Dimensions.get('window').width);

export default class iOSNotification {
    static toast = null;

    static show(data) {
        // iOSNotification.toast.show({
        //     position: Toast.constants.gravity.top,
        //     children: 
        //         <View>
        //             <TouchableWithoutFeedback onPress={() => data.onPress(data.params)}>
        //                 <View style={{backgroundColor: 'rgba(0, 0, 0, 0.85)', padding: 16, borderRadius: 8,}}>
        //                     <View style={{flexDirection: 'row', alignItems: 'center'}}>
        //                         <Image style={{height: 18, width: 18, borderRadius: 4}} source={require("../assets/images/icon_notification.png")}/>
        //                         <Text style={{color: 'white', marginStart: 8, fontWeight: 'bold'}}>{data.title}</Text>
        //                     </View>
        //                     <Text style={{fontSize: 14, color: 'white', marginTop: 8}}>{data.body}</Text>
        //                 </View>
        //             </TouchableWithoutFeedback>
        //         </View>
        // });
    }

    static style = {
        width: screenWidth - 14,
        backgroundColor: 'transparent',
    };
}