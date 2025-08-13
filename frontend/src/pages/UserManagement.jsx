import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { FaEdit, FaTrash, FaUser, FaUserShield, FaUserTie, FaUserCircle } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    region: '',
    zone: '',
    role: ''
  });

  useEffect(() => {
    // Check if user is authorized
    if (!user || (user.role !== 'national_admin' && user.role !== 'system_admin')) {
      navigate('/unauthorized');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5560/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5560/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      region: user.region,
      zone: user.zone,
      role: user.role
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5560/api/auth/users/${editingUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'national_admin':
        return <FaUserShield className="text-purple-600" />;
      case 'system_admin':
        return <FaUserShield className="text-indigo-600" />;
      case 'admin':
        return <FaUserTie className="text-blue-600" />;
      case 'zone_admin':
        return <FaUserCircle className="text-green-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'national_admin':
        return 'bg-purple-100 text-purple-800';
      case 'system_admin':
        return 'bg-indigo-100 text-indigo-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'zone_admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUserSection = (role, title) => {
    const filteredUsers = users.filter(u => u.role === role);
    if (filteredUsers.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div key={user._id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(user.role)}
                  <div>
                    <h3 className="font-semibold">{user.fullName}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Region:</span> {user.region}
                </p>
                {user.zone && (
                  <p className="text-sm">
                    <span className="font-medium">Zone:</span> {user.zone}
                  </p>
                )}
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center mt-10 text-xl">Loading Users...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center text-red-500 mt-10">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

        {renderUserSection('national_admin', 'National Administrators')}
        {renderUserSection('system_admin', 'System Administrators')}
        {renderUserSection('admin', 'Regional Administrators')}
        {renderUserSection('zone_admin', 'Zone Administrators')}
        {renderUserSection('voter', 'Voters')}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone</label>
                  <input
                    type="text"
                    value={editForm.zone}
                    onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserManagement; 