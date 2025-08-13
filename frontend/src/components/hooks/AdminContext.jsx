import React, { createContext, useState,useEffect } from 'react';


// Create a context for authentication
export const AdminCont = createContext();

export const AdminContext = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    const storedIsAdmin = localStorage.getItem('isAdmin');
    return storedIsAdmin === 'true'; // Convert the string to boolean
  });

  // Update local storage whenever isLoggedIn changes
  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin);
  }, [isAdmin]);

  return (
    <AdminCont.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminCont.Provider>
  );
};