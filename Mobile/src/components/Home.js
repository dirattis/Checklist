import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet} from 'react-native';
import { connect } from 'react-redux';
import { getChecklists } from '../actions/AppActions';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconIos from 'react-native-vector-icons/Ionicons';
import Loading from './shared/Loading';

const style = StyleSheet.create({     
    container: { flex: 1, backgroundColor:'#fff' } 
});

class Home extends Component {

    componentWillMount() {
        this.props.getChecklists(this.props.username, this.props.token, this.props.idCliente, this.props.idUsuario );
        this.criaFonteDeDados(this.props.checklists || []);
    }

    componentWillReceiveProps(nextProps) {
        this.criaFonteDeDados(nextProps.checklists)
    }

    criaFonteDeDados( checklists ) {
        
        let checkedchecklists = checklists.filter(x => x.concluido);
        let pendingschecklists = checklists.filter(x => !x.concluido);        

        this.pendingDataSource = pendingschecklists;
        this.checkedDataSource = checkedchecklists;
    }

    renderRow({item}) {
        
        if(item){
            return (
                    <View style={{ flex: 1, padding: 5, borderBottomWidth: 0, borderColor: "#ccc", flexDirection: 'row', justifyContent:'space-between' }}>
                        <Text style={{ fontSize: 20, color: '#b4b9ba' }}>{item.nome}</Text>
                        <Text style={{ fontSize: 20, color: '#b4b9ba' }}>{item.qtdePerguntasRespondidas}/{item.qtdePerguntas}</Text>
                    </View>
            )
        }

        return null;
    }

    render(){
        return (
            <View style={style.container}>
            <Loading loading={this.props.loading}/>
                <View style={{flex:2, flexDirection:'row', marginTop: 15, marginLeft:10}} >
                    <IconFA size={100} name={'user-circle-o'} color={'#d0d4d6'} />
                    <View style={{marginLeft:10, marginTop:10}}>
                        <Text style={{fontSize:30, fontWeight:'bold'}}> Olá, {this.props.name ? this.props.name : 'Convidado'}.</Text>
                        <Text style={{fontSize:30, fontWeight:'bold', color:'#bcc0c1'}}>Bem-vindo!</Text>
                    </View>
                </View>
                <View style={{ flex:4, marginTop:10 ,marginHorizontal:20, borderBottomWidth:1, borderRightWidth:2, borderColor:'#ccc' }}>    
                        <View style={{flexDirection:'row'}}>
                            <Text style={{fontSize:22}}>Tarefas pendentes</Text>
                            <IconIos size={30} name={'md-close'} color={'#fd3524'}  style={{fontWeight:'bold', marginLeft: 5}}/>
                        </View>
                        <FlatList style={{marginTop:10}}
                            keyExtractor={checklist => `${checklist.idCheckListDistribuicao}-${checklist.checklistId}`}
                            data={this.pendingDataSource}
                            renderItem={this.renderRow.bind(this)}
                        />
                </View>
                <View style={{ flex:4, marginTop:20, marginBottom:10 ,marginHorizontal:20, borderBottomWidth:1, borderRightWidth:2, borderColor:'#ccc' }}>    
                        <View style={{flexDirection:'row'}}>
                            <Text style={{fontSize:22}}>Tarefas concluídas</Text>
                            <IconIos size={30} name={'md-checkmark'} color={'#4ed966'}  style={{fontWeight:'bold', marginLeft: 5}}/>
                        </View>
                        <FlatList style={{marginTop:10}}
                            keyExtractor={checklist => `${checklist.idCheckListDistribuicao}-${checklist.checklistId}`}
                            data={this.checkedDataSource}
                            renderItem={this.renderRow.bind(this)}
                        />
                </View>
            </View>
        )
    }
    
}
const mapStateToProps = state => {
    return {
        checklists: state.AppReducer.checklists ? [...state.AppReducer.checklists] : [],
        username: state.AutenticacaoReducer.username,
        name: state.AutenticacaoReducer.name,
        token: state.AutenticacaoReducer.token,
        idCliente: state.AutenticacaoReducer.idCliente,
        idUsuario: state.AutenticacaoReducer.idUsuario,
        loading: state.AppReducer.loading
    }
}

export default connect(mapStateToProps, {getChecklists})(Home);