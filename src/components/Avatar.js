/**
 *  Avatar.js
 *  
 *  Created by Dmitry Chulkov 07/10/2019
 */

import React from 'react';
import { Image, View } from 'react-native';
import icon from "../constant/Icons";
import BackendAPI from "../../backend/BackendAPI";
import PropTypes from 'prop-types';

class Avatar extends React.Component {

    render() {
        const {size} = this.props;
        return (
            <View style={this.props.style}>
                <Image
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    }}
                    source={this.getImageSource()}
                />
            </View>
            
        );
    }

    getImageSource() {
        if (!this.props.src)
            return icon("avatar-blank");

        if (this.props.src.uri)
            return this.props.src;

        return {uri: `${BackendAPI.API_BASE}${this.props.src}`};
    }
}

Avatar.defaultProps = {
    size: 68,
}

export default Avatar;