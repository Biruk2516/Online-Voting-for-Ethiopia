import React from 'react';
import { useLanguage, languages } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {Object.values(languages).map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 