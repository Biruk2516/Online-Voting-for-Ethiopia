import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RegionAdminBoard = () => {
  const { region } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegionStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/auth/region-stats/${region}`);
        setResults(response.data.result || []); // ✅ prevent undefined
      } catch (err) {
        setError('❌ Failed to load regional stats');
        setResults([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    if (region) fetchRegionStats();
  }, [region]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Regional Admin Dashboard
      </h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {region.charAt(0).toUpperCase() + region.slice(1)} Election Results
      </h2>

      {loading && <p className="text-gray-600">Loading regional stats...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="text-gray-500">No votes cast yet in this region.</p>
      )}

      <ul className="space-y-6">
        {results.map(({ fullName, party, percentage }) => (
          <li key={fullName} className="bg-gray-100 rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-gray-800">{fullName}</span>
              <span className="text-sm text-gray-600">({party})</span>
              <span className="text-sm font-medium text-blue-700">
                {percentage}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-300 rounded">
              <div
                className="h-full bg-green-500 rounded transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegionAdminBoard;
