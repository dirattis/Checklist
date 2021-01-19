
import { API } from 'aws-amplify';
import {API_NAME} from '../shared.js';

const pathPartner = '/dashboard/parceiro/';
const pathCustom = '/dashboard';

export default class DashboardService {

    getPartinersRegion(idCliente){
        return API.get(API_NAME, pathPartner + 'regiao/' + idCliente);
    }

    getPartinersUf(idCliente, idRegiao){
        return API.get(API_NAME, pathPartner + 'uf/' + `${idCliente}/${idRegiao}`);
    }

    getCustomData(idCliente, agrupamento,  periodoDe, periodoAte){
        let config = { body: { idCliente, agrupamento, periodoDe, periodoAte} }  
        return API.post(API_NAME, pathCustom, config);
    }
}