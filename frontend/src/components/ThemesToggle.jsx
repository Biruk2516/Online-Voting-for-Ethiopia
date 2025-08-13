import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} className="text-xl p-2">
      {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-800" />}
    </button>
  );
};

export default ThemeToggle;
