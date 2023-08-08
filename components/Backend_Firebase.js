// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { Globals } from './GlobalVariables';
import { db, functions } from '../firebase';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export const FirebaseBackend = createContext();

export const Backend_Firebase = ({ children }) => {
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  // State Variables

  // Cloud Functions
  const createTestDocument = httpsCallable(functions, 'createTestDocument');
  const transaction = httpsCallable(functions, 'transaction');
  const create = httpsCallable(functions, 'createNft');

  // Firebase Functions
  const setOfferData = async function (tokenId, address, price, timestamp, signature, nonce, chainId) {
    const offer = {
      tokenId: tokenId.toString(),
      address: address.toString(),
      price: price.toString(),
      timestamp: timestamp.toString(),
      signature: signature,
      nonce: nonce.toString(),
      chainId: chainId,
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

  const setSaleData = async function (tokenId, address, price, timestamp, signature, nonce, chainId) {
    const sale = {
      tokenId: tokenId.toString(),
      address: address.toString(),
      price: price.toString(),
      timestamp: timestamp.toString(),
      signature: signature,
      nonce: nonce.toString(),
      chainId: chainId,
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

  const deleteOfferData = async function (tokenId, from) {
    const offerRef = doc(db, 'offer', tokenId + '-' + from);
    try {
      await deleteDoc(offerRef);
      console.log('Offer successfully deleted!');
    } catch (e) {
      console.error('Error removing document: ', error);
    }
  };

  const getSaleData = async function (metadata) {
    const saleId = metadata.tokenId + '-' + metadata.owner;
    const docRef = doc(db, 'sale', saleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
      // console.log('Sale data: ', docSnap.data());
      return docSnap.data();
    } else {
      // console.log('No such document!');
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
      // console.log(doc.id, ' => ', doc.data());
    });

    const offers = querySnap.docs.map((doc) => doc.data());
    // console.log('=> ', offers[0].price);
    return offers;
  };

  const getTransactionData = async function (metadata) {
    const q = query(
      collection(db, 'transactions'),
      where('tokenId', '==', metadata.tokenId.toString()),
      orderBy('timestamp', 'asc')
    );
    const querySnap = await getDocs(q);

    const transactions = querySnap.docs.map((doc) => doc.data());
    return transactions;
  };

  const getInfoData = async function (metadata) {
    const docRef = doc(db, 'info', metadata.tokenId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
      return docSnap.data();
    } else {
      return null;
    }
  };

  const getImageByUrl = async function (imageUri) {
    // console.log('Check if token already exists');
    const q = query(collection(db, 'info'), where('image', '==', imageUri));

    const querySnap = await getDocs(q);

    const allResults = querySnap.docs.map((doc) => doc.data());
    return allResults.length > 0;
  };

  const getBrowseData = async function () {
    const q = query(collection(db, 'info'), orderBy('timestamp', 'desc'), limit(20));
    const querySnap = await getDocs(q);
    const all = querySnap.docs.map((doc) => doc.data().tokenId);
    const lastSales = await getLastSales();
    const highestSales = await getHighestSales();
    const browse = {
      all: all,
      lastSales: lastSales,
      highestSales: highestSales,
    };
    return browse;
  };

  const getLastSales = async function () {
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(20));
    const querySnap = await getDocs(q);
    const lastSales = querySnap.docs.map((doc) => doc.data().tokenId);
    return lastSales;
  };

  const getHighestSales = async function () {
    const q = query(collection(db, 'transactions'), orderBy('price', 'desc'), limit(20));
    const querySnap = await getDocs(q);
    const highestSales = querySnap.docs.map((doc) => doc.data().tokenId);
    return highestSales;
  };

  const subscribeToToken = async function (metadata, setMetadata) {
    const qOffer = query(
      collection(db, 'offer'),
      where('tokenId', '==', metadata.tokenId.toString()),
      orderBy('price', 'desc')
    );

    const unsubOffer = onSnapshot(qOffer, (snapshot) => {
      const offers = snapshot.docs.map((doc) => doc.data());
      metadata.offers = offers;
      metadata.highestOffer = offers[0];

      console.log('EVENT - Offers updated!');

      setMetadata(metadata);
    });

    const saleId = metadata.tokenId + '-' + metadata.owner;
    const docRef = doc(db, 'sale', saleId);
    const unsubSale = onSnapshot(docRef, (doc) => {
      if (doc.exists) {
        console.log('EVENT - Sale data Updated: ', doc.data());
        metadata.sale = doc.data();
      } else {
        console.log('EVENT - Sale data deleted!');
        metadata.sale.price = 0;
      }

      setMetadata(metadata);
    });
  };

  // This should not be called from the Frontend, but from the server
  const transactionEvent = async function (tokenId, from, to, price, chainId) {
    const params = {
      tokenId: tokenId.toString(),
      from: from,
      to: to,
      price: price,
      chainId: chainId,
    };

    try {
      const result = await transaction(params);
      // console.log(result.data.result);
    } catch (e) {
      console.error('Error: ', error);
    }
  };
  // This should not be called from the Frontend, but from the server
  const creationEvent = async function (tokenId, uri, chainId) {
    const params = {
      tokenId: tokenId.toString(),
      uri: uri,
      chainId: chainId,
    };

    try {
      const result = await create(params);
      // console.log(result.data.result);
    } catch (e) {
      console.error('Error: ', error);
    }
  };

  // Firebase Server Functions
  const testInteraction = async function () {
    try {
      const result = await createTestDocument({});
      // do something with the result
      console.log('The Firebase Cloud call was a success: ', result);
    } catch (error) {
      console.error('Interacting with the Firebase Cloud failed: ', error);
    }
  };

  return (
    <FirebaseBackend.Provider
      value={{
        setOfferData,
        setSaleData,
        getSaleData,
        getOfferData,
        getTransactionData,
        subscribeToToken,
        transactionEvent,
        getInfoData,
        getBrowseData,
        getImageByUrl,
        creationEvent,
        testInteraction,
        deleteOfferData,
      }}
    >
      {children}
    </FirebaseBackend.Provider>
  );
};
