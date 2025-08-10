import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './UserManagement.css';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

const UserManagement: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserRequest>({ name: '', email: '' });

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  const fetchUsers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(apiBaseUrl + '/api/users', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      await axios.post(apiBaseUrl + '/api/users', newUser, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setNewUser({ name: '', email: '' });
      setShowCreateForm(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      await axios.delete(apiBaseUrl + '/api/users/' + userId, {
        headers: { Authorization: 'Bearer ' + token }
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="user-management loading">Loading users...</div>;
  }

  if (error) {
    return <div className="user-management error">Error: {error}</div>;
  }

  return (
    <div className="user-management">
      <div className="header">
        <h1>User Management</h1>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-btn"
        >
          {showCreateForm ? 'Cancel' : 'Create User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={createUser} className="create-form">
            <h3>Create New User</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Create User</button>
          </form>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="no-users">
            <p>No users found. Create your first user!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
