
import React, {Component} from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, View, Image, Alert} from 'react-native';
import { RNCamera } from 'react-native-camera';
import {Actions} from 'react-native-router-flux';
import moment from 'moment/min/moment-with-locales';
import {connect} from 'react-redux';
import {photoPreview, cancelAddPhoto} from '../actions/AppActions';

moment.locale('pt-br');

const flashAutoImage = require('../imgs/flashAuto.png');
const flashOnImage = require('../imgs/flashOn.png');
const flashOffImage = require('../imgs/flashOff.png');

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black'
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    }
  });

class Camera extends Component {
  constructor(props){
    super(props);

    this.state = { 
      flashMode: RNCamera.Constants.FlashMode.auto,
      flashModeImage: flashAutoImage
     }
  }

  takePhoto = async function() {
    if (this.camera) {
      const options = { quality: 0.5, fixOrientation: true, forceUpOrientation:true };
      const data = await this.camera.takePictureAsync(options)
     
      this.props.photoPreview({questionId: this.props.questionId, photo: { uri: data.uri, isCached:true, date: new Date() }});
      

      // CameraRoll.saveToCameraRoll(data.uri,'photo').then(uriSaved => {
      //   this.props.addPhoto({questionId: this.props.questionId, photo: { uri: uriSaved, date: new Date() }});
      // })
      // .catch((err) => {      
      //   Alert.alert('Atenção','Não foi possível salvar a foto.' + err);
      // });
    }
  };

  changeFlashMode = async function() {
    if (this.camera) {
      if(this.state.flashMode == RNCamera.Constants.FlashMode.off){
        this.setState({flashMode: RNCamera.Constants.FlashMode.torch, 
          flashModeImage: flashOnImage});
      }
      else if(this.state.flashMode == RNCamera.Constants.FlashMode.torch){
        this.setState({flashMode: RNCamera.Constants.FlashMode.auto, 
          flashModeImage: flashAutoImage});
      }
      else{
        this.setState({flashMode: RNCamera.Constants.FlashMode.off, 
          flashModeImage: flashOffImage});
      }

    }
  };

  viewLastPhoto(){
    if(this.props.photos.length > 0){

      let photo = this.props.photos[this.props.photos.length - 1];

      return (
        <TouchableOpacity onPress={() => Actions.photo({photos: this.props.photos, title: `${moment(photo.date).calendar()}`})}>  
              <Image source={{uri: photo.uri}} style={{width: 60, height: 60, margin:10, borderRadius:10}}/>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity onPress={() => false} style={{width:80}}>  
      </TouchableOpacity>
      )
  }
 

  render() {

    return (
      <View style={ styles.container} > 
          <RNCamera
                ref={ref => {
                  this.camera = ref;
                }}
                style = {styles.preview}
                flashMode={this.state.flashMode}
                permissionDialogTitle={'Permissão Camera'}
                permissionDialogMessage={'Permissão para acessar a camera.'}
            />
          <View style={{flex: 0, flexDirection: 'row', justifyContent:'space-between'}}>
            
            {this.viewLastPhoto()}
            <TouchableOpacity 
                onPress={this.takePhoto.bind(this)}
            >           
                <Image source={require('../imgs/circle-button.png')} style={{width: 80, height: 80}} />
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={this.changeFlashMode.bind(this)}
            >           
                <Image source={this.state.flashModeImage} style={{width: 40, height: 40, 
                  marginLeft:35, marginTop:20, marginRight:10 }} />
            </TouchableOpacity>
          </View>       
      
    </View>
    );
  }
}


const mapStateToProps = state => {
  console.log(state.AppReducer.indicePerguntaAtual); 
 console.log(state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].fotos); 
 console.log(this.props);
 return {
      photos: [...state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].fotos],
      questionId: state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].perguntaId       
  }
}

export default connect(mapStateToProps,{photoPreview, cancelAddPhoto})(Camera);