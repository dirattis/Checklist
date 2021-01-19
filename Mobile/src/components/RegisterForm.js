import React, { Component } from 'react';
import { View, Platform, KeyboardAvoidingView, Animated, Keyboard, Alert,
    StyleSheet, TouchableOpacity,  Text, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";
import TextInputCustom  from "./shared/TextInputCustom";
import DismissKeyboard from './shared/DismissKeyboard';
import { connect } from 'react-redux';
import {styles, logoAnimationDuration} from '../config/appStyles';
import { 
    modificaEmail, 
    modificaNome, 
    cadastraUsuario,
    limpaErros
} from '../actions/AutenticacaoActions';

const style = StyleSheet.create({     
    headerText: { fontSize: 50 },
    textInput: { borderColor:'#8CD1E3', flex:1, paddingTop: 10, height:50, fontSize:20, borderRadius: 5,
    paddingRight: 10,  paddingBottom: 10, paddingLeft: 0,  color:'#fff', backgroundColor:'#4c89a7' },
    viewInput: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', 
             backgroundColor:'#4c89a7', borderRadius: 5}        
});

const logo = require('../imgs/simbolo_novo.png');

class RegisterForm extends Component {

    constructor(props){
        super(props);
        this.animatedLogoValue = new Animated.Value(1);
        this.state = {
            viewLogo: {marginTop:50, flex:2},
            logoToggle:{ marginTop: 0}
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
        if(nextProps.erroCadastro !== '')
            Alert.alert('Atenção', nextProps.erroCadastro,
            [
                {text: 'OK', onPress: () => this.props.limpaErros()},
            ]);
      }
    
      keyboardWillShow = (event) => {
        Animated.timing(this.animatedLogoValue, {
          duration: logoAnimationDuration,
          toValue: 0.5,
          useNativeDriver: true,
        }).start();
        this.setState({ viewLogo: {marginTop:10, flex:1}, logoToggle:{ marginTop: 15} }); 
      };
    
      keyboardWillHide = (event) => {
        this.setState({ viewLogo: {marginTop:50, flex:2}, logoToggle:{ marginTop: 0} });
        Animated.timing(this.animatedLogoValue, {
          duration: logoAnimationDuration,
          toValue: 1,
          useNativeDriver: true
        }).start();
      };

    _cadastraUsuario() {
        const { nome, email } = this.props;
        this.props.cadastraUsuario({ nome, email });
    }

    renderBtnCadastro() {

        let btnAccessEnable = (this.props.email.trim() && this.props.nome.trim());
        
        if(this.props.loading_cadastro) {
            return (
                <ActivityIndicator size="large" />
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
            <TouchableOpacity disabled={!btnAccessEnable} style={btnAccessStyle}  onPress={() => this._cadastraUsuario()}>
                <Text style={[txtAccessStyle]} >Cadastrar</Text>
            </TouchableOpacity>
        )
    }

    render() {    
        return (
            
                <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
                    <DismissKeyboard>    
                    <LinearGradient colors={['#0286cb','#001c2b']} style={{flex: 1, padding: 10}}>
                        <View style={[{ justifyContent:'center', alignItems: 'center'}, this.state.viewLogo]}>
                            <Animated.Image source={logo}  resizeMode='cover' style={[styles.logo, {marginTop: 50}, {
                            transform: [                            
                                {
                                    scale: this.animatedLogoValue
                                }
                            ]
                            
                            }]} />
                            {/* <Image source={require('../imgs/logo_branco.png')} style={[styles.logo]}/> */}
                        </View>
                        <View style={{ flex: 6, justifyContent: 'center' }}>
                            <View style={[style.viewInput, {marginTop:50}]}>
                                <Icon size={30} color={'#fff'} name={'ios-person'} style={{padding:10, backgroundColor:'transparent'}}/>
                                <TextInputCustom 
                                    placeholderStyle={{ fontStyle:'italic' }}
                                    selectionColor="#fff"
                                    underlineColorAndroid="transparent"
                                    value={this.props.nome} 
                                    maxLength={12}
                                    style={[style.textInput]} 
                                    placeholder='nome' placeholderTextColor='#9ec0d0'
                                    onChangeText={texto => this.props.modificaNome(texto)  } 
                                />
                            </View>
                            <View style={[style.viewInput,,this.state.input,{marginTop:20}]}>
                                <Icon size={30} color={'#fff'} name={'ios-mail'} style={{padding:10, backgroundColor:'transparent'}}/>
                                <TextInputCustom 
                                    placeholderStyle={{ fontStyle:'italic' }}
                                    autoCapitalize='none'
                                    keyboardType='email-address'
                                    selectionColor="#fff"
                                    underlineColorAndroid="transparent"
                                    value={this.props.email} 
                                    style={[style.textInput]} 
                                    placeholder='e-mail' placeholderTextColor='#9ec0d0'
                                    onChangeText={texto => this.props.modificaEmail(texto)  } 
                                />
                            </View>   
                            <View style={{ justifyContent:'center', marginTop:20}}>
                            {this.renderBtnCadastro()}
                        </View>                         
                        </View>
                        
                    </LinearGradient>
                    </DismissKeyboard>
                </KeyboardAvoidingView>
             
        );
    }
}

const mapStateToProps = state => { 
    return (
        {
            nome: state.AutenticacaoReducer.nome,
            email: state.AutenticacaoReducer.email,
            erroCadastro: state.AutenticacaoReducer.erroCadastro,
            loading_cadastro: state.AutenticacaoReducer.loading_cadastro
        }
    );
}

export default connect(
    mapStateToProps, 
    {
        modificaEmail, 
        modificaNome,
        cadastraUsuario,
        limpaErros
    }
)(RegisterForm);