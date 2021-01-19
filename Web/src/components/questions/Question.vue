<template>
  <div class="divPergunta">
    <b-modal
      id="viewPhoto"
      size="lg"
      ref="modalPhotos"
      title
      :hide-header="true"
      :hide-footer="true"
    >
      <b-carousel
        id="carousel1"
        style="text-shadow: 1px 1px 2px #333;"
        controls
        indicators
        background="#ababab"
        :interval="4000"
        img-width="1024"
        img-height="380"
      >
        <b-carousel-slide v-for="(photo, index) of pergunta.fotos" :key="photo.uri + index">
          <img slot="img" class="d-block img-fluid w-100" :src="photo.uri" alt="image slot">
        </b-carousel-slide>
      </b-carousel>
    </b-modal>
    <b-modal
      id="addPhoto"
      size="lg"
      ref="modalCadastro"
      title
      cancel-title="Cancelar"
      ok-title="Upload"
      @ok="upload"
      @cancel="cancel()"
    >
      <div v-if="files.length" id="divImagesQuestion">
        <li v-for="(file, index) in files" :key="file.id">
          <span>{{file.name}}</span> -
          <span>{{file.size | formatSize}}</span>
          <span>
            <i :id="file.id" class="fa fa-trash text-danger"></i>
            <b-popover :target="file.id" title="Deseja realmente excluir o arquivo?" :ref="file.id">
              <b-button size="sm" @click="closeConfirmDelete(file.id)">Não</b-button>
              <b-button size="sm" variant="primary" @click="deleteElement(file)">Sim</b-button>
            </b-popover>
          </span>
        </li>
      </div>
      <div v-else class="text-center p-5">
        <h4>Arraste e solte os arquivos aqui</h4>
      </div>
      <div id="file-upload-question">
        <file-upload
          
          class="btn btn-primary"
          extensions="jpg,jpeg,png"
          accept="image/png, image/jpeg"
          :multiple="true"
          :drop="true"
          :drop-directory="true"
          v-model="files"
          ref="upload"
        >Selecione a(s) Foto(s)</file-upload>
      </div>
    </b-modal>
    <b-modal id="salvar" size="sm" ref="modalSalvar" :title="titleSalvar" ok-only>{{messageSalvar}}</b-modal>

    <h3 class="desc-pergunta">{{pergunta.descricao}}</h3>

    <div class="divPergunta" v-if="!pergunta.resposta.escolhasDisponiveis">
      <textarea
        @change="changeValueText"
        name="txtDesc"
        rows="10"
        v-model="pergunta.resposta.descricao"
      ></textarea>
    </div>
    <div class="divPergunta" v-else-if="pergunta.tipo.toLowerCase() === 'emoji'">
      <div class="w-100">
        <b-button class="color-2" v-b-modal.addPhoto v-if="pergunta.fotoObrigatoria">
          <i class="fa fa-plus mr-1"></i>Foto
        </b-button>
        <span
          v-if="pergunta.fotoObrigatoria"
          @click="showPhotos"
          :style="pergunta.fotos.length > 0 ? 'cursor:pointer' : 'cursor:default'"
        >
          {{pergunta.fotos.length}}
          <i class="far fa-images"></i>
        </span>
        <b-button class="color-2 float-right" @click="synchronize">
          <i class="fa fa-save mr-1"></i>Salvar
        </b-button>
      </div>
      <input
        class="slider"
        type="range"
        min="0"
        max="100"
        v-model="pergunta.resposta.valor"
        @change="changeSlider"
        @input="inputSlider"
      >
      <div class="divPergunta text-center">
        <h4
          class="text-center d-inline-block"
          :class="{'text-success-app': valueTextSlide === 'Sim', 'text-danger': valueTextSlide === 'Não'}"
        >{{this.valueTextSlide}}</h4>
        <i
          class="contentAnswer"
          :class="{'far fa-thumbs-up text-success-app' : valueTextSlide === 'Sim', 'far fa-thumbs-down text-danger' : valueTextSlide === 'Não'}"
        ></i>
        <!-- <img  :src="valueEmojiSlide" class="emoji center"> -->
      </div>
    </div>
    <div v-else-if="pergunta.tipo.toLowerCase() === 'alternativa'"></div>
    <div v-else-if="pergunta.tipo.toLowerCase() === 'simnao'">
      <input
        class="slider"
        type="range"
        min="0"
        max="100"
        v-model="pergunta.resposta.valor"
        @change="changeSlider"
        @input="inputSlider"
      >
      <div class="divPergunta">
        <h4 class="center text-center">{{this.valueTextSlide}}</h4>
      </div>
    </div>
    <div v-else-if="pergunta.tipo.toLowerCase() === 'multiplaEscolha'"></div>
  </div>
