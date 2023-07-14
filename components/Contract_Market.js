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

  // State Variables

  // Functions
  const getNonce = async () => {
    const contract_Market_connected = contract_Market.connect(signer);
    const nonce = await contract_Market_connected.getNonce();
    return nonce;
  };
  const purchaseNft = async (saleId) => {};
  const sellNft = async (offerId) => {};

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
        // { name: 'price', type: 'uint256' },
        // { name: 'sigOwner', type: 'address' },
        { name: 'typeOf', type: 'string' },
      ],
    };
    // Define the message
    const value = {
      tokenId: tokenId,
      nonce: nonce,
      // price: priceInWei,
      // sigOwner: signerAddress,
      typeOf: typeOf,
    };

    console.log('Sign Message');
    console.log(
      `Token ID: ${tokenId.toString()} - sigOwner: ${signerAddress.toString()} - priceInWei: ${priceInWei.toString()} - typeOf ${typeOf.toString()} - nonce ${nonce.toString()}`
    );

    const signature = await signer._signTypedData(domain, types, value);

    console.log('Message signed!');

    await verifyMessage(tokenId, signerAddress, priceAsText, typeOf, nonce, signature);

    return signature;
  };

  const verifyMessage = async function (tokenId, sigOwner, priceAsText, typeOf, nonce, signature) {
    const priceInWei = ethers.utils.parseEther(priceAsText);

    console.log('Verify Message:');
    console.log(
      `Token ID: ${tokenId.toString()} - sigOwner: ${sigOwner.toString()} - priceInWei: ${priceInWei.toString()} - typeOf ${typeOf.toString()} - nonce ${nonce.toString()}`
    );
    const result = await contract_Market.getSigner(tokenId, sigOwner, priceInWei, typeOf, nonce, signature);
    console.log(`Verify finished! ${sigOwner} should be ${result}, which is: ${sigOwner == result}`);
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
    const signature = await signMessage(metadata.tokenId, price.toString(), 'sale');

    const sale = {
      tokenId: metadata.tokenId.toString(),
      address: signerAddress.toString(),
      price: price.toString(),
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
