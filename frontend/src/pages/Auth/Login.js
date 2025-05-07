import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/sjsu-logo.png';

function Login() {
  const { googleLogin, isAuthenticated, error } = useAuth();
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left panel */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#00274C',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 5,
          py: 6,
          textAlign: 'center',
          background: 'linear-gradient(to bottom right, #00274C, #004B87)',
        }}
      >
        <Avatar
          alt="SJSU Logo"
          src={Logo}
          sx={{ width: 100, height: 100, mb: 4 }}
        />
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Spartan Share
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Collaborate. Share. Succeed.
        </Typography>
        <Typography variant="body2" sx={{ color: '#ccc', maxWidth: 400 }}>
          A secure cloud-based platform exclusively for San José State University students and faculty to share files, host meetings, and work together.
        </Typography>
      </Box>

      {/* Right panel - Login card */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
          py: 6,
          backgroundColor: '#f8f9fa',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            p: 4,
            borderRadius: 4,
            boxShadow: 4,
            backgroundColor: '#ffffff',
          }}
        >
          <Typography variant="h5" fontWeight={600} align="center" sx={{ mb: 2 }}>
            Sign in with SJSU
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {(loginError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError || error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setLoginError('Login failed. Please try again.')}
              useOneTap
            />
          </Box>

          <Typography variant="caption" align="center" display="block" sx={{ color: '#555' }}>
            Use your <strong>@sjsu.edu</strong> email to access Spartan Share.
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;