
import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram ,FaTelegram } from 'react-icons/fa';

const Share = ({ bookLink, onCancel }) => {
 return (
    <div className="m-4 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50" style={{marginTop:'-180px'}}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Thanks for Sharing!</h2>
            <button onClick={onCancel} className="text-red-500 hover:text-red-700">
            Cancel
            </button>
          </div>
          <div className="flex flex-col items-center mt-4">
            <p className="mb-4">Share this book on:</p>
            <div className="flex space-x-4">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${bookLink}`} target="_blank" rel="noopener noreferrer">
                <FaFacebook className="text-blue-600 w-8 h-8 hover:text-blue-800" />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${bookLink}`} target="_blank" rel="noopener noreferrer">
                <FaTwitter className="text-blue-400 w-8 h-8 hover:text-blue-600" />
                </a>
                <a href={`https://www.linkedin.com/shareArticle?url=${bookLink}`} target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="text-blue-700 w-8 h-8 hover:text-blue-900" />
                </a>
                <a href={`https://www.instagram.com/?url=${bookLink}`} target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-pink-500 w-8 h-8 hover:text-pink-700" />
                </a>
                <a href={`https://www.instagram.com/?url=${bookLink}`} target="_blank" rel="noopener noreferrer">
                <FaTelegram className="text-pink-500 w-8 h-8 hover:text-pink-700" />
                </a>
            </div>
          </div>
      </div>
    </div>
 );
};

export default Share;