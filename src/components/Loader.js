import React from 'react';
import { ActivityIndicator, View} from 'react-native';

export default class Loader extends React.Component {
    render() {
        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <ActivityIndicator size="large" color="#3B5998"/>
            </View>
        );
    }
}