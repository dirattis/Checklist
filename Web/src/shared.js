
export const API_NAME = 'checklist';
export const API_CONFIG = {
    headers: {}
}

export const getData = () => {
    let response = require('./assets/js/data.json');
    return response;
}

export const generatePassword = () => {

    let pass = '';
    while (!/d/g.test(pass)) {
        pass = Math.random().toString(36).slice(-6);
    }

    return pass[0].toUpperCase();
}

export const treatError = (error) => {

    switch (error) {
        case 'No current user':

            break;

        default:
            break;
    }
}

export const getMenuForRole = (items, perfil) => {
    let menuGestor = items.filter(x => x.name != 'empresas').map(x => x.name);
    let menuAnalista = ['*','statusPerguntas','home','login'];

    let perfilMenus = { Gestor: menuGestor, Analista: menuAnalista, Admin: items.map(x => x.name) }    
    return perfilMenus[perfil];     
}

