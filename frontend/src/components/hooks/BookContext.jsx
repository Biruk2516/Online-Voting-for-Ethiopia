import React, { createContext, useState,useEffect } from 'react';


// Create a context for authentication
export const BookFiltered = createContext();

export const  BookContext  =({ children }) => {
    const [book, setBook] = useState([]);

    return (
        <BookFiltered.Provider value={{book, setBook}}>
            {children}
        </BookFiltered.Provider>
    )
}


