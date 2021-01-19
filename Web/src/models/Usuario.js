export default class Usuario{

    constructor(nome='', email='', userCognito= null, tipo='Interno', idPerfil=null, idSuperior=null,
                idFornecedor=null, idCLiente=null, dataCadastro='', id= null){
        this.id = id;
        this.userCognito = userCognito;
        this.idCliente = idCLiente;
        this.idFornecedor= idFornecedor;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
        this.dataCadastro = dataCadastro;
        this.idPerfil = idPerfil;
        this.idSuperior = idSuperior;
    }
}