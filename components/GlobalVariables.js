import React, { createContext, useState, useEffect } from 'react';

export const Globals = createContext();

export const GlobalVariables = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState('');
  const [createNftPopup, setCreateNftPopup] = useState(false);
  const [profileName, setProfileName] = useState('');

  return (
    <Globals.Provider
      value={{
        isLoading,
        setIsLoading,
        isLoadingText,
        setIsLoadingText,
        createNftPopup,
        setCreateNftPopup,
        profileName,
        setProfileName,
      }}
    >
      {children}
    </Globals.Provider>
  );
};
