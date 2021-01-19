import {NetInfo, Alert} from 'react-native';

export const API_NAME = 'ChecklistAPI';
export const API_CONFIG = { 
    headers: {}
}

function handleFirstConnectivityChange(isConnected) {
    if(!isConnected)
        Alert.alert('Atenção', 'Opss! Infelizmente você não está conectado à Internet!!');
}

NetInfo.isConnected.addEventListener(
'connectionChange',
handleFirstConnectivityChange
);

export const getData = () => {
    let response = require('./config/data.json');    
    return response;    
}

export const isInternetConnected = () => {
    return NetInfo.isConnected.fetch().then(isConnected => isConnected);      
}