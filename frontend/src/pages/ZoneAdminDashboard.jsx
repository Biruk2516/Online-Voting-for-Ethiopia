import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUsers, FaVoteYea, FaUserTie, FaUserCog, FaEdit, FaTrash } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSnackbar } from 'notistack';

const ZoneAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { zone } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [summary, setSummary] = useState({
    totalVoters: 0,
    totalVotes: 0,
    turnoutPercentage: '0.00',
  });

  const [voteData, setVoteData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'zone_admin') {
      navigate('/login');
      return;
    }

    // Ensure zone matches the user's zone
    if (user.zone.toLowerCase() !== zone.toLowerCase()) {
      setError('You do not have access to this zone');
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

        // Fetch votes for the zone
        const votesRes = await axios.get(`http://localhost:5560/api/auth/admin/zone-votes/${encodeURIComponent(zone)}`, {
          withCredentials: true,
        });

        // Create vote data for the chart
        const filteredVoteData = candidates.map(candidate => {
          const voteEntry = votesRes.data.find(v => v._id === candidate._id);
          return {
            candidateName: candidate.fullName || 'Unnamed',
            votes: voteEntry ? voteEntry.votes : 0,
            party: candidate.party || 'Independent'
          };
        });

        setVoteData(filteredVoteData);

        // Calculate total votes
        const totalVotes = filteredVoteData.reduce((acc, curr) => acc + curr.votes, 0);

        // Fetch users in the zone
        const usersRes = await axios.get(
          `http://localhost:5560/api/auth/admin/region-voters/${encodeURIComponent(user.region)}?zone=${encodeURIComponent(zone)}`,
          {
            withCredentials: true,
          }
        );

        const zoneUsers = usersRes.data || [];
        setUsers(zoneUsers);

        // Update summary
        setSummary({
          totalVoters: zoneUsers.length,
          totalVotes,
          turnoutPercentage: zoneUsers.length > 0 
            ? ((totalVotes / zoneUsers.length) * 100).toFixed(2)
            : '0.00'
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, zone, navigate]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5560/api/auth/admin/users/${userId}`, {
        withCredentials: true,
      });

      // Update users list and summary
      const updatedUsers = users.filter(u => u._id !== userId);
      setUsers(updatedUsers);
      setSummary(prev => ({
        ...prev,
        totalVoters: updatedUsers.length,
        turnoutPercentage: updatedUsers.length > 0 
          ? ((prev.totalVotes / updatedUsers.length) * 100).toFixed(2)
          : '0.00'
      }));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Welcome, {zone} Zone Admin
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard icon={<FaUsers className="text-blue-700 text-3xl" />} label="Total Voters" value={summary.totalVoters} />
          <SummaryCard icon={<FaVoteYea className="text-purple-700 text-3xl" />} label="Total Votes" value={summary.totalVotes} />
          <SummaryCard icon={<FaVoteYea className="text-yellow-500 text-3xl" />} label="Turnout %" value={`${summary.turnoutPercentage}%`} />
        </div>

        {/* Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Votes by Candidate in {zone}</h2>
          {voteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={voteData}>
                <XAxis dataKey="candidateName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="votes" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No voting data available for this zone yet.</p>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Voters</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.idNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit className="inline-block" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
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

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={() => navigate('/home')}
            className="px-5 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
          >
            View All Elections
          </button>
        </div>
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

export default ZoneAdminDashboard; 