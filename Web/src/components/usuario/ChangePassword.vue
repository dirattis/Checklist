<template>
  <panel title="Alterar Senha">
    <b-modal size="sm" ref="alertModal" :title="alertTitle" ok-only @ok="toHome()">{{alertMessage}}</b-modal>
    <form @submit.prevent="changePassword" ref="formModalCadastro">
      <span>Senha Antiga:</span>
      <b-form-input
        class="input"
        data-vv-as="Senha Antiga"
        name="oldPassword"
        v-model="oldPassword"
        @keyup.native="submit($event)"
        v-validate="'required|min:6'"
        :class="{'input': true, 'is-danger': errors.has('oldPassword') }"
      />
      <div
        v-show="errors.has('oldPassword')"
        class="help is-danger"
      >{{ errors.first('oldPassword') }}</div>

      <span>Nova Senha:</span>
      <b-form-input
        type="password"
        name="newPassword"
        data-vv-as="Nova Senha"
        class="input"
        v-model="newPassword"
        @keyup.native="submit($event)"
        v-validate="'required|min:6'"
        :class="{'input': true, 'is-danger': errors.has('newPassword') }"
      />
      <div
        v-show="errors.has('newPassword')"
        class="help is-danger"
      >{{ errors.first('newPassword') }}</div>

      <span>Confirme a Senha:</span>
      <b-form-input
        type="password"
        class="input"
        data-vv-as="Confirme a Senha"
        name="confirmationNewPassword"
        v-model="confirmationNewPassword"
        @keyup.native="submit($event)"
        v-validate="'required|min:6'"
        :class="{'input': true, 'is-danger': errors.has('confirmationNewPassword') }"
      />
      <div
        v-show="errors.has('confirmationNewPassword')"
        class="help is-danger"
      >{{ errors.first('confirmationNewPassword') }}</div>
      <b-button type="submit" class="color-2 btnEnter">Salvar</b-button>
    </form>
  </panel>
</template>
<script>
import { Auth } from "aws-amplify";
//import { Validator } from "vee-validate";

// const passwordEqualsValidator = {
//   modelPasswords: null,
//   getMessage(field, args) {
//     if (this.modelPasswords.confirmationNewPassword != this.modelPasswords.newPassword)
//         return "Nova senha deve ser igual à confirmação.";
//   },
//   validate(form, args) {
//       console.log(form);
//     this.modelPasswords = form;

//     if (this.modelPasswords.confirmationNewPassword != this.modelPasswords.newPassword)
//       return false;

//     return true
//   }
// };

// Validator.extend('passwordEquals', passwordEqualsValidator);

export default {
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmationNewPassword: "",
      alertMessage: "",
      alertTitle: ""
    };
  },

  methods: {
    toHome() {
      if (this.alertTitle != "Atenção") this.$router.push({ name: "home" });
    },

    submit(e) {
      if (e.keyCode == 13) {
        this.changePassword();
      }
    },
    changePassword() {
      this.$validator.validateAll().then(result => {
        if (result) {
          if (this.confirmationNewPassword != this.newPassword) {
            this.alertTitle = "Atenção";
            this.alertMessage = "Nova senha deve ser igual à confirmação.";
            this.$refs.alertModal.show();
            return;
          }

          Auth.currentAuthenticatedUser()
            .then(user => {
                console.log(user);
              return Auth.changePassword(
                user,
                this.oldPassword,
                this.newPassword
              );
            })
            .then(data => { console.log(data); 
                if(data == 'SUCCESS'){
                    this.alertTitle = "Parabéns";
                    this.alertMessage = 'Senha alterada com sucesso!';
                    this.$refs.alertModal.show();
                }
            })
            .catch(err => {
              console.log(err);
              let message = "";
              switch (err.code) {
                case "InvalidParameterException":
                case "InvalidPasswordException":
                  message = "A senha deve conter no mínimo 6 caracteres, sendo letra(s) e número(s).";
                  break;
                  case "NotAuthorizedException":
                  message = "Senha Inválida. Por favor verifique e tente novamente.";
                  break;
                default:
                  message = err.message;
                  break;
              }
              
              this.alertTitle = "Atenção";
              this.alertMessage = message;
              this.$refs.alertModal.show();
            });
        }
      });
    }
  }
};
</script>

<style scoped>
div.help {
}

span {
  margin-top: 10px;
  display: inline-block;
}

.btnEnter {
  float: right;
  margin-top: 10px;
}
</style>


