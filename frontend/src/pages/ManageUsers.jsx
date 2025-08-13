import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { FaEdit, FaTrash, FaUserEdit, FaUserMinus, FaKey } from 'react-icons/fa';

const ManageUsers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    region: '',
    zone: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      let response;
      if (user.role === 'national_admin') {
        response = await axios.get('http://localhost:5560/api/auth/regional-admins');
      } else if (user.role === 'admin') {
        response = await axios.get(`http://localhost:5560/api/auth/zone-admins/${user.region}`);
      } else if (user.role === 'zone_admin') {
        response = await axios.get(`http://localhost:5560/api/auth/voters/${user.zone}`);
      }
      setUsers(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      region: user.region,
      zone: user.zone,
      password: '' // Reset password field
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Remove password if not provided
      }
      
      await axios.put(`http://localhost:5560/api/auth/users/${editingUser._id}`, updateData);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update user', { variant: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5560/api/auth/users/${userId}`);
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsers();
      } catch (error) {
        enqueueSnackbar('Failed to delete user', { variant: 'error' });
      }
    }
  };

  const getTitle = () => {
    if (user.role === 'national_admin') return 'Manage Regional Admins';
    if (user.role === 'admin') return 'Manage Zone Admins';
    return 'Manage Voters';
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{getTitle()}</h1>
      
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {user.role === 'national_admin' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              {user.role === 'admin' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Zone</label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              {user.role === 'national_admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              )}
              {user.role === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                {user.role === 'national_admin' && (
                  <td className="px-6 py-4 whitespace-nowrap">{user.region}</td>
                )}
                {user.role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap">{user.zone}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FaEdit className="inline-block" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="inline-block" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
