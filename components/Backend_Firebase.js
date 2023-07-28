// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { Globals } from './GlobalVariables';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export const FirebaseBackend = createContext();

export const Backend_Firebase = ({ children }) => {
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  // State Variables

  // Firebase Functions
  const setOfferData = async function (tokenId, address, price, timestamp, signature) {
    const offer = {
      tokenId: tokenId.toString(),
      address: address.toString(),
      price: price.toString(),
      timestamp: timestamp.toString(),
      signature: signature,
    };

    console.log(`Offer amount: ${offer.price}`);

    const uniqueId = tokenId + '-' + address;
    const offerRef = doc(db, 'offer', uniqueId);

    try {
      await setDoc(offerRef, offer);
      console.log('Offer successfully set: ', offer.price);
    } catch (error) {
      console.log('Error setting offer: ', error);
    }
  };

  const setSaleData = async function (tokenId, address, price, timestamp, signature) {
    const sale = {
      tokenId: tokenId.toString(),
      address: address.toString(),
      price: price.toString(),
      timestamp: timestamp.toString(),
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
      console.log('Sale data: ', docSnap.data());
      return docSnap.data();
    } else {
      console.log('No such document!');
      return null;
    }
  };

  const getOfferData = async function (metadata, address) {
    const q = query(
      collection(db, 'offer'),
      where('tokenId', '==', metadata.tokenId.toString()),
      orderBy('price', 'desc')
    );
    const querySnap = await getDocs(q);

    querySnap.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
    });

    const offers = querySnap.docs.map((doc) => doc.data());
    // console.log('=> ', offers[0].price);
    return offers;
  };

  return (
    <FirebaseBackend.Provider value={{ setOfferData, setSaleData, getSaleData, getOfferData }}>
      {children}
    </FirebaseBackend.Provider>
  );
};
