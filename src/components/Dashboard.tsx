import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './Dashboard.css';

interface CsvProcessingStats {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  successRate: number;
  latestProcessingTimestamp?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [stats, setStats] = useState<CsvProcessingStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: 'Bearer ' + token };

        // Fetch CSV processing stats
        const statsResponse = await axios.get(apiBaseUrl + '/api/csvrecords/stats', { headers });
        setStats(statsResponse.data);

        // Fetch recent users
        const usersResponse = await axios.get(apiBaseUrl + '/api/users', { headers });
        setRecentUsers(usersResponse.data.slice(0, 5)); // Get latest 5 users

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAccessTokenSilently, apiBaseUrl]);

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || user?.email}</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-section">
          <h2>CSV Processing Statistics</h2>
          {stats ? (
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Total Records</h3>
                <p className="stat-number">{stats.totalRecords}</p>
              </div>
              <div className="stat-card">
                <h3>Processed</h3>
                <p className="stat-number">{stats.processedRecords}</p>
              </div>
              <div className="stat-card">
                <h3>Failed</h3>
                <p className="stat-number">{stats.failedRecords}</p>
              </div>
              <div className="stat-card">
                <h3>Success Rate</h3>
                <p className="stat-number">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          ) : (
            <p>No processing statistics available</p>
          )}
        </div>

        <div className="recent-users-section">
          <h2>Recent Users</h2>
          {recentUsers.length > 0 ? (
            <div className="users-list">
              {recentUsers.map(userItem => (
                <div key={userItem.id} className="user-item">
                  <div className="user-info">
                    <h4>{userItem.name}</h4>
                    <p>{userItem.email}</p>
                  </div>
                  <small>Created: {new Date(userItem.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No users found</p>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <a href="/users" className="action-btn">Manage Users</a>
            <a href="/csv-upload" className="action-btn">Upload CSV</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
