<template>
  <div class="highcharts">
    <b-modal
      id="mensagem"
      size="sm"
      ref="modalMensagem"
      :title="titleModalMensagem"
      :ok-only="true"    
    >{{mensagemModal}}</b-modal>

  <div id="divHeader">
     <b-button class="color-2 float-right" @click="navigatedCustomize = !navigatedCustomize">
            <i v-if="navigatedCustomize" class="fas fa-chevron-left"></i>
            {{navigatedCustomize ? 'Voltar' : 'Customizar'}}
            <i
              v-if="!navigatedCustomize"
              class="fas fa-chevron-right"
            ></i>
          </b-button>
          </div>
          
    <highcharts v-show="!navigatedCustomize" :options="chartOptionsParceiroRegional" ref="chartParceiroRegional"></highcharts>
    <highcharts v-show="!navigatedCustomize" :options="chartOptionsScoreRegionalUltimoAno"></highcharts>
    
       <b-form inline @submit.prevent="getDataToChart" v-show="navigatedCustomize">

         <span class="ml-2">Visualizar:</span>
         <b-form-select  ref="focusElem"
          name="tipoDadoVisualizar"  data-vv-as="Visualizar"
          :options="tipoDadoVisualizar" class="mb-2 mr-sm-2 mb-sm-0 ml-2"
          v-validate="'required'"
          v-model="dash.idTipoDado"
          :class="{'input': true, 'is-danger': errors.has('tipoDadoVisualizar') }"
        />
        
        <span class="ml-2">Agrupado Por:</span>
         <b-form-select
          name="tipoAgrupamento"  data-vv-as="Agrupado Por"
          :options="agrupamentos" class="mb-2 mr-sm-2 mb-sm-0 ml-2"
          v-validate="'required'"
          v-model="dash.agrupamento"
          :class="{'input': true, 'is-danger': errors.has('tipoAgrupamento') }"
        />

        <span class="ml-2">Período De:</span>
        <b-form-input
          name="periodoDe" class="mb-2 mr-sm-2 mb-sm-0 ml-2"
          data-vv-as="Período De"
          type="date"
          v-model="dash.dataDe"
          v-validate="'required'"
          :class="{'input': true, 'is-danger': errors.has('periodoDe') }"
        />

        <span class="ml-2">Até:</span>
        <b-form-input
          name="periodoAte" class="mb-2 mr-sm-2 mb-sm-0 ml-2"
          data-vv-as="Período Até"
          type="date"
          v-model="dash.dataAte"
          v-validate="'required'"
          :class="{'input': true, 'is-danger': errors.has('periodoAte') }"
        />
        
        <b-button type="submit" class="btn btn-primary color-2">Carregar</b-button>
      </b-form>
      <highcharts id="chartCustom" v-show="navigatedCustomize" :options="chartOptionsCustom" ref="chartOptionsCustom"></highcharts>
  </div>
</template>

<script>
import DashboardService from "../../services/DashboardService";
import { Chart } from "highcharts-vue";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import LoadDrillDown from "highcharts/modules/drilldown";

Highcharts3D(Highcharts);
LoadDrillDown(Highcharts);

