import React from 'react';
import {
    Platform,
    TouchableOpacity,
    Text
} from 'react-native';
import { AppLoading } from "expo";
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { FontAwesome } from "@expo/vector-icons";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { enableScreens } from 'react-native-screens';

// import Toast from "react-native-smart-toast";
import icon from "./src/constant/Icons";

// Screens
import InitScreen from './src/screens/login/InitScreen';
import SignInScreen from "./src/screens/login/SignInScreen";
import TermsScreen from "./src/screens/login/TermsScreen";

import TaskCreateFormScreen from "./src/screens/task-form/TaskCreateFormScreen";
import TaskCreatedSuccessScreen from "./src/screens/task-form/TaskCreatedSuccessScreen";
import TaskEditFormScreen from "./src/screens/task-form/TaskEditFormScreen";

import MainTaskListScreen from "./src/screens/task-list/MainTaskListScreen";
import FilterScreen from "./src/screens/task-list/FiltersScreen";
import MyTasksScreen from "./src/screens/task-list/MyTasksScreen";
import TaskDetailsScreen from "./src/screens/task-details/TaskDetailsScreen";
import FavoriteScreen from "./src/screens/favorite/FavoriteScreen";
import CustomPriceScreen from "./src/screens/task-details/CustomPriceScreen";

import NotificationCenterScreen from './src/screens/NotificationCenterScreen';
import NotificationSettingsScreen from './src/screens/settings/NotificationSettingsScreen';
import NotificationFilterScreen from './src/screens/settings/NotificationFilterScreen';

import ProfileScreen from "./src/screens/profile/ProfileScreen";
import ProfileEditScreen from "./src/screens/profile/ProfileEditScreen";
import ProfileEditAboutScreen from './src/screens/profile/ProfileEditAboutScreen';
import ProfileScheduleEditScreen from './src/screens/profile/ProfileScheduleEditScreen';
import UserReviewsScreen from './src/screens/profile/UserReviewsScreen';

import PerformersListScreen from './src/screens/performers/PerformersListScreen';
import PerformersFilterScreen from './src/screens/performers/PerformersFilterScreen';

import DialogsListScreen from "./src/screens/dialogs/DialogsListScreen";
import DialogScreen from "./src/screens/dialogs/DialogScreen";

import OfferTaskScreen from './src/screens/OfferTaskScreen';

// Signup quest
import AddPhotoScreen from './src/screens/signup-quest/AddPhotoScreen';
import AccountTypeScreen from './src/screens/signup-quest/AccountTypeScreen';
import AddInfoScreen from './src/screens/signup-quest/AddInfoScreen';
import ScheduleEditScreen from './src/screens/signup-quest/ScheduleEditScreen';

import ReviewScreen from './src/screens/review/ReviewScreen';
import ReviewTextEditScreen from './src/screens/review/ReviewTextEditScreen';
import ReviewUserSelectorScreen from './src/screens/review/ReviewUserSelectorScreen';
import ReviewDoneScreen from './src/screens/review/ReviewDoneScreen';

import EmployeeAdListScreen from './src/screens/employee-ad/EmployeeAdListScreen';
import EmployeeAdScreen from './src/screens/employee-ad/EmployeeAdScreen';
import EmployeeAdCreate from './src/screens/employee-ad/EmployeeAdCreate';

import EmployerInfoScreen from './src/screens/employer-quest/EmployerInfoScreen';
import UpdateAppScreen from './src/screens/UpdateAppScreen';

// Components
import DrawerMenu from "./src/components/DrawerMenu";
import iOSNotification from './src/components/iOSNotification';
import MyToast from './src/components/MyToast';
import LanguageSelectorDialog from './src/components/LanguageSelectorDialog';
import { LanguageDialogHandler } from './src/components/LanguageSelectorDialog';
import NotificationHelper from './src/utils/NotificationHelper';
import { HeaderTextButton } from './src/components/Buttons';
import strings from './src/utils/Strings';

// Constaints
import Color from './src/constant/Color';

import { Provider} from 'react-redux';
import store from './src/redux/store';

