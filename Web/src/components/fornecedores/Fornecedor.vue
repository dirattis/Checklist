<template>
  <panel title="Fornecedor">
    <app-table
      ref="gridFornecedor"
      :hiddenHeads="hiddenHeads"
      :customHeads="customHeads"
      :customData="customData"
      :data="items"
      :totalRows="items.length"
      class="tableMain"
      @edit="edit"
      :masks="masks"
      isCrud
      @deleteElement="toDelete"
      :isLoadingInit="isLoadingInit"
    />

    <b-modal
      id="addModal"
      size="md"
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
        <span class="fieldName">CNPJ:</span>
        <b-form-input
          v-mask="'##.###.###/####-##'"
          type="text"
          name="fornecedor.cnpj"
          ref="focusElem"
          v-model="fornecedor.cnpj"
          v-validate="'cnpj'"
          data-vv-as="CNPJ"
          :class="{'input': true, 'is-danger': errors.has('fornecedor.cnpj') }"
        />
        <span
          v-show="errors.has('fornecedor.cnpj')"
          class="help is-danger"
        >{{ errors.first('fornecedor.cnpj') }}</span>

        <span class="fieldName">Razão Social:</span>
        <b-form-input
          name="fornecedor.razaoSocial"
          data-vv-as="Razão Social"
          type="text"
          v-model="fornecedor.razaoSocial"
          v-validate="'required'"
          :class="{'input': true, 'is-danger': errors.has('fornecedor.razaoSocial') }"
        />
        <span
          v-show="errors.has('fornecedor.razaoSocial')"
          class="help is-danger"
        >{{ errors.first('fornecedor.razaoSocial') }}</span>
        
        <span class="fieldName">UF:</span>
        <b-form-select
          name="fornecedor.uf"
          data-vv-as="UF"
          :options="ufs"
          v-validate="'required'"
          v-model="fornecedor.uf"
          :class="{'input': true, 'is-danger': errors.has('fornecedor.uf') }"
          @change.native="getCity($event)"
        />
        <span
          v-show="errors.has('fornecedor.uf')"
          class="help is-danger"
        >{{ errors.first('fornecedor.uf') }}</span>
        
        <span class="fieldName">Cidade:</span>
        <b-form-select
          name="fornecedor.cidade"
          data-vv-as="Cidade"
          :options="cidades"
          v-validate="'required'"
          v-model="fornecedor.cidade"
          :class="{'input': true, 'is-danger': errors.has('fornecedor.cidade') }"
        />
        <span
          v-show="errors.has('fornecedor.cidade')"
          class="help is-danger"
        >{{ errors.first('fornecedor.cidade') }}</span>
        
        <span class="fieldName">Contato:</span>
        <b-form-input type="text" v-model="fornecedor.contato"/>
        <span class="fieldName">Email:</span>
        <b-form-input
          type="text"
          name="fornecedor.email"
          data-vv-as="Email"
          v-model="fornecedor.email"
          v-validate="'email'"
          :class="{'input': true, 'is-danger': errors.has('fornecedor.email') }"
        />
        <span v-show="errors.has('fornecedor.email')" class="help is-danger">{{ errors.first('fornecedor.email') }}</span>
        
        <span class="fieldName">Telefone:</span>
        <input
          class="form-control"
          type="text"
          name="fornecedor.telefone"
          v-model="fornecedor.telefone"
          data-vv-as="Telefone"
           v-validate="'phone'"
          :class="{'input': true, 'is-danger': errors.has('fornecedor.telefone') }"
          v-mask="['(##) ####-####', '(##) #####-####']"
        >
        <span v-show="errors.has('fornecedor.telefone')" class="help is-danger">{{ errors.first('fornecedor.telefone') }}</span>
      </form>
    </b-modal>
  </panel>
</template>

<script>
import PartnerService from "../../services/PartnerService";
import LocalizationService from "../../services/LocalizationService";

