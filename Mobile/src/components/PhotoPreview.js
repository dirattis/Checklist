import React, { Component } from 'react';
import {connect} from 'react-redux';
import { ImageBackground, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Keyboard, Platform, TouchableOpacity, View, CameraRoll, Alert, PermissionsAndroid} from 'react-native';
import DismissKeyboard from './shared/DismissKeyboard';
import Icon from 'react-native-vector-icons/Entypo';
import IconIos from 'react-native-vector-icons/Ionicons';
import moment from 'moment/min/moment-with-locales';
import Loading from './shared/Loading';
import {cancelAddPhoto, savePhotos, addPhoto, loadingProcess} from '../actions/AppActions';
import _ from 'lodash';
import {styles} from '../config/appStyles';
import Amplify from 'aws-amplify';
import awsConfig from '../config/aws-exports';
import { Storage } from 'aws-amplify';
import RNFetchBlob from 'rn-fetch-blob';
global.Buffer = require('buffer').Buffer;

Amplify.configure(awsConfig);
moment.locale('pt-br');
const { width } = Dimensions.get('window');

const HEIGHT_COMENTARIO = 40;
const MAX_HEIGHT_COMENTARIO = HEIGHT_COMENTARIO * 4;
class PhotoPreview extends Component{  
    
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

    keyboardWillShow = (event) => {

        if(Platform.OS === 'android')
            this.setState({ margin: { marginBottom: 40} }); 
        else
            this.setState({ margin: { marginBottom: 20} }); 
        
      };
    
      keyboardWillHide = (event) => {
        console.log('desceu')
        this.setState({ margin: { marginBottom: 20} });
        
      };

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
      
    readFile(filePath){
        return RNFetchBlob.fs.readFile(filePath, 'base64').then(data => new Buffer(data, 'base64'));
    }

    async _savePhotos(){
        let photos = [...this.state.photosState];
        let photosCount = 0;
        let errors = [];
        let photosUpdateState = [];

        try {
            if(Platform.OS === 'android'){
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
            }
          
        console.log(photos);        

        photos.forEach(photo => {
            this.props.loadingProcess();
            CameraRoll.saveToCameraRoll(photo.uri,'photo').then(uriSaved => {
                photo.uri = uriSaved;
                photo.isCached =false;
                photo.date = new Date();                
            })
            .then(x => {
                photosCount++;  
                photosUpdateState.push(photo);             
                if(photosCount == photos.length){
                    if(photosUpdateState.length > 0){
                        //this.props.savePhotos({questionId: this.props.questionId, photos: photosUpdateState});

                        photosUpdateState.forEach(f => {
                            if (f.uri) {                                
                                this.readFile(f.uri).then(buffer => buffer)
                                .then(buffer => {
                                    return Storage.put(`${this.props.userCognito}/${this.props.questionId}/${new Date(f.date).getTime()}_photo_${this.props.questionId}.jpeg`, buffer, {
                                        contentType: 'image/jpeg'
                                    })
                                })
                                .then(objkey => Storage.get(objkey.key).then(path => 
                                    {
                                        console.log(path);
                                        f.uri = path.substring(0, path.indexOf("?")); 

                                        this.props.savePhotos({questionId: this.props.questionId, photos: [f] });
                                        
                                    }))
                                .catch(err => {
                                    
                                    console.log(err);
                                    errors.push(err);
                                });
                            }
                        });
                    }
                    
                    this.props.loadingProcess();
                    if(errors.length > 0){                        
                        Alert.alert('Atenção','Uma ou mais fotos não foram salvas. ' + errors.join(' .'));
                    }
                }
            })
            .catch((err) => {    
                this.props.loadingProcess();
                errors.push(err);           
                Alert.alert('Atenção','Uma ou mais fotos não foram salvas. ' + errors.join(' .'));
            
            });
        });

        } catch (err) {
            this.props.loadingProcess();
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
                <Loading loading={this.props.loading}/>
                    {
                        this.state.photosState.map((photo, index) => 
                            {
                                let penultPhoto = this.state.photosState.length > 1 ? this.state.photosState[this.state.photosState.length - 2] : null;
                                return (
                                        <KeyboardAvoidingView key={index}  style={{flex: 1}} behavior={(Platform.OS === 'ios') ? "padding" : null}>
                                        <DismissKeyboard>
                                            <ImageBackground style={{ flex: 1, width: width }} source={{uri: photo.uri}}>
                                                <View style={styles.headerFromLeft}>
                                                    <TouchableOpacity onPress={() => this.props.cancelAddPhoto(photo.uri, this.props.questionId, penultPhoto)}>
                                                        <IconIos                             
                                                            size={30}
                                                            color={'#fff'}                      
                                                            name={'md-close'}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={[styles.viewComentario, this.state.margin]}>
                                                    {/* <TouchableOpacity onPress={() => this.addPhotoPreview()} style={styles.btnCircle}>
                                                        <IconIos                                
                                                            size={30}
                                                            color={'#fff'}                      
                                                            name={'ios-camera'}
                                                        />
                                                    </TouchableOpacity> */}
                                                    <View style={styles.viewTxtComentario}>
                                                        <TextInput onSubmitEditing={Keyboard.dismiss}
                                                            editable={true}
                                                            multiline={true}
                                                            autoCapitalize='none'
                                                            underlineColorAndroid="transparent"
                                                            value={photo.comentario} 
                                                            maxLength={1000}
                                                            style={[annotationTextStyle, styles.txtComentario]} 
                                                            placeholder='Adicione um comentário...'                                         
                                                            onChangeText={texto => this.updateAnnotation(texto, index)}
                                                            onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)} 
                                                        />
                                                    </View>
                                                    <TouchableOpacity style={styles.btnCircle} 
                                                        onPress={() => this._savePhotos()} >
                                                        <Icon                                        
                                                        size={25}
                                                        color={'#fff'}                      
                                                        name={'save'}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </ImageBackground>
                                        </DismissKeyboard>
                                        </KeyboardAvoidingView>
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
        questionId: state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].perguntaId,
        userCognito: state.AppReducer.user,
        loading: state.AppReducer.loading
    }
  }

export default connect(mapStateToProps, {cancelAddPhoto, savePhotos, addPhoto, loadingProcess})(PhotoPreview);