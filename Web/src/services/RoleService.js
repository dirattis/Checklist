
import { API } from 'aws-amplify';
import {API_NAME} from '../shared.js';

const path = '/perfis/';

export default class RoleService {

    get(){
        return API.get(API_NAME, path)
    }
}