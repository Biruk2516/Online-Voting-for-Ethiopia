import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vote1 from '../assets/vote1.jpg';
import vote2 from '../assets/vote2.jpg';
import vote3 from '../assets/vote3.jpg';
import vote4 from '../assets/vote4.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const images = [vote1, vote2, vote3, vote4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      (prev + 1) % images.length
    );
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-green-800 dark:bg-gray-900 text-white shadow-md">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="bg-white text-green-800 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-md shadow hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Navigation */}
        <nav className="space-x-6 text-lg font-medium">
          <button onClick={() => navigate('/about')} className="hover:underline">About Us</button>
          <button onClick={() => navigate('/help')} className="hover:underline">Help</button>
        </nav>
      </header>

      {/* Welcome Text */}
      <div className="text-center py-10 px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-green-900 dark:text-green-100">
          Welcome to the Ethiopian Online Voting System
        </h1>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-row px-10 pb-16 h-[400px]">
        {/* Carousel */}
        <div className="w-[55%] flex justify-center items-center relative">
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <ChevronLeft size={32} />
          </button>

          <img
            src={images[currentImageIndex]}
            alt="Voting"
            className="w-full max-h-[400px] object-contain rounded-xl shadow-md transition duration-500"
          />

          <button
            onClick={handleNext}
            className="absolute right-4 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Register/Login Buttons */}
        <div className="w-[45%] flex flex-col justify-center items-end pr-10">
          <div className="flex flex-col space-y-6 w-full max-w-sm">
            <button
              onClick={() => navigate('/register')}
              className="bg-green-700 hover:bg-green-800 text-white text-2xl py-4 rounded-xl shadow-md transition"
            >
              Register
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white dark:bg-gray-100 hover:bg-gray-100 text-green-700 border border-green-700 text-2xl py-4 rounded-xl shadow-md transition"
            >
              Login
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
