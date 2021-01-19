<template>
  <panel title="Rede Interna">
    <app-table
      ref="gridRedeInterna"
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
          name="redeInterna.cnpj"
          ref="focusElem"
          v-model="redeInterna.cnpj"
          v-validate="'cnpj'"
          data-vv-as="CNPJ"
          :class="{'input': true, 'is-danger': errors.has('redeInterna.cnpj') }"
        />
        <span
          v-show="errors.has('redeInterna.cnpj')"
          class="help is-danger"
        >{{ errors.first('redeInterna.cnpj') }}</span>

        <span class="fieldName">Razão Social:</span>
        <b-form-input
          name="redeInterna.razaoSocial"
          data-vv-as="Razão Social"
          type="text"
          v-model="redeInterna.razaoSocial"
          v-validate="'required'"
          :class="{'input': true, 'is-danger': errors.has('redeInterna.razaoSocial') }"
        />
        <span
          v-show="errors.has('redeInterna.razaoSocial')"
          class="help is-danger"
        >{{ errors.first('redeInterna.razaoSocial') }}</span>
        
        <span class="fieldName">UF:</span>
        <b-form-select
          name="redeInterna.uf"
          data-vv-as="UF"
          :options="ufs"
          v-validate="'required'"
          v-model="redeInterna.uf"
          :class="{'input': true, 'is-danger': errors.has('redeInterna.uf') }"
          @change.native="getCity($event)"
        />
        <span
          v-show="errors.has('redeInterna.uf')"
          class="help is-danger"
        >{{ errors.first('redeInterna.uf') }}</span>
        
        <span class="fieldName">Cidade:</span>
        <b-form-select
          name="redeInterna.cidade"
          data-vv-as="Cidade"
          :options="cidades"
          v-validate="'required'"
          v-model="redeInterna.cidade"
          :class="{'input': true, 'is-danger': errors.has('redeInterna.cidade') }"
        />
        <span
          v-show="errors.has('redeInterna.cidade')"
          class="help is-danger"
        >{{ errors.first('redeInterna.cidade') }}</span>
        
        <span class="fieldName">Contato:</span>
        <b-form-input type="text" v-model="redeInterna.contato"/>
        <span class="fieldName">Email:</span>
        <b-form-input
          type="text"
          name="redeInterna.email"
          data-vv-as="Email"
          v-model="redeInterna.email"
          v-validate="'email'"
          :class="{'input': true, 'is-danger': errors.has('redeInterna.email') }"
        />
        <span v-show="errors.has('redeInterna.email')" class="help is-danger">{{ errors.first('redeInterna.email') }}</span>
        
        <span class="fieldName">Telefone:</span>
        <input
          class="form-control"
          type="text"
          name="redeInterna.telefone"
          v-model="redeInterna.telefone"
          data-vv-as="Telefone"
           v-validate="'phone'"
          :class="{'input': true, 'is-danger': errors.has('redeInterna.telefone') }"
          v-mask="['(##) ####-####', '(##) #####-####']"
        >
        <span v-show="errors.has('redeInterna.telefone')" class="help is-danger">{{ errors.first('redeInterna.telefone') }}</span>
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
      redeInterna: {
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
      titleRegistrationModal: "Nova Rede Interna",
      isLoadingModal: false,
      isLoadingInit: true,
      tipoRedeInterna: 1
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
        .getinternalNetwork(this.$store.state.user.idCliente)
        .then(res => (this.items = res))
        .catch(err => console.log(err));
      this.$refs.gridRedeInterna.reload();
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
      this.redeInterna = {
        cnpj: "",
        razaoSocial: "",
        contato: "",
        telefone: "",
        email: "",
        uf: null,
        cidade: null
      };
      this.titleRegistrationModal = "Nova Rede Interna";
    },

    edit(row) {
      this.isLoadingModal = true;
      this.titleRegistrationModal = row.razaoSocial;
      this.service
        .get(this.$store.state.user.idCliente, row.id)
        .then(res => {
          this.redeInterna = res[0];

          this.redeInterna.uf = this.redeInterna.uf.id;
          this.redeInterna.cidade = this.redeInterna.cidade.id;
          if (this.redeInterna.uf) {
            this.localizationService
              .getCities(this.redeInterna.uf)
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
          this.redeInterna.cnpj = this.redeInterna.cnpj.replace(/[\.|\/|\-]/g, "");
          this.redeInterna.idCliente = this.$store.state.user.idCliente;
          this.redeInterna.idTipoParceiro = this.tipoRedeInterna;

          this.service
            .save(this.redeInterna)
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
      .getinternalNetwork(this.$store.state.user.idCliente)
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


