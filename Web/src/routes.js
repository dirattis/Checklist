import Home                 from './components/home/Home.vue';
import Login                from './components/login/Login.vue';
import Empresa              from './components/empresa/Empresa.vue';
import Fornecedor             from './components/fornecedores/Fornecedor.vue';
import RedeInterna             from './components/redeInterna/redeInterna.vue';
import Usuario              from './components/usuario/Usuario.vue';
import ChecklistCrud        from './components/checklistCrud/ChecklistCrud.vue';
import Pergunta             from './components/pergunta/Pergunta.vue'
import Checklist            from './components/checklist/Checklist.vue';
import DistribuirChecklist  from './components/checklist/DistribuirChecklist.vue';
import QuestionFlow         from './components/questions/QuestionFlow.vue';
import Dashboard            from './components/dashboard/Dashboard.vue';
import ChangePassword       from './components/usuario/ChangePassword.vue';


// const Empresa             = () => System.import('./components/empresa/Empresa.vue');
// const Fornecedor            = () => System.import('./components/fornecedores/Fornecedor.vue');
// const Usuario             = () => System.import('./components/usuario/Usuario.vue');
// const ChecklistCrud       = () => System.import('./components/checklistCrud/ChecklistCrud.vue');
// const Pergunta            = () => System.import('./components/pergunta/Pergunta.vue');
// const Checklist           = () => System.import('./components/checklist/Checklist.vue');
// const DistribuirChecklist = () => System.import('./components/checklist/DistribuirChecklist.vue');
// const QuestionFlow        = () => System.import('./components/questions/QuestionFlow.vue');
// const Dashboard           = () => System.import('./components/dashboard/Dashboard.vue');
// const ChangePassword      = () => System.import('./components/usuario/ChangePassword.vue');

export const  routes = [
    { selected: false, name:'login', path: '/', component: Login, hiddenMenu:true, meta: { withoutAuthentication: true } },
    { selected: false, name:'alterarSenha',  hiddenMenu:true, path: '/alterarSenha', component: ChangePassword,  meta: { groups:['public'] } },
    { selected: false, name:'home', title: 'Home', icon: 'fa-home', path: '/home', component: Home, meta: { groups:['public'] } },    
    { selected: false, name:'empresas', title: 'Empresas', icon: 'fa-user', path: '/empresas', component: Empresa },     
    { selected: false, name:'usuarios', title: 'Usuários', icon: 'fa-user', path: '/usuarios', component: Usuario, meta: { groups:['public'] } },    
    { selected: false, name:'redeInterna', title: 'Rede Interna', icon: 'fa-id-badge', path: '/rede-interna', component: RedeInterna, meta: { groups:['public'] } },
    { selected: false, name:'fornecedores', title: 'Fornecedores', icon: 'fa-handshake', path: '/fornecedores', component: Fornecedor, meta: { groups:['public'] } },
    { selected: false, name:'perguntas', title: 'Perguntas', icon: 'fa-question', path: '/perguntas', component: Pergunta, meta: { groups:['public'] } },
    { selected: false, name:'checklist', title: 'Checklist', icon: 'fa-clipboard-list', path: '/checklist-crud', component: ChecklistCrud, meta: { groups:['public'] } },       
    { selected: false, name:'distribuirChecklist', title: 'Distribuir Checklist', icon: 'fa-sitemap', path: '/distribuir-checklist', component: DistribuirChecklist, meta: { groups:['public'] } },
    { selected: false, name:'statusPerguntas', title: 'Status Perguntas', icon: 'fa-tasks', path: '/statusPerguntas', component: Checklist, meta: { groups:['public'] } },
    { selected: false, name:'questions',  path: '/checklist', component: QuestionFlow, hiddenMenu:true, meta: { groups:['public'] } },
    { selected: false, name:'dashboard',  title: 'Dashboard', icon: 'fa-chart-line', path: '/dashboard', component: Dashboard,  meta: { groups:['public'] } },
    { selected: false, path: "*", component: Home }
];

