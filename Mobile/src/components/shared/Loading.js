import React, { Component } from 'react';
import { Modal, View, ActivityIndicator } from 'react-native';

class Loading extends Component {

    constructor(props){            
        super(props);
    }

    render() 
    {
        return (
            <Modal
            animationType={this.props.animation || 'none'}
            transparent={true}
            visible={this.props.loading}
            onRequestClose={() => false}>
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                <ActivityIndicator
                    animating={this.props.loading} size="large" color='#fff' />
                </View>
            </View>
            </Modal>       
            )
    }
        
}

const styles = {
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-around',
      backgroundColor: '#00000040'
    },
    activityIndicatorWrapper: {
      backgroundColor: 'transparent',
      height: 100,
      width: 100,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around'
    }
  }

export default Loading;