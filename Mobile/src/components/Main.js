import React, {Component} from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import {connect} from 'react-redux';
import { answer, irProximaPergunta, irPerguntaAnterior, concluirChecklist } from '../actions/AppActions';
import Question from    './Question';
import Loading from './shared/Loading';
import {styles} from '../config/appStyles';


const style = StyleSheet.create({
    main: { flex: 1, padding: 10, backgroundColor: '#fff' },
    pergunta: { flex: 8 },
    btnPerguntas: {width:140, paddingHorizontal:10, paddingVertical:5, height:50 }
});

class Main extends Component {
    
    constructor(props){
        super(props);
        this.answer = this.answer.bind(this);
    }

    answer(questionId, selectedAlternativeId, indexAvailableAlternative, description, value){       
        this.props.answer({checklistId: this.props.checklistIdAtual, questionId, selectedAlternativeId, indexAvailableAlternative, description, value});
    }

    completeQuestionnaire(){
        if(this.props.qtdePerguntas == this.props.qtdePerguntasRespondidas){
            Alert.alert('Parabéns', 'Checklist concluído com sucesso!!!',
                [
                    {text: 'OK', onPress: () => this.props.concluirChecklist(this.props.checklistIdAtual)},
                ]);
            }
        else
            Alert.alert('Atenção', 'Por favor, responda todo o checklist para dar como concluído.');
                
    }

    viewQuestions() {        

        if(this.props.perguntas.length > 0)
            return (<Question answer={this.answer} 
                              pergunta={this.props.perguntas[this.props.indicePerguntaAtual]}
                              indicePerguntaAtual={this.props.indicePerguntaAtual}
                              qtdePerguntas={this.props.qtdePerguntas}
                              checklistConcluido={this.props.checklistConcluido}
                    />);
        
        return null;
    }

    viewButtons(){
                           
            if(this.props.perguntas.length == 0)
                return (
                        <View style={{ flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>Nenhuma pergunta cadastrada.</Text>
                        </View>
                        )   
            else if(this.props.indicePerguntaAtual == (this.props.perguntas.length - 1)){

                if(this.props.checklistConcluido)
                    return  (
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems:'flex-end' }}>
                                <TouchableOpacity style={[styles.btnAction, style.btnPerguntas]} onPress={() => this.props.irPerguntaAnterior(this.props.checklistIdAtual)}>
                                        <Text style={[styles.txtBtnAction]} >&#60; anterior</Text>
                                </TouchableOpacity>
                            </View>
                            )

                return  (
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems:'flex-end' }}>
                            <TouchableOpacity style={[styles.btnAction, style.btnPerguntas]} onPress={() => this.props.irPerguntaAnterior(this.props.checklistIdAtual)}>
                                    <Text style={[styles.txtBtnAction]} >&#60; anterior</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btnAction,style.btnPerguntas]} 
                                onPress={() => this.completeQuestionnaire() }>                                
                                <Text style={[styles.txtBtnAction]} >concluir</Text>
                            </TouchableOpacity>
                        </View>
                        )
                }
            else if(this.props.indicePerguntaAtual > 0)
                return  (<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems:'flex-end'}}>
                            <TouchableOpacity style={[styles.btnAction,style.btnPerguntas]} onPress={() => this.props.irPerguntaAnterior(this.props.checklistIdAtual)}>
                                <Text style={[styles.txtBtnAction]} > &#60; anterior</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btnAction,style.btnPerguntas]} onPress={() => this.props.irProximaPergunta(this.props.checklistIdAtual)}>
                                <Text style={[styles.txtBtnAction]} > próximo &#62; </Text>
                            </TouchableOpacity>
                        </View>
                        )                        
            else 
                return  (
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems:'flex-end'}}>
                                <TouchableOpacity style={[styles.btnAction,style.btnPerguntas]} onPress={() => this.props.irProximaPergunta(this.props.checklistIdAtual)}>
                                        <Text style={[styles.txtBtnAction]} > próximo &#62; </Text>
                                </TouchableOpacity>
                            </View>
                        )
    
    }

    render(){
        return(
            <View style={style.main}>
            <Loading loading={this.props.loading}/>
                <View style={style.pergunta}>
                    {this.viewQuestions()}
                </View>
                
                {this.viewButtons()}
               
            </View>
            )
    }
    
};

const mapStateToProps = state => {
    console.log(state.AppReducer);
        return    {               
            checklistIdAtual: state.AppReducer.checklistAtual.checklistId,
            checklistConcluido: state.AppReducer.checklistAtual.concluido,
            perguntas: state.AppReducer.perguntasPorChecklist ? [...state.AppReducer.perguntasPorChecklist] : [],
            indicePerguntaAtual: state.AppReducer.checklistAtual.indicePerguntaAtual,
            qtdePerguntasRespondidas : state.AppReducer.checklistAtual.qtdePerguntasRespondidas,
            qtdePerguntas: state.AppReducer.checklistAtual.qtdePerguntas,
            loading: state.AppReducer.loading
    }
}

export default connect(mapStateToProps,{answer, irProximaPergunta, irPerguntaAnterior,concluirChecklist})(Main);