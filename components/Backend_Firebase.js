// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { Globals } from './GlobalVariables';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export const FirebaseBackend = createContext();

export const Backend_Firebase = ({ children }) => {
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  // State Variables

  // Firebase Functions
  const setOfferData = async function (tokenId, address, price, signature) {
    const offer = {
      tokenId: tokenId.toString(),
      address: address.toString(),
      price: price.toString(),
      signature: signature,
    };

    console.log(`Offer amount: ${offer.price}`);

    const uniqueId = offer.tokenId + '-' + offer.address;
    const offerRef = doc(db, 'offer', uniqueId);

    try {
      await setDoc(offerRef, offer);
      console.log('Offer successfully set: ', offer.price);
    } catch (error) {
      console.log('Error setting offer: ', error);
    }

    setDoc(offerRef, offer)
      .then(() => console.log('Offer successfully set!'))
      .catch((error) => console.error('Error setting offer: ', error));
  };

  const setSaleData = async function (tokenId, address, price, signature) {
    const sale = {
      tokenId: tokenId.toString(),
      address: address.toString(),
      price: price.toString(),
      signature: signature,
    };
    console.log(`Setting NFT price: ${sale.price}`);

    const uniqueId = sale.tokenId + '-' + sale.address;
    const saleRef = doc(db, 'sale', uniqueId);

    try {
      await setDoc(saleRef, sale);
      console.log('Sale price successfully updated: ', sale.price);
    } catch (error) {
      console.log('Error updating NFT price: ', error);
    }
  };

  const getSaleData = async function (metadata) {
    const saleId = metadata.tokenId + '-' + metadata.owner;
    const docRef = doc(db, 'sale', saleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
      console.log('Document data:', docSnap.data());
      return docSnap.data();
    } else {
      console.log('No such document!');
      return null;
    }
  };

  const getOfferData = async function (tokenId, tokenOwner) {
    const offerId = metadata;
  };

  return (
    <FirebaseBackend.Provider value={{ setOfferData, setSaleData, getSaleData, getOfferData }}>
      {children}
    </FirebaseBackend.Provider>
  );
};
