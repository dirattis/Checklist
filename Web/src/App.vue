<template>
  <div id="app">
    <app-header :user="user" v-show="user.username"></app-header>    
    <app-menu v-show="user.username" :items="user.username ? routes : []"></app-menu>    
    <main :class="{ 'main-lg' : !user.username }">
      <router-view></router-view>
    </main>  
    <footer v-if="user.username">
            <span class="txt-footer">G3S © {{year}}</span>
    </footer>
  </div>
</template>

<script>
import Menu from './components/shared/menu/Menu.vue';
import Header from './components/shared/header/Header.vue';
import Login  from './components/login/Login.vue'
import { routes } from './routes.js';


export default {
  name: 'app',  

  components:{
    'app-menu': Menu,
    'app-header' : Header
  },

  created(){
    //console.log(this.$store.getters.init);
  
  },

  data () {
    return {
        routes,
        year: new Date().getFullYear()
    }
  },

  computed: {    
    user(){
      return this.$store.state.user;
    }  
  }
}
</script>

<style scoped>
  #app{
    height: 100%;
    overflow: hidden;
  }

  footer{
    background: #011d2b;
    height: 32px;
    float: left;
    width: calc(100% - 227px);    
    text-align: center
    
}

.minified footer{
    width: calc(100% - 45px);
}

.txt-footer{
  color: #fff;  
}

main{
  overflow: auto;
}

</style>
