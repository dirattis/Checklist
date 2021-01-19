
import { API, Storage } from 'aws-amplify';
import {API_NAME} from '../shared.js';


const path = '/responder/';

export default class AnswerService {

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

    async uploadImage(username, perguntaId, foto){
        let objkey = await Storage.put(`${username}/${perguntaId}/${foto.name}`,foto.file, { contentType: foto.type});
        if(objkey.key){
            let path = await Storage.get(objkey.key);
            return { result: 'success', data: path.substring(0, path.indexOf("?")) };
        }
        
        return { result: 'error', data: foto.name }
    }

    createObjectToAnswer(state){
        console.log(state);
        return {
            idCliente: state.user.idCliente,
            idUsuario: state.user.idUsuario,
            checkListID: state.checklistAtual.checklistId,
            idCheckListDistribuicao: state.checklistAtual.idCheckListDistribuicao,
            dadosCheckListPergunta: {
              perguntasPorChecklist: state.perguntas,
              checklistIdAtual: state.checklistAtual.checklistId,
              indicePerguntaAtual: state.indicePerguntaAtual
            },
            dadosCheckList: state.checklistAtual
          }
    }
}