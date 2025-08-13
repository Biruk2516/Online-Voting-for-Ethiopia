import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { 
  FaUser, FaLock, FaCalendarAlt, FaMapMarkerAlt, 
  FaShieldAlt, FaEdit, FaCheck, FaArrowLeft, FaSpinner
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, logout, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    region: ''
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setProfileData(response.data);
        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          region: response.data.region
        });
      } catch (error) {
        enqueueSnackbar('Failed to load profile data', { variant: 'error' });
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [enqueueSnackbar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put('/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setProfileData(response.data.user);
      updateUser(response.data.user); // Update context
      setIsEditing(false);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
      console.error('Profile update error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-700 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                <p className="text-blue-100 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
              >
                {isEditing ? (
                  <>
                    <FaCheck className="mr-2" /> Save
                  </>
                ) : (
                  <>
                    <FaEdit className="mr-2" /> Edit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
                
                <div>
                  <label className="block text-sm text-gray-500">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{profileData.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-500">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-500">Region</label>
                  {isEditing ? (
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Afar">Afar</option>
                      <option value="Amhara">Amhara</option>
                      <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                      <option value="Dire Dawa">Dire Dawa</option>
                      <option value="Gambela">Gambela</option>
                      <option value="Harari">Harari</option>
                      <option value="Oromia">Oromia</option>
                      <option value="Sidama">Sidama</option>
                      <option value="Somali">Somali</option>
                      <option value="Southern Nations">Southern Nations</option>
                      <option value="South West Ethiopia">South West Ethiopia</option>
                      <option value="Tigray">Tigray</option>
                    </select>
                  ) : (
                    <p className="mt-1 font-medium flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-600" /> {profileData.region}
                    </p>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Account Information</h3>
                
                <div>
                  <label className="block text-sm text-gray-500">ID Number</label>
                  <p className="mt-1 font-medium">{profileData.idNumber}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500">Account Status</label>
                  <p className="mt-1 font-medium flex items-center">
                    <FaShieldAlt className={`mr-2 ${profileData.isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                    {profileData.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500">Member Since</label>
                  <p className="mt-1 font-medium flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-600" />
                    {new Date(profileData.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500">Last Login</label>
                  <p className="mt-1 font-medium">
                    {profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t flex justify-between">
              <button
                onClick={() => navigate('/change-password')}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <FaLock className="mr-2" /> Change Password
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;