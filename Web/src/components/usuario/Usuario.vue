<template>
  <panel title="Usuários">
    <app-table
      ref="gridusuario"
      :hiddenHeads="hiddenHeads"
      :customHeads="customHeads"
      :customData="customData"
      :data="items"
      :totalRows="items.length"
      class="tableMain"
      @edit="edit"
      isCrud
      @deleteElement="toDelete"
      :isLoadingInit="isLoadingInit"
    />

    <b-modal
      id="addModal"
      size="lg"
      ref="modalCadastro"
      :title="titleRegistrationModal"
      cancel-title="Cancelar"
      ok-title="Salvar"
      @shown="openModal()"
      @hidden="hideModal()"
      @ok="handleSubmit"
      class="vld-parent"
    >
      <loading :active.sync="isLoadingModal"></loading>
      <form @submit.prevent="save" ref="formModalCadastro">
        <span class="fieldName">Nome:</span>
        <b-form-input
          ref="focusElem"
          name="usuario.nome"
          data-vv-as="Nome"
          type="text"
          v-model="usuario.nome"
          v-validate="'required'"
          :class="{'input': true, 'is-danger': errors.has('usuario.nome') }"
        />
        <span
          v-show="errors.has('usuario.nome')"
          class="help is-danger"
        >{{ errors.first('usuario.nome') }}</span>
        
        <span class="fieldName">Email:</span>
        <b-form-input
          name="email"
          :disabled="usuario.id != null"
          data-vv-as="Email"
          type="text"
          v-model="usuario.email"
          v-validate="'required|email'"
          :class="{'input': true, 'is-danger': errors.has('email') }"
        />
        <span v-show="errors.has('email')" class="help is-danger">{{ errors.first('email') }}</span>
        
        <span class="fieldName">Perfil:</span>
        <b-form-select
          name="perfil"
          data-vv-as="Perfil"
          :options="perfis"
          v-validate="'required'"
          v-model="usuario.perfil"
          :class="{'input': true, 'is-danger': errors.has('perfil') }"
        />
        <span v-show="errors.has('perfil')" class="help is-danger">{{ errors.first('perfil') }}</span>

        <span v-if="isManager()" class="fieldName">Superior:</span>
        <b-form-select v-if="isManager()"
          name="superior"
          data-vv-as="Superior"
          :options="managers"
          v-validate="'required'"
          v-model="usuario.superior"
          :class="{'input': true, 'is-danger': errors.has('superior') }"
        />
        <span v-if="isManager()" 
        v-show="errors.has('superior')" class="help is-danger">{{ errors.first('superior') }}</span>

        <span class="fieldName">Tipo:</span>
        <b-form-group>
          <b-form-radio-group v-model="usuario.tipo" name="radioSubComponent">
            <b-form-radio value="Colaborador">Colaborador</b-form-radio>
            <b-form-radio value="Fornecedor">Fornecedor</b-form-radio>
          </b-form-radio-group>
        </b-form-group>

        <span class="fieldName" v-if="usuario.tipo === 'Fornecedor'">Fornecedor:</span>
        <b-form-select
          v-if="usuario.tipo === 'Fornecedor'"
          name="fornecedor"
          data-vv-as="Fornecedor"
          :options="fornecedores"
          v-validate="'required'"
          v-model="usuario.fornecedor"
          :class="{'input': true, 'is-danger': errors.has('fornecedor') }"
        />
        <span v-show="errors.has('fornecedor')" class="help is-danger">{{ errors.first('fornecedor') }}</span>
      </form>
    </b-modal>
  </panel>
</template>

<script>
import UserService from "../../services/UserService";
import PartnerService from "../../services/PartnerService";
import CompanyService from "../../services/CompanyService";
import RoleService from "../../services/RoleService";
import Usuario from "../../models/Usuario";

