<template>
  <div class="vld-parent divParentTable">   
    <loading :active.sync="isLoading" :is-full-page="false"></loading>
    <b-modal
      id="confirmImport"
      v-if="canImport"
      size="sm"
      ref="modalConfirmImport"
      title="Importar"
      cancel-title="Não"
      ok-title="Sim"
      @ok="importSave()"
    >Deseja realmente importar os registros do arquivo?</b-modal>

    <b-modal
      v-if="canDeleteData"
      id="confirm"
      size="sm"
      ref="modalConfirm"
      title="Excluir"
      cancel-title="Não"
      ok-title="Sim"
      @ok="deleteElement()"
      @cancel="cancel()"
    >Deseja realmente excluir o registro?</b-modal>

    <b-button v-if="canAddData" class="color-2 btn-inline" v-b-modal.addModal>
      <i class="fa fa-plus mr-1"></i>Adicionar
    </b-button>
    <file-upload v-if="canImport"
          class="btn btn-primary color-2 btn-inline"
          extensions="xlsx"
          accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          :multiple="false"
          v-model="files"
          ref="uploadImport"
        >
        <i class="fas fa-upload mr-1"></i>
        Importar</file-upload>
        <span v-if="files.length > 0">{{files[0].name}} - </span>
  <b-button v-if="files.length > 0" class="color-2 btn-inline" v-b-modal.confirmImport>
        <i class="fa fa-save mr-1"></i>
      </b-button>
    <b-input v-if="filter" placeholder="Filtro" class="filter" v-model="filtro"/>
    <div class="divTable">
      
      <table :id="tableId" :class="classObject" class="table-responsive-md table">
        <thead class="thead-dark headerBackGround">
          <tr v-if="heads.length == 0">
            <th class="p-1" style="width:40%;">{{finalMessageEmptyRows}}</th>
            <!-- <th class="p-1" >{{messageEmptyRows}}</th> -->
          </tr>
          <tr v-else :style="{cursor: sorting ? 'pointer' : 'default'}">
            <th class="p-1" v-for="(head,index) in heads" :key="head.head.prop"   @click="sortManager(head, index)" :style="index == 0 ? 'width:40%' : ''" >
            <!-- <th class="p-1" v-for="(head,index) in heads" :key="head.head.prop"   @click="sortManager(head, index)" > -->
              {{head.head.columnName}}
              <i v-if="sorting" class="fa sortIcon" :class="head.classSort"></i>
            </th>
            <th v-if="canDeleteData || canEditData || canDetailData" class="p-1" style="width:100px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" @dblclick="edit(row)">
            <td class="p-1" v-for="nmProp in heads" :key="nmProp.head.prop">
              <span v-if="nmProp.head.mask">
                <!-- <the-mask mask="##.###.###/####-##" masked="false">{{row[nmProp.head.prop]}}</the-mask> -->
                <span>{{row[nmProp.head.prop]}}</span>
                <input v-show="false" v-mask="nmProp.head.mask" v-model="row[nmProp.head.prop]">
              </span>
              <span :title="row[nmProp.head.prop]" v-else>
                {{row[nmProp.head.prop] === true ? 'Sim'
                : (row[nmProp.head.prop] === false ? 'Não' : row[nmProp.head.prop]
                ) }}
              </span>
            </td>
            <td class="p-1">
              <b-button
                v-if="canDeleteData"
                size="sm"
                variant="danger"
                class="btnEditRow"
                @click="confirmDelete(row)"
              >
                <i class="fa fa-trash"></i>
              </b-button>
              <b-button
                v-if="canEditData"
                size="sm"
                variant="primary"
                class="btnEditRow color-2"
                style="margin-right:5px"
                @click="edit(row)"
              >
                <i class="fa fa-edit"></i>
              </b-button>
              <b-button
                v-if="canDetailData"
                size="sm"
                variant="primary"
                class="btnEditRow color-2"
                style="margin-right:5px"
                @click="edit(row)"
              >
                <i class="fa fa-eye"></i>
              </b-button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr></tr>
        </tfoot>
      </table>
      <b-pagination
        id="paginationStyle" v-if="pagination" :aria-controls="tableId" :align="paginationAlign" :total-rows="totalRows" 
        v-model="currentPage" :per-page="perPage" @input="paginar()"
      ></b-pagination>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import moment from 'moment/min/moment-with-locales';
moment.locale('pt-br');
import XLSX from 'xlsx';

