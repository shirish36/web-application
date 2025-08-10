import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import CsvUpload from './components/CsvUpload';
import ProtectedRoute from './components/ProtectedRoute';

const domain = process.env.REACT_APP_AUTH0_DOMAIN || 'your-auth0-domain.auth0.com';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || 'your-auth0-client-id';
const audience = process.env.REACT_APP_AUTH0_AUDIENCE || 'https://your-api.com';

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "read:users write:users read:csv write:csv"
      }}
    >
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/csv-upload" 
                element={
                  <ProtectedRoute>
                    <CsvUpload />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </Auth0Provider>
  );
}

export default App;
