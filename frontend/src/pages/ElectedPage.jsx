import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header2 from '../components/Header2';
import { FaUser, FaBuilding, FaCalendarAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const ElectedPage = () => {
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotedCandidate = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
          navigate('/login');
          return;
        }

        // First get all candidates
        const candidatesRes = await axios.get('http://localhost:5560/api/auth/candidates', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Find the candidate that the user voted for
        let votedCandidate = null;
        for (const candidate of candidatesRes.data) {
          for (const vote of candidate.votes || []) {
            const found = vote.voters?.find(v => String(v.user) === String(user.id || user._id));
            if (found) {
              votedCandidate = candidate;
              break;
            }
          }
          if (votedCandidate) break;
        }

        setVotedCandidate(votedCandidate);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching voted candidate:', err);
        setError('Failed to fetch your vote information');
        setLoading(false);
      }
    };

    fetchVotedCandidate();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header2 />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your vote information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header2 />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header2 />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🗳️ Your Vote</h1>
          <p className="text-lg text-gray-600">View the candidate you voted for</p>
        </div>

        {votedCandidate ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300">
              <div className="relative">
                <img
                  src={`http://localhost:5560/uploads/${votedCandidate.image}`}
                  alt={votedCandidate.fullName}
                  className="h-96 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCheckCircle className="text-green-500 text-xl" />
                    <span className="text-green-500 font-medium">Vote Confirmed</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{votedCandidate.fullName}</h2>
                  <p className="text-white/90 text-lg">{votedCandidate.party}</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaBuilding className="text-blue-500 text-xl" />
                  <span className="text-lg">{votedCandidate.constituency}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaCalendarAlt className="text-green-500 text-xl" />
                  <span className="text-lg">Age: {votedCandidate.age}</span>
                </div>
                <div className="flex items-start space-x-3 text-gray-600">
                  <FaInfoCircle className="text-purple-500 text-xl mt-1" />
                  <p className="text-lg">{votedCandidate.bio}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vote Cast Yet</h2>
              <p className="text-gray-600 mb-6">You haven't cast your vote in this election.</p>
              <button
                onClick={() => navigate('/home')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Voting Page
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ElectedPage;
