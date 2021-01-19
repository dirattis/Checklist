import React, { Component } from 'react';
import { ImageBackground, ScrollView, Dimensions, TextInput, TouchableOpacity, View, CameraRoll, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import IconIos from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import {cancelAddPhoto, savePhotos, addPhoto} from '../actions/AppActions';
import moment from 'moment/min/moment-with-locales';
import {Actions} from 'react-native-router-flux';
import {styles} from '../config/appStyles';
import _ from 'lodash';

moment.locale('pt-br');
const { width } = Dimensions.get('window');
const HEIGHT_COMENTARIO = 40;
const MAX_HEIGHT_COMENTARIO = HEIGHT_COMENTARIO * 4;

class Photo extends Component{  
    
    constructor(props){
        super(props);

        this.state = { 
            currentPage: 0
        }
    }
    
    
    handlePageChange(e){
        let offset = e.nativeEvent.contentOffset;
        if(offset) {
          let newPage = Math.round(offset.x / width) + 1;
          if(this.state.currentPage != newPage) {
            this.setState({currentPage: newPage});
            this.updateTitle(newPage - 1);
          }
        }
      }

    updateTitle(indexPhoto){
        let newTitle = moment(this.props.photos[indexPhoto].date).calendar();
        Actions.refresh({title: newTitle});
    }

    renderImage(photo, index){
            return  (<ImageBackground key={index} style={{ flex: 1, width: width }} source={{uri: photo.uri}} >
                        <View style={[styles.viewComentario, { marginBottom:20 }]}>
                            <Text style={[{fontSize: 25, fontStyle:'italic' ,color:'#fff' }]}> {photo.comentario}</Text>                           
                        </View>
                    </ImageBackground>)
                
    }

    render(){

        return (
                <ScrollView horizontal={true} pagingEnabled={true}  ref={ref => this.scrollView = ref}
                            onContentSizeChange={(contentWidth, contentHeight)=>{        
                                this.scrollView.scrollToEnd();
                            }} onMomentumScrollEnd={this.handlePageChange.bind(this)}
                >
                    {
                        this.props.photos.map((photo, index) => 
                            this.renderImage(photo, index)
                        )
                    }
                </ScrollView>  
                )
    }
}

const mapStateToProps = state => {
    let photos = state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].fotos || [];
    console.log(photos);
    return {
        photos: [...photos],
        questionId: state.AppReducer.perguntas[state.AppReducer.indicePerguntaAtual].perguntaId       
    }
  }

export default connect(mapStateToProps, {cancelAddPhoto, savePhotos, addPhoto})(Photo);