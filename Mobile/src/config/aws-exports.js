//identityPoolId: 'us-east-2:ee0d15e7-855a-460f-8d4a-ac422cfd1cc7',
"use strict";
import {API_NAME} from '../shared';
import {Auth} from 'aws-amplify';

async function customHeader(){    
  console.log('call customHeader');
  return { Authorization: (await Auth.currentSession()).idToken.jwtToken } 
}

const awsConfig = {
  Auth: {
    identityPoolId: 'secret',    
    region: 'secret',
    userPoolId: 'secret',
    userPoolWebClientId: 'secret'
  },
  Storage: {
    bucket:'secret', region: 'secret'
  },
  API: {
    endpoints: [
        {
            name: API_NAME,
            endpoint: "secret",
            custom_header: customHeader,
            service: "lambda",
            region: "secret"
            
        }
    ]
}    
}
  
  export default awsConfig;
