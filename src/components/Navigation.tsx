import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();

  if (isLoading) {
    return <nav className="navigation">Loading...</nav>;
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">Web Application</Link>
      </div>
      
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/csv-upload">CSV Upload</Link>
            <div className="user-info">
              <span>Welcome, {user?.name || user?.email}</span>
              <button 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => loginWithRedirect()}
            className="login-btn"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
