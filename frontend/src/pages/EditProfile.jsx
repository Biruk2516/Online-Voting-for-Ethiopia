import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera } from 'react-icons/fa';

const EditProfile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    region: '',
    zone: '',
  });
  const [faceImage, setFaceImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5560/api/auth/profile', {
          withCredentials: true,
        });
        const { fullName, email, region, zone } = response.data;
        setFormData({ fullName, email, region, zone });
        setPreviewImage(response.data.faceImage);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('region', formData.region);
      formDataToSend.append('zone', formData.zone);
      if (faceImage) {
        formDataToSend.append('faceImage', faceImage);
      }

      await axios.put('http://localhost:5560/api/auth/profile', formDataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gray-200 p-1">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="faceImage"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                  >
                    <FaCamera className="h-4 w-4" />
                  </label>
                  <input
                    type="file"
                    id="faceImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Click the camera icon to update your profile picture
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Region</option>
                    <option value="addis_ababa">Addis Ababa</option>
                    <option value="afar">Afar</option>
                    <option value="amhara">Amhara</option>
                    <option value="beni_shangul">Benishangul-Gumuz</option>
                    <option value="diredawa">Dire Dawa</option>
                    <option value="gambela">Gambela</option>
                    <option value="harari">Harari</option>
                    <option value="oromia">Oromia</option>
                    <option value="sidama">Sidama</option>
                    <option value="somali">Somali</option>
                    <option value="snnp">Southern Nations</option>
                    <option value="sw_ethiopia">South West Ethiopia</option>
                    <option value="tigray">Tigray</option>
                  </select>
                </div>

                {user?.role !== 'candidate' && user?.role !== 'national_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zone</label>
                    <input
                      type="text"
                      name="zone"
                      value={formData.zone}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your zone"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 