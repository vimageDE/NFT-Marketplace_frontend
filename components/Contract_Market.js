// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { Globals } from './GlobalVariables';
import { NftContract } from './Contract_NFT';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export const MarketContract = createContext();

export const Contract_Market = ({ children }) => {
  const { chainId, contract, contract_Market, signer, signerAddress } = useContext(NftContract);

  // Functions
  const getNonce = async () => {
    const contract_Market_connected = contract_Market.connect(signer);
    const nonce = await contract_Market_connected.getNonce();
    return nonce;
  };
  const purchaseNft = async (saleId) => {};
  const sellNft = async (offerId) => {};

  // Front End Functions

  const signMessage = async function (tokenId, price, typeOf) {
    // Get Nonce of user
    const nonce = await getNonce();
    // Define the EIP-712 domain - All properties on a domain are optional
    const domain = {
      name: 'NFt Portfolio',
      version: '1',
      chainId: chainId,
      verifyingContract: contract_Market.address,
    };

    const types = {
      Message: [
        { name: 'tokenId', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'price', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'nonce', type: 'string' },
      ],
    };
    // Define the message
    const value = {
      tokenId: tokenId.toString(),
      address: signerAddress.toString(),
      price: price.toString(),
      type: typeOf.toString(),
      nonce: nonce.toString(),
    };

    console.log('Sign Message');

    const signature = await signer._signTypedData(domain, types, value);

    console.log('Message signed!');

    return signature;
  };

  // Firebase Functions
  const setOffer = async function (metadata, price) {
    const signature = await signMessage(metadata.tokenId.toString(), price.toString(), 'offer');

    const offer = {
      tokenId: metadata.tokenId.toString(),
      address: signerAddress.toString(),
      price: price.toString(),
      signature: signature,
    };

    console.log(`Offer amount: ${offer.price}`);

    const uniqueId = offer.tokenId + '-' + offer.address;
    const offerRef = doc(db, 'offer', uniqueId);

    setDoc(offerRef, offer)
      .then(() => console.log('Offer successfully set!'))
      .catch((error) => console.error('Error setting offer: ', error));
  };

  const setSale = async function (metadata, price) {
    const signature = await signMessage(metadata.tokenId.toString(), price.toString(), 'sale');

    const sale = {
      tokenId: metadata.tokenId.toString(),
      address: signerAddress.toString(),
      price: price,
      signature: signature,
    };
    console.log(`Setting NFT price: ${sale.price}`);

    const uniqueId = sale.tokenId + '-' + sale.address;
    const saleRef = doc(db, 'sale', uniqueId);

    setDoc(saleRef, sale)
      .then(() => console.log('Sale price sucessfully updated: ', sale.price))
      .catch((error) => console.error('error updating NFT price: ', error));
  };

  return (
    <MarketContract.Provider value={{ contract_Market, signerAddress, purchaseNft, sellNft, setOffer, setSale }}>
      {children}
    </MarketContract.Provider>
  );
};
