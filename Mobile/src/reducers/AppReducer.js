import {
    NEXT, PREVIEWS, ADD_PHOTO, ANSWER, GET_CHECKLISTS,
    GET_QUESTIONS, FINALIZE_CHECKLIST, CANCEL_PHOTO, SAVE_PHOTOS
} from '../actions/types';
import { AsyncStorage } from 'react-native';
import Amplify from 'aws-amplify';
import awsConfig from '../config/aws-exports';
import { Storage, API } from 'aws-amplify';
import RNFetchBlob from 'rn-fetch-blob';
import ChecklistService from '../services/ChecklistService';
global.Buffer = require('buffer').Buffer;

Amplify.configure(awsConfig);
import _ from 'lodash';
const checklistService = new ChecklistService();


const INITIAL_STATE =
{
    user: null,
    idUsuario: 0,
    idCliente: 0,
    token: '',
    perguntas: [],
    checklists: [],
    perguntasPorChecklist: [],
    checklistAtual: null,
    indicePerguntaAtual: 0,
    loading: false
}

// getQuestionsAPI = (token) => {
//     //API_CONFIG.headers = { auth: token }
//     console.log(API_CONFIG);
//     return API.get(API_NAME, '/aplicacaochecklist/', API_CONFIG).then(response => response);
// }

saveStateInLocalStorage = (state) => {
    AsyncStorage.mergeItem(state.user, JSON.stringify(state), (err, result) => {
        if (result !== null) {
            console.log(result);
        }
        else
            console.log(err);
    });
}

updateAnsweredQuestionsCount = (state, checklistId) => {
    let checklistStatePreviews = [...state.checklists];
    let checklistGetPreviews = checklistStatePreviews.find(x => x.checklistId == checklistId);
    if (checklistGetPreviews) {
        // let perguntas = getQuestionsFromChecklist(state, checklistGetPreviews);      
        let perguntas = state.perguntasPorChecklist;
        let respondidas = perguntas.filter(x =>
            (x.resposta.valor > 0 ||
                x.resposta.descricao ||
                (x.resposta.escolhasSelecionadas && x.resposta.escolhasSelecionadas.length > 0)
            ));
        console.log(respondidas);
        checklistGetPreviews.qtdePerguntasRespondidas = respondidas.length;
    }
}

getQuestionsFromChecklist = (state, checklist) => {
    let perguntasChecklistState = [...state.perguntas];
    let perguntasChecklist = [];
    checklist.perguntas.forEach(perguntaId => {
        let perguntaGet = perguntasChecklistState.find(x => perguntaId == x.perguntaId);
        if (perguntaGet) {
            perguntasChecklist.push(perguntaGet);
        }
    });

    return perguntasChecklist;
}

readFile = (filePath) => {
    return RNFetchBlob.fs.readFile(filePath, 'base64').then(data => new Buffer(data, 'base64'));
}

