import { NEXT, PREVIEWS, ANSWER, ADD_PHOTO, GET_CHECKLISTS, GET_QUESTIONS, 
        FINALIZE_CHECKLIST, SAVE_PHOTOS, CANCEL_PHOTO } from './types';
import { Actions } from 'react-native-router-flux';
import {AsyncStorage} from 'react-native';
import {getData, isInternetConnected, API_NAME, API_CONFIG} from '../shared.js';
import ChecklistService from '../services/ChecklistService';


const checklistService = new ChecklistService();


// getChecklistAPI = (token) => {
//     if(token)
//         API_CONFIG.headers = { auth: token }

//     console.log(API_CONFIG);
//     return API.get(API_NAME, '/checklists/1', API_CONFIG).then(response => response);
// }

// getQuestionsAPI = (token) => {
//     //API_CONFIG.headers = { auth: token }
//     console.log(API_CONFIG);
//     return API.get(API_NAME, '/aplicacaochecklist/1', API_CONFIG).then(response => response);
// }

export const irProximaPergunta = (checklistIdAtual) => {    
    return dispatch => {
        dispatch({type: NEXT, payload: checklistIdAtual });
        Actions.main(); 
     }
}

export const irPerguntaAnterior = (checklistIdAtual) => {    
    return { type: PREVIEWS, payload: checklistIdAtual  }
}

export const cancelAddPhoto = (photoUri, questionId, penultPhoto) => {
    return dispatch => {
        dispatch(  {type: CANCEL_PHOTO, payload: photoUri} ); 
        Actions.camera();       
        // if(!penultPhoto){
        //     console.log('camera');
        //     Actions.camera();
        // }
        // else{
        //     console.log(penultPhoto);
        //     Actions.photoPreview({questionId, penultPhoto });
        // }
    }    
}

export const photoPreview = ({questionId, photo}) => {
    return dispatch => {
        dispatch({ type: ADD_PHOTO, payload: {questionId, photo, isCached: photo.isCached} });
        Actions.photoPreview({questionId, photo });
     }
}

export const savePhotos = ({questionId, photos}) => {
    return dispatch => {         
        dispatch({ type: SAVE_PHOTOS, payload: {questionId, photos} });
         Actions.camera();
    }
}

export const addPhoto = (questionId, photo) => {
    return dispatch => {
        dispatch({ type: ADD_PHOTO, payload: {questionId, photo, addAnnotation: true} });
        Actions.camera();
    }
}

export const answer = ({checklistId, questionId, selectedAlternativeId, indexAvailableAlternative, description, value}) => {
    return { type: ANSWER, payload: {checklistId, questionId, selectedAlternativeId, indexAvailableAlternative, value, description} }
}

export const getChecklists = (user, token, idCliente, idUsuario) => {    
    user = user || 'defaultUser';
    return dispatch => {
        
        //console.log(isInternetConnected());
        // Storage.list(`${user}/`, {level: 'private'})
        // .then(result => { 
        //     console.log(result);
        //     result.forEach(element => {
        //         Storage.get(element.key, { level: 'private' })
        //         .then(file => console.log(file))
        //         .catch(err => console.log(err));
        //     });
            
        // })
        // .catch(err => console.log(err));

        dispatch({ type: 'loading'});

        AsyncStorage.getItem(user, (err, resultStorage) => {   
            // if(result !== null){
            //     dispatch({ type: GET_CHECKLISTS, payload: {user, token, result: JSON.parse(result)} });
            // }
            // else{
                let result = getData();                
                
                if(idCliente > 0){
                    checklistService.get(idCliente,idUsuario)
					.then(checklistsData => 
					{          
                        dispatch({ type: 'loading'});              
                        let res = {...result, checklists: checklistsData }   
                        console.log(res);                 
                        dispatch({ type: GET_CHECKLISTS, payload: {user, token, idCliente, idUsuario, result: res} });

                    }).catch(err => {console.log(err); dispatch({ type: 'loading'});});
                }
                else{
                    dispatch({ type: 'loading'});
                    dispatch({ type: GET_CHECKLISTS, payload: {user, token, idCliente, idUsuario, result } });
                }
                    
                    
                // }).catch(err => console.log(err));
            //}
        });
    }
}

export const loadingProcess = () => 
{    
    return { type: 'loading' };
}

export const getQuestions = (checklist,idCliente,idUsuario) => {
    return dispatch => { 

        if(idCliente > 0){
            dispatch({ type: 'loading'});
            checklistService.getQuestions(idCliente,checklist.checklistId,checklist.idCheckListDistribuicao)
                .then(result => 
                {         
                    dispatch({ type: 'loading'});
                    let questions = {perguntasPorChecklist:[]};  
                    console.log(result)             
                    if(result){
                        if(result.length > 0)
                        questions = JSON.parse(result[0].checklists);
                    }
                    questions.perguntasPorChecklist = questions.perguntasPorChecklist.map(p => {
                        if (typeof p.fotos == "string") p.fotos = JSON.parse(p.fotos);                          

                        if(typeof(p.resposta) == "string")
                            p.resposta = JSON.parse(p.resposta);

                            return p;
                    });

                    console.log(questions.perguntasPorChecklist);
                    dispatch({ type: GET_QUESTIONS, payload: { checklist,  questions: questions.perguntasPorChecklist}});
                    Actions.main({ title: checklist.nome});

                }).catch(err => {console.log(err); dispatch({ type: 'loading'});});
        }
        else{
            dispatch({ type: GET_QUESTIONS, payload: { checklist,  questions: null}});
            Actions.main({ title: checklist.nome});
        }
       
    }
}

export const concluirChecklist = (checklistIdAtual) => {
    return dispatch => { 
        
        dispatch({ type: FINALIZE_CHECKLIST, payload: checklistIdAtual });        
        Actions.home();
    }
}


