import React, { Component } from 'react';
import { View, Text, Platform, Alert, Animated, ActivityIndicator, KeyboardAvoidingView,  Keyboard, TouchableOpacity, StyleSheet } from 'react-native';
import {connect} from 'react-redux';
import {styles, logoAnimationDuration} from '../config/appStyles';
import { confirmRegistration, resendCode, limpaErros } from '../actions/AutenticacaoActions';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";
import TextInputCustom  from "./shared/TextInputCustom";
import DismissKeyboard from './shared/DismissKeyboard';

const style = StyleSheet.create({    
    text:{ fontSize: 22, color:'#fff'},
    textInput: { borderColor:'#8CD1E3', flex:1, paddingTop: 7, height:35, fontSize:22, borderRadius: 5,
    paddingRight: 5,  paddingBottom: 5, paddingLeft: 0,  color:'#fff', backgroundColor:'#4c89a7' },
    viewInput: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', 
            height: 35, backgroundColor:'#4c89a7', borderRadius: 5}     
});

const logo = require('../imgs/simbolo_novo.png');

class ConfirmSignUp extends Component{
    
    constructor(props) {
        super(props);
        this.state = { code: '', viewLogo: {marginTop:50, flex:2}  };
        this.animatedLogoValue = new Animated.Value(1);
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
        if(nextProps.erroConfirm !== '')
            Alert.alert('Atenção', nextProps.erroConfirm,
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
        this.setState({ viewLogo: {marginTop:10, flex:1} }); 
      };
    
      keyboardWillHide = (event) => {
        this.setState({ viewLogo: {marginTop:50, flex:2} });
        Animated.timing(this.animatedLogoValue, {
          duration: logoAnimationDuration,
          toValue: 1,
          useNativeDriver: true
        }).start();
      };
    
    _confirmRegistration(){
        //console.log(this.props);
        const {username, senha} = this.props;
        this.props.confirmRegistration({username, code:this.state.code, senha});
    }

    renderBtnResendSignUp(){
        if(this.props.loading_resend_confirm) {
            return (
                <ActivityIndicator size="large" />
            )
        }
        return (
            <TouchableOpacity style={[styles.whiteBtnAction,{width:160, marginTop: 5}]} onPress={() => this.props.resendCode(this.props.username)}>
                <Text style={[styles.whiteTxtBtnAction, {fontSize:20}]} >Reenviar Código</Text>
            </TouchableOpacity>
        )
    }

    renderBtnConfirm() {
        let btnAccessEnable = this.state.code.trim().length == 6;

        if(this.props.loading_confirm) {
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
            <TouchableOpacity disabled={!btnAccessEnable} style={btnAccessStyle} onPress={() => this._confirmRegistration()}>
                <Text style={txtAccessStyle} >Confirmar</Text>
            </TouchableOpacity>
        )
    }

    render(){
        return (
            <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
                <DismissKeyboard>
                <LinearGradient colors={['#0286cb','#001c2b']} style={{flex: 1, padding: 10}}>
                <View style={[{ justifyContent:'center', alignItems: 'center'}, this.state.viewLogo]}>
                            <Animated.Image source={logo}  resizeMode='cover' style={[styles.logo, {
                            transform: [                            
                                {
                                    scale: this.animatedLogoValue
                                }
                            ]
                            
                            }]} />
                            {/* <Image source={require('../imgs/logo_branco.png')} style={[styles.logo]}/> */}
                        </View>
                        <View style={{ flex: 3, marginTop:40 }}>
                            <View>
                                <Text style={style.text}>Confirme seu cadastro.</Text>
                                <Text style={[style.text,{marginTop:10}]}>Preencha com o código enviado.</Text>
                            </View>
                            <View style={[style.viewInput,{marginTop:10}]}>
                                    <Icon size={22} color={'#fff'} name={'ios-arrow-forward'} style={{padding:7, backgroundColor:'transparent'}}/>
                                    <TextInputCustom 
                                        placeholderStyle={{ fontStyle:'italic' }}
                                        selectionColor="#fff"
                                        underlineColorAndroid="transparent"
                                        value={this.state.code} 
                                        style={style.textInput} 
                                        placeholder='######' maxLength={6} placeholderTextColor='#9ec0d0'
                                        onChangeText={texto => this.setState({code: texto})   } 
                                    />
                                </View>
                            {this.renderBtnResendSignUp()}
                        </View>
                        <View style={{ flex: 2, justifyContent:'center'}}>
                            {this.renderBtnConfirm()}
                        </View>
                    </LinearGradient>
                </DismissKeyboard>
            </KeyboardAvoidingView>
        )
    }
}

const mapStateToProps = state => (
    {
        erroConfirm: state.AutenticacaoReducer.erroConfirm,        
        loading_confirm: state.AutenticacaoReducer.loading_confirm,
        loading_resend_confirm: state.AutenticacaoReducer.loading_resend_confirm,
    }
)



export default connect(mapStateToProps, { confirmRegistration, resendCode, limpaErros })(ConfirmSignUp);