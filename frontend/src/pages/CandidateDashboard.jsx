import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [voteData, setVoteData] = useState([]);

  const fetchCandidateData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5560/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.role !== 'candidate') {
        setAuthError('Access denied. Only candidates can view this page.');
        return;
      }

      setCandidate(res.data.candidate);

      // Calculate regional percentages
      const voteData = res.data.candidate.votes.map(entry => {
        const regionTotal = entry.voters.length;
        const percentage = regionTotal > 0 ? ((entry.count / regionTotal) * 100).toFixed(2) : 0;
        return {
          region: entry.region,
          percentage: parseFloat(percentage)
        };
      });

      setVoteData(voteData);
    } catch (err) {
      console.error(err);
      setAuthError('Error fetching candidate data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="text-center mt-10 text-xl">Loading Candidate Dashboard...</div>
      <Footer />
    </div>
  );
  
  if (authError) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="text-center text-red-500 mt-10">{authError}</div>
      <Footer />
    </div>
  );

  const calculatePercentage = (votes) => {
    return totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
  };

  const totalCandidateVotes = candidate.votes.reduce((sum, vote) => sum + vote.count, 0);
  const overallSupportPercentage = calculatePercentage(totalCandidateVotes);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div 
              onClick={() => navigate('/candidate-profile')}
              className="cursor-pointer transform transition-transform hover:scale-105"
            >
              <img
                src={`http://localhost:5560/uploads/${candidate.image}`}
                alt={candidate.fullName}
                className="w-48 h-48 rounded-full object-cover border-4 border-blue-500"
              />
              <p className="text-center mt-2 text-blue-600 hover:text-blue-800">View Profile</p>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidate.fullName}</h1>
              <p className="text-xl text-gray-600 mb-4">{candidate.party}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Overall Support</p>
                  <p className="text-2xl font-bold text-blue-700">{overallSupportPercentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">Percentage of total votes</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Regions</p>
                  <p className="text-2xl font-bold text-green-700">{voteData.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Constituency</p>
                  <p className="text-2xl font-bold text-purple-700">{candidate.constituency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Voting Statistics by Region</h2>
          <div className="space-y-4">
            {voteData.map((data, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{data.region}</h3>
                  <span className="text-blue-600 font-bold">{data.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Results by Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voteData.map((data, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.region}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support:</span>
                    <span className="font-medium text-blue-600">{data.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CandidateDashboard;
