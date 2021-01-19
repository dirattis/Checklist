
"use strict";
import {API_NAME} from '../shared';
import {Auth} from 'aws-amplify';

async function customHeader(){  
  return {     
    Authorization: (await Auth.currentSession()).idToken.jwtToken
  } 
}

const awsConfig = {
  Auth: {
    identityPoolId: 'us-east-1:cd554cc6-93a0-49a3-a5d7-9d0f9503e24a',
    region: 'us-east-1',
    userPoolId: 'us-east-1_qKw2LrN1g',
    userPoolWebClientId: '23fsh3c6b6fe7kmmimd8oq45vc'
  },
  Storage: {
    bucket:'main-bucket-check-g3s', region: 'us-east-2'
  },
  API: {
    endpoints: [
        {
            name: API_NAME,
            endpoint: "https://vdtuo1devj.execute-api.us-east-1.amazonaws.com/dev/checklist",
            custom_header: customHeader,
            service: "lambda",
            region: "us-east-1"
            
        }
    ]
  }    
}

export default awsConfig;

