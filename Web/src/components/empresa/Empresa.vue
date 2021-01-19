<template>
  <panel title="Empresa">  
        

        <app-table ref="gridEmpresa" :hiddenHeads="hiddenHeads" :customHeads="customHeads" :data="items" :totalRows="items.length" 
            class="tableMain" @edit="edit"  :masks="masks" isCrud @deleteElement="toDelete"/>


         <b-modal id="addModal" size="md" ref="modalCadastro" :title="titleRegistrationModal" cancel-title="Cancelar" ok-title="Salvar"
                @shown="openModal()" @hidden="hideModal()" @ok="handleSubmit">
            <form @submit.prevent="save" ref="formModalCadastro">
                <span>
                    CNPJ:
                </span>
                <b-form-input v-mask="'##.###.###/####-##'"  type="text" ref="focusElem" v-model="empresa.cnpj"/>
       <span>
            Razão Social:
            </span>
            <b-form-input name="empresa.razaoSocial"  data-vv-as="Razão Social" type="text" v-model="empresa.razaoSocial"  v-validate="'required'" :class="{'input': true, 'is-danger': errors.has('empresa.razaoSocial') }" />
            <span v-show="errors.has('empresa.razaoSocial')" class="help is-danger">{{ errors.first('empresa.razaoSocial') }}</span>
            <span>
           Contato:
           </span>
            <b-form-input type="text" v-model="empresa.contato"/>
            <span>
            Telefone:
            </span>
            <input class="form-control" type="text" v-model="empresa.telefone" v-mask="'(##) ####-####'" />
               
            </form>
        </b-modal>

        
  </panel>
</template>

<script>
import CompanyService from '../../services/CompanyService'

export default {
    data(){
        return {     
            customHeads:[{ prop: 'razaoSocial', columnName: 'Razão Social' }], 
            hiddenHeads:['empresaId'], 
            masks:[{ prop: 'cnpj', mask: '##.###.###/####-##' }, { prop: 'telefone', mask: '(##) ####-####' }], 
            items:[],     
            empresa: { cnpj:'', razaoSocial:'', contato:'', telefone: '', empresaId: null },
            titleRegistrationModal: 'Nova Empresa',
            isLoadingModal: false
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
            this.$refs.gridEmpresa.reload();
            this.$refs.modalCadastro.hide();
        },

        openModal() {    
            this.errors.clear();          
             this.$refs.focusElem.focus();
        },

        hideModal(){
            
            this.empresa = { cnpj:'', razaoSocial:'', contato:'', telefone: ''};
            this.titleRegistrationModal = 'Nova Empresa';
        },

        edit(row){
            this.titleRegistrationModal = row.razaoSocial;
            this.service.get(this.$store.state.user.idCliente, row.id).then(res => 
            {
                this.$refs.modalCadastro.show();  
                this.empresa = res[0];               
            })
            .catch(err => console.log(err));  
        },   
        
        handleSubmit (evt) {
            
            evt.preventDefault();
            this.save();
        },

        save(){
            this.$validator.validateAll().then((result) => {
                if (result) {
                    this.service.save(this.empresa).then(res => this.reloadData()).catch(err => console.log(err));
                }           
            });       
        },

        toDelete(row){
            this.service.remove({id: row.id }).then(res => this.reloadData()).catch(err => console.log(err));
        },
  },

    created(){
            this.service = new CompanyService();
            this.service.get(this.$store.state.user.idCliente).then(res => this.items = res).catch(err => console.log(err));
        

              //this.items = [{empresaId: 1,cnpj: '25371475000115',razaoSocial: 'G3S',contato: 'Rodolfo Ferraz', telefone: '11964082323'  }];

            //);
         
         
    }
}
</script>

<style scoped>
    span, .custom-checkbox{
        margin-top:10px;
        display: inline-block
    }
</style>


