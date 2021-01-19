import React, { Component } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity} from 'react-native';
import Slider from 'react-native-slider';
import { CheckBox} from 'react-native-elements';
import {Actions} from 'react-native-router-flux';
import DismissKeyboard from './shared/DismissKeyboard';
import IconFA from 'react-native-vector-icons/FontAwesome';
import moment from 'moment/min/moment-with-locales';
import {connect} from 'react-redux';
import Loading from './shared/Loading';
moment.locale('pt-br');

class Question extends Component {
        constructor(props){            
            super(props);
            console.log(props);
            this.state = {
                valueSlide: 0,
                valueTextSlide:'',
                optionsSlider:[],
                valueEmojiSlide:null,
                valueColorEmojiSlide:null,
                indiceEscolhaSelecionada: 0                
            }

            if(this.props.pergunta.tipo !== 'descritiva')
            {
                this.props.pergunta.resposta.escolhasDisponiveis = this.props.pergunta.resposta.escolhasDisponiveis || [];
                this.props.pergunta.resposta.escolhasSelecionadas = this.props.pergunta.resposta.escolhasSelecionadas || [];
            }    
        }
                
        _answer({alternativaId, indiceAlternativa, descricao, valor}){ 
            this.props.answer(this.props.pergunta.perguntaId, alternativaId, indiceAlternativa, descricao, valor );
        }

        mountSlider(pergunta){
            if(pergunta.resposta.escolhasDisponiveis && pergunta.tipo.toLowerCase() === 'emoji'){                
                let optionsSlider = [];
                let div = 100 / pergunta.resposta.escolhasDisponiveis.length;
                for(var i = 0; i < pergunta.resposta.escolhasDisponiveis.length; i++)
                    optionsSlider.push(div * (i+1));

                this.setState({optionsSlider: [...optionsSlider]});

                if(pergunta.resposta.valor > 0)
                    for (let i = 0; i < optionsSlider.length; i++) {                
                        if(pergunta.resposta.valor < optionsSlider[i]){
                            let escolha = pergunta.resposta.escolhasDisponiveis[i];
                            this.setState({valueTextSlide: escolha.nome});
                            let eSim = escolha.nome.toLowerCase() == 'sim';
                            this.setState({valueEmojiSlide:  eSim ?  'thumbs-o-up' : 'thumbs-o-down'});
                            this.setState({valueColorEmojiSlide: eSim ?  '#1c8434' : '#dc3545'});                            
                            this.setState({indiceEscolhaSelecionada: i});                    
                            
                            break;
                        }
                    }
                else{
                        this.setState({valueTextSlide: ''});
                        this.setState({valueEmojiSlide: null});
                        this.setState({valueColorEmojiSlide: null});                        
                        this.setState({indiceEscolhaSelecionada: 0});      
                    }
            }

            if(pergunta.resposta.escolhasSelecionadas){
                pergunta.resposta.escolhasSelecionadas.forEach( (id,ind) => {
                    let escolha =  pergunta.resposta.escolhasDisponiveis.find(x => x.id == id);
                    if(escolha){
                        escolha.checked = true;
                    }
                });   
            }
        }

        componentWillMount(){
            this.mountSlider(this.props.pergunta);           
        }

        componentWillReceiveProps(nextProps){
            this.mountSlider(nextProps.pergunta);           
        }

        changeSlider(value) {
            this.setState({valueSlide: value});

            if(value > 0)
                for (let i = 0; i < this.state.optionsSlider.length; i++) {                
                    if(value < this.state.optionsSlider[i]){
                        let escolha = this.props.pergunta.resposta.escolhasDisponiveis[i];
                        this.setState({valueTextSlide: escolha.nome});
                        let eSim = escolha.nome.toLowerCase() == 'sim';
                        this.setState({valueEmojiSlide:  eSim ?  'thumbs-o-up' : 'thumbs-o-down'});
                        this.setState({valueColorEmojiSlide: eSim ?  '#1c8434' : '#dc3545'});   
                        this.setState({indiceEscolhaSelecionada: i});                    
                        
                        break;
                    }
                }
            else{
                this.setState({valueTextSlide: ''});
                this.setState({valueEmojiSlide: null});
                this.setState({valueColorEmojiSlide: null});
                this.setState({indiceEscolhaSelecionada: 0});      
            }
          }

          onSlidingComplete(){
            let escolha = this.props.pergunta.resposta.escolhasDisponiveis[this.state.indiceEscolhaSelecionada];
            this._answer({alternativaId: escolha.id, indiceAlternativa: this.state.indiceEscolhaSelecionada, valor: this.state.valueSlide});
          }

