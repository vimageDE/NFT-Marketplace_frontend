// Example for a parent component
import React, { createContext, useState, useEffect } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { contractAddresses, abi } from '../constants';

export const NftContract = createContext();

export const Contract_NFT = ({ children }) => {
  // contract interaction Variables
  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const [provider, setProvider] = useState('');
  const [signer, setSigner] = useState('');
  const contractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [contract, setContract] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  // contract state variables
  const [hasProfile, setHasProfile] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [metadataCollection, setMetadataCollection] = useState([]);

  // Update Contract When isWeb3 is Enabled or changes
  useEffect(() => {
    if (isWeb3Enabled) {
      updateContract();
      updateContractValues();
    }
  }, [isWeb3Enabled]);
  // Get contract variables when a contract is connected
  useEffect(() => {
    if (isWeb3Enabled && contract) {
      updateContractValues();
    }
  }, [contract]);

  // Set Contract
  async function updateContract() {
    const p = new ethers.providers.Web3Provider(window.ethereum);
    const s = p.getSigner();
    const sa = await s.getAddress();
    console.log(`chainId: ${chainId} - contract address: ${contractAddress}`);
    const c = new ethers.Contract(contractAddress, abi, p);
    setProvider(p);
    setSigner(s);
    setSignerAddress(sa);
    setContract(c);
  }

  // Update UI
  async function updateContractValues() {
    if (!contract || !signerAddress) return;

    const address = customAddress ? customAddress : signerAddress;

    const getArtworks_Callback = await contract.getArtworksOfOwner(address);
    const getSeriesName_Callback = await contract.getSeriesName(address);
    const mc = metadataCollection;

    console.log(`Series Name: ${getSeriesName_Callback} - Artworks: ${getArtworks_Callback.length.toString()}`);

    for (let i = 0; i < getArtworks_Callback.length; i++) {
      const tokenId = getArtworks_Callback[i];
      const uri = await contract.tokenURI(tokenId);
      const metadata = await fetchMetadata(uri);
      mc.push(metadata);
      console.log(`token ID: ${tokenId} - uri: ${uri}`);
    }

    setHasProfile(getArtworks_Callback.length > 0);
    setSeriesName(getSeriesName_Callback.toString());
    setMetadataCollection(mc);
  }

  // Contracts
  const {
    runContractFunction: contractFunction,
    contractIsLoading,
    contractIsFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: 'contractFunction',
    params: {},
    msgValue: 0,
  });

  const setSeries = async (name) => {
    const contractConnected = contract.connect(signer);
    const tx = await contractConnected.setSeriesName(name);
    const response = tx.wait();

    updateContractValues();
  };

  const createArtwork = async (tokenURI) => {
    const contractConnected = contract.connect(signer);
    const tx = await contractConnected.createArtwork(tokenURI);
    const response = await tx.wait();

    const ArtworkCreatedEvent = response.events.find((e) => e.event === 'ArtworkCreated'); // something like this
    if (ArtworkCreatedEvent) {
      const tokenId = ArtworkCreatedEvent.args.tokenId.toString();
      const address = ArtworkCreatedEvent.args.owner.toString();
      console.log(`Artwork with ID ${tokenId} was created by ${address}.`);
    } else {
      console.error('ArtworkCreated event not found in the transaction receipt.');
    }

    updateContractValues();

    return tokenId;
  };

  // IPFS
  const fetchMetadata = async (url) => {
    // const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
    const ipfsUrl = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const response = await fetch(ipfsUrl);
    const text = await response.text();
    console.log(`this is the url text: ${text}`);
    const metadata = JSON.parse(text);
    return metadata;
  };
  const getImageUrl = (metadata) => {
    console.log(`this is the metadata: ${metadata}`);
    const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    console.log(`this is the imageUrl: ${imageUrl}`);
    return imageUrl;
  };

  // Export Variables
  return (
    <NftContract.Provider
      value={{
        // Const Contract Variables
        chainId,
        provider,
        signer,
        signerAddress,
        contractAddress,
        contract,
        setContract,
        // State Variables
        hasProfile,
        seriesName,
        metadataCollection,
        setCustomAddress,
        // Functions
        updateContractValues,
        // Contract Functions,
        createArtwork,
        setSeries,
        contractFunction,
        contractIsLoading,
        contractIsFetching,
        // IPFS
        fetchMetadata,
        getImageUrl,
      }}
    >
      {children}
    </NftContract.Provider>
  );
};
