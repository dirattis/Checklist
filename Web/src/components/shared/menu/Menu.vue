<template>
<nav>    
    <ul>
      <li v-for="item in itemsForRole" :class="{selected: item.selected}"  @click="selectItem(item)"> 
        <router-link :to="item.path" v-if="!item.hiddenMenu">  
                <i class="fa fa-lg fa-fw" :class="item.icon"></i>
                <span class="menu-item-parent">{{item.title}}</span>
        </router-link>        
     </li>
    </ul>
     <span class="arrow-mini-menu color-2" data-action="minifyMenu"> <i class="fa fa-arrow-circle-left hit"></i> </span>                            
</nav>
</template>
<script> 
import { getMenuForRole } from '../../../shared';

export default {
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data(){
    return {
      itemsForRole: []
    }
  },
  created(){
     this.setItemsForRole(this.items);
  },
  watch: {
    items: function(newValue, oldValue) {
        this.setItemsForRole(newValue);
    },   
  },
  methods: {
    selectItem(menuItem){
      this.itemsForRole.forEach(x => x.selected = false);
      menuItem.selected = true;
    },

    setItemsForRole(items){
        if(items.length > 0){

          let perfil = this.$store.state.user.perfil;
          let menus = getMenuForRole(items, perfil);        

          this.itemsForRole = [];
          items.forEach(item => {
            if(menus.some(x => x == item.name))
              this.itemsForRole.push(item);
          });
        }
    }
  }
};
</script>
<style scope>
  
nav{
    background: #011d2b;
    height: calc(100% - 49px) ; 
    width:227px;
    float: left;    
}

nav ul{
    width: 100%;
    padding: 0;
    margin: 0;
    font-size: 13px;
    line-height: .5em;
    list-style: none;
    position: relative;
}

nav > ul > li > a {
    padding-top: 13px;
    padding-bottom: 13px;
    color: #bbc0cf;
    transition: background-color .2s ease-in-out 0s;
    font-size: 13px;
    line-height: normal;
    padding: 10px 10px 10px 11px;
    display: block;
    font-weight: 400;
    text-decoration: none!important;
    position: relative;
    background-color: transparent;
}

nav > ul > li >  a:hover{
  background:#313645;
  color:#fff
  }

.arrow-mini-menu{
    color: #e8efe7;
    float: right;
    border-bottom: 1px solid #302F2F;
    text-align: center;
    padding: 0;
    width: 36px;
    height: 30px;
    display: block;
    border-radius: 5px 0 0 5px;
    cursor: pointer;
    margin-top: 7px;
    font-size: 19px;
    transition: all .1s linear 0s;    
    line-height: 1.5;
}

.arrow-mini-menu:hover{
    background:#025A72;
    color:#E4E4E4;
   
}

.selected{
  background: #028DB2;  
}

.selected > a{
  color: #fff
}


</style>