export default {
  data() {
    return {
      isLoading: false,
      currentPage: 1,
      colunaOrdenada: "",
      filtro: "",
      heads: [],
      rows: [],
      rowToDelete: null,
      canAddData: false,
      canEditData: false,
      canDetailData: false,
      canDeleteData: false,
      files: [],
      finalMessageEmptyRows: ''
    };
  },

  props: {
    data: Array,
    customHeads: Array,
    hiddenHeads: Array,
    customData: Array,
    masks: Array,
    bordered: { type: Boolean, default: false },
    hover: { type: Boolean, default: true },
    striped: { type: Boolean, default: true },
    tableId: { type: String, default: "tblMain" },
    pagination: { type: Boolean, default: true },
    sorting: { type: Boolean, default: true },
    filter: { type: Boolean, default: true },
    paginationAlign: { type: String, default: "center" },
    messageEmptyRows: { type: String, default: "" },
    totalRows: { type: Number, required: true },
    canImport: { type: Boolean, default: false },
    isCrud: { type: Boolean, default: false },
    canAdd: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canDetail: { type: Boolean, default: false },
    perPage: { type: Number, default: 10 },
    isLoadingInit: { type: Boolean, default: false }
  },

  created() {
    if (this.isCrud) {
      this.canAddData = true;
      this.canEditData = true;
      this.canDeleteData = true;
    } else {
      this.canAddData = this.canAdd;
      this.canEditData = this.canEdit;
      this.canDeleteData = this.canDelete;
    }

    this.isLoading = this.isLoadingInit;

    this.canDetailData = this.canDetail;
    this.loadData(this.data);
  },
  
  watch: {
    filtro: function(newFilter, oldFilter) {
      this.filtrar();
    },
    data: function(newData, oldData){
          
        this.isLoading = false;      
        if(newData.length == 0)
          this.finalMessageEmptyRows = this.messageEmptyRows; 

        this.loadData(newData);
    }
  },

  computed: {
    classObject: function() {
      return {
        "table-bordered": this.bordered,
        "table-hover": this.hover,
        "table-striped": this.striped
      };
    }
    // widthColumn: function(){
    //     let headAcoesPercent = this.editable ? 15 : 0;
    //     return `width: ${((100 - headAcoesPercent) / this.heads.length)}%`;
    // }
  },

  methods: {

    loadData(data){
        this.rows = data.filter((d, i) => i < this.perPage);
        if(this.heads.length == 0)
          this.heads = this.getHeader();

        this.applyCustomData();

    },

    applyCustomData(){
        if(this.customData){
            this.data.map(d => {
                            this.customData.forEach(cd => {
                                if(cd.prop in d){
                                    if(d[cd.prop]){
                                      let newValue = null;
                                      switch (cd.type) {
                                        case 'child':   
                                          //Preenche com o valor de alguma propriedade filha
                                          newValue = d[cd.prop][cd.value] || d[cd.prop];
                                          break;
                                        case 'date':  
                                          if(/^\d{2}\/\d{2}\/\d{4}$/.test(d[cd.prop]))
                                            newValue = d[cd.prop];
                                          else
                                            newValue = moment(d[cd.prop]).format(cd.value);
                                          break;
                                        default:
                                          newValue = d[cd.prop];
                                          break;
                                      }

                                      d[cd.prop] = newValue;
                                    }
                                }
                                return d;
                            });
                        });
        }
    },


    getHeader() {
      let result = [];
      if (this.rows && this.rows.length > 0)
        result = Object.keys(this.rows[0]).map((key, index) => {
          let objReturn = {};
          let objHead = {};

          if (this.customHeads) {
            let customHead = this.customHeads.find(x => x.prop == key);

            if (customHead) {
              objHead.prop = customHead.prop;
              objHead.columnName = customHead.columnName;
              objReturn.head = objHead;
            } else {
              objHead.prop = key;
              objHead.columnName = key[0].toUpperCase() + key.substring(1);
              objReturn.head = objHead;
            }
          } else {
            objHead.prop = key;
            objHead.columnName = key[0].toUpperCase() + key.substring(1);
            objReturn.head = objHead;
          }

          if (this.masks) {
            let maskObj = this.masks.find(x => x.prop == key);
            if (maskObj) objReturn.head.mask = maskObj.mask;
          }

          if (index == 0) {
            this.colunaOrdenada = index;
            objReturn.classSort = "fa-sort-up";
            return objReturn;
          } else {
            objReturn.classSort = "fa-sort";
            return objReturn;
          }
        });

      if (this.hiddenHeads)
        this.hiddenHeads.forEach(
          hid => (result = result.filter(h => h.head.prop !== hid))
        );

      return result;
    },

    filtrar() {
      let dadosFiltrados = this.data.filter(
        obj =>
          Object.values(obj)
            .join()
            .replace(/,/g, "")
            .toLowerCase()
            .indexOf(this.filtro.toLowerCase()) > -1
      );
      this.rows = dadosFiltrados.filter((d, i) => i < this.perPage);
    },

    sortManager(head, novoIndex, keepSorting) {
      if (!this.sorting) return;

      if (this.heads[this.colunaOrdenada].head != head.head) {
        this.heads[this.colunaOrdenada].classSort = "fa-sort";
        this.colunaOrdenada = novoIndex;
      }

      let isDate = false;

      if(this.customData){
        let dates = this.customData.filter(cd => cd.type == 'date');
        isDate = dates.some(x => x.prop == head.head.prop);
      }

      switch (head.classSort) {
        case "fa-sort":
        case "fa-sort-up":
          if (keepSorting) {
            let dataAux = this.data.sort((a, b) =>
              this.sort(a[head.head.prop], b[head.head.prop], isDate)
            );
            this.data = dataAux.reverse();
          } else {
            head.classSort = "fa-sort-down";
            this.data = this.data.sort((a, b) =>
              this.sort(a[head.head.prop], b[head.head.prop], isDate)
            );
          }
          break;
        case "fa-sort-down":
        default:
          if (keepSorting) {
            this.data = this.data.sort((a, b) =>
              this.sort(a[head.head.prop], b[head.head.prop], isDate)
            );
          } else {
            head.classSort = "fa-sort-up";
            let dataAux = this.data.sort((a, b) =>
              this.sort(a[head.head.prop], b[head.head.prop], isDate)
            );
            this.data = dataAux.reverse();
          }
          break;
      }
      this.currentPage = 1;
      this.rows = this.data.filter((d, i) => i < this.perPage);
    },

    sort(a, b, isDate) {

      if(isDate)
      {
        a = moment(a,"DD/MM/YYYY").toDate();
        b = moment(b,"DD/MM/YYYY").toDate();
      }      

      if (!a) return -1;
      if (!b) return 1;

      if (!a.localeCompare) return a - b;

      return a.localeCompare(b);
    },

    paginar() {
      let skip = (this.currentPage - 1) * this.perPage;
      let take = skip + this.perPage;
      this.rows = this.data.filter(function(d, i) {
        return i >= skip && i < take;
      });
    },

    edit(row) {
      row = _.cloneDeep(row);
      this.$emit("edit", row);
    },

    deleteElement() {
      if (this.rowToDelete) {
        let row = _.cloneDeep(this.rowToDelete);
        this.$emit("deleteElement", row);
      }
    },

    cancel() {
      this.rowToDelete = null;
    },

    confirmDelete(row) {
      this.rowToDelete = row;
      this.$refs.modalConfirm.show();
    },

    reload(keepSorting = true) {
      if (this.heads.length > 0)
        this.sortManager(this.heads[0], 0, keepSorting);
    },

    importSave(){
      let reader = new FileReader();
      reader.onloadend = readerOnloaded.bind(this);

      reader.readAsArrayBuffer(this.files[0].file);
    }
  },

  mounted() {
    if (this.heads.length > 0) this.sortManager(this.heads[0], 0, false);
  }

  
};

