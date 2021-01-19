<template>
  <panel title="Checklist">  
        

        <app-table ref="gridquestionarie" :hiddenHeads="hiddenHeads"  :data="items" :totalRows="items.length" 
            class="tableMain" @edit="edit"   isCrud @deleteElement="excluirquestionarie"/>


         <b-modal id="addModal" size="lg" ref="modalCadastro" :title="titleRegistrationModal" cancel-title="Cancelar" ok-title="Salvar"
                @shown="openModal()" @hidden="hideModal()" @ok="handleSubmit">
            <form @submit.prevent="salvarquestionarie" ref="formModalCadastro">
                <span>Nome:</span>
                <b-form-input name="nome"  data-vv-as="descrição" v-validate="'required'"  type="text" ref="focusElem" v-model="questionarie.nome" 
                    :class="{'input': true, 'is-danger': errors.has('nome') }"/>
                <span v-show="errors.has('nome')" class="help is-danger">{{ errors.first('nome') }}</span>
       
                

                <span>Concluído:</span>
                <span>{{questionarie.concluido ? 'Sim' : 'Não'}}</span>
               
            </form>
        </b-modal>

        
  </panel>
</template>

<script>
const SAUDACAO_NOVO_CADASTRO =  'Novo Checklist';

export default {
    data(){
        return {     
            hiddenHeads:['questionarieId'],  
            items:[],     
            questionarie: { nome:'', categoria:'', concluido:'', questionarieId: null },
            titleRegistrationModal: SAUDACAO_NOVO_CADASTRO
        }
    },

     methods: {

        openModal() {  
            this.errors.clear();            
             this.$refs.focusElem.focus();
        },

        hideModal(){
            
            this.questionarie = { nome:'', categoria:'', tipo:''};
            this.titleRegistrationModal = SAUDACAO_NOVO_CADASTRO;
        },

        edit(row){
            this.titleRegistrationModal = row.nome;
            this.questionarie = row;
            console.log(this.questionarie);
            this.$refs.modalCadastro.show();
        },   
        
        handleSubmit (evt) {
            
            evt.preventDefault();
            this.salvarquestionarie();
        },

        salvarquestionarie(){
            this.$validator.validateAll().then((result) => {
                if (result) {
                    if(this.questionarie.questionarieId){
                        let questionarieEditIndex = this.items.findIndex(x => x.questionarieId == this.questionarie.questionarieId);
                        this.items[questionarieEditIndex] = this.questionarie;
                        this.$refs.gridquestionarie.reload();
                    }
                    else{                        
                        this.items.push(this.questionarie);
                        this.$refs.gridquestionarie.reload();
                    }                    
                    this.$refs.modalCadastro.hide();
                }           
            });       
        },

        excluirquestionarie(row){
            let index = this.items.findIndex(r => r.questionarieId === row.questionarieId);
            this.items.splice(index,1);
            this.$refs.gridquestionarie.reload();
        }
  },

    created(){
        this.items = this.$store.getters.checklists;   
    }
}
</script>
<style scoped>
    span, .custom-checkbox{
        margin-top:10px;
        display: inline-block
    }
</style>



