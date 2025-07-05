import {StyleSheet, Platform} from "react-native";

const isIOS = Platform.OS === 'ios';

const COLOR_MAIN = "#3B5998";
const COLOR_SECONDARY = "white";
const COLOR_LINK = "#6B739B";

const COLOR_BUTTON = "#3B5998";
const COLOR_BTN_PRIMARY_TEXT = "white";

const COLOR_BUTTON_SECONDARY = "#e8e9f0";
const COLOR_TEXT_SECONDARY = "#3B5998";

const unit = val => val * 0.75;

const buttonCommon = {
    borderRadius: 5,
    marginBottom: unit(22),
    padding: unit(16)
};

export default StyleSheet.create({
    appVersion: {
        color: '#DDD',
        fontSize: 12,
        paddingBottom: 5,
        textAlign: 'center',
    },
    loginContainer: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        justifyContent: "center",
    },
    commonContainer: {
        flex: 1,
        flexDirection: "column"
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        paddingTop: unit(16),
        paddingLeft: unit(16),
        paddingRight: unit(16),
        paddingBottom: unit(16)
    },
    textH1: {
        fontSize: 80,
        textAlign: "center",
        marginBottom: unit(16),
        color: COLOR_TEXT_SECONDARY
    },
    textH2: {
        fontSize: 24,
        color: "#4F5267",
        marginBottom: unit(18)
    },
    textNormalLogin: {
        fontSize: 16,
        color: "#888A92",
        marginBottom: unit(26)
    },
    // Login / Sign up
    secondaryBtnWrap: {
        // borderWidth: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    // PRIMARY BUTTON
    buttonMain: {
        backgroundColor: COLOR_BUTTON,
        ...buttonCommon
    },
    buttonMainText: {
        color: COLOR_BTN_PRIMARY_TEXT,
        textAlign: "center"
    },
    buttonSecondary: {
        backgroundColor: COLOR_BUTTON_SECONDARY,
        ...buttonCommon
    },
    buttonSecondaryText: {
        color: COLOR_TEXT_SECONDARY,
        textAlign: "center"
    },
    buttonLink: {},
    buttonLinkText: {
        color: COLOR_LINK,
        textDecorationLine: "underline",
        textAlign: "center"
    },
    // Top Menu
    topMenu: {
        paddingTop: Platform.OS === 'ios' ? 30 : 22,
        backgroundColor: "#3B5998",
        width: "100%",
        height: Platform.OS === 'ios' ? 80 : 70,
        paddingLeft: 4,
        paddingRight: 4,
        alignItems: "center",
        justifyContent: "space-between",
        position: "absolute",
        top: 0,
        flex: 1,
        flexDirection: "row"
    },
    topMenuText: {
        fontSize: 17,
        fontWeight: "bold",
        color: "white"
    },
    topMenuButton: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
    topMenuButtonText: {
        fontSize: 17,
        color: "white"
    },
    topMenuButtonSmallText: {
        fontSize: 14,
        color: "white"
    },
    // Bottom Menu
    bottomMenu: {
        width: "100%",
        height: 50,
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    bottomMenuItem: {
        backgroundColor: COLOR_MAIN,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    bottomMenuItemText: {
        color: COLOR_SECONDARY
    },
    bottomMenuItemSelected: {
        backgroundColor: COLOR_SECONDARY,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    bottomMenuItemSelectedText: {
        color: COLOR_MAIN
    },
    // Displays
    displayRow: {
        flexDirection: "row",
        flexWrap: 'wrap',
        marginBottom: 5,
    },
    displayValueContainer: {
        flexDirection: "row"
    },
    displayLabel: {
        fontSize: 16,
        marginRight: 3,
        color: "#848484"
    },
    displayValue: {
        fontSize: 16,
        color: "#333333"
    },
    // Forms
    phoneCodePickerContainer: {
        flexDirection: 'row',
        borderRightWidth: 1,
        borderColor: '#949494',
        padding: isIOS ? unit(14) : unit(10),
        paddingTop: isIOS ? unit(8) : unit(13),
    },
    phoneCodePickerCallingCall: {
        marginLeft: unit(3),
        paddingTop: isIOS ? unit(5) : unit(6),
    },
    loginInputContainer: {
        backgroundColor: "#e8eaf0",
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: unit(16)
    },
    loginInput: {
        padding: unit(14),
        flexGrow: 1,
    },
    fieldLabel: {
        fontSize: 14,
        marginBottom: 5,
        color: "#888A92"
    },
    fieldInput: {
        height: 38,
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0"
    },
    fieldPicker: {
        height: 38,
        padding: 5,
        justifyContent: "center",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#e8e9f0"
    },
    validationMessage: {
        fontSize: 12,
        color: "#FFAAAA",
        marginTop: unit(-16),
        marginBottom: unit(16)
    },
    // DRAWER
    drawerContainer: {
        flex: 1,
        flexDirection: "column",
        paddingTop: Platform.OS === 'ios' ? 30 : 22,
    },
    drawerUserContainer: {
        flexDirection: "row",
        paddingTop: unit(24),
        paddingBottom: unit(24),
        paddingRight: unit(16),
        paddingLeft: unit(16),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#8E8E8E"
    },
    drawerUserRightContainer: {
        flex: 1,
        flexDirection: "column"
    },
    drawerUserAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: unit(24),
    },
    drawerUserName: {
        fontSize: 20,
        color: "#333333"
    },
    drawerUserRole: {
        fontSize: 16,
        color: "#848484"
    },
    drawerUserRating: {
        flexDirection: "row",
        marginTop: unit(12)
    },
    drawerMenuListContainer: {
        flex: 1,
        flexDirection: "column",
        paddingTop: unit(8)
    },
    drawerMenuItem: {
        flexDirection: "row",
        paddingLeft: Platform.OS === 'ios' ? unit(22) : unit(16),
        paddingRight: unit(16),
        marginTop: unit(16),
        marginBottom: Platform.OS === 'ios' ? unit(16) : unit(16)
    },
    drawerMenuItemContainer: {
        flexDirection: "row"
    },
    drawerMenuImage: {
        marginRight: unit(24),
        height: 24,
        width: 24
    },
    drawerMenuText: {
        fontSize: 16,
        color: "#333333"
    },
    drawerBottomSection: {
        width: "100%",
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#8E8E8E"
    },
    drawerMenuNotificationContainer:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    drawerMenuNotificationDescription:{
        marginTop: 4,
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.56)'
    },
    myApplyContainer:{
        flexDirection: 'column',
        justifyContent: 'center',
        borderColor: COLOR_MAIN,
        borderWidth: 0.5,
        borderRadius: 8,
        padding: 6,
        paddingTop: 18,
        paddingBottom: 12,
        paddingLeft: 12,
        paddingRight: 12
    },
    myApplyTitle: {
        color: '#333333',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold'
    }

});