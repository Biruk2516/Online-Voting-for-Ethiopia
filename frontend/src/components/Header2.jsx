import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCog, 
  FaHome,
  FaClipboardList,
  FaVoteYea
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import ethiopiaEmblem from '../assets/ethiopian.jpg';

const Header2 = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-green-800 text-white shadow-md sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-yellow-500 text-green-900 py-1 px-4">
        <div className="container mx-auto text-center text-sm font-bold">
          🇪🇹 ETHIOPIAN NATIONAL ELECTORAL BOARD - OFFICIAL VOTING PORTAL 🇪🇹
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img 
              src={ethiopiaEmblem} 
              alt="Ethiopian Government Emblem" 
              className="h-12 mr-3"
            />
            <div className="border-l-2 border-yellow-500 h-12 mx-3"></div>
            <div>
              <h1 className="text-xl font-bold flex items-center">
                <FaVoteYea className="mr-2" />
                eVoting Dashboard
              </h1>
            </div>
          </div>

          {/* Navigation and Profile */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center px-3 py-2 rounded hover:bg-green-700 transition"
              >
                <FaHome className="mr-2" /> Dashboard
              </Link>
              <Link 
                to="/elections" 
                className="flex items-center px-3 py-2 rounded hover:bg-green-700 transition"
              >
                <FaClipboardList className="mr-2" /> My Elections
              </Link>
            </nav>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <FaUserCircle className="text-2xl" />
                <span className="hidden md:inline">{user?.fullName || 'Profile'}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-700 font-medium">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaUserCircle className="mr-2" /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaCog className="mr-2" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header2;