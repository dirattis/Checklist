import { Actions } from 'react-native-router-flux';
import Amplify from 'aws-amplify';
import awsConfig from '../config/aws-exports';
import { Auth, API } from 'aws-amplify';
import {isInternetConnected} from '../shared.js';
import { Alert } from 'react-native';
import UserService from '../services/UserService';

Amplify.configure(awsConfig);

import { 
    MODIFICA_EMAIL,
    MODIFICA_SENHA,
    MODIFICA_NOME,
    GET_USER,
    LIMPA_ERROS,
    CADASTRO_USUARIO_SUCESSO,
    CADASTRO_USUARIO_ERRO,
    LOGIN_USUARIO_SUCESSO,
    LOGOUT_USUARIO_SUCESSO,
    LOGOUT_USUARIO_ERRO,
    LOGIN_USUARIO_ERRO,
    LOGIN_EM_ANDAMENTO,
    CADASTRO_EM_ANDAMENTO,
    CONFIRM_REGISTRATION_ERROR,
    CONFIRM_REGISTRATION_SUCCESS,
    CONFIRMING_CODE,
    RESENDING_CONFIRMATION_CODE,
    RESEND_CONFIRMATION_CODE_SUCCESS,
    RESEND_CONFIRMATION_CODE_ERROR,
    SET_COMPANY
} from './types';
import Usuario from '../models/Usuario';

const MAIL_PATTERN = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const userService = new UserService();

export const modificaEmail = (texto) => {
    return {
        type: MODIFICA_EMAIL,
        payload: texto
    }
}

export const modificaSenha = (texto) => {
    return {
        type: MODIFICA_SENHA,
        payload: texto
    }
}

export const modificaNome = (texto) => {
    return {
        type: MODIFICA_NOME,
        payload: texto
    }
}

export const getUser = () => {
    return {
        type: GET_USER
    }
}

export const limpaErros = () => {
    return {
        type: LIMPA_ERROS
    }
}

export const cadastraUsuario = ({ nome, email }) => {
    return dispatch => {

        dispatch({ type: CADASTRO_EM_ANDAMENTO });
        
        if(!MAIL_PATTERN.test(email))
        {
            dispatch (
                {
                    type: CADASTRO_USUARIO_ERRO,
                    payload: 'E-mail inválido.'
                });
                return;
        }

        let user = new Usuario({email: email.toLowerCase(), nome})
        userService.createCognitoUser(user)
        .then(userCognito => {
          user.userCognito = userCognito.userSub;

          console.log(user);
          cadastroUsuarioSucesso(dispatch, user);
        //   userService
        //     .save(user)
        //     .then(res => {
        //         console.log(res);
        //         console.log(user);
        //         cadastroUsuarioSucesso(dispatch, user);
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         dispatch ({ type: CADASTRO_USUARIO_ERRO, payload: err });
        //   });
        })
        .catch(err => {
            console.log(err);
             cadastroUsuarioErro(err, dispatch);
        });
    }
    
}

export const confirmRegistration = ({username, code, senha}) => {
    
    return dispatch => {
        dispatch({ type: CONFIRMING_CODE });
        
        
        Auth.confirmSignUp(username.toLowerCase(), code, {
            forceAliasCreation: true    
        }).then(data => {   
            console.log('confirmado');
            
            Auth.signIn(username.toLowerCase(), senha)
            .then(user =>  { 
                console.log(user);                 
                loginUsuarioSucesso(dispatch, user.signInUserSession.idToken.payload.given_name, user.username  ); })
            .catch(err => { console.log(err); loginUsuarioErro(err, dispatch); });
            
        })
        .catch(erro => { 
            console.log(erro);      
            let message = '';
            
            switch (erro.code) {
                case 'CodeMismatchException':
                    message = 'Código inválido, por favor tente novamente.';
                    break;    
                case 'LimitExceededException':
                    message = 'Número de tentativas excedido, por favor tente mais tarde.';
                    break;     
                default:
                    message = erro.message;
                    break;
            }

            
            dispatch ({ type: CONFIRM_REGISTRATION_ERROR, payload: message });
         });
    }
}

export const resendCode = (username) => {
    
    return dispatch => {
        dispatch({ type: RESENDING_CONFIRMATION_CODE });
        
        Auth.resendSignUp(username.toLowerCase())
        .then(data => { 
            dispatch ({ type: RESEND_CONFIRMATION_CODE_SUCCESS });
        })
        .catch(err => {                       
            dispatch ({ type: RESEND_CONFIRMATION_CODE_ERROR, payload: err.message });
         });
    }
}


