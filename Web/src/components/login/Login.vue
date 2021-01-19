<template>
	<panel>  
		<loading :active.sync="isLoadingModal"></loading>
		<div class="bg">
			 
			<b-modal size="sm" ref="alertModal" title="Atenção" ok-only >{{alertMessage}}</b-modal>
			<div class="content-center">
				<div class="divLogo">
					<img  class="logo" src="static/img/logo-g3s-horizontal.png" alt="Logo Empresa" >
				</div>
				<div class="login clearfix" v-if="!youForgotPassword">  
					<b-input type="text" placeholder="e-mail"  class="input-login email fab" v-model="login" @keyup.native="submitLogin($event)"/>				
					<b-input type="password" placeHolder="senha" class="input-login" v-model="password" @keyup.native="submitLogin($event)" />		
					<p class="forgot" @click="forgotPassword()" >Esqueceu sua senha?</p>	
					<b-button class="btnEnter" @click.prevent="loginSend()" :disabled="!this.login || !this.password">
						Login </i>
					</b-button> 									
				</div>
				<div class="login clearfix"  v-else>
					<b-input type="text" placeholder="e-mail"  class="input-login email fab" v-model="login" @keyup.native="submitLogin($event)"/>	
					<b-input type="text" placeHolder="código" class="input-login" v-model="code" @keyup.native="submitLogin($event)" />			
					<b-input type="password" placeHolder="senha" class="input-login" v-model="password" @keyup.native="submitLogin($event)" />		

					<div class="d-flex">					
					<b-button class="btnEnter" @click.prevent="forgotPassword()" >
						Voltar
					</b-button>	
					<b-button class="btnEnter" @click.prevent="loginSend()" :disabled="!this.login || !this.password || !this.code">
						Alterar Senha 
					</b-button>
					</div>
				</div>
				<div  class="copyright clearfix">
				<p class="footer">© Todos os direitos reservados G3S </p>
				</div>
			</div>
		</div>
	</panel>
</template>
<script>
import {Auth } from 'aws-amplify';
import UserService from '../../services/UserService';

export default {
	data(){
		return {
			login:'',
			password:'',
			code:'',
			alertMessage:'',
			isLoadingModal:false,
			youForgotPassword: false
		}
	},

	created() {
		this.service = new UserService();

	},

	methods:{
		submitLogin(e){
			if (e.keyCode == 13) {
				this.loginSend()
			}
		},	
		
		forgotPassword(){
			this.youForgotPassword = !this.youForgotPassword; 
			// Auth.forgotPassword(this.login)
			// .then(data => {

			// })
			// .catch(err => {
			// 	let message = '';
			// 	switch (err.code) {
			// 		case "UserNotFoundException":
			// 		message = "Usuário não encontrado.";
			// 			break;																
			// 		default:
			// 		message = err.message;
			// 		break;
			// 	}

			// 	this.alertMessage = message;
			// 	this.$refs.alertModal.show();
				
			// });
		},
		loginSend()
		{
			this.isLoadingModal = true;
			Auth.signIn(this.login, this.password)
                .then(userAuth =>  { 
					console.log(userAuth); 					        
					
					this.service.getFromUserCognito(userAuth.username)
					.then(userBD => 
					{ 
						this.isLoadingModal = false;
						console.log(userBD); 
						if(userBD){
							let dataUser = userAuth.signInUserSession.idToken;
							let user = { 	name: dataUser.payload.given_name,
									email: dataUser.payload.email,
									token: dataUser.jwtToken,
									username: userAuth.username,
									perfil: userBD[0].perfil.nome,
									idCliente: userBD[0].idCliente,
									idUsuario: userBD[0].id
							}

							this.$store.dispatch('SET_USER', user);					

							this.$router.push({ name: 'home'});
						}
						else{
							this.alertMessage = "Usuário cadastrado incorretamente. Favor informar o suporte.";
							this.$refs.alertModal.show();
						}

					}).catch(err => { 
						this.isLoadingModal = false; 
						console.log(err); 
					});

					
				}).catch(err => { 
					this.isLoadingModal = false;
					let message = '';
					console.log(err); 
					switch (err.code) {
						case "NetworkError":
						message = "Infelizmente você está sem internet. Por favor tente novamente mais tarde.";
							break;
						case "UserNotConfirmedException":
							message = "Usuário ainda não confirmou seu e-mail. \n Por favor confirme.";
							break;
						case "UserNotFoundException":
						case "NotAuthorizedException":
						message = "Usuário e/ou senha inválidos. \n Tente novamente.";
							break;																
						default:
						message = err.message;
						break;
              		}
					
					this.alertMessage = message;
					this.$refs.alertModal.show();
				});
		}
	}
};
</script>

<style scoped>
	.login{
        border: 0;
        padding: 10px;		
		background: #cfd8dd;
		margin: auto;
		margin-top: 20px
    }

	.copyright{
        border: 0;
        padding: 10px;		
		background: #cfd8dd;
		margin: auto;
    }

	.input-login{    
        width:100%; 
        margin-bottom: 10px;
		background: #8eb4c7;
		color: #016297;	
		font-size: 1.2rem;

	}

	.email{
		margin-top: 10px
	}
	.footer{
		margin: 15px 0 0 0;
		font: 12px  arial;
		text-align: center
	}

	.forgot
	{
		font: italic 12px  arial;
	 	float: right;
		 cursor: pointer
	}
	

	::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
		color: #c1d3dd;
		opacity: 1; /* Firefox */
	}

	:-ms-input-placeholder { /* Internet Explorer 10-11 */
	color: #c1d3dd
	}

	::-ms-input-placeholder { /* Microsoft Edge */
	color: #c1d3dd
	}
	
	.btnEnter{
		background: #016297;
		width: 100%;
		cursor: pointer
	}

	.bg{
		width: 100%;
		height: 100%;
        background-image: url('../../../static/img/bk_pagina_inicial.png');
		display: flex;
	}
	.divLogo
	{    
		width: 227px;
		background:transparent;
		margin: auto
	}

	.content-center{
		margin: auto;
		width: 20%;		
		min-width: 300px;
	}
</style>


