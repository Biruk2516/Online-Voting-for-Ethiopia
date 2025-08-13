// src/components/LanguageSwitcher.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      onChange={handleLanguageChange}
      value={i18n.language}
      style={{
        padding: '6px',
        borderRadius: '6px',
        marginLeft: '1rem',
        fontWeight: 'bold'
      }}
    >
      <option value="en">English</option>
      <option value="am">አማርኛ</option>
    </select>
  );
};

export default LanguageSwitcher;
