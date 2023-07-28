// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { Globals } from './GlobalVariables';
import { NftContract } from './Contract_NFT';
import { db } from '../firebase';
import { FirebaseBackend } from './Backend_Firebase';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export const MarketContract = createContext();

export const Contract_Market = ({ children }) => {
  const { chainId, contract, contract_Market, signer, signerAddress } = useContext(NftContract);
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  const { setOfferData, setSaleData } = useContext(FirebaseBackend);
  // State Variables

  // Functions
  const getNonce = async () => {
    let nonce = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    return nonce;
  };

  const purchaseNft = async (tokenId, tokenOwner) => {
    const saleId = tokenId + '-' + tokenOwner;
    const docRef = db.collection('sale').doc(saleId);
    docRef.get().then((doc) => {
      if (doc.exists) {
        console.log('Document data:', doc.data());
      } else {
        console.log('No such document!');
      }
    });
  };
  const sellNft = async (offerId) => {};

  const setSale = async (metadata, price) => {
    try {
      setIsLoadingText('Sign your offer');
      setIsLoading(true);

      const signature = await signMessage(metadata.tokenId, price.toString(), 'sale');

      await setSaleData(metadata.tokenId, signerAddress, price, signature);

      setIsLoadingText('Successfully updated NFT price!');
    } catch (e) {
      setIsLoadingText('Failed to set price!');
    }

    setTimeout(() => setIsLoading(false), 2000);
  };

  const setOffer = async function (metadata, price) {
    try {
      setIsLoadingText('Sign your offer');
      setIsLoading(true);

      const signature = await signMessage(metadata.tokenId, price.toString(), 'offer');

      await setOfferData(metadata.tokenId, signerAddress, price, signature);

      setIsLoadingText('Successfully updated offer!');
    } catch (e) {
      setIsLoadingText('Failed to set price!');
    }

    setTimeout(() => setIsLoading(false), 2000);
  };

  // Front End Functions

  const signMessage = async function (tokenId, priceAsText, typeOf) {
    // Get Nonce of user
    const nonce = await getNonce();
    // Convert price from text to wei
    const priceInWei = ethers.utils.parseEther(priceAsText);
    // big Number tokenId
    // const tokenId_BN = ethers.BigNumber.from(tokenId);

    // Define the EIP-712 domain - All properties on a domain are optional
    const domain = {
      name: 'NFT Portfolio',
      version: '1',
      chainId: chainId,
      verifyingContract: contract_Market.address,
    };

    const types = {
      Message: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'typeOf', type: 'string' },
        { name: 'user', type: 'address' },
      ],
    };
    // Define the message
    const value = {
      tokenId: tokenId, // ethers.BigNumber.from(15),
      nonce: nonce, // ethers.BigNumber.from(30),
      price: priceInWei, // ethers.BigNumber.from(60),
      typeOf: typeOf,
      user: signerAddress,
    };

    console.log('Sign Message');

    const signature = await signer._signTypedData(domain, types, value);

    console.log('Message signed!');

    await verifyMessage(tokenId, signerAddress, priceAsText, typeOf, nonce, signature);

    return signature;
  };

  const verifyMessage = async function (tokenId, sigOwner, priceAsText, typeOf, nonce, signature) {
    const priceInWei = ethers.utils.parseEther(priceAsText);

    console.log('Verify Message:');

    const result = await contract_Market.getSigner(tokenId, nonce, priceInWei, typeOf, signature);
    console.log(`Verify finished! ${sigOwner} should be ${result}, which is: ${sigOwner == result}`);
  };

  return (
    <MarketContract.Provider value={{ contract_Market, signerAddress, purchaseNft, sellNft, setSale, setOffer }}>
      {children}
    </MarketContract.Provider>
  );
};
