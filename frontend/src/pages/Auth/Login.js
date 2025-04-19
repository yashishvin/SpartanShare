import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Alert } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const { googleLogin, isAuthenticated, error } = useAuth();
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse);
      navigate('/dashboard');
    } catch (err) {
      setLoginError('Login failed. Please ensure you are using an SJSU email.');
    }
  };

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
          
          {(loginError || error) && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {loginError || error}
            </Alert>
          )}
          
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 5 
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setLoginError('Login failed. Please try again.');
              }}
              useOneTap
            />
          </Box>
          
          <Typography variant="body2" align="center" sx={{ mt: 4, fontSize: '0.8rem' }}>
            Spartan Share is exclusively for SJSU students and faculty.
            Please use your SJSU email to sign in.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;