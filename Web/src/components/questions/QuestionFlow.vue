<template>
  <panel :title="titulo" class="vld-parent ">
    <loading :active.sync="isLoadingInit" :is-full-page="false"></loading>
    <b-modal
      id="concluido"
      size="sm"
      ref="modalAlerta"
      :title="titleConcluido"
      ok-only
      @ok="alertaOk()"
    >{{messageConcluido}}</b-modal>
    <b-modal
      id="confirm"
      size="sm"
      ref="modalConfirm"
      title="Finalizar Checklist"
      cancel-title="Não"
      ok-title="Sim"
      @ok="finalizeChecklist()"
    >Deseja realmente finalizar o Checklist?</b-modal>

    <div class="divPerguntas clearfix">
      <question
        :pergunta="perguntas[$store.state.indicePerguntaAtual]"
        @answer="answer"
        @loader="loader"
        ref="question"
        :indicePerguntaAtual="$store.state.indicePerguntaAtual"
        :qtdePerguntas="this.perguntas.length"
      />

      <div v-if="perguntas.length == 0">
        <h3>{{messageDataEmpty}}</h3>
      </div>
      <div
        class="divButtons"
        v-else-if="$store.state.indicePerguntaAtual == (perguntas.length - 1)"
      >
        <button class="aEsquerda" @click.prevent="prev()">&#60; Anterior</button>
        <button class="aDireita" @click="completeQuestionnaire">Finalizar</button>
      </div>
      <div class="divButtons" v-else-if="$store.state.indicePerguntaAtual > 0">
        <button class="aEsquerda" @click.prevent="prev()">&#60; Anterior</button>
        <button class="aDireita" @click.prevent="next()">Próximo &#62;</button>
      </div>
      <div class="divButtons" v-else>
        <button class="aDireita" @click.prevent="next()">Próximo &#62;</button>
      </div>
    </div>
  </panel>
</template>
<script>
import Question from "./Question";
import AnswerService from "../../services/AnswerService";
import { Storage } from "aws-amplify";

export default {
  components: {
    question: Question
  },
  data() {
    return {
      titleConcluido: "",
      messageConcluido: "",
      titulo: "",
      indicePerguntaAtual: 0,
      perguntas: [],
      checklistIdAtual: null,
      checklist: null,
      isLoadingInit: true,
      messageDataEmpty: ''
    };
  },
  updated() {
    this.$refs.question.mountSlider(
      this.perguntas[this.$store.state.indicePerguntaAtual]
    );
  },

  methods: {
    next() {
      console.log(this.checklistIdAtual);
      this.$store.dispatch("NEXT", this.checklistIdAtual);
    },
    prev() {
      this.$store.dispatch("PREV", this.checklistIdAtual);
    },
    updateIndexChecklist() {
      this.$store.dispatch("SET_CHECKLIST", this.checklistIdAtual);
    },
    loadQuestions() {
      this.$store.dispatch("LOAD_QUESTIONS", this.perguntas);
    },
    finalizeChecklist() {
      if (
        this.perguntas.length ==
        this.$store.state.checklistAtual.qtdePerguntasRespondidas
      ) {
        //this.$store.dispatch("FINALIZE_CHECKLIST", this.checklistIdAtual);

        let checklistAtual = this.$store.getters.checklistAtual;
        checklistAtual.concluido = true;

        let perguntasData = {
        idCliente: this.$store.state.user.idCliente,
        idUsuario: this.$store.state.user.idUsuario,
        checkListID: checklistAtual.checklistId,
        idCheckListDistribuicao: checklistAtual.idCheckListDistribuicao,
        dadosCheckListPergunta: {
          perguntasPorChecklist: this.$store.state.perguntas,
          checklistIdAtual: checklistAtual.checklistId,
          indicePerguntaAtual: this.$store.state.indicePerguntaAtual
        },
        dadosCheckList: checklistAtual
      };
      console.log(JSON.stringify(perguntasData));

      this.service
        .save(perguntasData)
        .then(result => {
          console.log(result);
          this.titleConcluido = "Parabéns";
        this.messageConcluido = "Checklist concluído com sucesso!";
        this.$refs.modalAlerta.show();
        })
        .catch(err => {
          console.log(err);
          this.titleSalvar = "Alerta";
          this.messageSalvar = "Erro ao finalizar o checklist. " + err;
          this.$refs.modalAlerta.show();
        });
        
      }
      else{
        this.titleConcluido = "Atenção";
        this.messageConcluido =
          "Por favor, responda todo o checklist para dar como concluído.";
        this.$refs.modalAlerta.show();
      }
    },

    alertaOk(){
      if(this.titleConcluido == "Parabéns")
        this.$router.push({ name: "tarefas" });
    },

    completeQuestionnaire() {
      if (
        this.perguntas.length !=
        this.$store.state.checklistAtual.qtdePerguntasRespondidas
      ){
        this.titleConcluido = "Atenção";
        this.messageConcluido =
          "Por favor, responda todo o checklist para dar como concluído.";
        this.$refs.modalAlerta.show();
        return;
      }

      this.$refs.modalConfirm.show();
    },
    answer(answer) {
      this.$store.dispatch("ANSWER", { checklistId: this.checklistIdAtual });
    },

    loader(loading){
      this.isLoadingInit = loading;
    }
  },

  created() {
    console.log(this.$route.params.checklist);
    let checklist = this.$route.params.checklist;
    this.titulo = checklist.nome;

    this.service = new AnswerService();
    this.service
      .getQuestions(
        this.$store.state.user.idCliente,
        checklist.checklistId,
        checklist.idCheckListDistribuicao
      )
      .then(result => {
        this.isLoadingInit = false;
        let questions = { perguntasPorChecklist: [] };
        console.log(result);
        if (result) {
          if (result.length > 0) questions = JSON.parse(result[0].checklists);
        }
        questions.perguntasPorChecklist = questions.perguntasPorChecklist.map(
          p => {
            if (typeof p.fotos == "string") p.fotos = JSON.parse(p.fotos);

            if (typeof p.resposta == "string")
              p.resposta = JSON.parse(p.resposta);

            return p;
          }
        );

        console.log(questions.perguntasPorChecklist);
        this.perguntas = questions.perguntasPorChecklist;

        if(this.perguntas.length == 0) this.messageDataEmpty = 'Nenhuma pergunta cadastrada';

        this.loadQuestions();
      })
      .catch(err => {console.log(err); this.isLoadingInit = false;});


    this.indicePerguntaAtual = checklist.indicePerguntaAtual;
    this.checklistIdAtual = checklist.checklistId;
    this.updateIndexChecklist();
  }
};
</script>
<style>
.divPerguntas {
  float: left;
  border: 2px solid #028db2;
  border-radius: 15px;
  box-shadow: 5px 8px #8ccbdc;
  padding: 10px;
  width: 100%;
  height: 100%;
}

.divButtons > button {
  background: #0e79be;
  color: #fff;
  border: 2px solid #034c7b;
  border-radius: 5px;
  width: 100px;
  cursor: pointer;
}

.aEsquerda {
  float: left;
}

.aDireita {
  float: right;
}
</style>


