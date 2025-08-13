// Footer.jsx
import React from 'react';
import { FaTelegramPlane, FaFacebookF, FaTwitter, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-10">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-purple-400">About Us</h3>
          <p className="text-sm text-gray-300">
            Ethiopia Online Voting System is a secure and transparent platform that enables eligible citizens to cast their vote digitally across the country.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-400">Contact</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>Email: support@nebe.et</li>
            <li>Phone: +251 11 123 4567</li>
            <li>Address: Addis Ababa, Ethiopia</li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Follow Us</h3>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white text-2xl" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-2xl" aria-label="Telegram">
              <FaTelegramPlane />
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-2xl" aria-label="TikTok">
              <FaTiktok />
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-2xl" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-gray-900 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} National Election Board of Ethiopia. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
