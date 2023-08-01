// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { Globals } from './GlobalVariables';
import { Contract_NFT, NftContract } from './Contract_NFT';
import { db } from '../firebase';
import { FirebaseBackend } from './Backend_Firebase';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export const MarketContract = createContext();

export const Contract_Market = ({ children }) => {
  const { chainId, contract, contract_Market, contract_Weth, signer, signerAddress } = useContext(NftContract);
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  const { setOfferData, setSaleData, testInteraction, getOfferData } = useContext(FirebaseBackend);
  // State Variables

  // Functions
  const getNonce = async () => {
    let nonce = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    return nonce;
  };

  const getTimestamp = (hours) => {
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    const additionalTime = 60 * 60 * hours; // Number of seconds in a day
    const timestamp = now + additionalTime;
    return timestamp;
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
  const sellNft = async (metadata) => {
    try {
      setIsLoadingText('Sign your offer');
      setIsLoading(true);

      const offers = await getOfferData(metadata);

      const acceptedOffer = offers[0];

      const tokenId = ethers.BigNumber.from(acceptedOffer.tokenId);
      const sigOwner = acceptedOffer.address;
      const priceAsText = acceptedOffer.price.toString();
      const price = ethers.utils.parseEther(priceAsText);
      const typeOf = 'offer';
      const nonce = ethers.BigNumber.from(acceptedOffer.nonce);
      const time = ethers.BigNumber.from(acceptedOffer.timestamp);
      const signature = acceptedOffer.signature;

      // Front End Validation
      const validation = await verifyMessage(tokenId, sigOwner, priceAsText, typeOf, nonce, time, signature);
      // Check timestamp
      const timeLeft = expiryTimestamp - Math.floor(Date.now() / 1000);
      const expired = timeLeft < 0;

      console.log('Validate offer data');

      if (validation && !expired) {
        // Make Sale
        console.log('Offer data successfully validated!');
        const tx = await contract_Market.SellNft(tokenId, sigOwner, price, nonce, time, signature);
        const receipt = await tx.wait();
      } else {
        // Fail
        throw new Error('Validation failed or offer expired');
      }

      setIsLoadingText('Successfully Purchased NFT!');
    } catch (error) {
      setIsLoadingText('Failed to set price!');
    }

    setTimeout(() => setIsLoading(false), 2000);

    // TEST!
    return;
    await testInteraction();
    console.log('Firebsae Cloud function should have been called!');
  };

  const setSale = async (metadata, price) => {
    try {
      setIsLoadingText('Sign your offer');
      setIsLoading(true);

      // Get Expiration Time
      const expirationTime = getTimestamp(24);
      // Get Nonce of user
      const nonce = await getNonce();

      const signature = await signMessage(metadata.tokenId, price.toString(), 'sale', expirationTime, nonce);
      // Approve NFT
      await approveNFT(metadata.tokenId);

      // this should normaly be done on the server!
      // Or at least some confirmation of the sale by a server that reacts to the approve event
      await setSaleData(metadata.tokenId, signerAddress, price, expirationTime, signature, nonce);

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

      // Set Expiration Time
      const expirationTime = getTimestamp(24);
      // Get Nonce of user
      const nonce = await getNonce();

      const signature = await signMessage(metadata.tokenId, price.toString(), 'offer', expirationTime, nonce);
      // Approve Tokens
      await approveTokens(price.toString());

      // this should normaly be done on the server!
      // Or at least some confirmation of the offer by a server that reacts to the approve event
      await setOfferData(metadata.tokenId, signerAddress, price, expirationTime, signature, nonce);

      setIsLoadingText('Successfully updated offer!');
    } catch (e) {
      setIsLoadingText('Failed to set price!');
    }

    setTimeout(() => setIsLoading(false), 2000);
  };

  // Approve Functions

  const approveTokens = async (amount) => {
    try {
      setIsLoadingText('Approve Tokens');
      const priceConverted = ethers.utils.parseEther(amount);
      const tx = await contract_Weth.approve(contract_Market.address, priceConverted);
      setIsLoadingText('Waiting for confirmation');
      const receipt = tx.wait();
      console.log('Tokens successfully approved!');
    } catch (error) {
      console.log('Error approving tokens: ', error);
    }
  };

  const approveNFT = async (tokenId) => {
    try {
      setIsLoadingText('Approve NFT');
      const tx = await contract.approve(contract_Market.address, tokenId);
      setIsLoadingText('Waiting for confirmation');
      const receipt = tx.wait();
      console.log('NFT successfully approved!');
    } catch (error) {
      console.log('Error approving NFT: ', error);
    }
  };

  // Front End Functions

  const signMessage = async function (tokenId, priceAsText, typeOf, time, nonce) {
    // Convert price from text to wei
    const priceInWei = ethers.utils.parseEther(priceAsText);

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
        { name: 'timestamp', type: 'uint256' },
        { name: 'typeOf', type: 'string' },
        { name: 'user', type: 'address' },
      ],
    };
    // Define the message
    const value = {
      tokenId: tokenId, // ethers.BigNumber.from(15),
      nonce: nonce, // ethers.BigNumber.from(30),
      price: priceInWei, // ethers.BigNumber.from(60),
      timestamp: time,
      typeOf: typeOf,
      user: signerAddress,
    };

    console.log('Sign Message');

    const signature = await signer._signTypedData(domain, types, value);

    console.log('Message signed!');

    await verifyMessage(tokenId, signerAddress, priceAsText, typeOf, nonce, time, signature);

    return signature;
  };

  const verifyMessage = async function (tokenId, sigOwner, priceAsText, typeOf, nonce, time, signature) {
    const priceInWei = ethers.utils.parseEther(priceAsText);

    console.log('Verify Message:');
    console.log('Verify with variables: ', tokenId, sigOwner, priceAsText, typeOf, nonce, time, signature);

    const result = await contract_Market.getSigner(tokenId, sigOwner, nonce, priceInWei, typeOf, time, signature);
    console.log(`Verify finished! ${sigOwner} should be ${result}, which is: ${sigOwner == result}`);
    return sigOwner == result;
  };

  return (
    <MarketContract.Provider value={{ contract_Market, signerAddress, purchaseNft, sellNft, setSale, setOffer }}>
      {children}
    </MarketContract.Provider>
  );
};