export default {
  data() {
    return {
      customHeads: [{ prop: "razaoSocial", columnName: "Razão Social" }, { prop: "uf", columnName: "UF" }, { prop: "cnpj", columnName: "CNPJ" }],
      hiddenHeads: ["id", "dataCadastro", "ativo", 'contato', 'telefone', 'email'],
      customData: [{ prop: "uf", value: "nome", type: "child" }, { prop: "cidade", value: "nome", type: "child" }],
      
      masks: [
        { prop: "cnpj", mask: "##.###.###/####-##" },
        { prop: "telefone", mask: "(##) ####-####" }
      ],
      items: [],
      ufs: [],
      cidades: [],
      fornecedor: {
        email: "",
        cnpj: "",
        razaoSocial: "",
        uf: "",
        cidade: "",
        contato: "",
        telefone: "",
        idCliente: 0,
        id: null
      },
      titleRegistrationModal: "Novo Fornecedor",
      isLoadingModal: false,
      isLoadingInit: true,
      tipoFornecedor: 2
      //errors: [],
      // money: {
      //     decimal: ',',
      //     thousands: '.',
      //     suffix: '',
      //     precision: 2,
      //     masked: false /* doesn't work with directive */
      // }
    };
  },

  methods: {
    reloadData() {
      this.isLoadingModal = false;
      this.service
        .getProvider(this.$store.state.user.idCliente)
        .then(res => (this.items = res))
        .catch(err => console.log(err));
      this.$refs.gridFornecedor.reload();
      this.$refs.modalCadastro.hide();
    },

    treatLocation(list){
        return list.map(partner => 
                {
                    if(!partner.uf.id)
                        partner.uf = null;

                    if(!partner.cidade.id)
                        partner.cidade = null;

                    return partner;
                }); 
    },

    openModal() {
      this.errors.clear();
      this.$refs.focusElem.focus();
      this.localizationService
        .getStates()
        .then(res => {
          this.ufs = res;
          this.ufs = this.ufs.map(x => {
            return { text: x.sigla, value: x.id };
          });
        })
        .catch(err => console.log(err));
    },

    hideModal() {
      this.fornecedor = {
        cnpj: "",
        razaoSocial: "",
        contato: "",
        telefone: "",
        email: "",
        uf: null,
        cidade: null
      };
      this.titleRegistrationModal = "Novo Fornecedor";
    },

    edit(row) {
      this.isLoadingModal = true;
      this.titleRegistrationModal = row.razaoSocial;
      this.service
        .get(this.$store.state.user.idCliente, row.id)
        .then(res => {
          this.fornecedor = res[0];

          this.fornecedor.uf = this.fornecedor.uf.id;
          this.fornecedor.cidade = this.fornecedor.cidade.id;
          if (this.fornecedor.uf) {
            this.localizationService
              .getCities(this.fornecedor.uf)
              .then(res => {
                this.cidades = res;
                this.cidades = this.cidades.map(x => {
                  return { text: x.nome, value: x.id };
                });
                this.isLoadingModal = false;
              })
              .catch(err => {
                console.log(err);
                this.isLoadingModal = false;
              });
          } else this.isLoadingModal = false;
        })
        .catch(err => {
          console.log(err), (this.isLoadingModal = false);
        });
      this.$refs.modalCadastro.show();
    },

    handleSubmit(evt) {
      evt.preventDefault();
      this.save();
    },

    save() {
      console.log( this.$validator);
      this.$validator.validateAll().then(result => {
        if (result) {
          this.isLoadingModal = true;
          this.fornecedor.cnpj = this.fornecedor.cnpj.replace(/[\.|\/|\-]/g, "");
          this.fornecedor.idCliente = this.$store.state.user.idCliente;
          this.fornecedor.idTipoParceiro = this.tipoFornecedor;

          this.service
            .save(this.fornecedor)
            .then(res => this.reloadData())
            .catch(err => {
              console.log(err);
              this.isLoadingModal = false;
            });
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
    },

    getCity(event) {
      this.isLoadingModal = true;
      this.localizationService
        .getCities(event.target.value)
        .then(res => {
          this.isLoadingModal = false;
          this.cidades = res;
          this.cidades = this.cidades.map(x => {
            return { text: x.nome, value: x.id };
          });
        })
        .catch(err => {
          console.log(err);
          this.isLoadingModal = false;
        });
    }
  },

  created() {
    this.service = new PartnerService();
    this.service
      .getProvider(this.$store.state.user.idCliente)
      .then(res => {
        this.items = this.treatLocation(res);
        this.isLoadingInit = false;
      })
      .catch(err => {
        console.log(err);
        this.isLoadingInit = false;
      });

    this.localizationService = new LocalizationService();

  }
};
</script>

<style scoped>

.custom-checkbox {
  margin-top: 10px;
  display: inline-block;
}
</style>


