import { 
    MODIFICA_EMAIL,
    MODIFICA_SENHA,
    MODIFICA_NOME,
    GET_USER,
    LIMPA_ERROS,
    CADASTRO_USUARIO_SUCESSO,
    CADASTRO_USUARIO_ERRO,
    LOGIN_USUARIO_ERRO,
    LOGIN_USUARIO_SUCESSO,
    LOGOUT_USUARIO_SUCESSO,
    LOGOUT_USUARIO_ERRO,
    LOGIN_EM_ANDAMENTO,
    CADASTRO_EM_ANDAMENTO,
    CONFIRM_REGISTRATION_ERROR,
    CONFIRM_REGISTRATION_SUCCESS,
    CONFIRMING_CODE,
    RESENDING_CONFIRMATION_CODE,
    RESEND_CONFIRMATION_CODE_SUCCESS,
    RESEND_CONFIRMATION_CODE_ERROR,
    SET_COMPANY
} from '../actions/types';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'

const INITIAL_STATE = {
    nome: '',
    email: '',
    senha: '',
    token: '',
    erroCadastro: '',
    erroLogin: '',
    erroLogout: '',
    erroConfirm:'',
    loading_login: false,
    loading_cadastro: false,
    loading_confirm: false,
    loading_resend_confirm: false,
    username:'',    
    name:'',
    idCliente:0,
    idUsuario:0,
    nomeCliente:'',
    cadastrou: false,
    loading: false

}

const authReducer = (state = INITIAL_STATE, action) => {
    
    switch(action.type) {
        case 'loading':
            state.loading = !state.loading;
            return { ...state };
            
        case GET_USER:
            return { ...state }
        case MODIFICA_EMAIL:
            return { ...state, email: action.payload }
        case MODIFICA_SENHA:
            return { ...state, senha: action.payload }
        case MODIFICA_NOME:
            return { ...state, nome: action.payload }
        case LIMPA_ERROS:
            return { ...state, erroCadastro: '', erroLogin: '', erroConfirm:'', cadastrou: false }      
        case CADASTRO_USUARIO_ERRO:
            return { ...state, erroCadastro: action.payload, loading_cadastro: false }        
        case CADASTRO_USUARIO_SUCESSO:
            return { ...state, nome: '', senha: '', erroCadastro: '', loading_cadastro: false, username: action.payload.nome, cadastrou: true }
        case LOGIN_USUARIO_ERRO:
            return { ...state, erroLogin: action.payload, loading_login: false, loading_confirm: false }
        case LOGIN_USUARIO_SUCESSO:
            const {username, name, token, idCliente, nomeCliente, idUsuario} = action.payload;      
            return { ...INITIAL_STATE, email: state.email, username, name, token, idCliente, nomeCliente, idUsuario }
        case SET_COMPANY:
            return { ...INITIAL_STATE, idCliente: action.payload, email: state.email, username: state.username, name: state.name, token: state.token }
        case LOGOUT_USUARIO_SUCESSO:
            return { ...INITIAL_STATE, email: state.email }
        case LOGOUT_USUARIO_ERRO:
            return { ...state, erroLogout: action.payload}
        case LOGIN_EM_ANDAMENTO:
            return { ...state, loading_login: true }        
        case CADASTRO_EM_ANDAMENTO:
            return { ...state, loading_cadastro: true }
        case CONFIRM_REGISTRATION_SUCCESS:
            return { ...state, loading_confirm: false, erroConfirm:'' }
        case CONFIRM_REGISTRATION_ERROR:
            return { ...state, erroConfirm: action.payload, loading_confirm: false }
        case CONFIRMING_CODE:
            return { ...state, loading_confirm: true }
        case RESENDING_CONFIRMATION_CODE:
            return { ...state, loading_reenvio_confirm: true }
        case RESEND_CONFIRMATION_CODE_SUCCESS:
            return { ...state, loading_resend_confirm: false, erroConfirm:'' }
        case RESEND_CONFIRMATION_CODE_ERROR:
            return { ...state, erroConfirm: action.payload, loading_resend_confirm: false }
        

        default:
            return state;
    }    
}

const persistConfig = {
    key: 'auth',
    storage: storage,
    blacklist: ['loading_login','loading_cadastro','loading_confirm']
  };
  
  export default persistReducer(persistConfig, authReducer);