export default {
  components: {
    highcharts: Chart
  },

mounted(){
  this.$refs.chartParceiroRegional.chart.showLoading("<img src='static/img/spinner.gif' />");
   this.service
      .getPartinersRegion(this.$store.state.user.idCliente)
      .then(res => {
        console.log(res);
        this.$refs.chartParceiroRegional.chart.hideLoading();
        if (res) {
          this.chartOptionsParceiroRegional.series[0].data = res.map(item => {
            return {
              name: item.regiao,
              y: item.qtdeParceiros,
              drilldown: item.idRegiao
            };
          });
        }
      })
      .catch(err => {
        this.$refs.chartParceiroRegional.chart.hideLoading();
        console.log(err);
      });
},
  created() {
   // this.$refs.chartParceiroRegional.showLoading("Carregando...");
    this.service = new DashboardService();
   this.tipoDadoVisualizar = [{ value: 1, text: 'Score'}];
   this.agrupamentos = [{ value: 1, text: 'Região'}]; // { value: 2, text: 'UF'}
  },
  methods: {
    getDataToChart(){
      this.$validator.validateAll().then(result => {
        if (result) {
          // if (this.pesos.length == 0 || !this.equalstotal) {
          //   return;
          // }
          this.$refs.chartOptionsCustom.chart.showLoading("<img src='static/img/spinner.gif' />");
          this.service
            .getCustomData(this.$store.state.user.idCliente, this.dash.agrupamento, this.dash.dataDe, this.dash.dataAte)
            .then(res => {
              console.log(res);
              this.$refs.chartOptionsCustom.chart.hideLoading();
              if (res) {
                this.chartOptionsCustom.title.text = 'Média Score Por Região';
                this.chartOptionsCustom.xAxis.categories =  res.map(item => `${item.mes}/${item.ano}`);

                console.log(this.chartOptionsCustom.xAxis.categories);
               
               let dataNulls = [];
               res.forEach(item => {
               if(!item.regiao){
                 dataNulls.push(null);
                 this.chartOptionsCustom.series.forEach(s => s.data.push(null));
                 return;
               }

                let serieExistente = this.chartOptionsCustom.series.find(x => x.name == item.regiao);
                if(serieExistente){
                  serieExistente.data.push(item.score);
                  return;
                }

                  this.chartOptionsCustom.series.push(
                      {
                        name: item.regiao,
                        data: [...dataNulls, item.score]
                      });
               });
                console.log( this.chartOptionsCustom.series);
              }
            })
            .catch(err => {
              console.log(err);
              
            });
        }
        else{
          this.titleModalMensagem = 'Alerta';
          this.mensagemModal = 'Preencha os campos obrigatórios';
          this.$refs.modalMensagem.show();
        }
      });
    }
  },
  data() {

    let contextVue= this;
    return {
      titleModalMensagem: 'Alerta',
      mensagemModal: '',
      dash: {},
      tipoDadoVisualizar: [],
      agrupamentos: [],
      navigatedCustomize: false,
      chartOptionsParceiroRegional: {
        chart: {
          type: "pie",
          options3d: {
            enabled: true,
            alpha: 45,
            beta: 0
          },
          events: {
            
            drilldown: function(e) {
              if (!e.seriesOptions) {

                var chart = this;
                 chart.showLoading("<img src='static/img/spinner.gif' />");
        
                contextVue.service.getPartinersUf(
                    contextVue.$store.state.user.idCliente,
                    e.point.drilldown
                  )
                  .then(res => {
                    if (res) {
                      chart.hideLoading();

                      let series = { name: e.point.name, id: e.point.name, data: res.map(x => {
                          return [`${x.uf} (${x.sigla})`, x.qtdeParceiros];
                      })};

                      chart.addSeriesAsDrilldown(e.point, series);
                    }
                  })
                  .catch(err => {
                    chart.hideLoading();
                    console.log(err);
                  });
              }
            }
          }
        },
        title: {
          text: "Parceiros Por Região"
        },
        tooltip: {
          pointFormat:
            "<b> {point.y} Parceiro(s) - {point.percentage:.1f}%</b>"
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            depth: 35,
            dataLabels: {
              enabled: true,
              format: "{point.name}"
            }
          }
        },
        series: [
          {
            type: "pie",
            name: "Parceiro(s)",
            data: []
          }
        ],
        drilldown: {
          series: []
        },
        credits: {
          enabled: false
        },
        lang: {
          drillUpText: '< Voltar'
        }
      },
      chartOptionsCustom: {
        chart: {
          type: "line",
          options3d: {
            enabled: false
          }
        },
        title: {
          text: ""
        },
        tooltip: {
          pointFormat:
            "<b> {point.y} {series.name} - {point.percentage:.1f}%</b>"
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        yAxis: {
          title: {
              text: 'Score'
          }
        },
        xAxis: {
          categories: []
        },
        series: [],
        credits: {
          enabled: false
        }
      },

      chartOptionsScoreRegionalUltimoAno: {
        chart: {
          type: "column",
          options3d: {
            enabled: false
          }
        },
        title: {
          text: "Média Score Regional Último Ano"
        },
        tooltip: {
          pointFormat:
            "<b> {point.y} {series.name} - {point.percentage:.1f}%</b>"
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        xAxis: {
          categories: [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez"
          ]
        },
        series: [
          {
            name: "Curitiba",
            data: [8.2]
          },
          {
            name: "Rio de Janeiro",
            data: [7.1]
          },
          {
            name: "São Paulo",
            data: [8.9]
          },
          {
            name: "Bahia",
            data: [6.5]
          },
          {
            name: "Paraná",
            data: [8.7]
          },
          {
            name: "Manaus",
            data: [6.9]
          }
        ],
        credits: {
          enabled: false
        }
      }
    };
  }
};
</script>

<style>
.highcharts > div {
  display: inline-block;
  width: 49%;
}

#chartCustom {
   width: 100% !important;
   margin-top: 10px
}

.highcharts-loading-inner{
  top:15% !important;
}

#divHeader{
  display: block;
  width: 100%;
      min-height: 50px;
    margin: 10px 10px 0 0;
    padding-right: 10px;
}
</style>
