import React, { createContext, useState, useEffect } from 'react';

export const Globals = createContext();

export const GlobalVariables = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState('');

  return (
    <Globals.Provider value={{ isLoading, setIsLoading, isLoadingText, setIsLoadingText }}>{children}</Globals.Provider>
  );
};
