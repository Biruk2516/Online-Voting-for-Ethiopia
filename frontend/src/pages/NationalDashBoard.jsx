import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header2 from '../components/Header2';
import Footer from '../components/Footer';
import ResultGenerator from '../components/ResultGenerator';

// National Admin credentials
const NATIONAL_ADMIN_EMAIL = 'national.admin@ethiopia.gov';
const NATIONAL_ADMIN_PASSWORD = 'NationalAdmin@2024';

const NationalDashboard = () => {
  const [results, setResults] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [showGenerator, setShowGenerator] = useState(false);
  const [regionalAdmins, setRegionalAdmins] = useState([]);
  const [showAdmins, setShowAdmins] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    region: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth(token);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      console.log('Checking auth with token:', token);
      const res = await axios.get('http://localhost:5560/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Auth response:', res.data);

      if (res.data.user.role === 'national_admin') {
        setIsAuthenticated(true);
        fetchNationalStats();
      } else {
        console.log('User is not national admin:', res.data.user.role);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      if (email === NATIONAL_ADMIN_EMAIL && password === NATIONAL_ADMIN_PASSWORD) {
        const res = await axios.post('http://localhost:5560/api/auth/login', {
          email,
          password
        });
        console.log('Login response:', res.data);

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          setIsAuthenticated(true);
          fetchNationalStats();
        } else {
          setLoginError('Invalid response from server');
        }
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  const fetchNationalStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5560/api/auth/national-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(res.data.result);
      setTotalVoters(res.data.votersCount);
    } catch (error) {
      console.error('❌ Error fetching national stats:', error);
    }
  };

  const fetchRegionalAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching regional admins with token:', token);
      
      if (!token) {
        setLoginError('No authentication token found');
        return;
      }

      const res = await axios.get('http://localhost:5560/api/auth/regional-admins', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Regional admins response:', res.data);
      setRegionalAdmins(res.data);
      setShowAdmins(true);
      setLoginError(''); // Clear any previous errors
    } catch (error) {
      console.error('❌ Error fetching regional admins:', error);
      console.error('Error response:', error.response?.data);
      setLoginError(error.response?.data?.message || 'Failed to fetch regional admins');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      fullName: admin.fullName,
      email: admin.email,
      region: admin.region,
      password: ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete updateData.password;
      }

      await axios.put(`http://localhost:5560/api/auth/users/${editingAdmin._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state
      setRegionalAdmins(prev => prev.map(admin => 
        admin._id === editingAdmin._id ? { ...admin, ...updateData } : admin
      ));

      setEditingAdmin(null);
      setEditForm({
        fullName: '',
        email: '',
        region: '',
        password: ''
      });
    } catch (error) {
      console.error('Error updating admin:', error);
      setLoginError('Failed to update admin');
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this regional admin?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5560/api/auth/users/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state
      setRegionalAdmins(prev => prev.filter(admin => admin._id !== adminId));
    } catch (error) {
      console.error('Error deleting admin:', error);
      setLoginError('Failed to delete admin');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">National Admin Login</h1>
          {loginError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {loginError}
            </div>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            handleLogin(email, password);
          }}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Header2 />
      <h1 className="text-3xl font-bold mb-4">🌍 National Admin Dashboard</h1>
      <p className="mb-6 text-gray-700">Total Unique Voters: {totalVoters}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate('/addCandidate')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow"
        >
          👥 Register Candidates
        </button>
        <button
          onClick={fetchRegionalAdmins}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow"
        >
          👨‍💼 Manage Regional Admins
        </button>
        <button
          onClick={() => setShowGenerator(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold shadow"
        >
          📊 Generate Results
        </button>
      </div>

      {/* Regional Admins Section */}
      {showAdmins && (
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Regional Administrators</h2>
            <button
              onClick={() => setShowAdmins(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loginError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {loginError}
            </div>
          )}

          {regionalAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No regional administrators found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalAdmins.map((admin) => (
                <div key={admin._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{admin.fullName}</h3>
                    <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                      {admin.region}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {admin.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      ID: {admin.idNumber}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last Login: {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Regional Admin</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <input
                  type="text"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {results.map((candidate, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
          >
            <h2 className="text-xl font-bold">{candidate.fullName}</h2>
            <p className="text-gray-600">Party: {candidate.party}</p>
            <p className="text-gray-600">Region: {candidate.region}</p>
            <p className="text-blue-600 font-semibold mt-2">
              Percentage: {candidate.percentage}%
            </p>
          </div>
        ))}
      </div>

      {showGenerator && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-center">📈 Generated Results</h2>
          <ResultGenerator />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NationalDashboard;
