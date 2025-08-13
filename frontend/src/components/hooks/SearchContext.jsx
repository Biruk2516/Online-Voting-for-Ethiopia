import React, { createContext, useState,useEffect } from 'react';


// Create a context for authentication
export const ButtonContext = createContext();

export const  SearchContext  =({ children }) => {
    const [ispressed, setIsPressed] = useState(false);

    return (
        <ButtonContext.Provider value={{ispressed, setIsPressed}}>
            {children}
        </ButtonContext.Provider>
    )
}