createObjectToAnswer = (state) => {    
    return {
                idCliente: state.idCliente,
                idUsuario: state.idUsuario,
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

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'loading':
            state.loading = !state.loading;
            return { ...state };

        case NEXT:
            let checklistStateNext = [...state.checklists];
            let checklistGetNext = checklistStateNext.find(x => x.checklistId == action.payload);
            if (checklistGetNext) {
                checklistGetNext.indicePerguntaAtual++;
                return { ...state, indicePerguntaAtual: checklistGetNext.indicePerguntaAtual };
            }
            console.log(state);
            return { ...state };

        case PREVIEWS:

            let checklistStatePreviews = [...state.checklists];
            let checklistGetPreviews = checklistStatePreviews.find(x => x.checklistId == action.payload);
            if (checklistGetPreviews) {
                checklistGetPreviews.indicePerguntaAtual--;
                return { ...state, indicePerguntaAtual: checklistGetPreviews.indicePerguntaAtual };
            }
            return { ...state };

        case GET_CHECKLISTS:
            console.log(action.payload);
            const { user, token, idCliente, idUsuario, result } = action.payload;
            console.log(result);
            return { ...state, ...result, user, token, idCliente, idUsuario };
        case GET_QUESTIONS:
            // let checklistAtual = action.payload; 


            //perguntasChecklist = getQuestionsFromChecklist(state, checklistAtual)
            const { questions, checklist } = action.payload;

            if(!questions)
                return { ...state, perguntasPorChecklist: [...state.perguntas],  checklistAtual: checklist };

            return { ...state, perguntasPorChecklist: questions, perguntas: questions, checklistAtual: checklist };

        case ANSWER:

            const { checklistId, questionId, selectedAlternativeId, indexAvailableAlternative, description, value } = action.payload;
            let perguntasState = [...state.perguntas];

            let perguntaGet = perguntasState.find(x => x.perguntaId == questionId);

            if (perguntaGet) {
                switch (perguntaGet.tipo) {
                    case 'descritiva':
                        perguntaGet.resposta.descricao = description;
                        break;
                    case 'emoji':
                        perguntaGet.resposta.valor = value;
                        break;
                    case 'alternativa':
                        perguntaGet.resposta.escolhasSelecionadas = [];
                        let escolha = perguntaGet.resposta.escolhasDisponiveis.find(x => x.checked);
                        if (escolha)
                            escolha.checked = false;

                        let index = perguntaGet.resposta.escolhasSelecionadas.indexOf(selectedAlternativeId);
                        if (index == -1) {
                            perguntaGet.resposta.escolhasSelecionadas.push(selectedAlternativeId);
                            perguntaGet.resposta.escolhasDisponiveis[indexAvailableAlternative].checked = true;
                        }
                        else {
                            perguntaGet.resposta.escolhasSelecionadas.splice(index, 1);
                            perguntaGet.resposta.escolhasDisponiveis[indexAvailableAlternative].checked = false;
                        }
                        break;
                    case 'multiplaEscolha':
                        perguntaGet.resposta.escolhasSelecionadas = perguntaGet.resposta.escolhasSelecionadas || [];
                        break;
                    default:
                        return { ...state };
                }

                updateAnsweredQuestionsCount(state, checklistId);
                saveStateInLocalStorage(state);

            }
            return { ...state };
        case CANCEL_PHOTO:

            let perguntasCancelPhoto = [...state.perguntas];
            let questionIdCancelPhoto = perguntasCancelPhoto[state.indicePerguntaAtual].perguntaId;
            let perguntaCancelPhoto = perguntasCancelPhoto.find(x => x.perguntaId == questionIdCancelPhoto);
            if (perguntaCancelPhoto) {
                let fotosCancelPhoto = [...perguntaCancelPhoto.fotos];
                let fotosSalvas = null;

                console.log(fotosCancelPhoto);
                console.log(action.payload);
                if (action.payload) {

                    let index = _.findIndex(fotosCancelPhoto, x => x.uri == action.payload);
                    console.log(index);
                    if (index > -1) {

                        fotosCancelPhoto.splice(index, 1);
                        fotosSalvas = fotosCancelPhoto;
                    }
                }
                else
                    fotosSalvas = fotosCancelPhoto.filter(x => !x.isCached);

                console.log(fotosSalvas);
                perguntaCancelPhoto.fotos = fotosSalvas;
            }
            console.log(state);
            return { ...state };

        case ADD_PHOTO:
            let perguntas = [...state.perguntas];
            let pergunta = perguntas.find(x => x.perguntaId == action.payload.questionId);
            if (pergunta) {
                if (action.payload.addAnnotation) {
                    let fotosAddPhoto = [...pergunta.fotos];
                    let fotoUpdate = fotosAddPhoto.find(x => x.uri == action.payload.photo.uri);
                    if (fotoUpdate)
                        fotoUpdate.comentario = action.payload.photo.comentario;
                }
                else
                    pergunta.fotos.push(action.payload.photo);
            }
            return { ...state };
        case SAVE_PHOTOS:        

            let perguntasSavePhotos = [...state.perguntas];
            let perguntaSavePhoto = perguntasSavePhotos.find(x => x.perguntaId == action.payload.questionId);
            if (perguntaSavePhoto) {
                let fotosSalvas = [...perguntaSavePhoto.fotos, ...action.payload.photos].filter(x => !x.isCached);
                perguntaSavePhoto.fotos = fotosSalvas;
            }

            let perguntasData = createObjectToAnswer(state);
            checklistService.save(perguntasData)
                    .then(result => {
                        console.log(result);
                    }).catch(err => { console.log(err);  }); //TODO: Tratar erro para usuário
            
            return { ...state };
        case FINALIZE_CHECKLIST:
            let checklistStateFinalize = [...state.checklists];
            let checklistGetFinalize = checklistStateFinalize.find(x => x.checklistId == action.payload);
            if (checklistGetFinalize) {

                state.checklistAtual = checklistGetFinalize
                checklistGetFinalize.concluido = true;

                saveStateInLocalStorage(state);
                
                let perguntasData = createObjectToAnswer(state);
                
                console.log(JSON.stringify(perguntasData));
                checklistService.save(perguntasData)
                    .then(result => {
                        console.log(result);
                    }).catch(err => console.log(err));
            }

            return { ...state };
        default:
            return state;
    }

}