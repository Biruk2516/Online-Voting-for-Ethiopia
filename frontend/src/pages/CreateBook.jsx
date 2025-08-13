import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Validations from '../Validations/Validations';

const CreateBook = () => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [party, setParty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [bio, setBio] = useState('');
  const [criminalRecord, setCriminalRecord] = useState('clean');
  const [idNumber, setIdNumber] = useState('');
  const [image, setImage] = useState(null);
  const [votes, setVotes] = useState(0); // Initialize votes to 0
  const [isIndependent, setIsIndependent] = useState(false);
  const [supportSignatures, setSupportSignatures] = useState('');
  const [loading, setLoading] = useState(false);
  
  const bioValidation = Validations.validateInputLength(bio);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Ethiopian political parties for dropdown
  const ethiopianParties = [
    "Prosperity Party",
    "Ethiopian Citizens for Social Justice",
    "Balderas for True Democracy",
    "National Movement of Amhara",
    "Oromo Liberation Front",
    "Ethiopian Democratic Party",
    "Independent"
  ];

  // Ethiopian regions for dropdown
  const ethiopianRegions = [
    "Addis Ababa",
    "Afar",
    "Amhara",
    "Benishangul-Gumuz",
    "Dire Dawa",
    "Gambela",
    "Harari",
    "Oromia",
    "Sidama",
    "Somali",
    "Southern Nations",
    "South West Ethiopia",
    "Tigray"
  ];

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSaveCandidate = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (age < 21) {
      enqueueSnackbar('Candidate must be at least 21 years old', { variant: 'error' });
      return;
    }
    
    if (isIndependent && !supportSignatures) {
      enqueueSnackbar('Independent candidates require support signatures', { variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('age', age);
    formData.append('party', party);
    formData.append('constituency', constituency);
    formData.append('bio', bio);
    formData.append('criminalRecord', criminalRecord);
    formData.append('idNumber', idNumber);
    formData.append('votes', votes);
    formData.append('isIndependent', isIndependent);
    formData.append('supportSignatures', supportSignatures);
    
    if (image) {
      formData.append('image', image);
    }

    setLoading(true);

    axios.post('http://localhost:5555/candidates', formData)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Candidate created successfully!', { variant: 'success' });
        navigate('/candidates');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error creating candidate', { variant: 'error' });
        console.error('Error:', error);
      });
  };

  return (
    <div className='p-4 min-h-screen bg-gray-100'>
      <BackButton />
      <h1 className='text-3xl my-4 font-bold text-center text-blue-800'>Register New Candidate</h1>
      {loading && <Spinner />}
      
      <div className='max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6'>
        <form onSubmit={handleSaveCandidate}>
          {/* Personal Information Section */}
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4 text-blue-700 border-b pb-2'>Personal Information</h2>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='mb-4'>
                <label className='block text-gray-700 mb-2'>Full Name*</label>
                <input
                  type='text'
                  value={fullName}
                  placeholder='Legal name as per ID'
                  onChange={(e) => setFullName(e.target.value)}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-gray-700 mb-2'>Age*</label>
                <input
                  type='number'
                  value={age}
                  placeholder='Must be 21+'
                  min="21"
                  onChange={(e) => setAge(e.target.value)}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
            </div>
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>National ID/Passport Number*</label>
              <input
                type='text'
                value={idNumber}
                placeholder='Ethiopian identification number'
                onChange={(e) => setIdNumber(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>Candidate Photo*</label>
              <input 
                type="file" 
                accept='image/*' 
                onChange={handleImageChange}
                className='w-full px-4 py-2 border rounded-lg'
                required
              />
            </div>
          </div>

          {/* Political Information Section */}
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4 text-blue-700 border-b pb-2'>Political Information</h2>
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>Political Party*</label>
              <select
                value={party}
                onChange={(e) => {
                  setParty(e.target.value);
                  setIsIndependent(e.target.value === 'Independent');
                }}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value="">Select a party</option>
                {ethiopianParties.map((party, index) => (
                  <option key={index} value={party}>{party}</option>
                ))}
              </select>
            </div>
            
            {isIndependent && (
              <div className='mb-4'>
                <label className='block text-gray-700 mb-2'>Support Signatures*</label>
                <input
                  type='number'
                  value={supportSignatures}
                  placeholder='Number of support signatures'
                  onChange={(e) => setSupportSignatures(e.target.value)}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required={isIndependent}
                />
              </div>
            )}
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>Constituency/Region*</label>
              <select
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value="">Select a region</option>
                {ethiopianRegions.map((region, index) => (
                  <option key={index} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>Criminal Record Status*</label>
              <select
                value={criminalRecord}
                onChange={(e) => setCriminalRecord(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value="clean">No criminal record</option>
                <option value="pardoned">Pardoned conviction</option>
                <option value="rehabilitated">Rehabilitated offender</option>
              </select>
            </div>
          </div>

          {/* Biography Section */}
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4 text-blue-700 border-b pb-2'>Biography</h2>
            
            <div className='mb-4'>
              <label className='block text-gray-700 mb-2'>Candidate Biography*</label>
              <textarea
                value={bio}
                placeholder='Political background, qualifications, and vision'
                onChange={(e) => setBio(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32'
                required
              />
              {bioValidation && <p className='text-red-500 text-sm mt-1'>{bioValidation}</p>}
            </div>
          </div>

          {/* Hidden votes field */}
          <input type="hidden" value={votes} />

          <div className='flex justify-center'>
            <button 
              type="submit"
              className='px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
            >
              Register Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;