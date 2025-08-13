import React, { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BiHide, BiShow } from 'react-icons/bi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSnackbar } from 'notistack';
import Webcam from 'react-webcam';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Validations from '../Validations/Validations';
import vote1 from '../assets/vote1.jpg';
import vote2 from '../assets/vote2.jpg';
import vote3 from '../assets/vote3.jpg';
import vote4 from '../assets/vote4.png';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaMapMarkerAlt, FaUserPlus, FaBuilding, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const facePoses = [
  { key: 'front', label: 'Look Straight Ahead' },
  { key: 'left', label: 'Turn Your Face to the Left' },
  { key: 'right', label: 'Turn Your Face to the Right' },
  { key: 'up', label: 'Tilt Your Face Upwards' },
  { key: 'down', label: 'Tilt Your Face Downwards' },
];

const Signup = () => {
  const images = [vote1, vote2, vote3, vote4];
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const webcamRef = useRef(null);
  const checkRef = useRef(null);
  const { setUser, login } = useContext(AuthContext);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    region: '',
    zone: '',
    role: 'voter',
    adminCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [capturedFaces, setCapturedFaces] = useState({
    front: null,
    left: null,
    right: null,
    up: null,
    down: null,
  });
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const regions = [
    "addis_ababa", "afar", "amhara", "beni_shangul", "diredawa",
    "gambela", "harari", "oromia", "sidama", "somali", "snnp",
    "sw_ethiopia", "tigray", "national"
  ];

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

  useEffect(() => {
    const interval = setInterval(() => setCurrentImageIndex(i => (i + 1) % images.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle Fayda callback data
    if (location.state?.verified) {
      setFormData(prev => ({
        ...prev,
        idNumber: location.state.idNumber
      }));
      setIdVerified(true);
      
      // If we have user info from Fayda, pre-fill the form
      if (location.state.userInfo) {
        const { name, email, phone, address } = location.state.userInfo;
        setFormData(prev => ({
          ...prev,
          fullName: name || prev.fullName,
          email: email || prev.email,
          // You might want to parse the address to get region/zone
          // This depends on the format of the address data from Fayda
        }));
      }
    }
  }, [location]);

  const handleCheckboxChange = () => setIsChecked(checkRef.current.checked);

  const handleChange = e => {
    const { name, value } = e.target;
    
    // If role is changed to national_admin, automatically set region to national
    if (name === 'role' && value === 'national_admin') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        region: 'national'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (name === 'idNumber') setIdVerified(false);
  };

  const validateForm = () => {
    const newErrors = {
      fullNameError: Validations.validateFullName(formData.fullName),
      idNumberError: !idVerified ? 'Please verify your National ID' : '',
      emailError: Validations.validateEmail(formData.email),
      passwordError: formData.role === 'voter' ? Validations.validatePassword(formData.password) : '', // admin maybe require password still
      confirmPasswordError: formData.role === 'voter' && formData.password !== formData.confirmPassword ? 'Passwords do not match' : '',
      regionError: !formData.region ? 'Please select your region' : '',
      adminCodeError: formData.role === 'admin' && !formData.adminCode ? 'Admin code is required' : '',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

 const verifyNationalId = async () => {
  if (formData.idNumber.length !== 12) {
    setErrors(prev => ({ ...prev, idNumberError: 'National ID must be 12 digits' }));
    return;
  }

  setIsVerifying(true);
    try {
      // Simulated/mock verification
      const isValid = formData.idNumber.startsWith("12"); // Example: valid if starts with 12
      if (isValid) {
        setIdVerified(true);
        enqueueSnackbar("ID Verified Successfully!", { variant: "success" });
        setErrors(prev => ({ ...prev, idNumberError: '' }));
      } else {
        throw new Error("Invalid ID");
      }
    } catch {
      setIdVerified(false);
      enqueueSnackbar("Invalid National ID", { variant: "error" });
      setErrors(prev => ({ ...prev, idNumberError: 'Invalid ID number' }));
    } finally {
      setIsVerifying(false);
    }
  };

  const captureFace = () => {
    const image = webcamRef.current.getScreenshot();
    if (!image) {
      enqueueSnackbar('Failed to capture image. Try again.', { variant: 'error' });
      return;
    }
    const poseKey = facePoses[currentPoseIndex].key;
    setCapturedFaces(prev => ({ ...prev, [poseKey]: image }));

    if (currentPoseIndex < facePoses.length - 1) {
      setCurrentPoseIndex(currentPoseIndex + 1);
    } else {
      setWebcamOpen(false);
    }
  };

  const retakePose = (poseKey) => {
    setCurrentPoseIndex(facePoses.findIndex(p => p.key === poseKey));
    setWebcamOpen(true);
  };

  const allFacesCaptured = facePoses.every(p => capturedFaces[p.key] !== null);

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

    if (!validateForm()) return;
    if (!isChecked) return enqueueSnackbar('You must agree to the terms', { variant: 'error' });
    if (formData.role === 'voter' && !allFacesCaptured) return enqueueSnackbar('Please capture all face poses', { variant: 'error' });

    const form = new FormData();
    
    // Add basic form fields
    form.append('fullName', formData.fullName);
    form.append('idNumber', formData.idNumber);
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('region', formData.region);
    form.append('zone', formData.zone);
    form.append('role', formData.role);

    if (formData.role === 'admin' || formData.role === 'zone_admin' || formData.role === 'national_admin') {
      form.append('adminCode', formData.adminCode);
    }

    // Add face images only for voters
    if (formData.role === 'voter') {
      try {
        for (const pose of facePoses) {
          if (capturedFaces[pose.key]) {
            const response = await fetch(capturedFaces[pose.key]);
            const blob = await response.blob();
            form.append('faceImages', blob, `face_${pose.key}.jpg`);
          }
        }
      } catch (err) {
        console.error('Error processing face images:', err);
        setError('Error processing face images. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.post('http://localhost:5560/api/auth/register', form, {
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
        } else if (res.data.user.role === 'national_admin') {
          navigate('/national-admin-dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.message?.includes('duplicate face')) {
        setError('This face has already been registered. Please try again with a different face image.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateFaydaSignInUrl = () => {
    const clientId = import.meta.env.VITE_FAYDA_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_FAYDA_REDIRECT_URI || 'http://localhost:3000/fayda-callback';

    if (!clientId) {
      enqueueSnackbar('Fayda client ID is not configured. Please contact support.', { variant: 'error' });
      return null;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      acr_values: 'mosip:idp:acr:generated-code mosip:idp:acr:linked-wallet mosip:idp:acr:biometrics',
      claims: JSON.stringify({
        userinfo: {
          name: { essential: true },
          phone: { essential: true },
          email: { essential: true },
          picture: { essential: true },
          gender: { essential: true },
          birthdate: { essential: true },
          address: { essential: true }
        }
      }),
      code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
      code_challenge_method: 'S256',
      display: 'page',
      nonce: 'g4DEuje5Fx57Vb64dO4oqLHXGT8L8G7g',
      state: formData.idNumber || 'ptOO76SD',
      ui_locales: 'en'
    });

    return `https://auth.verifayda.gov.et/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/ethiopia-flag.jpg')" }}>
      <div className="absolute top-1 left-1 z-30"><BackButton /></div>
      <div className="absolute top-0 left-0 w-full bg-black bg-opacity-70 py-2 z-10 text-white text-center font-bold text-lg">
        Welcome to the Official Ethiopian Online Voting Registration Portal
      </div>

      <div className="flex justify-center items-start pt-20 px-8 space-x-8 min-h-screen">
        {/* Left side - Image Carousel */}
        <div className="w-[40%] relative">
          <div className="relative">
            <button 
              onClick={() => setCurrentImageIndex(i => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10 hover:bg-gray-100 transition"
            >
              <ChevronLeft />
            </button>
            <img src={images[currentImageIndex]} className="rounded-xl shadow-lg w-full h-auto" alt="Vote Banner" />
            <button 
              onClick={() => setCurrentImageIndex(i => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10 hover:bg-gray-100 transition"
            >
              <ChevronRight />
            </button>
          </div>
          
          {/* Additional Info Section */}
          <div className="mt-12 bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Why Register Online?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaShieldAlt className="text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-800">Secure Voting</h4>
                  <p className="text-gray-600 text-sm">Advanced security measures to protect your vote</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-800">Easy Verification</h4>
                  <p className="text-gray-600 text-sm">Quick and secure ID verification process</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaUser className="text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-800">Face Recognition</h4>
                  <p className="text-gray-600 text-sm">Biometric verification for enhanced security</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-[40%] bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl max-h-[800px] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 px-6 py-4 mb-6 rounded-t-xl">
            <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
            <p className="text-blue-100 text-center mt-2">Join our secure voting platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserPlus className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIdCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                maxLength={12}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="National ID Number (12 digits)"
                disabled={idVerified}
              />
            </div>
            <button
              type="button"
              onClick={verifyNationalId}
              disabled={idVerified || isVerifying}
              className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                idVerified ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
              } ${idVerified ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isVerifying ? "Verifying..." : idVerified ? "Verified" : "Verify ID"}
            </button>
            {errors.idNumberError && <p className="text-red-500 text-sm mt-1">{errors.idNumberError}</p>}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm Password"
              />
            </div>
            {errors.confirmPasswordError && <p className="text-red-500 text-sm mt-1">{errors.confirmPasswordError}</p>}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Region</option>
                {Object.keys(regionsAndZones).map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {formData.region && formData.role !== 'candidate' && formData.role !== 'national_admin' && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Zone</option>
                    {regionsAndZones[formData.region]?.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                {!formData.zone && <p className="text-red-500 mb-2">Please select your zone</p>}
              </>
            )}

            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="voter">Voter</option>
                <option value="admin">Region Admin</option>
                <option value="zone_admin">Zone Admin</option>
              </select>
            </div>

            {(formData.role === 'admin' || formData.role === 'zone_admin') && (
              <div className="relative">
                <input
                  type="password"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Admin Code"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  ref={checkRef}
                  onChange={handleCheckboxChange}
                  disabled={!idVerified}
                />
                <span>I agree to the terms and conditions</span>
              </label>
            </div>

            {!webcamOpen && (
              <>
                <div className="mb-3 border rounded p-2 space-y-2 bg-gray-50">
                  <h3 className="font-semibold">Face Capture</h3>
                  <p>{allFacesCaptured ? "All poses captured" : `Please ${facePoses[currentPoseIndex].label}`}</p>

                  {facePoses.map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-4">
                      {capturedFaces[key] ? (
                        <>
                          <img
                            src={capturedFaces[key]}
                            alt={`Captured face ${key}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-600"
                          />
                          <button type="button" className="text-sm text-blue-600 underline" onClick={() => retakePose(key)}>
                            Retake
                          </button>
                        </>
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                          {label.split(' ')[1]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={allFacesCaptured}
                  onClick={() => setWebcamOpen(true)}
                  className={`w-full p-2 text-white rounded ${
                    allFacesCaptured ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {allFacesCaptured ? "Captured all faces" : "Capture Face Poses"}
                </button>
              </>
            )}

            {webcamOpen && (
              <div className="mb-3">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                  className="w-full rounded"
                />
                <p className="text-center mt-2 font-semibold text-blue-700">
                  {facePoses[currentPoseIndex].label}
                </p>
                <button
                  type="button"
                  onClick={captureFace}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={() => setWebcamOpen(false)}
                  className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Your Identity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="Enter your National ID"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={verifyNationalId}
                    disabled={isVerifying}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify ID'}
                  </button>
                </div>
                
                {/* Fayda E-Signet Button */}
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Or verify using Fayda E-Signet</p>
                  <button
                    onClick={() => {
                      const url = generateFaydaSignInUrl();
                      if (url) {
                        window.location.href = url;
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <FaShieldAlt className="mr-2" />
                    Verify with Fayda E-Signet
                  </button>
                </div>

                {idVerified && (
                  <div className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-2" />
                    <span>ID Verified Successfully</span>
                  </div>
                )}
                {errors.idNumberError && (
                  <p className="text-red-500">{errors.idNumberError}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isChecked}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
