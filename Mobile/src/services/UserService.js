
import { API, Auth } from 'aws-amplify';
import {API_NAME} from '../shared.js';

export default class UserService {

    getFromUserCognito(id){
        let idCliente = 0;
        id = id || 0;
        return API.get(API_NAME, `/user/${idCliente}/${id}`)
    }

    save(data){        
        let config = { body: data }  
        if(data.id)
            return API.put(API_NAME, '/usuarios/', config);
        else
            return API.post(API_NAME, '/usuarios/', config);
    }

    passwordGenerate(name){
        let now = new Date();
        let password = name.split(" ")[0] + now.getFullYear();
        password = password[0].toUpperCase() + password.substring(1).toLowerCase();
        if(password.length < 6){
            let day = now.getDate().toString();
            day = day.length == 1 ? '0' + day : day;
            password += day;
        }

        return password;
    }

    createCognitoUser(data){

        let password = this.passwordGenerate(data.nome);
        return Auth.signUp({username: data.email.toLowerCase(),
                            password,
                            attributes: {
                                given_name: data.nome
                            }
        });
    }
}