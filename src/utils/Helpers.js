/**
 *  Helpers.js
 *  Created by Dmitry Chulkov
 */

import Constants from 'expo-constants';


export function isCurrentAppVersionLowerThan(appVersion){
    const currentVersion = Constants.manifest.version;
    const currentVersionComponents = currentVersion.split('.');
    const appVersionComponents = appVersion.split('.');
    for(let i = 0; i < appVersionComponents.length; i++){
        if(Number(appVersionComponents[i]) > Number(currentVersionComponents[i])){
            return true;
        }else if(Number(appVersionComponents[i]) < Number(currentVersionComponents[i])){
            return false;
        }
    }

    return false;
}