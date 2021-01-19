
import { API } from 'aws-amplify';
import {API_NAME} from '../shared.js';

const pathState = '/uf';
const pathCity = '/cidade/';

export default class LocalizationService {

    getStates(){
        return API.get(API_NAME, pathState);
    }

    getCities(idState){
        return API.get(API_NAME, pathCity + idState);
    }
}