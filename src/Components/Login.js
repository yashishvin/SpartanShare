import { Card, CardContent, Typography, Box } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
/*
*TODO:1)Look into callbacks add necessary code for getting info from login
*     2)Look for alternative method, we need to protect the routes
*     3)Why did they use fire base ? 
*/


function Login()
{ 
  return(
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#121212' 
    }}>
      <Card sx={{ 
        bgcolor: '#708090', 
        color: '#fff', 
        minWidth: 455, 
        minHeight: 350, 
        borderRadius: 3,
        boxShadow: 8 
      }}>
        {/* Yellow Banner */}
        <Box sx={{ 
          bgcolor: '#fdd835', 
          padding: 2, 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12 
        }}>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ color: '#000', fontWeight: 600 }}
          >
            Welcome to Spartan Share
          </Typography>
        </Box>

        {/* Content */}
        <CardContent>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Welcome, Spartan!! Sign in to begin your mission.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 5 
            }}
          >
            <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              onSuccess={credentialResponse => {
                console.log(credentialResponse);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </div>
    );
    
}

export default Login;