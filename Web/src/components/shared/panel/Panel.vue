<template>
  <div :class="['panel', {'no-spaces' : !user.username}]">
      <h2 class="panel-title">{{title}}</h2>
      <div :class="['content-panel', 'clearfix', {center : !user.username}, {'no-spaces'  : !user.username}]">          
        <slot></slot>
      </div>
  </div>
</template>

<script>
export default {
    props: {
        title: String       
    },

    computed: {
        user(){
        return this.$store.state.user;
        }  
    }
}
</script>

<style scoped>
    .panel{
    /* border: 1px solid #1B374E; */
        background: #fff;
        margin: 15px 15px 0 15px;
        padding: 5px;
        border-radius: 15px;
        display: flex;
        flex-direction: column;  
        height: calc(100% - 32px);      
    }
    .panel-title{
        background: -webkit-linear-gradient(#0286cb,  #001c2b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        /* color: #0a6a92 */
    }
    .content-panel{
        width: 100%;
        padding: 10px;
        height: 100%;
    }
    .no-spaces{
        margin: 0;
        padding: 0
    }
    .center{
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
