import GoogleButton from 'react-google-button'
import { GoogleLogin } from '@react-oauth/google';

/*
*TODO:1)Look into callbacks add necessary code for getting info from login
*     2)Look for alternative method, we need to protect the routes
*     3)Why did they use fire base ? 
*/


function Login()
{ 
  return(
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '300px' }}>
            <GoogleLogin
              clientId  = {process.env.REACT_APP_GOOGLE_CLIENT_ID}
              onSuccess={credentialResponse => {
                console.log(credentialResponse);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
    </div>
    );
    
}

export default Login;