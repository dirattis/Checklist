import React, {Component} from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
            KeyboardAvoidingView, Animated, Keyboard, AsyncStorage} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { modificaEmail, modificaSenha, autenticarUsuario, limpaErros } from '../actions/AutenticacaoActions';
import {styles, logoAnimationDuration} from '../config/appStyles';
import DismissKeyboard from './shared/DismissKeyboard';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";
import TextInputCustom  from "./shared/TextInputCustom";

const style = StyleSheet.create({   
    textInput: { borderColor:'#8CD1E3', flex:1, paddingTop: 10, height:50, fontSize:20, borderRadius: 5,
    paddingRight: 10,  paddingBottom: 10, paddingLeft: 0,  color:'#fff', backgroundColor:'#4c89a7' },
    viewInput: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', 
            height: 50, backgroundColor:'#4c89a7', borderRadius: 5}    
});

const logo = require('../imgs/simbolo_novo.png');

class LoginForm  extends Component {
    constructor(props){
        super(props);
        this.animatedLogoValue = new Animated.Value(1);
        this.state = {
            viewLogo: {
                        marginTop:50, flex:2
                    },
            viewAuxActions: {
                opacity: 1
            },
            logoToggle:{ marginTop: 0},
            loading_login: false
        }
    }

    componentWillMount () {

        if(Platform.OS === 'android'){
            this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);        
            this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
        }
        else{
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        }
      }
    
      componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
      }

    componentWillReceiveProps(nextProps){
        if(nextProps.erroLogin !== '')
            Alert.alert('Atenção', nextProps.erroLogin,
            [
                {text: 'OK', onPress: () => this.props.limpaErros()},
            ]);
        
        if(nextProps.cadastrou)
            Alert.alert('Parabéns', 'Cadastro realizado com Sucesso! Verifique seu e-mail para confirmação do mesmo.',
            [
                {text: 'OK', onPress: () => this.props.limpaErros()},
            ]);
      }

      keyboardWillShow = (event) => {
        Animated.timing(this.animatedLogoValue, {
          duration: logoAnimationDuration,
          toValue: 0.5,
        }).start();
         this.setState({ viewLogo: {marginTop:10, flex:1}, logoToggle:{ marginTop: 15} }); 
      };
    
      keyboardWillHide = (event) => {
        this.setState({ viewLogo: {marginTop:50, flex:2}, logoToggle:{ marginTop: 0}});
        Animated.timing(this.animatedLogoValue, {
          duration: logoAnimationDuration,
          toValue: 1,
        }).start();
      };

    _autenticarUsuario() {
        const { email, senha } = this.props;
        this.props.autenticarUsuario({ email, senha });
    }

    renderBtnAcessar() {

        let btnAccessEnable = (this.props.senha.trim() && this.props.email.trim());

        if(this.props.loading_login) {
            return (
                <ActivityIndicator size="large" color='#fff' />
            )
        }

        let btnAccessStyle;
        let txtAccessStyle;

        if(btnAccessEnable){
            btnAccessStyle = [  styles.whiteBtnAction, styles.btnEnabled, {height:50}];  
            txtAccessStyle = [styles.whiteTxtBtnAction,{fontSize:30}];          
        }
        else{
            btnAccessStyle = [styles.whiteBtnAction, {height:50, backgroundColor: '#4c89a7'}];
            txtAccessStyle = [styles.whiteTxtBtnAction,{fontSize:30, backgroundColor: '#4c89a7', color:'#9ec0d0'}];
        }
            

        return (
            <TouchableOpacity disabled={!btnAccessEnable} style={btnAccessStyle} onPress={() => this._autenticarUsuario()}>
                <Text style={txtAccessStyle} >Login</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
            <DismissKeyboard>
                <LinearGradient colors={['#0286cb','#001c2b']} style={{flex: 1, padding: 10}}> 
                <View style={[{ justifyContent:'center', alignItems: 'center'}, this.state.viewLogo]}>
                            <Animated.Image source={logo}  resizeMode='cover' style={[styles.logo, this.state.logoToggle,{
                            transform: [                            
                                {
                                    scale: this.animatedLogoValue
                                }
                            ]
                            
                            }]} />
                        </View>           
                        <View style={{ flex: 4, justifyContent:'center'}}>
                            <View style={[style.viewInput,{marginTop:50}]}>
                                <Icon size={30} color={'#fff'} name={'ios-mail'} style={{padding:10, backgroundColor:'transparent'}}/>
                                <TextInputCustom autoCapitalize='none'
                                    placeholderStyle={{ fontStyle:'italic' }}
                                    keyboardType='email-address'
                                    selectionColor='rgba(0, 0, 0, 0.5)'
                                    underlineColorAndroid="transparent"
                                    value={this.props.email} 
                                    style={style.textInput} 
                                    placeholder='e-mail' placeholderTextColor='#9ec0d0'
                                    onChangeText={texto => this.props.modificaEmail(texto)  } 
                                />
                            </View>
                            <View style={[style.viewInput,{marginTop:20}]}>
                                <Icon size={30} color={'#fff'} name={'ios-key'} style={{padding:10}}/>
                                <TextInputCustom 
                                    secureTextEntry 
                                    selectionColor='rgba(0, 0, 0, 0.5)'
                                    underlineColorAndroid="transparent"
                                    value={this.props.senha} 
                                    style={style.textInput} 
                                    placeholder='senha' 
                                    placeholderTextColor='#9ec0d0' 
                                    placeholderStyle={{ fontStyle:'italic' }}
                                    onChangeText={texto => this.props.modificaSenha(texto)  } 
                                />
                            </View>
                            <View style={[{flexDirection:'row', justifyContent:'space-between'}]}>                                
                                <TouchableOpacity  onPress={() => Actions.registerForm() } style={{marginTop:10}}>
                                    <Text style={[{ fontSize: 18, fontStyle:'italic' ,color:'#fff' }]}>Cadastre-se</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flex: 2, justifyContent:'center'}}>
                            {this.renderBtnAcessar()}
                        </View>
                        <View style={{ flex: 1, justifyContent:'center', alignItems:'center'}}>                            
                                <Text style={[{ fontSize: 14, color:'#fff' }]}>G3S © {new Date().getFullYear()}</Text>
                        </View>
                        <View style={{ justifyContent:'flex-end', alignItems:'flex-end'}}>
                            <TouchableOpacity  onPress={() => AsyncStorage.clear() }>
                                <Text style={[{ fontSize: 14, color:'#fff' }]}>Versão 1.1.1</Text>
                            </TouchableOpacity> 
                        </View>
                    </LinearGradient>
                </DismissKeyboard>
                </KeyboardAvoidingView>
            
        );
    }
}

const mapStateToProps = state => {
    console.log(state.AutenticacaoReducer.email);
    return {
        email: state.AutenticacaoReducer.email,
        senha: state.AutenticacaoReducer.senha,
        erroLogin: state.AutenticacaoReducer.erroLogin,
        loading_login: state.AutenticacaoReducer.loading_login,
        cadastrou: state.AutenticacaoReducer.cadastrou
    };
}




export default connect(mapStateToProps, { modificaEmail, modificaSenha, autenticarUsuario, limpaErros })(LoginForm);