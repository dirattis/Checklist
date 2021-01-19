<template>
  <panel title="Distribuir Checklist">  
        

        <app-table ref="gridDistribuirChecklist" :canDetail="true" :canAdd="true"  :hiddenHeads="hiddenHeads" :customHeads="customHeads" :data="items" 
        :totalRows="items.length" :customData="customData" class="tableMain" @edit="edit"  :isLoadingInit="isLoadingInit"/>
        
  </panel>
</template>
<style scoped>
    .divItemsChild{
        overflow: auto;
        max-height: 400px;
    }
    .divChecklists{
        margin: 10px 0 10px 0;
        border: 2px solid #ced4da;
        border-radius: 5px;
        padding: 10px;
    }

    span, .custom-checkbox{
        margin-top:10px;
    }
</style>

<script>
import ShareChecklistService from '../../services/ShareChecklistService';
import PartnerService from '../../services/PartnerService';
import UserService from '../../services/UserService';
import ChecklistService from '../../services/ChecklistService';
import _ from 'lodash';



export default {
    data(){
        return {     
            customHeads:[{ prop: 'dataCadastro', columnName: 'Data Cadastro' }, { prop: 'descricao', columnName: 'Descrição' },
                        { prop: 'usuario', columnName: 'Usuário' }],             
            hiddenHeads:['id','flAtivo', 'idCliente', 'checklists'], 
            customData:[{ prop: 'parceiro', value: 'razaoSocial', type: 'child' }, { prop: 'dataCadastro', value: 'DD/MM/YYYY', type:'date' },
                        { prop: 'usuario', value: 'nome', type: 'child' }],
            items:[],   
            checklists: [],  
            parceiros:[],
            usuarios:[],
            distribuirChecklist: { usuario:'', parceiro:'',checklists:[],  dataCadastro: '', id: null },
            titleRegistrationModal: 'Nova Distribuição de Checklist',
            isLoadingModal: false,
            isLoadingInit:true
            //errors: [],
            // money: {
            //     decimal: ',',
            //     thousands: '.',   
            //     suffix: '',   
            //     precision: 2,
            //     masked: false /* doesn't work with directive */
            // }
        }
    },

     methods: {

        reloadData(){
                this.isLoadingModal = false;
                this.service.get(this.$store.state.user.idCliente).then(res => this.items = res).catch(err => console.log(err));;
                this.$refs.gridDistribuirChecklist.reload();
                this.$refs.modalCadastro.hide();
            },

        hideModal(){
            
            this.distribuirChecklist = { usuario:'', parceiro:'',checklists: _.cloneDeep(this.checklists),  dataCadastro: '', id: null },
            this.titleRegistrationModal = 'Nova Distribuição de Checklist';
        },

        openModal(){
            this.errors.clear();
        },

        edit(row){
             this.isLoadingModal = true;
            this.titleRegistrationModal = 'Distribuição de Checklist';
            this.service.get(this.$store.state.user.idCliente, row.id).then(res => 
            {                
                 this.isLoadingModal = false;
                 
                this.distribuirChecklist = res[0];               
                this.distribuirChecklist.parceiro = this.distribuirChecklist.parceiro.id;
                this.distribuirChecklist.usuario = this.distribuirChecklist.usuario.id;

                if(res[0].checklists){                
                
                    res[0].checklists = res[0].checklists.map(c => {
                        c.selecionado = true; 
                        let check = this.checklists.find(x => x.id == c.id);
                        if(check)
                            c.qtdePerguntas = check.perguntas.filter(x => x.selecionado == 1).length;
                        else
                            c.qtdePerguntas = 0;
                        
                        return c;
                    });
                }
                else{
                     res[0].checklists = _.cloneDeep(this.checklists);
                }
                
                // let checklistsAux = _.unionBy(res[0].checklists ,this.checklists,'id');

                // let checklists = checklistsAux.map(c => {
                //     let check = this.checklists.find(x => x.id == c.id);
                //     if(check)
                //         c.qtdePerguntas = check.perguntas.filter(p => p.selecionado == "1").length;
                    
                //     return c;
                // });

                // this.checklists = checklists;
            })
            .catch(err => { console.log(err); this.isLoadingModal = false;});
            this.$refs.modalCadastro.show(); 
        },   
        
        handleSubmit (evt) {           

            if(this.distribuirChecklist.id == null){  
                evt.preventDefault();              
                this.save();
            }
        }


  },

    created(){

        this.service = new ShareChecklistService();
        this.service.get(this.$store.state.user.idCliente).then(resDist => 
        {             
            console.log(resDist);
            let checklistService = new ChecklistService();
            checklistService.get(this.$store.state.user.idCliente).then(resCheck => 
            {
                this.isLoadingInit = false;
                resDist.forEach(d => { 
                    if(d.checklists){
                        let checklistMerged = [];
                        d.checklists.forEach(element => {
                            let checkFound = resCheck.find(x => x.id == element.id);
                            if(checkFound){      
                                checklistMerged.push( _.extend({}, checkFound, {selecionado: true}));
                            }
                        });
                        d.checklists = checklistMerged;
                        
                    }
                    else{
                        d.checklists = _.map(resCheck, function(element) { 
                            return _.extend({}, {id: element.id, nome: element.nome}, {selecionado: false});
                        });
                    }  
                });        
                
                
                this.checklists = resCheck;
                this.distribuirChecklist.checklists = resCheck;

                console.log(this.checklists);
                console.log(resDist);

            }).catch(err => {console.log(err); this.isLoadingInit = false;} );
            
            this.items = resDist
        })
        .catch(err => {console.log(err); this.isLoadingInit = false;});
            
        let partnerService = new PartnerService();
        partnerService.get(this.$store.state.user.idCliente).then(res => 
        { 
            this.parceiros = res.map(x => { return { text: x.razaoSocial, value: x.id } });
        }).catch(err => console.log(err)); 
        
         let userService = new UserService();
        userService.get(this.$store.state.user.idCliente).then(res => 
        { 
            this.usuarios = res.map(x => { return { text: x.nome, value: x.id } });
        }).catch(err => console.log(err));     



         let checklistService = new ChecklistService();
            checklistService.get(this.$store.state.user.idCliente).then(resCheck => 
            {
                this.isLoadingInit = false;                 
                
                
                this.checklists = resCheck;
                this.distribuirChecklist.checklists = resCheck;

                console.log(this.checklists);
                console.log(resDist);

            }).catch(err => {console.log(err); this.isLoadingInit = false;} );
           
    }
}
</script>