        renderQuestion(){


            if(this.props.pergunta.resposta.escolhasDisponiveis)
            {
                if(this.props.pergunta.tipo.toLowerCase() === 'emoji'){

                    return(
                        <View style={{flex:1}}>
                            <Slider
                                style={{marginHorizontal:40}} 
                                minimumValue={1}
                                maximumValue={100}
                                disabled={this.props.checklistConcluido}
                                step={1}
                                value={parseInt(this.props.pergunta.resposta.valor)}
                                onValueChange={this.changeSlider.bind(this)}
                                minimumTrackTintColor={'#0286cb'}
                                maximumTrackTintColor={'#001c2b'}
                                thumbTintColor={'#0286cb'}
                                onSlidingComplete ={() => this.onSlidingComplete()}
                                />           
                                <View style={{flex: 1, alignItems:'center', justifyContent:'center'}}>                                        
                                    <Text style={{fontSize:35, marginBottom:5, fontWeight:'bold', color:this.state.valueColorEmojiSlide}}>{this.state.valueTextSlide}</Text>
                                    {/* <Image source={this.state.valueEmojiSlide} style={{width:130, height:130}} /> */}
                                    <IconFA size={100} name={this.state.valueEmojiSlide} color={this.state.valueColorEmojiSlide} />
                                </View>                       
                        </View>
                    )
                }

                let escolhas = this.props.pergunta.resposta.escolhasDisponiveis.map((alternativa, indice) => 
                {   
                    if(this.props.pergunta.tipo === 'alternativa')
                        return (                                   
                                <CheckBox key={alternativa.id}
                                title={alternativa.nome}
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                checked={this.props.pergunta.resposta.escolhasDisponiveis[indice].checked}
                                onPress ={() => this._answer({alternativaId: alternativa.id, indiceAlternativa: indice}) }
                                />                                            
                        )
                    else if(this.props.pergunta.tipo.toLowerCase() === 'simnao')
                        return (                                   
                            <CheckBox key={alternativa.id}
                            title={alternativa.nome}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            checkedColor={alternativa.nome.toLowerCase() === 'sim' ? 'green' : 'red'}
                            checked={this.props.pergunta.resposta.escolhasDisponiveis[indice].checked}
                            onPress ={() => this._answer({alternativaId: alternativa.id, indiceAlternativa: indice}) }
                            />                                            
                        )
                    else if(this.props.pergunta.tipo.toLowerCase() === 'multiplaEscolha')                         
                            return (                                   
                                <CheckBox key={alternativa.id}
                                title={alternativa.nome}
                                checked={this.props.pergunta.resposta.escolhasDisponiveis[indice].checked}
                                onPress ={() => this._answer({alternativaId: alternativa.id, indiceAlternativa: indice}) }
                                /> 
                            )
                });

                return escolhas;
            }
            else
            {

                return (
                   
                        <TextInput 
                            style={{height: 200, borderColor: 'gray', borderWidth: 1, textAlignVertical: 'top'}}
                            maxLength = {1000}
                            editable={true}
                            multiline = {true}
                            underlineColorAndroid="transparent"                            
                            onChangeText={(text) => this._answer({descricao: text})}
                            value={this.props.pergunta.resposta.descricao}
                        />
                ) 
            }
        }

        render()
        {   
            return(
                <DismissKeyboard>
                    
                    <View style={{ flex:1, marginTop: 10, marginLeft:10, marginRight: 5}}>
                    <Loading loading={this.props.loading}/>
                     
                        {
                                this.props.pergunta.fotoObrigatoria ?
                                    this.props.checklistConcluido && this.props.pergunta.fotos.length > 0 ?
                                        (
                                            <View style={{flex:1, flexDirection:'row'}}>
                                                <View style={{flex:1}}></View>                                        
                                                <View  style={{flex:1, alignItems:'center'}}>
                                                    <TouchableOpacity onPress={() => Actions.photo({photos: this.props.pergunta.fotos, 
                                                        title: `${moment(this.props.pergunta.fotos[this.props.pergunta.fotos.length - 1].date).calendar()}`})} >
                                                        <Image source={require('../imgs/icone_galeria.png')} style={{width:60, height:60}}/>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{flex:1, alignItems:'flex-end'}}>
                                                    <Text style={{ fontSize: 20, color: '#b4b9ba' }}>{this.props.indicePerguntaAtual + 1}/{this.props.qtdePerguntas}</Text>
                                                </View>
                                            </View>
                                        )
                                    :
                                        !this.props.checklistConcluido ?
                                        (
                                            <View style={{flex:1, flexDirection:'row'}}>
                                                <View style={{flex:1}}></View>                                        
                                                <View  style={{flex:1, alignItems:'center'}}>
                                                    <TouchableOpacity onPress={() => Actions.camera()} >
                                                        <Image source={require('../imgs/icone_camera.png')} style={{width:60, height:60}}/>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{flex:1, alignItems:'flex-end'}}>
                                                    <Text style={{ fontSize: 20, color: '#b4b9ba' }}>{this.props.indicePerguntaAtual + 1}/{this.props.qtdePerguntas}</Text>
                                                </View>
                                            </View>
                                        )
                                        : ( <View style={{flex:1, flexDirection:'row'}}></View>)
                                : 
                                (                                    
                                    <View style={{alignItems:'flex-end', flex:1}}>
                                        <Text style={{ fontSize: 20, color: '#b4b9ba' }}>{this.props.indicePerguntaAtual + 1}/{this.props.qtdePerguntas}</Text>                                        
                                    </View>
                                )
                            }
                        <View style={{ flex: this.props.pergunta.fotoObrigatoria ? 2 : 4, marginTop:20}}>
                            <Text style={{color:'#0286cb', fontSize:22 }}>{this.props.pergunta.descricao}</Text>                            
                        </View>                        
                        <View style={{ flex:6}}>
                            {this.renderQuestion()}
                        </View>                        
                    </View>
                </DismissKeyboard>
            )
        }

}

const mapStateToProps = state => {
        return    {               
            loading: state.AppReducer.loading
    }
}

export default connect(mapStateToProps,null)(Question);