</template>
<script>
import { Storage } from "aws-amplify";
import AnswerService from "../../services/AnswerService";

export default {
  data() {
    return {
      valueTextSlide: "",
      optionsSlider: [],
      // valueEmojiSlide: null,
      indiceEscolhaSelecionada: 0,
      descricao: "",
      files: [],
      titleSalvar: "",
      messageSalvar: ""
    };
  },
  
  props: {
    pergunta: Object,
    indicePerguntaAtual: { type: Number, default: 0 },
    qtdePerguntas: { type: Number, default: 0 }
  },
  created() {
    this.mountSlider(this.pergunta);
    this.service = new AnswerService();
  },
  watch: {
    pergunta: function(newData, oldData) {
      this.mountSlider(newData);
    }
  },
  methods: {
    synchronize() {
      let perguntasData = this.service.createObjectToAnswer(this.$store.state);
      
      this.service
        .save(perguntasData)
        .then(result => {
          console.log(result);
          this.titleSalvar = "Parabéns";
          this.messageSalvar = "Progresso do checklist salvo com sucesso!";
          this.$refs.modalSalvar.show();
        })
        .catch(err => {
          console.log(err);
          this.titleSalvar = "Alerta";
          this.messageSalvar = "Erro ao salvar o progresso do checklist. " + err;
          this.$refs.modalSalvar.show();
        });
    },

    deleteElement(fileToDelete) {
      this.files = this.files.filter(file => file !== fileToDelete);
    },

    closeConfirmDelete(popoperRef) {
      this.$refs[popoperRef][0].$emit("close");
    },
    cancel(){
      this.files = [];
    },
    uploadCompleted(uploadCount, filesLength){
      console.log(uploadCount);
      console.log(filesLength);
      return uploadCount == filesLength;
    },
    upload() {

      if(this.$refs.upload.files.length > 0){
        
        this.$emit("loader", true);
        let errors = [];

        let promises = this.$refs.upload.files.map(foto => {
            return this.service.uploadImage(this.$store.state.user.username, this.pergunta.perguntaId, foto);   
        });

        Promise.all(promises).then(resultArray => {
            let promisesToSave = [];
            resultArray.forEach(ret => {            
              if(ret.result == 'success'){

                this.$store.dispatch("SAVE_PHOTOS", {
                  questionId: this.pergunta.perguntaId, 
                  photo: { uri: ret.data, date: new Date() } 
                });

                let perguntasData = this.service.createObjectToAnswer(this.$store.state);
                promisesToSave.push(this.service.save(perguntasData));
              }
              else
                errors.push(ret.data);
            });

            Promise.all(promisesToSave).then(resultArrayToSave => {
              console.log(resultArrayToSave);
              this.$emit("loader", false);
              this.treatMessage(errors);
            }).catch(err => {
              this.$emit("loader", false);
              if(err.code == 'NetworkingError')
                this.treatError(err);
              else
                this.treatMessage(errors);
            });

            
           
        })
        .catch(err => {
          this.$emit("loader", false);
          this.treatError(err);
        });
          
      }
    },

    treatMessage(errors){
       if(errors.length > 0){
          console.log(errors);
          let images = errors.join('  ');

          this.titleSalvar = "Alerta";
          this.messageSalvar = "Erro ao carregar as seguintes imagens: " + images;
          this.$refs.modalSalvar.show();
        }
        else
        {
          this.titleSalvar = "Parabéns";
          this.messageSalvar = "Imagens carregadas com sucesso!";
          this.$refs.modalSalvar.show();
        }
    },

    treatError(error){
      console.log(error);
      let message = "Opss.. Ocorreu o seguinte erro: " + error.message;
    
      if(error.code == 'NetworkingError'){
          message = 'Opss.. parece que você está sem internet. Verifique sua conexão para prosseguir.';
      }            
      this.titleSalvar = "Alerta";
      this.messageSalvar = message;
      this.$refs.modalSalvar.show();
    },

    mountSlider(pergunta) {
      if (!pergunta) return;
      if (
        pergunta.resposta.escolhasDisponiveis &&
        pergunta.tipo.toLowerCase() === "emoji"
      ) {
        let optionsSlider = [];
        let div = 100 / pergunta.resposta.escolhasDisponiveis.length;
        for (var i = 0; i < pergunta.resposta.escolhasDisponiveis.length; i++)
          optionsSlider.push(div * (i + 1));

        this.optionsSlider = optionsSlider;

        if (pergunta.resposta.valor > 0)
          for (let i = 0; i < optionsSlider.length; i++) {
            if (pergunta.resposta.valor < optionsSlider[i]) {
              let escolha = pergunta.resposta.escolhasDisponiveis[i];
              this.valueTextSlide = escolha.nome;
              //this.valueEmojiSlide = this.optionsEmojiSlider[escolha.id];
              this.indiceEscolhaSelecionada = i;

              break;
            }
          }
        else {
          this.valueTextSlide = "";
          //this.valueEmojiSlide = null;
          this.indiceEscolhaSelecionada = 0;
        }
      }

      if (pergunta.resposta.escolhasSelecionadas) {
        pergunta.resposta.escolhasSelecionadas.forEach((id, ind) => {
          let escolha = pergunta.resposta.escolhasDisponiveis.find(
            x => x.id == id
          );
          if (escolha) {
            escolha.checked = true;
          }
        });
      }
    },
    changeValueText() {
      this.$emit("answer");
    },
    changeSlider() {
      this.$emit("answer");
    },

    inputSlider() {
      if (this.pergunta.resposta.valor > 0)
        for (let i = 0; i < this.optionsSlider.length; i++) {
          if (this.pergunta.resposta.valor < this.optionsSlider[i]) {
            let escolha = this.pergunta.resposta.escolhasDisponiveis[i];
            this.valueTextSlide = escolha.nome;
            //this.valueEmojiSlide = this.optionsEmojiSlider[escolha.id];
            this.indiceEscolhaSelecionada = i;

            break;
          }
        }
      else {
        this.valueTextSlide = "";
        //this.valueEmojiSlide = null;
        this.indiceEscolhaSelecionada = 0;
      }
    },

    showPhotos() {
      if (this.pergunta.fotos.length > 0) {
        this.$refs.modalPhotos.show();
      }
    }
  }
};
</script>
<style>
/* .camera figcaption {
        position: absolute;
        top: 32px;
        left: 45px;
        font-size: 40px;
        color: #0f79be;
        text-shadow: 0px 0px 5px #0f79be;
    } */
