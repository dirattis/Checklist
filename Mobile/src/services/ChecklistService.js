
import { API } from 'aws-amplify';
import {API_NAME} from '../shared.js';


const path = '/responder/';

export default class ChecklistService {


    get(idCliente=0, id=0){
        return API.get(API_NAME, path + `${idCliente}/${id}`)
    }

    getQuestions(idCliente=0, idChecklist=0, idDistribuicao=0){
        return API.get(API_NAME, path + 'perguntas/' + `${idCliente}/${idChecklist}/${idDistribuicao}`)
    }

    save(data){
        let config = { body: data }  
        if(data.checkListID)
            return API.put(API_NAME, path + 'perguntas/', config);
        else
            return API.post(API_NAME, path + 'perguntas/', config);
    }
    
}