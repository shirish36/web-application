import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to CSV Processing Application</h1>
        <p>
          A comprehensive solution for managing users and processing CSV files with OAuth-based authentication.
        </p>
        
        {!isAuthenticated ? (
          <div className="auth-section">
            <h2>Get Started</h2>
            <p>Sign in to access your dashboard and start managing your data.</p>
            <button 
              onClick={() => loginWithRedirect()}
              className="cta-button"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <div className="welcome-back">
            <h2>Welcome Back!</h2>
            <p>Continue to your dashboard to manage your data.</p>
            <a href="/dashboard" className="cta-button">Go to Dashboard</a>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h3> Secure Authentication</h3>
            <p>OAuth-based login with Auth0 for secure access to your data.</p>
          </div>
          <div className="feature">
            <h3> User Management</h3>
            <p>Create, update, and manage user accounts with a comprehensive interface.</p>
          </div>
          <div className="feature">
            <h3> CSV Processing</h3>
            <p>Upload and process CSV files with real-time status tracking.</p>
          </div>
          <div className="feature">
            <h3> Dashboard</h3>
            <p>Monitor your data and processing activities with detailed analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
