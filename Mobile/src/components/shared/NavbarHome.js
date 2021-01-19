import { Platform ,Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, {Component} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import SimpleLineIcon from "react-native-vector-icons/SimpleLineIcons";
import {Actions} from 'react-native-router-flux';
import { connect } from 'react-redux';
import { getUser } from '../../actions/AppActions';

const styles = StyleSheet.create({
  container: {
    height: Platform.OS ? 64 : 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center'
  },
  logo:{
    marginLeft:15,
    color:'#fff', fontSize:35, fontFamily: 'Optima', fontWeight:'bold'
  },
  navBarItem: {
    flex: 1,
    justifyContent: 'center',
  }
});

class NavbarHome extends Component {

  render() {
    return (
        <LinearGradient colors={['#0286cb','#001c2b']} style={styles.container}>
          <View style={{justifyContent:'space-between', flexDirection:'row', flex:1, paddingRight:10}}>   
            <View>
              <Image source={require('../../imgs/g3list_branco.png')} style={{height:45, width:70,   marginLeft:10}}/>
              {/* <Text style={styles.logo}>G3S</Text> */}
            </View>      
            <TouchableOpacity onPress={() => { Actions.settings({user:this.props.user, nomeCliente:this.props.nomeCliente}); }} style={{marginTop:5}}>
              <SimpleLineIcon size={35} name={'settings'} color={'#fff'}/>
            </TouchableOpacity>
          </View>
        </LinearGradient>

    );
  }
}

const mapStateToProps = state => {
  return {
      user: state.AutenticacaoReducer.name,
      nomeCliente: state.AutenticacaoReducer.nomeCliente

  }
}
export default connect(mapStateToProps, {getUser})(NavbarHome);
