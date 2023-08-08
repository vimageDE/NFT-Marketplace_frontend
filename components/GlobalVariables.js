import React, { createContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const Globals = createContext();

export const GlobalVariables = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState('');
  const [createNftPopup, setCreateNftPopup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [deleteOffer, setDeleteOffer] = useState(false);

  const router = useRouter();

  const getAddressShortened = (address, digits = 6) => {
    // Check if the address is valid
    if (!address) return '';
    // Check if the address is long enough to be shortened
    if (address.length <= digits * 2 + 2) return address;

    // Shorten the address by keeping the first and last few characters
    const start = address.slice(0, digits);
    const end = address.slice(-digits);
    return `${start}...${end}`;
  };

  const getAddressLink = (address, name) => {
    const link = (
      <Link href={`/portfolio/${address}`}>
        <a className="text-gold">{name}</a>
      </Link>
    );
    return link;
  };

  const getTimestampDate = (timestamp) => {
    const date = new Date(timestamp * 1000);

    // Format it in a readable manner
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    return formattedDate;
  };

  const openAddress = (address) => {
    router.push(`/portfolio/${address}`);
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <Globals.Provider
      value={{
        isLoading,
        setIsLoading,
        isLoadingText,
        setIsLoadingText,
        createNftPopup,
        setCreateNftPopup,
        deleteOffer,
        setDeleteOffer,
        profileName,
        setProfileName,
        getAddressShortened,
        getAddressLink,
        getTimestampDate,
        openAddress,
        goHome,
      }}
    >
      {children}
    </Globals.Provider>
  );
};
