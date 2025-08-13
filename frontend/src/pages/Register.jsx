import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    idNumber: '',
    role: 'voter',
    region: '',
    zone: '',
    adminCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Ethiopian regions and their zones
  const regionsAndZones = {
    'Addis Ababa': ['Arada', 'Kirkos', 'Lideta', 'Bole', 'Yeka', 'Gulele', 'Kolfe Keranio', 'Nifas Silk-Lafto', 'Addis Ketema', 'Lemi Kura'],
    'Amhara': ['Gondar', 'Wollo', 'Gojjam', 'Shewa', 'Wag Hemra', 'North Shewa', 'South Wollo', 'North Wollo', 'South Gondar', 'North Gondar'],
    'Oromia': ['West Shewa', 'East Shewa', 'Arsi', 'Bale', 'Borena', 'East Hararge', 'West Hararge', 'Illubabor', 'Jimma', 'North Shewa'],
    'Tigray': ['Central', 'Eastern', 'North Western', 'Southern', 'South Eastern', 'Mekelle', 'Adwa', 'Axum', 'Shire', 'Humera'],
    'Somali': ['Jigjiga', 'Gode', 'Kebri Dehar', 'Shinile', 'Fik', 'Degehabur', 'Warder', 'Korahe', 'Afder', 'Liben'],
    'Afar': ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
    'Benishangul-Gumuz': ['Asosa', 'Kamashi', 'Metekel', 'Pawe', 'Mengie'],
    'Dire Dawa': ['Dire Dawa'],
    'Gambela': ['Agnuak', 'Nuer', 'Majang', 'Itang'],
    'Harari': ['Harari'],
    'SNNPR': ['Gurage', 'Hadiya', 'Kembata', 'Sidama', 'Wolayita', 'Bench Maji', 'Dawro', 'Konso', 'South Omo', 'Keffa']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFaceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      setFaceImage(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error capturing face:', err);
      setError('Failed to capture face image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (faceImage) {
        formDataToSend.append('faceImage', faceImage);
      }

      const res = await axios.post('http://localhost:5560/api/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);

        // Redirect based on role
        if (res.data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (res.data.user.role === 'zone_admin') {
          navigate('/zone-admin-dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('duplicate face')) {
        setError('This face has already been registered. Please try again with a different face image.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left side - Registration Form */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
                <p className="mt-2 text-gray-600">Join Ethiopia's secure online voting system</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="idNumber"
                      required
                      value={formData.idNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your ID number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="voter">Voter</option>
                    <option value="candidate">Candidate</option>
                    <option value="zone_admin">Zone Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="region"
                      required
                      value={formData.region}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Region</option>
                      {Object.keys(regionsAndZones).map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.region && formData.role !== 'candidate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zone</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="zone"
                        required
                        value={formData.zone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Zone</option>
                        {regionsAndZones[formData.region]?.map(zone => (
                          <option key={zone} value={zone}>{zone}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formData.role === 'zone_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Code</label>
                    <input
                      type="text"
                      name="adminCode"
                      required
                      value={formData.adminCode}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter admin code"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Face Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleFaceCapture}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Capture Face
                    </button>
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Face preview"
                        className="h-20 w-20 object-cover rounded-full"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>

            {/* Right side - Information */}
            <div className="bg-blue-600 p-8 text-white">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold mb-6">Welcome to Ethiopia's Online Voting System</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Secure Voting</h4>
                      <p className="mt-1 text-blue-100">Your vote is protected with advanced encryption and face recognition technology.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Quick & Easy</h4>
                      <p className="mt-1 text-blue-100">Cast your vote from anywhere, anytime with just a few clicks.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Transparent Process</h4>
                      <p className="mt-1 text-blue-100">Real-time results and complete transparency in the voting process.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <img
                    src="/ethiopia-flag.png"
                    alt="Ethiopia Flag"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 