import React, { PureComponent  } from 'react';
import { View, Text, FlatList,  TouchableOpacity, ActivityIndicator} from 'react-native';
import { connect } from 'react-redux';
import { getChecklists, getQuestions } from '../actions/AppActions';


class Checklist extends PureComponent  {

    constructor(props){
        super(props);
    }

    componentWillMount() {
        this.props.getChecklists(this.props.user,null, this.props.idCliente, this.props.idUsuario );

        this.criaFonteDeDados(this.props.checklists || []);
    }

    componentWillReceiveProps(nextProps) {

        this.criaFonteDeDados(nextProps.checklists)
    }

    criaFonteDeDados( checklists ) {

        let checklistsFiltrados = checklists;
        
        if(this.props){
            if(this.props.name == '_pendentes')
                checklistsFiltrados = checklists.filter(x => !x.concluido);
            else if(this.props.name == '_finalizadas')
                checklistsFiltrados = checklists.filter(x => x.concluido);
        }

        this.dataSource = checklistsFiltrados;
    }

    renderRow({item}) {
        if(item){
        
            // if(this.props.loading) {
            //     return (
            //         <View style={{ flex: 1, padding: 20, borderBottomWidth: 1, borderColor: "#ccc", flexDirection: 'row', justifyContent:'center' }}>
            //             <ActivityIndicator size="large" color='#fff' />
            //         </View>
                    
            //     )
            // }
                
            return (
                <TouchableOpacity onPress={
                    () => this.props.getQuestions(item, this.props.idCliente, this.props.idUsuario)
                }>
                    <View style={{ flex: 1, padding: 20, borderBottomWidth: 1, borderColor: "#ccc", flexDirection: 'row', justifyContent:'space-between' }}>
                        <Text style={{ fontSize: 22, color: '#b6babc' }}>{item.nome}</Text>
                        <Text style={{ fontSize: 20, color: '#b6babc' }}>{item.qtdePerguntasRespondidas} / {item.qtdePerguntas}</Text>
                    </View>
                </TouchableOpacity>
            )
        }

        return null;
    }

    render() {
        return (
            <View style={{backgroundColor:'#fff', flex:1}}>
                    <FlatList 
                        keyExtractor={checklist => `${checklist.idCheckListDistribuicao}-${checklist.checklistId}`}
                        data={this.dataSource}
                        renderItem={this.renderRow.bind(this)}
                    />
            </View>
        );
    }
}
const mapStateToProps = state => {
    console.log(state.AppReducer.checklists);
    return {
        checklists: state.AppReducer.checklists ? [...state.AppReducer.checklists] : [],
        user: state.AppReducer.user,
        idCliente: state.AutenticacaoReducer.idCliente,
        idUsuario: state.AutenticacaoReducer.idUsuario,
        loading: state.AppReducer.loading
    }
}

export default connect(mapStateToProps, {getChecklists, getQuestions})(Checklist);