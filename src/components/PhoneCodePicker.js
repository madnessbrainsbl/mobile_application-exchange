import React from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import strings from '../utils/Strings';
import CountryPicker  from 'react-native-country-picker-modal';

/**
 * @Legacy
 */

const unit = val => val * 0.75;

export default class PhoneCodePicker extends React.Component {
    state = {
        cca2: 'US',
        callingCode: '1',
        country: null,
        translation: 'eng',
        showPicker: false,
    };

    

    componentDidMount() {
        this.setCurrentLang();
    }

    onChangeHandler = (value) => {
        this.setState({
            cca2: value.cca2,
            callingCode: value.callingCode,
        }, () => {
            this.props.onChange(value.callingCode)
        });
    };

    setCurrentLang = async () => {
        let cca2 = 'IL', callingCode = '972';
        //let cca2 = 'RU', callingCode = '7';
        /*const language = await settings.getLanguage();

        switch (language) {
            case 'ru':
                cca2 = 'RU';
                callingCode = '7';
                break;
            case 'en':
                cca2 = 'US';
                callingCode = '1';
                break;
            case 'he':
                cca2 = 'IL';
                callingCode = '972';
                break;
            case 'ro':
                cca2 = 'RO';
                callingCode = '40';
                break;
            default:
                cca2 = 'IL';
                callingCode = '972';
                break;
        }*/

        this.setState({
            // translation: language === 'ru' ? 'rus' : 'eng', Not worked property as dynamically
            cca2,
            callingCode,
        }, () => {
            this.setState({showPicker: true});
            this.props.onChange(callingCode);
        });
    };

    render() {
        const { cca2, translation, callingCode } = this.state;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    borderRightWidth: 1,
                    borderColor: '#949494',
                    padding: unit(12),
                    paddingTop: unit(10),
                }} 
                onPress={() => this.pickerRef.setState({modalVisible: true})}>

                <CountryPicker
                    ref={component => this.pickerRef = component}
                    filterable
                    closeable
                    hideAlphabetFilter
                    showCallingCode
                    filterPlaceholder={strings['filter']}
                    onChange={this.onChangeHandler}
                    cca2={cca2}
                    translation={translation}
                    styles={{
                        itemCountryName: {
                            borderBottomWidth: 0,
                        }
                    }}
                />
                <Text style={{
                    marginLeft: unit(3),
                    paddingTop: unit(5),
                }}>+{callingCode}</Text>
            </TouchableOpacity>
        );
    }
}