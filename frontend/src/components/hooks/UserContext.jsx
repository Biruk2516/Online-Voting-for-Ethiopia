import React, { createContext, useState,useEffect } from 'react';


// Create a context for authentication
export const AuthContext = createContext();

export const UserContext = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return storedIsLoggedIn === 'true'; // Convert the string to boolean
  });

  // Update local storage whenever isLoggedIn changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
