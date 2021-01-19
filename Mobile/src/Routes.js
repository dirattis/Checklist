import React from 'react';
import {Image, View} from 'react-native';
import { Router, Scene, Tabs, Actions } from 'react-native-router-flux';
import {styles} from './config/appStyles';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ConfirmSignUp from './components/ConfirmSignUp';
import Main from './components/Main';
import Home from './components/Home';
import Camera from './components/Camera';
import Photo from './components/Photo';
import PhotoPreview from './components/PhotoPreview';
import Checklist from './components/Checklist';
import NavbarHome from './components/shared/NavbarHome';
import CustomNavBar from './components/shared/CustomNavBar';
import Settings from './components/Settings';


export default props => (
    <Router navigationBarStyle={styles.colorBackground} titleStyle={{ color: '#fff' }} >
        <Scene key="root" >
            <Scene key='loginForm' component={LoginForm} title="Login" hideNavBar={true}  />
            <Scene key='registerForm' component={RegisterForm} title="Cadastro"  navBar={CustomNavBar}
                    hideNavBar={false} />
            <Scene key='confirmSignUp' component={ConfirmSignUp} title="Confirme" navBar={CustomNavBar}
                     hideNavBar={false} />
            <Scene key='main' component={Main} hideNavBar={false} navBar={CustomNavBar}/>
            <Scene key='settings' component={Settings} title="Configurações" hideNavBar={false} navBar={CustomNavBar}/>
          
            {/* <Scene key='home' hideNavBar={true} initial tabs={true} 
                headerMode='none' wrap={false} tabStyle={{backgroundColor: '#4D5E6A'}} > */}
            <Tabs key='home' 
                    showLabel={true} hideNavBar activeTintColor='#fff'
                    activeBackgroundColor='#02283d'
                    inactiveBackgroundColor='#033044'                   
                    navigationBarStyle={{backgroundColor:'#233644', borderBottomColor: 'transparent'}}
                    swipeEnabled={false} 
                >
                <Scene key="Home" component={Home} title="" navBar={NavbarHome} 
                    icon={({ focused }) => ( 
                        <Image source={require('./imgs/icone_home.png')} style={{width:30, height:25}}/>
                        // <Icon
                        //     size={25}
                        //     color={focused ? '#fff' : '#ccc'}                      
                        //     name={'home'}
                        // />
                    )}
                 />
                 <Scene key="pendentes" component={Checklist} title="Tarefas pendentes" navBar={CustomNavBar}
                    icon={({ focused }) => (
                            <Image source={require('./imgs/icone_pendente.png')} style={{width:30, height:25}}/>
                        // <Icon
                        //     size={25}
                        //     color={focused ? '#fff' : '#ccc'}                      
                        //     name={'checklist'}
                        // />
                    )}
                 />
                    <Scene key="finalizadas" component={Checklist} title="Tarefas concluídas" navBar={CustomNavBar}
                     icon={({ focused }) => (
                        <Image source={require('./imgs/icone_concluido.png')} style={{width:30, height:25}}/>
                        // <Icon
                            
                        //     size={25}
                        //     color={focused ? '#fff' : '#ccc'}                      
                        //     name={'checklist'}
                        // />
                    )}
                />
                </Tabs>
            <Scene key='camera' component={Camera}  hideNavBar={false} navBar={CustomNavBar}
                    backButtonTintColor='#fff' backButtonTextStyle={{color:'#fff'}} backTitle="Perguntas"/>
            <Scene key='photo' component={Photo}  title="Photo" hideNavBar={false} navBar={CustomNavBar}
                 backButtonTintColor='#fff' backButtonTextStyle={{color:'#fff'}} backTitle=""/>
            <Scene key='photoPreview' component={PhotoPreview}  title="Preview" hideNavBar={true}/>
        </Scene>
    </Router>
);
