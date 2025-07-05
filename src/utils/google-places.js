/**
 * google-places.js
 */

const APIKey = "AIzaSyA1vffL6UB-hUsUQNHoBEmpFWmSpgCFC-E";
const AutocompleteURL = "https://maps.googleapis.com/maps/api/place/autocomplete/json?";
const PlaceDetailsURL = "https://maps.googleapis.com/maps/api/place/details/json?";

export const getPlaces = async (text, location=null, language=null) => {
    const query = buildQuery(text, location, language);
    const url = `${AutocompleteURL}${query}`;
    try {
        const response = await fetch(url);
        const result =  await response.json();
        if(result["status"] === "OK"){
            return result["predictions"];
        }else{
            return []
        }
    } catch (e) {
        console.error(e)
        return [];
    }
}

const buildQuery = (text, location, language) => {
    let queryParams = {
        "types": "address",
        "input": text,
        "key": APIKey,
        "radius": 100 * 1000 // 100km
    }

    if(location !== null){
        queryParams["locations"] = location;
    }

    if(language !== null){
        queryParams["language"] = language;
    }

    let paramList = [];
    for(let key in queryParams){
        paramList.push(`${key}=${queryParams[key]}`)
    }

    return paramList.join("&");
}

export const getPlaceDetails = async (placeID, language=null) => {
    const query = buildPlaceDetailsQuery(placeID, language);
    const url = `${PlaceDetailsURL}${query}`;
    try {
        const response = await fetch(url);
        const result =  await response.json();
        if(result["status"] === "OK"){
            return result["result"]["address_components"];
        }else{
            return []
        }
    } catch (e) {
        console.error(e)
        return [];
    }
}

const buildPlaceDetailsQuery = (placeID, language) => {
    let queryParams = {
        "place_id": placeID,
        "fields": "name,address_component",
        "key": APIKey,
    }

    if(language !== null){
        queryParams["language"] = language;
    }

    let paramList = [];
    for(let key in queryParams){
        paramList.push(`${key}=${queryParams[key]}`)
    }

    return paramList.join("&");
}