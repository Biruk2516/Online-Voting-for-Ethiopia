import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import Header2 from '../components/Header2';
import { FaVoteYea, FaUndo, FaUser, FaBuilding, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const Home = () => {
  const [candidates, setCandidates] = useState([]);
  const [region, setRegion] = useState('');
  const [zone, setZone] = useState('');
  const [userId, setUserId] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);

  // Modal state
  const [modal, setModal] = useState({
    show: false,
    action: null,
    candidateId: null,
    message: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id || user._id);
      setRegion(user.region);
      setZone(user.zone);
    } else {
      console.warn('⚠️ No user found in localStorage!');
    }

    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5560/api/auth/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(res.data);

      // Check if user has voted
      const voteRes = await axios.get('http://localhost:5560/api/auth/votes/total', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let voted = false;
      let candidateId = null;

      for (const candidate of res.data) {
        for (const vote of candidate.votes || []) {
          const found = vote.voters?.find(v => String(v.user) === String(userId));
          if (found) {
            voted = true;
            candidateId = candidate._id;
            break;
          }
        }
        if (voted) break;
      }

      setHasVoted(voted);
      setVotedCandidateId(candidateId);
    } catch (err) {
      console.error('❌ Error fetching candidates:', err);
    }
  };

  const confirmAction = (actionType, candidateId) => {
    setModal({
      show: true,
      action: actionType,
      candidateId,
      message: actionType === 'vote'
        ? 'Are you sure you want to vote for this candidate?'
        : 'Are you sure you want to clear your vote?',
    });
  };

  const handleConfirm = async () => {
    if (modal.action === 'vote') {
      await voteForCandidate(modal.candidateId);
    } else if (modal.action === 'clear') {
      await clearVote(modal.candidateId);
    }
    setModal({ show: false, action: null, candidateId: null, message: '' });
  };

  const voteForCandidate = async (candidateId) => {
    try {
      const res = await axios.post(`http://localhost:5560/api/auth/vote/${candidateId}`, {
        userId,
        region,
        zone,
      });
      alert(res.data.message || '✅ Voted successfully!');
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Voting failed!');
    }
  };

  const clearVote = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5560/api/auth/vote/${candidateId}/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || '✅ Vote cleared!');
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Failed to clear vote.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header2 />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🗳️ Cast Your Vote</h1>
          <p className="text-lg text-gray-600">Select your preferred candidate to make your voice heard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105">
              <div className="relative">
                <img
                  src={`http://localhost:5560/uploads/${candidate.image}`}
                  alt={candidate.fullName}
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-2xl font-bold text-white">{candidate.fullName}</h2>
                  <p className="text-white/90">{candidate.party}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaBuilding className="text-blue-500" />
                  <span>{candidate.constituency}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaCalendarAlt className="text-green-500" />
                  <span>Age: {candidate.age}</span>
                </div>
                <div className="flex items-start space-x-2 text-gray-600">
                  <FaInfoCircle className="text-purple-500 mt-1" />
                  <p className="text-sm">{candidate.bio}</p>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => confirmAction('vote', candidate._id)}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                      hasVoted 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                    disabled={hasVoted}
                  >
                    <FaVoteYea />
                    <span>{hasVoted ? 'Vote Submitted' : 'Vote Now'}</span>
                  </button>

                  {hasVoted && votedCandidateId === candidate._id && (
                    <button
                      onClick={() => confirmAction('clear', candidate._id)}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FaUndo />
                      <span>Clear Vote</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {modal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Confirm Your Action</h3>
              <p className="mb-6 text-gray-600">{modal.message}</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setModal({ show: false, action: null, candidateId: null, message: '' })}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
