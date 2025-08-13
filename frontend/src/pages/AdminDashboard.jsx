import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaUsers, FaVoteYea, FaUserTie, FaUserCog, FaEdit, FaTrash } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [summary, setSummary] = useState({
    totalVoters: 0,
    totalCandidates: 0,
    totalVotes: 0,
    turnoutPercentage: '0.00',
  });

  const [voteData, setVoteData] = useState([]);
  const [zoneAdmins, setZoneAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    zone: '',
    password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all candidates
        const candidatesRes = await axios.get('http://localhost:5560/api/auth/candidates', {
          withCredentials: true,
        });

        const candidates = candidatesRes.data || [];

        // Fetch votes for each zone in the region
        const votesRes = await axios.get(`http://localhost:5560/api/auth/admin/region-votes/${encodeURIComponent(user.region)}`, {
          withCredentials: true,
        });

        // Calculate total votes per zone
        const zoneTotals = votesRes.data.reduce((acc, zoneData) => {
          const zoneTotal = Object.entries(zoneData)
            .filter(([key]) => key !== 'zone')
            .reduce((sum, [_, votes]) => sum + votes, 0);
          acc[zoneData.zone] = zoneTotal;
          return acc;
        }, {});

        // Transform data for the chart with percentages
        const chartData = votesRes.data.map(zoneData => {
          const zoneTotal = zoneTotals[zoneData.zone];
          const transformedData = { zone: zoneData.zone };
          
          Object.entries(zoneData)
            .filter(([key]) => key !== 'zone')
            .forEach(([candidate, votes]) => {
              const percentage = zoneTotal > 0 ? ((votes / zoneTotal) * 100).toFixed(1) : 0;
              transformedData[candidate] = `${percentage}%`;
            });
          
          return transformedData;
        });

        setVoteData(chartData);

        // Calculate total votes across all zones
        const totalVotes = Object.values(zoneTotals).reduce((sum, total) => sum + total, 0);

        // Fetch zone admins
        const zoneAdminsRes = await axios.get(`http://localhost:5560/api/auth/admin/zone-admins/${encodeURIComponent(user.region)}`, {
          withCredentials: true,
        });

        setZoneAdmins(zoneAdminsRes.data);

        // Update summary
        setSummary(prev => ({
          ...prev,
          totalCandidates: candidates.length,
          totalVotes,
        }));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const fetchRegionStats = async () => {
      try {
        const statsRes = await axios.get(`http://localhost:5560/api/auth/admin/region-stats/${encodeURIComponent(user.region)}`, {
          withCredentials: true,
        });

        setSummary(prev => ({
          ...prev,
          totalVoters: statsRes.data.totalVoters || 0,
          turnoutPercentage: statsRes.data.turnoutPercentage || '0.00',
        }));
      } catch (err) {
        console.error('Error fetching region stats:', err);
      }
    };

    fetchDashboardData();
    fetchRegionStats();
  }, [user, navigate]);

  const handleDeleteZoneAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to remove this zone admin?')) return;

    try {
      await axios.delete(`http://localhost:5560/api/auth/admin/zone-admins/${adminId}`, {
        withCredentials: true,
      });

      setZoneAdmins(prev => prev.filter(admin => admin._id !== adminId));
    } catch (err) {
      console.error('Error deleting zone admin:', err);
      setError('Failed to delete zone admin');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
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
      fetchDashboardData(); // Refresh the data
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update user', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">
        Welcome, {user?.region} Admin
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon={<FaUsers className="text-blue-700 text-3xl" />} label="Total Voters" value={summary.totalVoters} />
        <SummaryCard icon={<FaUserTie className="text-green-700 text-3xl" />} label="Candidates" value={summary.totalCandidates} />
        <SummaryCard icon={<FaVoteYea className="text-purple-700 text-3xl" />} label="Total Votes" value={summary.totalVotes} />
        <SummaryCard icon={<FaVoteYea className="text-yellow-500 text-3xl" />} label="Turnout %" value={`${summary.turnoutPercentage}%`} />
      </div>

      {/* Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Votes by Zone and Candidate</h2>
        {voteData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={voteData}>
              <XAxis dataKey="zone" />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value, name) => [`${value}`, name]}
                labelFormatter={(label) => `Zone: ${label}`}
              />
              <Legend />
              {Object.keys(voteData[0] || {}).filter(key => key !== 'zone').map((candidate, index) => (
                <Bar 
                  key={candidate}
                  dataKey={candidate}
                  fill={`hsl(${index * 45}, 70%, 50%)`}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No voting data available for your region yet.</p>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Zone Admins</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {zoneAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admin.zone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FaEdit className="inline-block" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteZoneAdmin(admin._id)}
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

      {/* Edit User Modal */}
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

      {/* Buttons */}
      <div className="mt-8 flex gap-4 justify-end">
        <button
          onClick={() => navigate('/home')}
          className="px-5 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
        >
          Vote
        </button>
      </div>
      <Footer />
    </div>
  );
};

const SummaryCard = ({ icon, label, value }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4">
    {icon}
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
