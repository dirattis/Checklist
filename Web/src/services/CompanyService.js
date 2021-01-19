
import { API } from 'aws-amplify';
import {API_NAME} from '../shared.js';

const path = '/empresas/';

export default class CompanyService {

    get(idCliente=0, id=0){
        return API.get(API_NAME, path + `${idCliente}/${id}`)
    }

    save(data){
        let config = { body: data }  
        if(data.id)
            return API.put(API_NAME, path, config);
        else
            return API.post(API_NAME, path, config);
    }

    remove(data){
        let config = { body: data }  
        return API.del(API_NAME, path, config);
    }
}