.contentAnswer {
  margin-left: 10px;
}
.divPergunta {
  width: 100%;
  min-height: 150px;
}
.divPergunta > textarea {
  width: 90%;
  margin: 20px 5%;
}
.divPergunta > h4,
.divPergunta > i {
  font-size: 2em;
  margin-top: 10px;
}

.center {
  margin: 0 auto;
  display: block;
}
.emoji {
  width: 156;
  height: 156;
}
.desc-pergunta {
  color: #003a98;
}

#file-upload-question {
  margin-top: 10px;
}
.file-uploads label {
  cursor: pointer;
}

#divImagesQuestion .fa-trash {
  margin-left: 5px;
  cursor: pointer;
}

input[type="range"].slider {
  -webkit-appearance: none;
  width: 50%;
  display: block;
  margin: 50px auto 20px auto;
}
input[type="range"].slider:focus {
  outline: none;
}
input[type="range"].slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: rgba(0, 141, 255, 0.45);
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}
input[type="range"].slider::-webkit-slider-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 26px;
  width: 13px;
  border-radius: 50px;
  background: #0f79be;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -9px;
}
input[type="range"].slider:focus::-webkit-slider-runnable-track {
  background: rgba(26, 152, 255, 0.45);
}
input[type="range"].slider::-moz-range-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: rgba(0, 141, 255, 0.45);
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}
input[type="range"].slider::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 26px;
  width: 13px;
  border-radius: 50px;
  background: #0f79be;
  cursor: pointer;
}
input[type="range"].slider::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type="range"].slider::-ms-fill-lower {
  background: rgba(0, 127, 230, 0.45);
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type="range"].slider::-ms-fill-upper {
  background: rgba(0, 141, 255, 0.45);
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type="range"].slider::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 26px;
  width: 13px;
  border-radius: 50px;
  background: #0f79be;
  cursor: pointer;
  height: 8.4px;
}
input[type="range"].slider:focus::-ms-fill-lower {
  background: rgba(0, 141, 255, 0.45);
}
input[type="range"].slider:focus::-ms-fill-upper {
  background: rgba(26, 152, 255, 0.45);
}
</style>


