import React, { createContext, useState, useEffect } from 'react';

export const Globals = createContext();

export const GlobalVariables = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState('');
  const [createProfilePopup, setCreateProfilePoup] = useState(false);

  return (
    <Globals.Provider
      value={{ isLoading, setIsLoading, isLoadingText, setIsLoadingText, createProfilePopup, setCreateProfilePoup }}
    >
      {children}
    </Globals.Provider>
  );
};
