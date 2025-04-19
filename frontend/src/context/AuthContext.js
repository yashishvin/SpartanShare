import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in when the app loads
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Verify token with backend
        const response = await api.get('/auth/verify');
        setUser(response.data.user);
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Google Login
  const googleLogin = async (credentialResponse) => {
    try {
      setError(null);
      
      // Send Google token to backend
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential
      });
      
      // Store JWT token from our backend
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser(user);
      
      return user;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      googleLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);