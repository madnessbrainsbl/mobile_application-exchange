import React from 'react';
import {
    Image,
} from 'react-native';
import icon from "../constant/Icons";
import { connect } from 'react-redux';

class DynamicFilterIcon extends React.Component{
    render(){
        return(
            <Image 
                source={this.props.isIdle? icon("filter-idle"): icon("filter-applied")} 
                style={{height: 24, width: 24, resizeMode: "contain"}}/>
        )
    }
}

const mapStateToProps = state => ({
    isIdle: state.taskReducer.filters === null,
})

//Map your action creators to your props.
const mapDispatchToProps = {}

export default  connect(mapStateToProps, mapDispatchToProps) (DynamicFilterIcon)