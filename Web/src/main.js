import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import VueLodash from 'vue-lodash'
import money from 'v-money'
import { routes } from './routes.js'
import Panel from './components/shared/panel/Panel.vue'
import './assets/css/site.css'
import './assets/css/fontawesome-all.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/js/page.js'
import Table from './components/shared/table/Table.vue'
import VueTheMask from 'vue-the-mask'
import VeeValidate, {Validator} from 'vee-validate'
import pt_BR from 'vee-validate/dist/locale/pt_BR'
import Vuex from 'Vuex'
import store from './store'
import awsConfig from './config/aws-exports.js'
import Amplify from 'aws-amplify'
import {routerBeforeEach} from './config/authorizationConfig'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import _ from 'lodash';
import VueUploadComponent from 'vue-upload-component';
import {validateCNPJ, validatePhone} from './validators.js';

Amplify.configure(awsConfig);

Vue.use(Vuex)
Vue.use(VueTheMask);
Vue.use(money);
Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(VueLodash);

Vue.component('panel', Panel);
Vue.component('app-table',Table);
Vue.component('loading',Loading);
Vue.component('file-upload',VueUploadComponent);

const router = new VueRouter({ 
  routes, 
  mode: 'history',
});

routerBeforeEach(router, store, routes);

Validator.localize('pt_BR', pt_BR)
Validator.extend('cnpj', validateCNPJ);
Validator.extend('phone', validatePhone);

Vue.use(VeeValidate);

Vue.filter('formatSize', function(value) {
  if (!value) return "";

  let resultSize = size;
  let size = parseFloat(value);
  let unitSize = "Bytes";
  let mb = 1024.0 * 1024.0;

  if (size > mb) {
    resultSize = size / mb;
    unitSize = "MB";
  } else if (size > 1024) {
    resultSize = size / 1024.0;
    unitSize = "KB";
  }

  return `${resultSize.toFixed(2)} ${unitSize}`;
})

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