var readerOnloaded = function(e){
        let arrayBuffer = e.target.result;

        let data = new Uint8Array(arrayBuffer);
            let arr = new Array();
            for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            let bstr = arr.join("");
 
            /* Call XLSX */
            let workbook = XLSX.read(bstr, {
                type: "binary"
            });
 
            /* DO SOMETHING WITH workbook HERE */
            let first_sheet_name = workbook.SheetNames[0];
            /* Get worksheet */
            let worksheet = workbook.Sheets[first_sheet_name];
            let importData = XLSX.utils.sheet_to_json(worksheet);
            console.log(importData);

            this.$emit("import", importData);
      };
</script>

<style>
.divParentTable{
  min-height: 100px;
}

.sortIcon {
  margin-top: 5px;
}

.divTable {
  margin-top: 15px;
}

.headerBackGround th {
  background-color: #011d2b !important;
}

.btn-inline {
  display: inline-block;  
}

.file-uploads label {
  cursor: pointer;
}

.btnEditRow {
  width: 32px;
  float: right;
}

.text-large {
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow: hidden;
}
.filter {
  float: right;
  width: 33%;
  margin-bottom: 10px;
  min-width: 150px;
}
.table td {
  vertical-align: middle;
}

#paginationStyle > li > a {
  background: transparent;
}
#paginationStyle > .disabled > .page-link {
  background: #011d2b;
  color: #fff;
}

#paginationStyle > .page-item.active > .page-link.btn-primary {
  background: #028db2;
  border-color: transparent;
  color: #fff;
}
</style>
