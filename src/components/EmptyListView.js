import React from 'react';
import {
    Text,
    View,
} from 'react-native';

class EmptyListView extends React.Component{
    render(){
        return(
            <View style={{flex: 1, marginTop: 100}}>
                <View style={{
                    flex: 1,
                    paddingLeft: 15,
                    paddingRight: 15,
                    justifyContent: "center",
                }}>
                    <Text style={{
                        marginTop: 100,
                        fontSize: 24,
                        color: "#4F5267",
                        textAlign: "center",
                        marginBottom: 28,
                    }}>
                    {this.props.title}
                    </Text>
                </View>
            </View>
            )
        }
}

export default EmptyListView;