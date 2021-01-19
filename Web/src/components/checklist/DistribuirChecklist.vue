<template>
  <panel title="Distribuir Checklist">  
        

        <app-table ref="gridDistribuirChecklist" :canDetail="true" :canAdd="true"  :hiddenHeads="hiddenHeads" :customHeads="customHeads" :data="items" 
        :totalRows="items.length" :customData="customData" class="tableMain" @edit="edit"  :isLoadingInit="isLoadingInit"/>

         <b-modal id="addModal" size="lg" ref="modalCadastro" :title="titleRegistrationModal" cancel-title="Cancelar" 
                :ok-only="distribuirChecklist.id != null"
                :ok-title="distribuirChecklist.id != null ? 'Cancel' : 'Salvar'"
                 @hidden="hideModal()" @shown="openModal()" @ok="handleSubmit" class="vld-parent">
                 <loading :active.sync="isLoadingModal"></loading>
            <form @submit.prevent="save" ref="formModalCadastro">
            
            <span class="mb-2">Descrição:</span>
            <b-form-input ref="focusElem" name="descricao"  data-vv-as="Descrição" type="text" v-model="distribuirChecklist.descricao"  
            v-validate="'required'" :class="{'input': true, 'is-danger': errors.has('descricao') }" :disabled="distribuirChecklist.id != null"/>
            <span v-show="errors.has('descricao')" class="help is-danger">{{ errors.first('descricao') }}</span>               

            <span class="mb-2">Parceiro:</span>
                <b-form-select name="parceiro" @change="filterUsers()" :disabled="distribuirChecklist.id != null"
                      :options="parceiros"  v-validate="'required'" 
                      v-model="distribuirChecklist.parceiro" :class="{'input': true, 'is-danger': errors.has('parceiro') }"/>
                <span v-show="errors.has('parceiro')" class="help is-danger">{{ errors.first('parceiro') }}</span>
            
            <span class="mb-2">Usuário:</span>
                <b-form-select name="usuario"
                      :options="usuarios"  v-validate="'required'" :disabled="distribuirChecklist.id != null"
                      v-model="distribuirChecklist.usuario" :class="{'input': true, 'is-danger': errors.has('usuario') }">
                </b-form-select>
                <span v-show="errors.has('usuario')" class="help is-danger">{{ errors.first('usuario') }}</span>

            <span class="mt-2">Selecione os Checklists:  </span>
            <div class="divChecklists">
                <div class="divItemsChild">
                     <b-form-checkbox v-for="checklist in distribuirChecklist.checklists" :disabled="distribuirChecklist.id != null" v-model="checklist.selecionado" :value="true" :unchecked-value="false"  class="d-block" >                       
                            {{checklist.nome}}
                    </b-form-checkbox>
                </div>
            </div>
                      
            </form>
        </b-modal>

        
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
        },

        save(){
            this.$validator.validateAll().then((result) => {
                if (result) {
                     this.isLoadingModal = true;
                    this.distribuirChecklist.checklists = this.distribuirChecklist.checklists.filter(x => x.selecionado)
                    this.distribuirChecklist.idUsuario = this.distribuirChecklist.usuario; 
                    this.distribuirChecklist.idParceiro = this.distribuirChecklist.parceiro;
                    this.distribuirChecklist.idCliente = this.$store.state.user.idCliente;

                    let checklistDataJSON = "";
                    if(this.distribuirChecklist.checklists.length > 0){
                        checklistDataJSON = this.distribuirChecklist.checklists.map(c => { return {
                            checklistId: c.id,
                            nome: c.nome,
                            qtdePerguntas: c.qtdePerguntas || 0,
                            qtdePerguntasRespondidas: 0,
                            indicePerguntaAtual: 0,
                            concluido: false
                        }});
                    }
                    this.distribuirChecklist.dadosJson = JSON.stringify(checklistDataJSON);
                    console.log(JSON.stringify(this.distribuirChecklist));
                    this.service.save(this.distribuirChecklist).then(res => this.reloadData()).catch(err => {console.log(err); this.isLoadingModal = false;});
                }           
            });       
        },

        toDelete(row){
            let index = this.items.findIndex(r => r.id === row.id);
            this.items.splice(index,1);
            this.$refs.gridDistribuirChecklist.reload();
        },

        filterUsers(){
            //this.usuarios = this.usuarios.filter(x => x.parceiro == this.distribuirChecklist.parceiro)
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




