export default class Usuario{

    constructor({nome='', email='', userCognito= null, tipo='Interno', idParceiro=null, idCLiente=0, dataCadastro='', id= null}){
        this.id = id,
        this.userCognito = userCognito,
        this.idCliente = idCLiente
        this.idParceiro= idParceiro,
        this.nome = nome,
        this.email = email,
        this.tipo = tipo,
        this.dataCadastro = dataCadastro

    }
}