import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { FaUserShield, FaEdit, FaTrash, FaUser, FaUserTie, FaHome, FaSignOutAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SystemAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
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
    if (!user || user.role !== 'system_admin') {
      navigate('/system-admin/login');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/system-admin/login');
  };

  const handleHome = () => {
    navigate('/home');
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token);
      
      const response = await axios.get('http://localhost:5560/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Users response:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response || error);
      setError(error.response?.data?.message || 'Failed to fetch users');
      if (error.response?.status === 401) {
        navigate('/system-admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5560/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
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
      const response = await axios.put(
        `http://localhost:5560/api/auth/users/${editingUser._id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUsers(users.map(user => 
        user._id === editingUser._id ? response.data : user
      ));
      setEditingUser(null);
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const renderUserSection = (role, title, icon) => {
    const filteredUsers = users.filter(user => user.role === role);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          {icon}
          <h2 className="text-xl font-semibold ml-2">{title}</h2>
          <span className="ml-2 text-gray-500">({filteredUsers.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div key={user._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.fullName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    {user.region} {user.zone ? `- ${user.zone}` : ''}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FaUserShield className="text-3xl text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 ml-2">System Administration</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleHome}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FaHome className="mr-2" />
              Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {renderUserSection('national_admin', 'National Administrators', <FaUserShield className="text-2xl text-indigo-600" />)}
        {renderUserSection('admin', 'Regional Administrators', <FaUserTie className="text-2xl text-blue-600" />)}
        {renderUserSection('zone_admin', 'Zone Administrators', <FaUserTie className="text-2xl text-green-600" />)}
        {renderUserSection('voter', 'Voters', <FaUser className="text-2xl text-gray-600" />)}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone</label>
                  <input
                    type="text"
                    value={editForm.zone}
                    onChange={(e) => setEditForm({...editForm, zone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="voter">Voter</option>
                    <option value="admin">Regional Admin</option>
                    <option value="zone_admin">Zone Admin</option>
                    <option value="national_admin">National Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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

export default SystemAdminDashboard; 