<template>
  <panel title="Checklist">
    <app-table
      ref="gridChecklist"
      :hiddenHeads="hiddenHeads"
      :customHeads="customHeads"
      :data="items"
      :totalRows="items.length"
      class="tableMain"
      @edit="edit"
      isCrud
      @deleteElement="toDelete"
      :isLoadingInit="isLoadingInit"
      :customData="customData"
    />
    <b-modal
      id="mensagem"
      size="sm"
      ref="modalMensagem"
      :title="titleModalMensagem"
      :ok-only="true"
      @ok="reloadData()"
    >{{mensagemModal}}</b-modal>

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
      :ok-disabled="pesos.length == 0" 
    >
      <loading :active.sync="isLoadingModal"></loading>
      <form @submit.prevent="save" ref="formModalCadastro">
        <span class="mb-2">Nome:</span>
        <b-form-input
          ref="focusElem"
          name="nome"
          data-vv-as="Nome"
          type="text"
          v-model="checklist.nome"
          v-validate="'required'"
          :class="{'input': true, 'is-danger': errors.has('nome') }"
        />
        <span v-show="errors.has('nome')" class="help is-danger">{{ errors.first('nome') }}</span>
        <div class="mt-2">
          <span>{{ selectedQuestionsFinalize ? 'Defina de 1 a 10, o peso mínimo que o checklist deve alcançar. E defina o peso de cada pergunta de 1 a 10 em relação ao checklist' : 'Selecione as Perguntas' }}:</span>
          <b-button class="color-2 float-right" @click="navigate()" v-if="!selectedQuestionsFinalize">            
            Atribuir Peso <i class="fas fa-chevron-right"></i>
          </b-button>
        </div>
        <div v-if="selectedQuestionsFinalize" class="mt-2">
          <span>
            Peso Mínimo:
            <!-- Soma Parcial dos Pesos:
            <strong class="alertaPeso" :class="{'text-danger': !equalstotal}">{{totalSum}}</strong>
            - Soma Total dos Pesos:
            <strong class="alertaPeso">{{totalSumTarget}}</strong> -->
          </span >
           <b-form-input
                class="d-inline-block"
                style="width:70px"
                name="scoreMinimo"
                type="number"
                v-model="checklist.scoreMinimo"
                min="1"
                max="10"
                v-validate="'required|max_value:10|min_value:1'"
                data-vv-as="Peso Mínimo"      
                :class="{'input': true, 'is-danger': errors.has('scoreMinimo') }"
              />
               <span v-show="errors.has('scoreMinimo')" class="help is-danger">{{ errors.first('scoreMinimo') }}</span>
          <!-- <span
            v-if="!equalstotal"
            class="text-danger"
          >* A soma parcial dos pesos deve bater com a soma total dos pesos.</span> -->
          <b-button class="color-2 float-right" @click="navigate()" v-if="selectedQuestionsFinalize">
            <i class="fas fa-chevron-left"></i>
            Selecionar Perguntas
          </b-button>
        </div>
        <div class="divPerguntas">
          <div class="divPerguntasCHild">
            <b-form-checkbox-group
              v-if="!selectedQuestionsFinalize"
              v-validate="'required'"
              data-vv-as="Selecione as Perguntas"
              v-model="selecionados"
              name="perguntas"
              :class="{'input': true, 'is-danger': errors.has('perguntas') }"
            >
              <b-form-checkbox
                :value="pergunta"
                v-for="pergunta in checklist.perguntas"
                class="d-block ml-1"
              >{{pergunta.descricao}}</b-form-checkbox>
            </b-form-checkbox-group>
            <div
              v-if="selectedQuestionsFinalize"
              class="d-flex mt-2"
              v-for="(selected,i) in selecionados"
            >
              <label style="flex:12" class="descPerguntas">{{selected.descricao}}</label>
              <b-form-input
                class="float-right"
                style="flex:1"
                name="pesos[]"
                type="number"
                v-model="pesos[i]"
                min="1"
                max="10"
                v-validate="'required|max_value:10|min_value:1'"
                data-vv-as="Peso"                 
                :value="selected.peso"
                :class="{'input': true, 'is-danger':  invalidLevel(i) }"
                :title="errors.first('pesos[]')"
              />
            </div>
          </div>
          <span
            v-show="errors.has('perguntas')"
            class="help is-danger"
          >{{ errors.first('perguntas') }}</span>
        </div>
      </form>
    </b-modal>
  </panel>
</template>
<script>
import ChecklistService from "../../services/ChecklistService";
import QuestionService from "../../services/QuestionService";
import _ from "lodash";

