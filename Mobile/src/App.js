import React, { Component } from 'react';
import { Provider } from 'react-redux';
//import { createStore, applyMiddleware } from 'redux';
import { applyMiddleware } from 'redux';
import Reactotron from './config/reactronConfig';
import ReduxThunk from 'redux-thunk';
import Routes from './Routes';
import reducers from './reducers';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react';
import Loading from './components/shared/Loading';

const persistConfig = {
    key: 'root',
    storage,
    whitelist:['AutenticacaoReducer']
  }
  
const persistedReducer = persistReducer(persistConfig, reducers);
//const store = createStore(persistedReducer, {}, applyMiddleware(ReduxThunk));
const store = Reactotron.createStore(persistedReducer, {}, applyMiddleware(ReduxThunk));
let persistor = persistStore(store)

{/* <Provider store={createStore(reducers, {}, applyMiddleware(ReduxThunk))}> */}

class App extends Component {

    render() {
        return (
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Routes />                    
                </PersistGate>
            </Provider>
        );
    }
}

export default App;