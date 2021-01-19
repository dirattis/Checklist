import Vue from 'vue';
import Vuex from 'Vuex';
import createPersistedState from 'vuex-persistedstate';
import { getData } from './shared';

Vue.use(Vuex);


export const getQuestionsFromChecklist = (state, checklist) => {
  let perguntasChecklistState = [...state.perguntas];
  let perguntasChecklist = [];
  checklist.perguntas.forEach(perguntaId => {
    let perguntaGet = perguntasChecklistState.filter(x => perguntaId == x.perguntaId);
    if (perguntaGet.length > 0) {
      let perguntaAux = Object.assign({}, perguntaGet)[0]
      perguntasChecklist.push(perguntaAux);
    }
  });
  return perguntasChecklist;
}

export default new Vuex.Store({
  plugins: [
    new createPersistedState({
      key: 'checklist',
      storage: window.sessionStorage,
      reducer: state => ({ user: state.user })
    })
  ],

  state: {
    user: {
      name: '',
      email: '',
      token: '',
      username: '',
      idCliente: 0,
      idUsuario: 0,
      perfil: ''
    },

    perguntas: [],
    checklists: [],
    perguntasPorChecklist: [],
    checklistAtual: null,
    indicePerguntaAtual: 0,
    parceiros: []
  },

  actions: {
    SET_USER(context, payload) {
      context.commit('SET_USER', payload);
    },
    NEXT(context, payload) {
      context.commit('NEXT', payload);
    },
    PREV(context, payload) {
      context.commit('PREV', payload);
    },
    LOAD_CHECKLIST(context, payload) {
      context.commit('LOAD_CHECKLIST', payload);
    },
    LOAD_QUESTIONS(context, payload) {
      context.commit('LOAD_QUESTIONS', payload);
    },
    SET_CHECKLIST(context, payload) {
      context.commit('SET_CHECKLIST', payload);
    },
    ANSWER(context, payload) {
      context.commit('ANSWER', payload);
    },
    SAVE_PHOTOS(context, payload) {
      context.commit('SAVE_PHOTOS', payload);
    },
    FINALIZE_CHECKLIST(context, payload) {
      context.commit('FINALIZE_CHECKLIST', payload);
    }


  },

  mutations: {

    SET_USER(state, payload) {
      state.user = payload
    },

    LOAD_CHECKLIST(state, payload) {
      state.checklists = [...payload];
    },

    LOAD_QUESTIONS(state, payload) {
      state.perguntasPorChecklist = [...payload];
      state.perguntas = [...payload];
    },

    SET_CHECKLIST(state, payload) {
      let checklistGetNext = state.checklists.filter(x => x.checklistId == payload);
      if (checklistGetNext.length > 0) {
        let checklistAux = Object.assign({}, checklistGetNext)[0];
        state.indicePerguntaAtual = checklistAux.indicePerguntaAtual;
        state.checklistAtual = checklistAux;
      }
    },
    NEXT(state, payload) {

      let checklistGetNext = state.checklists.find(x => x.checklistId == payload);
      if (checklistGetNext) {
        checklistGetNext.indicePerguntaAtual++;
        state.indicePerguntaAtual = checklistGetNext.indicePerguntaAtual;
      }
    },

    PREV(state, payload) {
      let checklistStatePreviews = [...state.checklists];
      let checklistGetPreviews = checklistStatePreviews.find(x => x.checklistId == payload);
      if (checklistGetPreviews) {
        checklistGetPreviews.indicePerguntaAtual--;
        state.indicePerguntaAtual = checklistGetPreviews.indicePerguntaAtual;
      }
    },

    ANSWER(state, payload) {
      const { checklistId, questionId, selectedAlternativeId, indexAvailableAlternative, description, value } = payload;


      let checklistStatePreviews = state.checklists;
      let checklistGetPreviews = checklistStatePreviews.find(x => x.checklistId == checklistId);
      if (checklistGetPreviews) {
        let perguntas = state.perguntasPorChecklist;
        console.log(perguntas);
        let respondidas = perguntas.filter(x =>
          (x.resposta.valor > 0 ||
            x.resposta.descricao ||
            (x.resposta.escolhasSelecionadas && x.resposta.escolhasSelecionadas.length > 0)
          ));
        console.log(respondidas);
        checklistGetPreviews.qtdePerguntasRespondidas = respondidas.length;
        state.checklistAtual = checklistGetPreviews;
      }

      let perguntaGet = state.perguntasPorChecklist.find(x => x.perguntaId == questionId);
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
            let escolhas = perguntaGet.resposta.escolhasDisponiveis.filter(x => x.checked);
            if (escolhas.length > 0)
              escolhas[0].checked = false;

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
        }

      }
    },

    SAVE_PHOTOS(state, payload) {

      let perguntasSavePhotos = state.perguntasPorChecklist;

      console.log(payload);
     

            let perguntaSavePhoto = perguntasSavePhotos.find(x => x.perguntaId == payload.questionId);
            if (perguntaSavePhoto) {
                //let fotosSalvas = [...perguntaSavePhoto.fotos, ...payload.photo];
                perguntaSavePhoto.fotos.push(payload.photo);
            }
            console.log(perguntaSavePhoto);
    },

    FINALIZE_CHECKLIST(state, payload) {
      if (state.checklistAtual)
        state.checklistAtual.concluido = true;
    }
  },

  getters: {
    init: state => {
      let userData = localStorage.getItem('defaultUser');
      if (!userData) {
        let JSONdata = getData();
        state = _.extend(state, JSONdata);
      }
      return state;
    },

    user: state => { return state.user },

    perguntas: state => state.perguntas,

    indicePerguntaAtual: state => state.indicePerguntaAtual,

    checklists: state => state.checklists,
    
    checklistAtual: state => state.checklistAtual,

    getQuestionsFromChecklist: (state) => checklist => getQuestionsFromChecklist(state, checklist)
  }
})