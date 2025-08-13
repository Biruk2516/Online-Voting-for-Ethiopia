import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { FaUser, FaIdCard, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaSignOutAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CandidateProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [candidateRes, totalVotesRes] = await Promise.all([
          axios.get('http://localhost:5560/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5560/api/auth/votes/total', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setCandidate(candidateRes.data.candidate);
        setTotalVotes(totalVotesRes.data.totalVotes);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError('Failed to load candidate data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center mt-10 text-xl">Loading Profile...</div>
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

  const calculatePercentage = (votes) => {
    if (!totalVotes) return 0;
    return ((votes / totalVotes) * 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-6">
              <div className="h-32 w-32 rounded-full bg-white p-1">
                <img
                  src={`http://localhost:5560/uploads/${candidate.image}`}
                  alt={candidate.fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{candidate.fullName}</h1>
                <p className="text-blue-100 mt-1">{candidate.party}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p className="font-medium">{candidate.idNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaEnvelope className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Constituency</p>
                    <p className="font-medium">{candidate.constituency}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaBuilding className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Party</p>
                    <p className="font-medium">{candidate.party}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Biography</h3>
                <p className="text-gray-600">{candidate.bio}</p>

                {/* Voting Statistics Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Support</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Overall Support</h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {calculatePercentage(candidate.votes.reduce((sum, entry) => sum + entry.count, 0))}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Percentage of total votes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CandidateProfile; 