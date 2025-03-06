import GoogleButton from 'react-google-button'
import { GoogleLogin } from '@react-oauth/google';
function HandleLogin()
{
  console.log('Success logging in')
}
function HandleLoginError()
{
  console.log('error logging in')
}
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
             onSuccess = { HandleLogin() }
             onError   = { HandleLoginError() }/>
    </div>
    );
    
}

export default Login;