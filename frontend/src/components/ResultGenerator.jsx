import React, { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FaSpinner, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

const ResultGenerator = () => {
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleGenerateResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await axios.get('http://localhost:5560/api/auth/national-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data || !res.data.result) {
        throw new Error('Invalid response format');
      }

      // Sort candidates by totalVotes descending
      const sortedResults = res.data.result
        .map(candidate => ({
          ...candidate,
          totalVotes: Number(candidate.totalVotes) || 0,
          percentage: Number(candidate.percentage) || 0,
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes);

      setResults(sortedResults);
      setShowResults(true);
      enqueueSnackbar('Results generated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('❌ Error generating results:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate results');
      enqueueSnackbar('Failed to generate results', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Election Results</h2>
        <button
          onClick={handleGenerateResults}
          disabled={loading}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold shadow transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FaChartBar />
              <span>Generate Results</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {showResults && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((candidate, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{candidate.fullName}</h3>
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                    Rank #{index + 1}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Party:</span>
                    <span className="ml-2">{candidate.party}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Region:</span>
                    <span className="ml-2">{candidate.region}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Total Votes:</span>
                    <span className="ml-2">{candidate.totalVotes.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Vote Share</span>
                      <span className="text-lg font-bold text-green-600">{candidate.percentage}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${candidate.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultGenerator;
