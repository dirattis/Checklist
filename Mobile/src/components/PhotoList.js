import React, { Component } from 'react';
import {connect} from 'react-redux';
import { ImageBackground, ScrollView, Dimensions, TouchableOpacity, View, CameraRoll, Alert, PermissionsAndroid} from 'react-native';
import DismissKeyboard from './shared/DismissKeyboard';
import Icon from 'react-native-vector-icons/Entypo';
import IconIos from 'react-native-vector-icons/Ionicons';
import moment from 'moment/min/moment-with-locales';
import {Actions} from 'react-native-router-flux';
import {cancelAddPhoto, savePhotos, addPhoto} from '../actions/AppActions';
import _ from 'lodash';
import {styles} from '../config/appStyles';

moment.locale('pt-br');
const { width } = Dimensions.get('window');

const HEIGHT_COMENTARIO = 40;
const MAX_HEIGHT_COMENTARIO = HEIGHT_COMENTARIO * 4;
class PhotoList extends Component{  
    
    constructor(props){
        super(props);

        let photosState = _.map(this.props.photos, function(element) { 
            return _.extend({}, element, {comentario: ''});
        });

        this.state = { 
            currentPage: 0,
            textHeight: HEIGHT_COMENTARIO,
            photosState,
            margin: { marginBottom: 20}
        }
    }

    updateAnnotation(annotation, indexPhoto){
        let photosUpdateAnnotation = [...this.state.photosState];
        photosUpdateAnnotation[indexPhoto].comentario = annotation;
        this.setState({photosState: [...photosUpdateAnnotation]});
    }
  
    handlePageChange(e){
        let offset = e.nativeEvent.contentOffset;
        if(offset) {
          let newPage = Math.round(offset.x / width) + 1;
          if(this.state.currentPage != newPage) {
            this.setState({currentPage: newPage});
          }
        }
      }

    updateSize(height){
        console.log(height);
        if(height < MAX_HEIGHT_COMENTARIO)
            this.setState({
                textHeight: height + 10
            });
      }
    
    addPhotoPreview(){
        this.props.addPhoto(this.props.questionId, this.state.photosState[this.state.photosState.length - 1]);
    }
      
    async _savePhotos(){
        let photos = [...this.state.photosState];
        let photosCount = 0;
        let errors = [];
        let photosUpdateState = [];

        try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Permissão de Acesso',
                message: 'Permite que o G3List acesse sua galeria para a gravação de fotos e outros arquivos?',
                buttonNegative: 'Não',
                buttonPositive: 'Sim',
              },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Você pode gravar a foto');
            } else {
              console.log('Acesso negado para gravação');
              return;
            }
          

        
        photos.forEach(photo => {
            CameraRoll.saveToCameraRoll(photo.uri,'photo').then(uriSaved => {
                photo.uri = uriSaved;
                photo.isCached =false;
                photo.date = new Date();                
            })
            .then(x => {
                photosCount++;  
                photosUpdateState.push(photo);             
                if(photosCount == photos.length){
                    if(photosUpdateState.length > 0)
                        this.props.savePhotos({questionId: this.props.questionId, photos: photosUpdateState});
                    
                    if(errors.length > 0)
                        Alert.alert('Atenção','Uma ou mais fotos não foram salvas. ' + errors[0]);
                }
            })
            .catch((err) => {    
                photosCount++;
                errors.push(err);
                if(photosCount == photos.length){                   

                    if(photosUpdateState.length > 0)
                        this.props.savePhotos({questionId: this.props.questionId, photos: photosUpdateState});

                    Alert.alert('Atenção','Uma ou mais fotos não foram salvas. ' + err);
                }
            });
        });

        } catch (err) {
            console.warn(err);
        }
    }

    render(){
        const {textHeight} = this.state;

        var annotationTextStyle = {
            height: textHeight
        }

        return (
                <ScrollView horizontal={true} pagingEnabled={true}  ref={ref => this.scrollView = ref}
                            onContentSizeChange={(contentWidth, contentHeight)=>{        
                                this.scrollView.scrollToEnd();
                            }} onMomentumScrollEnd={this.handlePageChange.bind(this)}
                >
                    {
                        this.state.photosState.map((photo, index) => 
                            {
                                let penultPhoto = this.state.photosState.length > 1 ? this.state.photosState[this.state.photosState.length - 2] : null;
                                return (
                                                <View style={styles.headerFromLeft}>
                                                    <TouchableOpacity onPress={() => this.props.cancelAddPhoto(photo.uri, this.props.questionId, penultPhoto)}>
                                                        <IconIos                             
                                                            size={30}
                                                            color={'#fff'}                      
                                                            name={'md-close'}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                                
                                        )
                            }
                        )
                    }
                </ScrollView>  
                )
    }
}

const mapStateToProps = state => {
    let cachedPhotos = state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].fotos || [];
    cachedPhotos = cachedPhotos.filter(x => x.isCached);
    console.log(cachedPhotos);
   return {
        photos: [...cachedPhotos],
        questionId: state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].perguntaId       
    }
  }

export default connect(mapStateToProps, {})(PhotoList);