export default {
  data() {
    return {
      customHeads: [{ prop: "dataCriacao", columnName: "Data Criação" }],
      hiddenHeads: ["id", "ativo", "dataCadastro", "userCognito", "perfil", "superior"],
      customData: [{ prop: "fornecedor", value: "razaoSocial", type: "child" }],
      items: [],
      perguntas: [],
      usuario: new Usuario(),
      titleRegistrationModal: "Novo Usuário",
      fornecedores: [],
      perfis: [],
      managers: [],
      empresas: [],
      isLoadingModal: false,
      isLoadingInit: true
    };
  },

  methods: {
    isManager(){
      return this.usuario.perfil && this.usuario.perfil == 3;
    },
    reloadData() {
      this.isLoadingModal = false;
      this.service
        .get(this.$store.state.user.idCliente)
        .then(res => this.items = this.treatPartner(res))
        .catch(err => console.log(err));
      this.$refs.gridusuario.reload();
      this.$refs.modalCadastro.hide();
    },

    treatPartner(list){
        return list.map(user => 
                {
                    if(!user.fornecedor.id)
                        user.fornecedor = null;

                    return user;
                }); 
    },

    openModal() {
      this.errors.clear();
      this.$refs.focusElem.focus();
      console.log(this.usuario)
    },

    hideModal() {
      this.usuario = new Usuario();     
      this.titleRegistrationModal = "Novo Usuário";
    },

    edit(row) {

      this.managers = this.managers.filter(x => x.value != row.id);
      
      this.isLoadingModal = true;
      this.titleRegistrationModal = row.nome;
      console.log(row);
      this.service
        .get(this.$store.state.user.idCliente, row.id)
        .then(res => {
          console.log(res[0]);
          this.usuario = res[0];
          this.usuario.fornecedor = this.usuario.fornecedor.id;
          this.usuario.perfil = this.usuario.perfil.id;
          this.usuario.superior = this.usuario.superior.id;
          this.isLoadingModal = false;
        })
        .catch(err => {
          console.log(err);
          this.isLoadingModal = false;
        });
      this.$refs.modalCadastro.show();
    },

    handleSubmit(evt) {
      evt.preventDefault();
      this.save();
    },

    save() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.isLoadingModal = true;
          this.usuario.idSuperior = this.usuario.perfil == 3 ? this.usuario.superior : null;
          this.usuario.idPerfil = this.usuario.perfil;
          this.usuario.idFornecedor = this.usuario.tipo === 'Fornecedor' ? this.usuario.fornecedor : null;
          this.usuario.idCliente = this.$store.state.user.idCliente;
          console.log(JSON.stringify(this.usuario));
          if (this.usuario.id)
            this.service
              .save(this.usuario)
              .then(res => this.reloadData())
              .catch(err => {
                console.log(err);
                this.isLoadingModal = false;
              });
          else {
            this.service
              .save(this.usuario)
              .then(idUser => {
                this.service
                  .createCognitoUser(this.usuario)
                  .then(user => {
                    console.log(user);
                    this.usuario.userCognito = user.userSub;
                    this.usuario.id = idUser;
                    this.service
                      .save(this.usuario)
                      .then(res => {
                        this.reloadData();
                      })
                      .catch(err => {
                          console.log(err);
                           this.isLoadingModal = false;
                    });
                  })
                  .catch(err => {
                    this.isLoadingModal = false;
                    console.log(err);
                    let message = '';
                    switch (err.code) {
                      case "UsernameExistsException":
                                message = "E-mail já cadastrado.";
                      break;                         						
                    default:
                      message = err.message;
                      break;
                    }
                    this.alertMessage = message;
					          this.$refs.alertModal.show();
                    
                  });
              })
              .catch(err => {
                console.log(err);
                this.isLoadingModal = false;
              });
          }
        }
      });
    },

    toDelete(row) {
      this.isLoadingModal = true;
      this.service
        .remove({ id: row.id })
        .then(res => this.reloadData())
        .catch(err => {
          console.log(err);
          this.isLoadingModal = false;
        });
    }
  },

  created() {
    this.service = new UserService();
    this.service
      .get(this.$store.state.user.idCliente)
      .then(res => {
            this.items = this.treatPartner(res);
            this.isLoadingInit = false;
      })
      .catch(err => {
        console.log(err);
        this.isLoadingInit = false;
      });

    this.service
      .getManagers(this.$store.state.user.idCliente)
      .then(res => {
        if(res){
            this.managers = res;
             this.managers = this.managers.map(x => {
            return { text: x.nome, value: x.id };
          });
        }
      })
      .catch(err => {
        console.log(err);
      });

    let partnerService = new PartnerService();
    partnerService
      .get(this.$store.state.user.idCliente)
      .then(res => {
        this.fornecedores = res;
        this.fornecedores = this.fornecedores.map(x => {
          return { text: x.razaoSocial, value: x.id };
        });
      })
      .catch(err => console.log(err));

    let roleService = new RoleService();
    roleService
      .get()
      .then(res => {
        this.perfis = res;
        this.perfis = this.perfis.map(x => {
          return { text: x.nome, value: x.id };
        });
      })
      .catch(err => console.log(err));

    


    let companyService = new CompanyService();
    companyService
      .get(this.$store.state.user.idCliente)
      .then(res => {
        this.empresas = res;
        this.empresas = this.empresas.map(x => {
          return { text: x.razaoSocial, value: x.id };
        });
      })
      .catch(err => console.log(err));
  }
};
</script>




