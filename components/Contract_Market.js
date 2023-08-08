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
  const { setIsLoading, setIsLoadingText, setDeleteOffer } = useContext(Globals);
  const { setOfferData, setSaleData, testInteraction, getOfferData, getSaleData, deleteOfferData, transactionEvent } =
    useContext(FirebaseBackend);
  // State Variables

  // Functions
  const getNonce = async () => {
    let nonce = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    return nonce;
  };

  const getTimestamp = (seconds) => {
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    const additionalTime = seconds; // Number of seconds in a day
    const timestamp = now + additionalTime;
    return timestamp;
  };

  const buyNft = async (metadata) => {
    try {
      setIsLoadingText('Validate sale');
      setIsLoading(true);

      const sale = await getSaleData(metadata);

      const tokenId = ethers.BigNumber.from(sale.tokenId);
      const sigOwner = sale.address;
      const priceAsText = sale.price.toString();
      const price = ethers.utils.parseEther(priceAsText);
      const typeOf = 'sale';
      const nonce = ethers.BigNumber.from(sale.nonce);
      const time = ethers.BigNumber.from(sale.timestamp);
      const signature = sale.signature;

      // Front End Validation
      const validation = await verifyMessage(tokenId, sigOwner, priceAsText, typeOf, nonce, time, signature);
      // Check timestamp
      const timeLeft = sale.timestamp - Math.floor(Date.now() / 1000);
      const expired = timeLeft < 0;

      console.log('Validate sale data');

      if (validation && !expired) {
        // Make Sale
        console.log('Sale data successfully validated!');

        // Allowance
        await approveTokens(priceAsText);

        // Transaction
        setIsLoadingText('Sale Transaction');
        // Create Message
        const message = {
          tokenId: tokenId,
          user: sigOwner,
          nonce: nonce,
          price: price,
          typeOf: typeOf,
          timestamp: time,
        };
        const tx = await contract_Market.BuyNft(message, signature);
        setIsLoadingText('Waiting for confirmation');
        const receipt = await tx.wait();
        // This is for testing only - Should be done on server
        await transactionEvent(tokenId, sigOwner, signerAddress, priceAsText, chainId);
      } else {
        // Fail
        throw new Error('Validation failed or offer expired');
      }

      setIsLoadingText('Successfully Sold NFT!');
    } catch (error) {
      setIsLoadingText('Failed to buy NFT!');
    }

    setTimeout(() => setIsLoading(false), 2000);
  };
  const sellNft = async (metadata) => {
    try {
      setIsLoadingText('Validate offer');
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
      const timeLeft = acceptedOffer.timestamp - Math.floor(Date.now() / 1000);
      const expired = timeLeft < 0;

      console.log('Validate offer data');

      if (validation && !expired) {
        // Make Sale
        console.log('Offer data successfully validated!');

        // Allowance
        await approveNFT(tokenId);

        // Transaction
        setIsLoadingText('Sale Transaction');
        // Create Message
        const message = {
          tokenId: tokenId,
          user: sigOwner,
          nonce: nonce,
          price: price,
          typeOf: typeOf,
          timestamp: time,
        };
        const tx = await contract_Market.SellNft(message, signature);
        setIsLoadingText('Waiting for confirmation');
        const receipt = await tx.wait();
        // This is for testing only - Should be done on server
        await transactionEvent(tokenId, signerAddress, sigOwner, priceAsText, chainId);
      } else {
        // Fail
        throw new Error('Validation failed or offer expired');
      }

      setIsLoadingText('Successfully Purchased NFT!');
    } catch (error) {
      setIsLoadingText('Failed to sell NFT!');
      setDeleteOffer(true);
    }

    setTimeout(() => setIsLoading(false), 2000);

    // TEST!
    return;
    await testInteraction();
    console.log('Firebsae Cloud function should have been called!');
  };

  const setSale = async (metadata, price, duration) => {
    try {
      setIsLoadingText('Sign your offer');
      setIsLoading(true);

      // Get Expiration Time
      const expirationTime = getTimestamp(duration);
      // Get Nonce of user
      const nonce = await getNonce();

      const signature = await signMessage(metadata.tokenId, price.toString(), 'sale', expirationTime, nonce);

      // Approve NFT
      setIsLoadingText('Approve NFT');
      await approveNFT(metadata.tokenId);

      // this should normaly be done on the server!
      // Or at least some confirmation of the sale by a server that reacts to the approve event
      await setSaleData(metadata.tokenId, signerAddress, price, expirationTime, signature, nonce, chainId);

      setIsLoadingText('Successfully updated NFT price!');
    } catch (e) {
      setIsLoadingText('Failed to set price!');
    }

    setTimeout(() => setIsLoading(false), 2000);
  };

  const setOffer = async function (metadata, price, duration) {
    try {
      setIsLoading(true);
      setIsLoadingText('Check if offer available');

      const tokensAvailable = await checkTokensAvailable(price.toString());
      if (!tokensAvailable) {
        console.log('Not enough tokens available in your account');
        setIsLoadingText('Not enough tokens available in your account');
      } else {
        setIsLoadingText('Sign your offer');

        // Set Expiration Time
        const expirationTime = getTimestamp(duration);
        // Get Nonce of user
        const nonce = await getNonce();

        const signature = await signMessage(metadata.tokenId, price.toString(), 'offer', expirationTime, nonce);

        // Approve Tokens
        setIsLoadingText('Approve Tokens');
        await approveTokens(price.toString());

        // this should normaly be done on the server!
        // Or at least some confirmation of the offer by a server that reacts to the approve event
        await setOfferData(metadata.tokenId, signerAddress, price, expirationTime, signature, nonce, chainId);

        setIsLoadingText('Successfully updated offer!');
      }
    } catch (e) {
      setIsLoadingText('Failed to set offer!');
    }

    setTimeout(() => setIsLoading(false), 2000);
  };

  const deleteHighestOffer = async function (metadata) {
    setIsLoading(true);
    setIsLoadingText('delte offer...');
    await deleteOfferData(metadata.tokenId, metadata.highestOffer.address);
    setDeleteOffer(false);
    setIsLoading(false);
  };

  // Approve Functions

  const approveTokens = async (amount) => {
    try {
      setIsLoadingText('Approve Tokens');
      const priceConverted = ethers.utils.parseEther(amount);
      const approvedAmount = await contract_Weth.allowance(signerAddress, contract_Market.address);
      const isAlreadyApproved = approvedAmount.gte(priceConverted);
      if (!isAlreadyApproved) {
        const tx = await contract_Weth.approve(contract_Market.address, priceConverted);
        setIsLoadingText('Waiting for confirmation');
        const receipt = await tx.wait();
      }
      console.log('Tokens successfully approved!');
    } catch (error) {
      console.log('Error approving tokens: ', error);
      throw new Error('Token Approval failed!');
    }
  };

  const approveNFT = async (tokenId) => {
    try {
      setIsLoadingText('Approve NFT');
      const approvedAddress = await contract.getApproved(tokenId);
      const isAlreadyApproved = approvedAddress == contract_Market.address;
      if (!isAlreadyApproved) {
        const tx = await contract.approve(contract_Market.address, tokenId);
        setIsLoadingText('Waiting for confirmation');
        const receipt = await tx.wait();
      }
      console.log('NFT successfully approved!');
    } catch (error) {
      console.log('Error approving NFT: ', error);
      throw new Error('NFT Approval failed!');
    }
  };

  const checkTokensAvailable = async (amountText) => {
    const amount = ethers.utils.parseEther(amountText);
    const available = await contract_Weth.balanceOf(signerAddress);
    console.log('Available tokens: ', available.toString());
    return available.gte(amount);
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

    console.log('Verify Message');
    // console.log('Verify with variables: ', tokenId, sigOwner, priceAsText, typeOf, nonce, time, signature);

    const message = {
      tokenId: tokenId,
      user: sigOwner,
      nonce: nonce,
      price: priceInWei,
      typeOf: typeOf,
      timestamp: time,
    };

    const result = await contract_Market.getSigner(message, signature);
    console.log(`Verify finished! ${sigOwner} should be ${result}, which is: ${sigOwner == result}`);
    return sigOwner == result;
  };

  return (
    <MarketContract.Provider
      value={{ contract_Market, signerAddress, buyNft, sellNft, setSale, setOffer, deleteHighestOffer }}
    >
      {children}
    </MarketContract.Provider>
  );
};