const cadastroUsuarioSucesso = (dispatch, user) => {
    dispatch ({ type: CADASTRO_USUARIO_SUCESSO, payload: user });

    Actions.loginForm();
}

const cadastroUsuarioErro = (erro, dispatch) => {
    console.log(erro);   
    let message = '';

    if(!erro.code)
        message = 'O campo senha é obrigatório.';
    else
        switch (erro.code) {
            case 'InvalidPasswordException':
            case 'InvalidParameterException':
                message = 'A senha deve conter no mínimo 6 caracteres, sendo letra(s) e número(s).';
                break;
            case 'usernameExistsException':
                message = 'E-mail já cadastrado.';
                break;
            default:
                message = erro.message;
                break;
        }

    dispatch ({ type: CADASTRO_USUARIO_ERRO, payload: message });
}
export const logout = () => {

    return dispatch => {

        dispatch({ type: 'loading'});
        Auth.signOut()
        .then(user =>  {
            console.log(user);
            dispatch({ type: 'loading'}); 
            dispatch ({ type: LOGOUT_USUARIO_SUCESSO }); 
            Actions.loginForm(); 
        })
        .catch(err => { 
            console.log(err); 
            dispatch({ type: 'loading'});
            dispatch ({ type: LOGOUT_USUARIO_ERRO, payload: err.message });
        });
    }
}

export const autenticarUsuario = ({ email, senha }) => {

    return dispatch => {

        dispatch({ type: LOGIN_EM_ANDAMENTO });

        if(!MAIL_PATTERN.test(email))
        {
            dispatch (
                {
                    type: LOGIN_USUARIO_ERRO,
                    payload: 'E-mail e/ou senha inválidos.'
                });
                return;
        }

        isInternetConnected().then(isConnected => {
            
            console.log('isConnected: ' + isConnected);
            if(isConnected){
                
                Auth.signIn(email.toLowerCase(), senha)
                .then(user =>  { 
                    console.log(user);                    

                    userService.getFromUserCognito(user.username)
					.then(userBD => 
					{ 
                        console.log(userBD); 
                        let idCliente = 0;
                        let idUsuario = 0;
                        let nomeCliente = 'CONVIDADO'
                        if(userBD){
                            idCliente = userBD[0].idCliente;
                            idUsuario = userBD[0].id;
                            nomeCliente = userBD[0].nmCliente;
                        }
							// dispatch( 
                            //     {
                            //         type: SET_COMPANY,
                            //         payload: userBD[0].idCliente
                            //     }
                            // );
                            let token = user.signInUserSession.idToken.jwtToken;
                            dispatch (
                                {
                                    type: LOGIN_USUARIO_SUCESSO,
                                    payload: { name: user.signInUserSession.idToken.payload.given_name, username: user.username, token, idCliente, nomeCliente, idUsuario }
                                }
                            );

                            Actions.home();

                            
                          //  loginUsuarioSucesso(dispatch, user.signInUserSession.idToken.payload.given_name, user.username, token ); })

					}).catch(err => { console.log(err); });

                   
                }).catch(err => { console.log(err); loginUsuarioErro(err, dispatch); });
            }
            else{
                Alert.alert('Atenção', 'Opss! Infelizmente você não está conectado à Internet. Deseja prosseguir no modo offline?',
                [
                    {text: 'SIM', onPress: () => loginUsuarioSucesso(dispatch)},
                    {text: 'NÃO', onPress: () => dispatch( { type: LOGOUT_USUARIO_SUCESSO }) }
                ]);
            }                        
        });
    }
}



const loginUsuarioSucesso = (dispatch, name, username, token) => {
    dispatch (
        {
            type: LOGIN_USUARIO_SUCESSO,
            payload: { name, username, token }
        }
    );

    Actions.home();
}

const loginUsuarioErro = (erro, dispatch) => {
    let message = '';
    
    switch (erro.code) {
        case 'UserNotFoundException':
            message = 'E-mail não cadastrado. Por favor cadastre-se.';
            break;
        case 'InvalidParameterException':
        case 'NotAuthorizedException':
            message = 'E-mail e/ou senha inválidos.';
            break;            
        case 'UserNotConfirmedException':
            message = 'Usuário não confirmado.';
            break;  
        default:
            message = erro.message;
            break;
    }

    dispatch (
        {
            type: LOGIN_USUARIO_ERRO,
            payload: message
        }
    );
}