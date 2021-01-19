/** @format */
import './src/config/reactronConfig';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './src/app.json';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Class RCTCxxModule']);

AppRegistry.registerComponent(appName, () => App);
