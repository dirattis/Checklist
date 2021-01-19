
import { API, Auth } from 'aws-amplify';
import {API_NAME} from '../shared.js';

const path = '/usuarios/';

export default class UserService {

    get(idCliente=0, id=0){
        return API.get(API_NAME, path + `${idCliente}/${id}`)
    }

    getFromUserCognito(id){
        let idCliente = 0;
        id = id || 0;
        return API.get(API_NAME, `/user/${idCliente}/${id}`)
    }

    getManagers(idCliente = 0){
        return API.get(API_NAME, `/gestores/${idCliente}`)
    }

    save(data){        
        let config = { body: data }  
        if(data.id)
            return API.put(API_NAME, path, config);
        else
            return API.post(API_NAME, path, config);
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
        })
    }

    remove(data){
        let config = { body: data }  
        return API.del(API_NAME, path, config);
    }
}