<template>
	<panel>  
		<b-modal
			id="alerta"
			size="sm"
			ref="modalAlertaPermissao"
			title="Atenção"
			ok-only
			>Você não possui permissão para acessar a tela solicitada.</b-modal>
			<img src="static/img/home.svg" class="imgHome" />    
			
	</panel>
</template>
<script>
export default {
	mounted(){
		if (this.$route.params && this.$route.params.showMessage) {
			this.$refs.modalAlertaPermissao.show();
  		}
	}
}
</script>

<style>
	.imgHome{
		width: 100%;
		height: 100%;	
	}
</style>


