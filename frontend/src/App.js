import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard'; // You'll need to create this
import WatchPartyHome from './pages/WatchParty/WatchPartyHome';
import WatchPartyRoom from './pages/WatchParty/WatchPartyRoom';

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/folder/:folderId" element={<Dashboard />} />
              <Route path="/shared" element={<Dashboard mode="shared" />} />
              {/* <Route path="/watchparty" element={<Dashboard mode="watchparty" />} /> */}
              <Route path="/watchparty" element={<WatchPartyHome />} />
              <Route path="/watchparty/:roomName" element={<WatchPartyRoom />} />
              <Route path="/trash" element={<Dashboard mode="trash" />} />
              {/* Add more protected routes here */}
            </Route>
            
            {/* Redirect to login for any other route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;