export default {
  data() {
    return {
      customHeads: [
        { prop: "dataAtualizacao", columnName: "Data Atualização" },
        { prop: "scoreMinimo", columnName: "Score Mínimo" }
      ],
      hiddenHeads: ["id", "perguntas"],
      customData: [
        { prop: "dataAtualizacao", value: "DD/MM/YYYY", type: "date" }
      ],
      items: [],
      perguntas: [],
      checklist: {
        nome: "",
        dataAtualizacao: "",
        perguntas: [],
        scoreMinimo: 0,
        idCliente: 0,
        id: null
      },
      titleRegistrationModal: "Novo Checklist",
      titleModalMensagem: "",
      mensagemModal: "",
      isLoadingModal: false,
      isLoadingInit: true,
      selectedQuestionsFinalize: false,
      pesos: [],
      selecionados: []
    };
  },

  computed: {
    totalSumTarget: function() {
      return this.pesos.length * 5;
    },
    totalSum: function() {
      if (this.pesos.length == 0) return 0;

      let arrayInt = this.pesos.map(Number);
      return arrayInt.reduce((i, v) => i + v);
    }
    
    // ,
    // equalstotal: function() {
    //   return this.totalSum == this.totalSumTarget;
    // }
  },

  methods: {
    invalidLevel(i) {  
      return (this.pesos[i] < 1 || this.pesos[i] > 10);
    },

    reloadData() {
      this.isLoadingModal = false;
      this.service
        .get(this.$store.state.user.idCliente)
        .then(res => (this.items = res))
        .catch(err => console.log(err));
      this.$refs.gridChecklist.reload();
      this.$refs.modalCadastro.hide();
    },

    openModal() {
      this.errors.clear();
      this.$refs.focusElem.focus();
    },

    hideModal() {
      this.checklist = {
        id: null,
        nome: "",
        scoreMinimo:0,
        perguntas: _.cloneDeep(this.perguntas)
      };
      this.titleRegistrationModal = "Novo Checklist";
      this.selectedQuestionsFinalize = false;
      this.pesos = [];
      this.selecionados = [];
    },

    edit(row) {
      this.titleRegistrationModal = "Checklist";
      this.isLoadingModal = true;
      this.service
        .get(this.$store.state.user.idCliente, row.id)
        .then(res => {
          this.isLoadingModal = false;
          this.selecionados = res[0].perguntas;
          this.checklist = res[0];
          //Atualizei os pesos para que conseguir checar o objeto
          this.checklist.perguntas = _.cloneDeep(this.perguntas).map(p => {
              let pergSel = this.selecionados.find(x => x.perguntaID == p.perguntaID);              
              if(pergSel){
                  p.peso = pergSel.peso;
              }
              return p;
          });
          this.updateGrade();
        })
        .catch(err => {
          console.log(err);
          this.isLoadingModal = false;
        });
      this.$refs.modalCadastro.show();
    },

    updateGrade() {
      this.pesos = this.selecionados.map(x => x.peso);
    },

    handleSubmit(evt) {
      evt.preventDefault();
      this.save();
    },

    save() {
      this.$validator.validateAll().then(result => {
        
        if (result) {
          if (this.pesos.length == 0){ // || !this.equalstotal) {
            this.titleModalMensagem = "Atenção";
            this.mensagemModal = `Por favor, verifique se preencheu todos os campos 
                            obrigatórios.`;
            this.$refs.modalMensagem.show();
            return;
          }

          this.pesos.forEach(peso => {
              console.log(peso);
              if(!peso || peso < 1 || peso > 10){
                this.titleModalMensagem = "Atenção";
                this.mensagemModal = `Por favor, cada peso pode variar apenas entre 1 e 10.`;
                this.$refs.modalMensagem.show();
                return;
              }

          });

          this.isLoadingModal = true;
          this.checklist.perguntas = this.selecionados.map((s, i) => { s.peso = parseInt(this.pesos[i], 10); return s; });
          this.checklist.idCliente = this.$store.state.user.idCliente;
          this.service
            .save(this.checklist)
            .then(res => {
              this.titleModalMensagem = "Parabéns";
              this.mensagemModal = "Registro Salvo com Sucesso!";
              this.$refs.modalMensagem.show();
            })
            .catch(err => {
              console.log(err);
              this.isLoadingModal = false;
              this.titleModalMensagem = "Alerta";
              this.mensagemModal = "Erro ao salvar o checklist.";
              this.$refs.modalMensagem.show();
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

    navigate() {
      if (!this.selectedQuestionsFinalize) this.updateGrade();

      this.selectedQuestionsFinalize = !this.selectedQuestionsFinalize;
    }
  },

  created() {
    this.service = new ChecklistService();
    let questionService = new QuestionService();

    this.service
      .get(this.$store.state.user.idCliente)
      .then(res => {
        console.log(res);
        if (res) {
          this.items = res;

          questionService
            .get(this.$store.state.user.idCliente)
            .then(perguntas => {
              console.log(perguntas);
              let perguntasChecklist = perguntas.map(p => {
                return { perguntaID: p.id, descricao: p.descricao, peso: 5 };
              });

              this.perguntas = _.cloneDeep(perguntasChecklist);
              this.checklist.perguntas = perguntasChecklist;
            });
        }
        this.isLoadingInit = false;
      })
      .catch(err => {
        console.log(err);
        this.isLoadingInit = false;
      });
  }
};
</script>
<style scoped>
.divPerguntasCHild {
  overflow: auto;
  max-height: 400px;
}
.divPerguntas {
  margin: 10px 0 10px 0;
  border: 2px solid #ced4da;
  border-radius: 5px;
  padding: 10px;
}

span,
.custom-checkbox {
  margin-top: 10px;
  display: inline-block;
}

.alertaPeso {
  font-size: 14pt;
}

.descPerguntas{
  margin-bottom: 0
}
</style>