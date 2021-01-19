import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import React, {PureComponent } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import Icon from "react-native-vector-icons/Ionicons";
import {connect} from 'react-redux';
import {cancelAddPhoto} from '../../actions/AppActions';


const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'android' ? 44 : 54,
    flexDirection: 'row',
    justifyContent:'center',
    alignItems:'flex-end'
  },
  back:{
    marginLeft:15,
    color:'#fff', fontSize:35,  fontWeight:'bold'
  },
  title:{
    color:'#fff', fontSize:22,  fontWeight:'bold'
  },
  navBarItem: {
    flex: 1,
    justifyContent: 'center',
  }
});

class CustomNavBar extends PureComponent  {

  pop(){
    let childComponent = this.props.component.WrappedComponent;
      if(childComponent && childComponent.name.toLowerCase() == 'camera')
        this.props.cancelAddPhoto();
   
   Actions.pop();
  }

  render() {      
    return (
        <LinearGradient colors={['#0286cb','#001c2b']} style={styles.container}>                      
            <TouchableOpacity style={[styles.navBarItem, { marginBottom: 5}]} onPress={() => this.pop()}>                
                <Icon size={35} color={'#fff'} name={'ios-arrow-back'} style={{marginLeft:10}}/>                
            </TouchableOpacity>
            <View style={[styles.navBarItem,{flex: 4, alignItems:'center', marginBottom: 5}]}>
                <Text style={[styles.title]}>{this.props.title}</Text>
            </View>
            <View style={[styles.navBarItem]}>

           </View> 
         
        </LinearGradient>
    );
  }
}

export default connect(null,{cancelAddPhoto})(CustomNavBar);

