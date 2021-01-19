import React, { Component } from 'react';
import { View, Text, FlatList,  TouchableOpacity, Image, StyleSheet} from 'react-native';
import { connect } from 'react-redux';
import IconFA from 'react-native-vector-icons/FontAwesome';
import { logout } from '../actions/AutenticacaoActions';
import Loading from './shared/Loading';


const style = StyleSheet.create({     
    container: { flex: 1, backgroundColor:'#fff' } 
});

const settings = [{
    icone: require('../imgs/icone_sair.png'), descricao: 'Sair'
}]

class Settings extends Component {

    componentWillMount() {        
        this.criaFonteDeDados();
    }

    componentWillReceiveProps() {
        this.criaFonteDeDados()
    }

    criaFonteDeDados() {        
        this.settingsDataSource = settings;
    }

    renderRow({item}) {
        
        if(item){
            return (    
                <TouchableOpacity onPress={() => this.props.logout()}>
                    <View style={{ flex: 1, padding: 5, flexDirection: 'row', alignItems:'center' }}>
                        <Image  source={item.icone} style={{width:60, height:60}}/>                        
                        <Text style={{ fontSize: 20, color: '#b4b9ba' }}>{item.descricao}</Text>
                    </View>
                </TouchableOpacity>            
            )
        }

        return null;
    }

    render(){
        return (
            <View style={style.container}>
            <Loading loading={this.props.loading}/>
                <View style={{flex:2, flexDirection:'row', backgroundColor:'#033044', paddingLeft:5, alignItems:'center'}} >
                    <View style={{flex:2}}>
                        <IconFA size={130} name={'user-circle-o'} color={'#fff'}/>
                    </View>
                    <View style={{marginLeft:10, flex:3}}>
                        <Text style={{fontSize:30, fontWeight:'bold', color:'#fff'}}>{this.props.user}</Text>
                        <Text style={{fontSize:22, color:'#fff'}}>{this.props.nomeCliente}</Text>
                    </View>
                </View>
                <View style={{ flex: 4 }}>
                        <FlatList style={{marginTop:10}}
                            keyExtractor={(setting,index) => index.toString()}
                            data={this.settingsDataSource}
                            renderItem={this.renderRow.bind(this)}
                        />
                </View>
                <View style={{ flex: 1, justifyContent:'center', alignItems:'center'}}>
                            <Text style={[{ fontSize: 14, color:'#fff' }]}>© Todos os direitos reservados - G3S</Text>
                        </View>
            </View>
        )
    }
    
}
const mapStateToProps = state => {
    return {
        loading: state.AutenticacaoReducer.loading
    }
}

export default connect(mapStateToProps, {logout})(Settings);