// For optimizing memory usage and performance
enableScreens();

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DEFAULT_NAV_OPTIONS = {
    headerStyle: {
      backgroundColor: Color.primary,
    },
    headerTintColor: Color.headerTintColor,
    headerBackTitle: null
}

const AuthStack = () => (
    <Stack.Navigator
        initialRouteName="AccountType"
        screenOptions={{
            headerShown: false
        }}
    >
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
);

const PerformerQuestStack = () => (
    <Stack.Navigator
        initialRouteName="Photo"
        screenOptions={{
            headerShown: false
        }}
    >
        <Stack.Screen name="Photo" component={AddPhotoScreen} />
        <Stack.Screen name="AddInfo" component={AddInfoScreen} />
        <Stack.Screen name="QuestScheduleEdit" component={ScheduleEditScreen} />
    </Stack.Navigator>
);

const MainStack = () => (
    <Stack.Navigator
        initialRouteName="MainTaskList"
        screenOptions={DEFAULT_NAV_OPTIONS}

    >
        <Stack.Screen 
            name="MainTaskList" 
            component={MainTaskListScreen} 
            options={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.getParent()?.openDrawer()}>
                        <FontAwesome name="bars" size={24} color={Color.headerTintColor} />
                    </TouchableOpacity>
                ),
                title: ""
            })}
        />
        <Stack.Screen 
            name="UserProfile" 
            component={ProfileScreen} 
            options={({route, navigation}) => ({
                headerRight: () => (
                    route.params?.user_id === "me" &&
                    <HeaderTextButton onPress={route.params?.editPress} title={strings["change"]}/>
                ),
            })}
        />

        <Stack.Screen
            name="EditProfile" 
            component={ProfileEditScreen} 
            options={({route}) => ({
                headerRight: () => (
                    <HeaderTextButton onPress={route.params?.donePress} title={strings["done"]}/>
                ),
                title: strings["change"]
            })}
        />

        <Stack.Screen 
            name="EditAbout"
            component={ProfileEditAboutScreen}
            options={({route}) => ({
                headerRight: () => (
                    <HeaderTextButton onPress={route.params?.donePress} title={strings["done"]}/>
                ),
                title: strings["tell_us_about_yourself"]
            })}
        />

        <Stack.Screen 
        name="ScheduleEdit"
        component={ProfileScheduleEditScreen}
        options={({route}) => ({
            headerRight: () => (
                <HeaderTextButton onPress={route.params?.donePress} title={strings["done"]}/>
            ),
            title: strings["profile_availability"]
        })}
        />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="Filters" component={FilterScreen} />
        <Stack.Screen name="CustomPrice" component={CustomPriceScreen} />
        <Stack.Screen name="PerformersList" component={PerformersListScreen} />
        <Stack.Screen name="PerformersFilter" component={PerformersFilterScreen} />
        <Stack.Screen 
            name="NotificationCenter" 
            component={NotificationCenterScreen}
            options={({navigation}) => ({
                headerLeft: () => (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.getParent()?.openDrawer()}>
                        <FontAwesome name="bars" size={24} color={Color.headerTintColor} />
                    </TouchableOpacity>
                ),
            })}
        />
        <Stack.Screen 
            name="NotificationSettings" 
            component={NotificationSettingsScreen}
            options={({navigation}) => ({
                headerLeft: () => (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.getParent()?.openDrawer()}>
                        <FontAwesome name="bars" size={24} color={Color.headerTintColor} />
                    </TouchableOpacity>
                ),
            })}
        />
        <Stack.Screen name="NotificationFilters" component={NotificationFilterScreen} />
        <Stack.Screen 
        name="CreateTask" 
        component={TaskCreateFormScreen}
        options={({route}) => ({
            headerRight: () => (
                <HeaderTextButton onPress={route.params?.submitForm} title={strings["task_form_done"]}/>
            ),
            title: strings["create_task"]
        })}
        />
        <Stack.Screen name="SuccessScreen" component={TaskCreatedSuccessScreen} />
        <Stack.Screen
            name="EditTask" 
            component={TaskEditFormScreen}
            options={({route}) => ({
                headerRight: () => (
                    <HeaderTextButton onPress={route.params?.submit} title={strings["task_form_done"]}/>
                ),
                title: strings["editing"]
            })}
        />
        <Stack.Screen 
            name="MyTasks" 
            component={MyTasksScreen}
            options={({navigation}) => ({
                headerLeft: () => (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.getParent()?.openDrawer()}>
                        <FontAwesome name="bars" size={24} color={Color.headerTintColor} />
                    </TouchableOpacity>
                ),
            })}
        />
        <Stack.Screen 
            name="FavoriteTasks" 
            component={FavoriteScreen}
            options={({navigation}) => ({
                headerLeft: () => (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.getParent()?.openDrawer()}>
                        <FontAwesome name="bars" size={24} color={Color.headerTintColor} />
                    </TouchableOpacity>
                ),
            })}
        />
        <Stack.Screen 
            name="DialogList"
            component={DialogsListScreen} 
            options={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => navigation.getParent()?.openDrawer()}>
                        <FontAwesome name="bars" size={24} color={Color.headerTintColor} />
                    </TouchableOpacity>
                ),
                title: strings["dialog"]
            })}
        />
        <Stack.Screen 
            name="Dialog" 
            component={DialogScreen} 
        />
        <Stack.Screen name="OfferTask" component={OfferTaskScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="WriteReview" component={ReviewTextEditScreen} />
        <Stack.Screen name="UserReviews" component={UserReviewsScreen} />
        <Stack.Screen name="ReviewUserSelector" component={ReviewUserSelectorScreen} />
        <Stack.Screen name="ReviewDone" component={ReviewDoneScreen} />
        <Stack.Screen name="EmployeeAdList" component={EmployeeAdListScreen} />
        <Stack.Screen name="EmployeeAd" component={EmployeeAdScreen} />
        <Stack.Screen name="CreateEmployeeAd" component={EmployeeAdCreate} />
        <Stack.Screen name="EmployerInfo" component={EmployerInfoScreen} />
    </Stack.Navigator>
);

