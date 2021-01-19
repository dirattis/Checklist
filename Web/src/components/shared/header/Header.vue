<template>
       <header>
            <div class="divLogo">
                <img  class="logo" src="static/img/logo_pequeno.png" alt="Logo Empresa" >
            </div>
            <div class="contentHeader">
				<div v-if="user.username" class="pull-right inline">
					<span  class="bem-vindo">
						Olá, seja bem-vindo <strong class="usuarioLogado">{{user.name}}</strong>
					</span>
					<b-dropdown no-caret class="d-inline-block" variant="link">
						<template slot="button-content">
								<b-button class="color-2 btnEnter">
									<i class="fa fa-user"></i>
								</b-button> 
						</template>
							<b-dd-item-btn @click.prevent="changePassword()">
									Alterar Senha <i class="fa fa-key"></i>
							</b-dd-item-btn>
							<b-dd-divider /> 
							<b-dd-item-btn @click.prevent="logoutSend()">
									Sair <i class="fa fa-sign-out-alt"></i>
							</b-dd-item-btn>
					</b-dropdown>			
				</div>
            </div>
        </header> 
</template>
<script>

import {Auth } from 'aws-amplify';
export default {
  
  props:{
      user: { type: Object },
  },

  methods:{
      logoutSend(){
            Auth.signOut()
            .then(res =>  { 
                console.log(res);
                let user = { name: '', email: '', token: '', username: '', perfil: '' }
                this.$store.dispatch('SET_USER', user);
				this.$router.push({ name: 'login'})
            })
            .catch(err => { console.log(err); });
	  },
	  changePassword(){
		  this.$router.push({ name: 'alterarSenha'});
	  }
  }
}
</script>
<style scoped>


header{
    float: left;
    background: #011d2b;
    width: 100%;
    height: 60px;    
} 

.divLogo{
    height:99%;
    width: 227px;
    background: #011d2b;
    float: left;
}

.contentHeader{
    width: 100%;
    height: 100%;    
}

.contentHeader > div{
    height: 100%;    
}

.contentHeader > div span{ 
    line-height: 48px;
}

.bem-vindo{
    display: inline-block;
    font-weight: 700;
    padding: 2px;
    text-align: center;   
    color: #fff;
    font-size: 18px;
}  

.logo{
    margin: auto;
    margin-top: 5px;
    display: block; 

}
.usuarioLogado{
    color: #028DB2
}
</style>

