<template>
  <panel title="Perguntas">
    <app-table
      ref="gridpergunta"
      :hiddenHeads="hiddenHeads"
      :customData="customData"
      :customHeads="customHeads"
      :data="items"
      :totalRows="items.length"
      class="tableMain"
      @edit="edit"
      isCrud
      canImport
      @deleteElement="toDelete"
      @import="toImport"
      :isLoadingInit="isLoadingInit"
    />

    <b-modal
      id="mensagem"
      size="sm"
      ref="modalMensagemImport"
      :title="titleModalMensagemImport"
      :ok-only="true"
      @ok="reloadData()"
    >{{mensagemModalImport}}</b-modal>

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
        <span>Descrição:</span>
        <b-form-input
          name="descricao"
          data-vv-as="Descrição"
          v-validate="'required'"
          type="text"
          ref="focusElem"
          v-model="pergunta.descricao"
          :class="{'input': true, 'is-danger': errors.has('descricao') }"
        />
        <div v-show="errors.has('descricao')" class="help is-danger">{{ errors.first('descricao') }}</div>

        <span>Categoria:</span>
        <b-form-select name="categoria" v-model="pergunta.idCategoria" :options="categorias"></b-form-select>

        <span>Tipo:</span>
        <b-form-select
          name="tipo"
          data-vv-as="Tipo"
          :options="tipos"
          v-validate="'required'"
          v-model="pergunta.idTipo"
          :class="{'input': true, 'is-danger': errors.has('tipo') }"
        />
        <div v-show="errors.has('tipo')" class="help is-danger">{{ errors.first('tipo') }}</div>

        <span v-if="pergunta.idTipo">Possíveis Respostas (Correta está selecionada):</span>
        <div class="divEscolhas" v-if="pergunta.idTipo">
          <div class="divEscolhasChild">
            <b-form-radio-group
              v-validate="'required'"
              data-vv-as="Possíveis Respostas"
              v-model="pergunta.idRespostaCorreta"
              name="escolhasDisponiveis"
              :class="{'input': true, 'is-danger': errors.has('escolhasDisponiveis') }"
            >
              <b-form-radio
                :value="resposta.id"
                v-for="resposta in escolhasDisponiveis"
                class="d-block"
              >{{resposta.descricao}}</b-form-radio>
            </b-form-radio-group>
          </div>
          <span
            v-show="errors.has('escolhasDisponiveis')"
            class="help is-danger"
          >{{ errors.first('escolhasDisponiveis') }}</span>
        </div>

        <b-form-checkbox
          name="flFoto"
          class="d-block"
          v-model="pergunta.flFoto"
          :value="true"
          :unchecked-value="false"
        >Foto Obrigatória</b-form-checkbox>
      </form>
    </b-modal>
  </panel>
</template>

<script>
import QuestionService from "../../services/QuestionService";
import CategoryService from "../../services/CategoryService";

export default {
  data() {
    return {
      customHeads: [
        { prop: "descricao", columnName: "Descrição" },
        { prop: "flFoto", columnName: "Foto Obrigatória" }
      ],
      hiddenHeads: [
        "id",
        "ativo",
        "resposta",
        "dataAtualizacao",
        "idRespostaCorreta"
      ],
      customData: [
        { prop: "categoria", value: "nome", type: "child" },
        { prop: "tipo", value: "nome", type: "child" }
      ],
      items: [],
      pergunta: {
        descricao: "",
        idRespostaCorreta: null,
        tipo: null,
        categoria: null,
        idCategoria: 0,
        idTipo: 0,
        idCliente: 0,
        flFoto: false,
        id: null
      },
      categorias: [],
      tipos: [],
      escolhasDisponiveis: [],
      titleRegistrationModal: "Nova Pergunta",
      titleModalMensagemImport: "Parabéns",
      mensagemModalImport: "Arquivo Importado com Sucesso!",
      isLoadingModal: false,
      isLoadingInit: true
    };
  },

  methods: {
    reloadData() {
      this.isLoadingModal = false;
      this.service
        .get(this.$store.state.user.idCliente)
        .then(res => (this.items = res))
        .catch(err => console.log(err));
      this.$refs.gridpergunta.reload();
      this.$refs.modalCadastro.hide();
    },

    openModal() {
      this.errors.clear();
      this.$refs.focusElem.focus();
    },

    hideModal() {
      this.pergunta = {
        descricao: "",
        tipo: null,
        categoria: null,
        flFoto: 0,
        idRespostaCorreta: null,
        id: null
      };
      this.titleRegistrationModal = "Nova Pergunta";
    },

    edit(row) {
      this.isLoadingModal = true;
      this.titleRegistrationModal = row.descricao;
      this.service
        .get(this.$store.state.user.idCliente, row.id)
        .then(res => {
          this.pergunta = res[0];
          this.pergunta.idCategoria = this.pergunta.categoria
            ? this.pergunta.categoria.id
            : null;
          this.pergunta.idTipo = this.pergunta.tipo.id;

          this.service.getAvailableOptions(this.pergunta.id).then(res => {
            this.isLoadingModal = false;
            this.escolhasDisponiveis = res;
          });
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
          this.pergunta.idCliente = this.$store.state.user.idCliente;
          this.pergunta.idsRespostas = this.escolhasDisponiveis.map(e => e.id);
          this.service
            .save(this.pergunta)
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

    toImport(perguntas) {
      perguntas = perguntas.map(x => {
        x.idCliente = this.$store.state.user.idCliente;
        x.idsRespostas =
          x.idTipo == 1 ? this.escolhasDisponiveis.map(e => e.id) : []; //Preenche se for tipo Sim/Não
        return x;
      });
      let perguntasLote = { isImport: true, perguntas };

      this.isLoadingModal = true;
      this.service
        .importedDataSave(perguntasLote)
        .then(res => {
          this.titleModalMensagemImport = "Parabéns";
          this.mensagemModalImport = "Arquivo Importado com Sucesso!";
          this.$refs.modalMensagemImport.show();
        })
        .catch(err => {
          console.log(err);
          this.isLoadingModal = false;
          this.titleModalMensagemImport = "Alerta";
          this.mensagemModalImport = "Erro ao importar arquivo.";
          this.$refs.modalMensagemImport.show();
        });
    }
  },

  created() {
    this.service = new QuestionService();
    this.categoryService = new CategoryService();

    this.service
      .get(this.$store.state.user.idCliente)
      .then(res => {
        this.items = res;
        this.isLoadingInit = false;
      })
      .catch(err => {
        this.isLoadingInit = false;
        console.log(err);
      });

    this.categoryService
      .get(this.$store.state.user.idCliente)
      .then(res => {
        this.categorias = res.map(x => {
          return { text: x.nome, value: x.idCategoria };
        });
      })
      .catch(err => console.log(err));

    this.service
      .getQuestionType()
      .then(
        res =>
          (this.tipos = res.map(x => {
            return { text: x.nome, value: x.id };
          }))
      )
      .catch(err => console.log(err));

  }
};
</script>
<style scoped>
span,
.custom-checkbox {
  margin-top: 10px;
  display: inline-block;
}

.divEscolhasChild {
  overflow: auto;
  max-height: 400px;
}
.divEscolhas {
  margin: 0 0 10px 0;
  border: 2px solid #ced4da;
  border-radius: 5px;
  padding: 10px;
}
</style>



