import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaMapMarkerAlt, FaShieldAlt, FaClock, FaHistory } from 'react-icons/fa';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5560/api/auth/profile', {
          withCredentials: true,
        });
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const getRoleDisplay = (role) => {
    const roleMap = {
      'voter': 'Voter',
      'admin': 'Region Admin',
      'zone_admin': 'Zone Admin',
      'national_admin': 'National Admin',
      'candidate': 'Candidate'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-24 w-24 rounded-full bg-white p-1">
                {profileData?.faceImage ? (
                  <img
                    src={profileData.faceImage}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{profileData?.fullName}</h1>
                <p className="text-blue-100">{profileData?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p className="font-medium">{profileData?.idNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{getRoleDisplay(profileData?.role)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Region</p>
                    <p className="font-medium capitalize">{profileData?.region?.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                {profileData?.zone && (
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Zone</p>
                      <p className="font-medium">{profileData.zone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                
                <div className="flex items-center space-x-3">
                  <FaClock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {new Date(profileData?.lastLogin).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaHistory className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium">
                      {new Date(profileData?.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Verification Status</p>
                    <p className="font-medium">
                      {profileData?.isVerified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-yellow-600">Pending Verification</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => navigate('/edit-profile')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 