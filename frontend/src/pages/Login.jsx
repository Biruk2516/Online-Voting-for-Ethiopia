// src/pages/Login.js

import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { BiHide, BiShow } from 'react-icons/bi';
import ethiopiaFlag from '../assets/ethiopian.jpg';
import { AuthContext } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaVoteYea, FaShieldAlt, FaUserLock, FaCamera, FaUserShield, FaEnvelope, FaLock, FaUserCircle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceMode, setFaceMode] = useState(false);
  const [isNationalAdmin, setIsNationalAdmin] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login, setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'isSystemAdmin') {
      setIsSystemAdmin(checked);
    } else if (name === 'isNationalAdmin') {
      setIsNationalAdmin(checked);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Determine the correct endpoint based on login type
      let endpoint;
      if (isSystemAdmin) {
        endpoint = 'http://localhost:5560/api/auth/system-admin/login';
      } else if (isNationalAdmin) {
        endpoint = 'http://localhost:5560/api/auth/login';
      } else {
        endpoint = 'http://localhost:5560/api/auth/login';
      }

      const response = await axios.post(endpoint, {
        email,
        password,
        role: isNationalAdmin ? 'national_admin' : undefined
      });

      const token = response.data.token;
      const userData = response.data.user;
      login(userData, token);
      enqueueSnackbar('Login successful!', { variant: 'success' });

      // Role-based routing
      if (isSystemAdmin) {
        navigate('/system-admin/dashboard');
      } else if (isNationalAdmin) {
        navigate('/nationalAdmin');
      } else if (userData.role === 'admin') {
        navigate(`/region-admin/${userData.region.toLowerCase()}`);
      } else if (userData.role === 'zone_admin') {
        navigate(`/zone-admin/${userData.zone.toLowerCase()}`);
      } else if (userData.role === 'candidate') {
        navigate('/candidate-dashboard');
      } else {
        navigate('/home');
      }

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('region', userData.region);
      if (userData.zone) {
        localStorage.setItem('zone', userData.zone);
      }

    } catch (error) {
      if (error.message === 'Network Error') {
        enqueueSnackbar('Cannot connect to server. Is the backend running?', { variant: 'error' });
      } else if (error.response?.status === 401) {
        enqueueSnackbar('Invalid email or password', { variant: 'error' });
      } else {
        enqueueSnackbar(error.response?.data?.message || 'Login failed', { variant: 'error' });
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setFaceMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      enqueueSnackbar('Could not access camera', { variant: 'error' });
      setFaceMode(false);
    }
  };

  const handleFaceLogin = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('faceImage', blob, 'face.jpg');

      try {
        const response = await axios.post('http://localhost:5560/api/auth/login-face', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });

        const token = response.data.token;
        const userData = response.data.user;
        login(userData, token);
        enqueueSnackbar('Face login successful!', { variant: 'success' });

        // Role-based routing
        if (userData.role === 'admin') {
          navigate(`/region-admin/${userData.region.toLowerCase()}`);
        } else if (userData.role === 'zone_admin') {
          navigate(`/zone-admin/${userData.zone.toLowerCase()}`);
        } else if (userData.role === 'candidate') {
          navigate('/candidate-dashboard');
        } else {
          navigate('/home');
        }

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('region', userData.region);
        if (userData.zone) {
          localStorage.setItem('zone', userData.zone);
        }

      } catch (err) {
        enqueueSnackbar(err.response?.data?.message || 'Face did not match. Try again.', { variant: 'error' });
        console.error(err);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left side - Login Form */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-gray-600">Sign in to your account</p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={email}
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
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <BiHide className="h-5 w-5 text-gray-400" /> : <BiShow className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isSystemAdmin"
                      checked={isSystemAdmin}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <FaUserShield className="mr-2" />
                      Login as System Administrator
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isNationalAdmin"
                      checked={isNationalAdmin}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 flex items-center">
                      <FaUserShield className="mr-2" />
                      Login as National Admin
                    </span>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>

            {/* Right side - Information */}
            <div className="bg-blue-600 p-8 text-white">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold mb-6">Ethiopia's Digital Democracy</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaUserCircle className="h-6 w-6 text-blue-200" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Secure Authentication</h4>
                      <p className="mt-1 text-blue-100">Your account is protected with advanced security measures.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Privacy First</h4>
                      <p className="mt-1 text-blue-100">Your personal information is encrypted and protected.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium">Verified Results</h4>
                      <p className="mt-1 text-blue-100">Every vote is verified and counted with precision.</p>
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

      <Footer />

      <div className="fixed bottom-4 right-4 bg-white bg-opacity-90 rounded-full shadow-lg p-3 flex items-center">
        <FaShieldAlt className="text-green-600 text-2xl mr-2" />
        <span className="text-sm font-medium">Secure Connection</span>
      </div>
    </div>
  );
};

export default Login;
