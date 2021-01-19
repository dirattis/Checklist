<template>
  <panel title="Status Perguntas" >  
        
            <div class="divTarefas">
                <h3>Perguntas Pendentes</h3>
                <app-table ref="gridChecklistPendente" :isLoadingInit="isLoadingInit" :filter="false" :pagination="false" :customHeads="customHeads"
                    :hiddenHeads="hiddenHeads"  messageEmptyRows="Nenhuma Tarefa Pendente" 
                    :data="itemsPendentes" :totalRows="itemsPendentes.length" class="tableMain" @edit="edit" canEdit />
            </div>
            <div class="divTarefas">
                <h3>Perguntas Concluídas</h3>
                <app-table ref="gridChecklisConcluido" :isLoadingInit="isLoadingInit" :filter="false" :pagination="false" :customHeads="customHeads"
                    :hiddenHeads="hiddenHeads" messageEmptyRows="Nenhuma Tarefa Concluída"
                    :data="itemsConcluidos" :totalRows="itemsConcluidos.length" class="tableMain" @edit="edit"   canEdit />
            </div>
        
  </panel>
</template>

<script>

import AnswerService from '../../services/AnswerService';


export default {
    data(){
        return {     
            customHeads: [{prop:'qtdeRespTotal', columnName:''}],
            hiddenHeads:['checklistId', 'qtdePerguntas', 'qtdePerguntasRespondidas', 'perguntas', 'indicePerguntaAtual', 'concluido', 'idCheckListDistribuicao'],  
            itemsPendentes:[],     
            itemsConcluidos:[],     
            titleRegistrationModal: '',
            isLoadingInit: true            
        }
    },

     methods: {
        edit(row){
            this.titleRegistrationModal = row.nome;
            console.log(row);
            this.$router.push({ name: 'questions', params: { checklist: row }})
        },
        loadChecklists(checklists){
            this.$store.dispatch('LOAD_CHECKLIST', checklists);
        }        

  },

    created(){
            //let items = this.$store.getters.checklists.map(x => Object.assign(x,{qtdeRespTotal: `${x.qtdePerguntasRespondidas}/${x.qtdePerguntas}`}));            
            let items = [];
            this.service = new AnswerService();
             this.service.get(this.$store.state.user.idCliente,this.$store.state.user.idUsuario)
					.then(res => 
					{   
                        this.isLoadingInit = false;   
                        console.log(res);    
                        if(res){
                            items  = res.map(x => Object.assign(x,{qtdeRespTotal: `${x.qtdePerguntasRespondidas}/${x.qtdePerguntas}`}));
                            this.loadChecklists(items);
                            this.itemsPendentes = items.filter(x => !x.concluido);
                            this.itemsConcluidos = items.filter(x => x.concluido);
                        }
                        else{
                            this.itemsPendentes = [];
                            this.itemsConcluidos = [];
                        }

                    }).catch(err => { console.log(err); this.isLoadingInit = false;});           
   
    }
}
</script>
<style scoped>
    span, .custom-checkbox{
        margin-top:10px;
        display: inline-block
    }

    .divTarefas{
        float: left;
        margin: 5%;
        border: 2px solid #028DB2;
        border-radius: 15px;
       box-shadow: 5px 8px #8CCBDC;
        padding: 10px;
        width: 40%;
    }
</style>



