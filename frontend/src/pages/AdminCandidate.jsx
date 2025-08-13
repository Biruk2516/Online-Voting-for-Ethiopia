import React, { useState } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import Header2 from '../components/Header2';

const parties = ['Prosperity Party', 'OLF', 'EZEMA', 'TPLF', 'New'];

const regionOptions = [
  { label: "Addis Ababa", value: "addis_ababa" },
  { label: "Afar", value: "afar" },
  { label: "Amhara", value: "amhara" },
  { label: "Benishangul", value: "beni_shangul" },
  { label: "Dire Dawa", value: "diredawa" },
  { label: "Gambela", value: "gambela" },
  { label: "Harari", value: "harari" },
  { label: "Oromia", value: "oromia" },
  { label: "Sidama", value: "sidama" },
  { label: "Somali", value: "somali" },
  { label: "SNNP", value: "snnp" },
  { label: "South West Ethiopia", value: "sw_ethiopia" },
  { label: "Tigray", value: "tigray" }
];

const AdminCandidate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    party: '',
    constituency: '',
    bio: '',
    criminalRecord: '',
    idNumber: '',
    image: null,
    isIndependent: false,
    supportSignatures: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      if (form.hasOwnProperty(key)) {
        formData.append(key, key === 'supportSignatures' ? (form[key] || '0') : form[key]);
      }
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const res = await axios.post("http://localhost:5560/api/auth/add", formData, config);
      const candidate = res?.data?.candidate;

      if (candidate) {
        alert(`✅ Candidate "${candidate.fullName}" added!\nUsername: ${candidate.username}\nEmail: ${candidate.email}`);
      } else {
        alert("Candidate added but response is incomplete.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Something went wrong.';
      alert(`❌ Error adding candidate: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header2 />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Add New Candidate</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="fullName" type="text" placeholder="Full Name" required value={form.fullName} onChange={handleChange} className="p-3 border rounded-lg" />
              <input name="age" type="number" placeholder="Age" required min={21} value={form.age} onChange={handleChange} className="p-3 border rounded-lg" />
              
              <select name="party" required value={form.party} onChange={handleChange} className="p-3 border rounded-lg">
                <option value="">Select Party</option>
                {parties.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select name="constituency" required value={form.constituency} onChange={handleChange} className="p-3 border rounded-lg">
                <option value="">Select Constituency</option>
                {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>

              <select name="criminalRecord" required value={form.criminalRecord} onChange={handleChange} className="p-3 border rounded-lg">
                <option value="">Criminal Record</option>
                <option value="clean">Clean</option>
                <option value="pardoned">Pardoned</option>
                <option value="rehabilitated">Rehabilitated</option>
              </select>

              <input name="idNumber" type="text" placeholder="National ID Number" required value={form.idNumber} onChange={handleChange} className="p-3 border rounded-lg" />

              <input name="supportSignatures" type="number" placeholder="Support Signatures" value={form.supportSignatures} onChange={handleChange} className="p-3 border rounded-lg" />

              <input name="image" type="file" accept="image/*" onChange={handleChange} className="p-2 file:bg-blue-600 file:text-white file:rounded-full" />

              <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="p-3 border rounded-lg" />

              <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} className="p-3 border rounded-lg" />
            </div>

            <textarea name="bio" placeholder="Biography" required rows="4" value={form.bio} onChange={handleChange} className="w-full p-3 border rounded-lg" />

            <label className="flex items-center space-x-3">
              <input type="checkbox" name="isIndependent" checked={form.isIndependent} onChange={handleChange} className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 font-medium">Is Independent?</span>
            </label>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Submit Candidate</button>
          </form>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminCandidate;
