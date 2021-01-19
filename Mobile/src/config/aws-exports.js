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
    identityPoolId: 'us-east-1:cd554cc6-93a0-49a3-a5d7-9d0f9503e24a',    
    region: 'us-east-1',
    userPoolId: 'us-east-1_qKw2LrN1g',
    userPoolWebClientId: '5nuk5p3m5ucggv7gvbdmn834qg'
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
