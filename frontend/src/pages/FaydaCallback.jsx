// src/pages/FaydaCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const FaydaCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state'); // This will be the ID number

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for user info
        const response = await axios.post('http://localhost:5560/api/auth/token', {
          code,
          codeVerifier: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM", // This should be stored securely
          redirectUri: process.env.REACT_APP_REDIRECT_URI
        });

        // Store the verified ID number
        localStorage.setItem('verifiedIdNumber', state);
        
        enqueueSnackbar('ID verification successful!', { variant: 'success' });
        
        // Redirect back to signup page
        navigate('/signup', { 
          state: { 
            verified: true,
            idNumber: state,
            userInfo: response.data.userInfo
          }
        });
      } catch (error) {
        console.error('Fayda verification error:', error);
        enqueueSnackbar('ID verification failed. Please try again.', { variant: 'error' });
        navigate('/signup');
      }
    };

    handleCallback();
  }, [location, navigate, enqueueSnackbar]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your identity...</p>
      </div>
    </div>
  );
};

export default FaydaCallback;