const AppStack = () => (
    <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <DrawerMenu {...props} />}
        screenOptions={{
            headerShown: false
        }}
    >
        <Drawer.Screen name="Home" component={MainStack} />
    </Drawer.Navigator>
);

const RootStack = () => (
    <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{ headerShown: false }}
    >
        <Stack.Screen name="AuthLoading" component={InitScreen} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="App" component={AppStack} />
        <Stack.Screen name="PerformerQuest" component={PerformerQuestStack} />
        <Stack.Screen name="UpdateApp" component={UpdateAppScreen} />
    </Stack.Navigator>
);

// export default class App extends React.Component {
//     state = {
//         isReady: false,
//     };

//     async componentDidMount() {
//     }

//     render() {
//         return( 
//             <Provider store={store}>
//                 <NavigationContainer>
//                     <RootStack />
//                 </NavigationContainer>
//                 <LanguageSelectorDialog
//                     ref={ref => LanguageDialogHandler.languageDialogRef = ref}/>
//                 {/* <Toast
//                     ref={ ref => iOSNotification.toast = ref }
//                     duration={5000}
//                     marginTop={20}
//                     style={iOSNotification.style}
//                 />
//                 <Toast
//                     ref={ ref => MyToast.toast = ref }
//                     marginTop={64}
//                     textStyle={{fontFamily: null}}
//                 /> */}
//             </Provider> 
//         )
//     }

//     loadResourcesAsync() {
//         return Promise.all([
//             Asset.loadAsync(icon.all),
//             Font.loadAsync(FontAwesome.font),
//         ]);
//     };

//     handleLoadingError(error) {
//         console.error(error);
//     };

//     handleFinishLoading() {
//         this.setState({isReady: true});
//     };
// }

export default function App() {
    // Initialize notification handler for foreground notifications
    React.useEffect(() => {
        NotificationHelper.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }, []);

    return (
        <Provider store={store}>
        <NavigationContainer>
            <RootStack />
        </NavigationContainer>
        <LanguageSelectorDialog
            ref={ref => LanguageDialogHandler.languageDialogRef = ref}/>
    </Provider> 
    );
  }
