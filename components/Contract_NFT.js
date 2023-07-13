// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { contractAddresses, abi, contractAddresses_Market, abi_market } from '../constants';
import { Globals } from './GlobalVariables';

export const NftContract = createContext();

export const Contract_NFT = ({ children }) => {
  // get Global Variables
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  // contract interaction Variables
  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const [provider, setProvider] = useState('');
  const [signer, setSigner] = useState('');
  const contractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const contractAddress_Market = chainId in contractAddresses_Market ? contractAddresses_Market[chainId][0] : null;
  const [contract, setContract] = useState('');
  const [contract_Market, setContract_Market] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  // contract state variables
  const [hasProfile, setHasProfile] = useState(false);
  const [userHasProfile, setUserHasProfile] = useState(false);
  const [ownProfile, setOwnProfile] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [seriesTitle, setSeriesTitle] = useState(0);
  const [metadataCollection, setMetadataCollection] = useState([]);
  const [metadataCollectionOwned, setMetadataCollectionOwned] = useState([]);

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
  }, [contract, customAddress]);

  // Set Contract
  async function updateContract() {
    const p = new ethers.providers.Web3Provider(window.ethereum);
    const s = p.getSigner();
    const sa = await s.getAddress();
    console.log(`chainId: ${chainId} - contract address: ${contractAddress}`);
    const c = new ethers.Contract(contractAddress, abi, p);
    const c_market = new ethers.Contract(contractAddress_Market, abi_market, p);
    setProvider(p);
    setSigner(s);
    setSignerAddress(sa);
    setContract(c);
    setContract_Market(c_market);
  }

  // Update UI
  async function updateContractValues() {
    if (!contract || !signerAddress) return;

    const isOwnProfile = !customAddress || customAddress == signerAddress;
    // console.log('Is own profile? ', isOwnProfile);
    setOwnProfile(isOwnProfile);
    const address = customAddress ? customAddress : signerAddress;

    if (!ethers.utils.isAddress(address)) {
      setHasProfile(false);
      return;
    }

    const getOwnedArtworks_Callback = await contract.getArtworksOfOwner(address);
    const getCreatedArtworks_Callback = await contract.getCreatedArtworks(address);
    if (!userHasProfile) {
      const getOwnSeriesName_Callback = await contract.getSeriesName(signerAddress);
      setUserHasProfile(getOwnSeriesName_Callback.length > 0);
      // console.log('test', getOwnSeriesName_Callback.toString());
    }
    const getSeriesName_Callback = await contract.getSeriesName(address);
    const getTitleIndex_Callback = await contract.getSeriesTitleToken(address);
    const mCreated = [];
    const mOwned = [];

    for (let i = 0; i < getCreatedArtworks_Callback.length; i++) {
      const tokenId = getCreatedArtworks_Callback[i];
      const uri = await contract.tokenURI(tokenId);
      let metadata = await fetchMetadata(uri);
      // Add custom Metadata
      metadata = { ...metadata, tokenId: tokenId, created: true, owned: false };

      if (getOwnedArtworks_Callback.includes(tokenId)) {
        // Change custom Metadata
        metadata.owned = true;
        // Add to array
        mOwned.push(metadata);
        // remove the tokenID from the created Array
        const index = getOwnedArtworks_Callback.indexOf(tokenId);
        if (index > -1) {
          getOwnedArtworks_Callback.splice(index, 1);
        }
      }

      mCreated.push(metadata);
    }

    for (let i = 0; i < getOwnedArtworks_Callback.length; i++) {
      const tokenId = getOwnedArtworks_Callback[i];
      const uri = await contract.tokenURI(tokenId);
      let metadata = await fetchMetadata(uri);
      // Add custom Metadata
      metadata = { ...metadata, tokenId: tokenId, created: false, owned: true };
      mOwned.push(metadata);
    }

    setHasProfile(getCreatedArtworks_Callback.length > 0);
    setSeriesName(getSeriesName_Callback.toString());
    setSeriesTitle(getTitleIndex_Callback);

    setMetadataCollection(mCreated);
    setMetadataCollectionOwned(mOwned);
  }

  // Contract NFT
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
    const response = await tx.wait();

    updateContractValues();
  };

  const setTitle = async (index) => {
    setIsLoading(true);

    if (seriesTitle == index) {
      setIsLoadingText('Image is already title');
    } else {
      try {
        setIsLoadingText('Updating title image');
        const contractConnected = contract.connect(signer);
        const tx = await contractConnected.setSeriesTitleIndex(index);
        const response = await tx.wait();
        setIsLoadingText('Completed!');
        updateContractValues();
      } catch (e) {
        setIsLoadingText(e.message);
      }
    }

    setTimeout(() => {
      setIsLoadingText('');
      setIsLoading(false);
    }, 2000);
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
    // console.log(`this is the url text: ${text}`);
    const metadata = JSON.parse(text);
    return metadata;
  };
  const getImageUrl = (metadata) => {
    // console.log(`this is the metadata: ${metadata}`);
    const imageUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    // console.log(`this is the imageUrl: ${imageUrl}`);
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
        contract_Market,
        // State Variables
        hasProfile,
        userHasProfile,
        ownProfile,
        seriesName,
        seriesTitle,
        metadataCollection,
        metadataCollectionOwned,
        customAddress,
        setCustomAddress,
        // Functions
        updateContractValues,
        // Contract Functions,
        createArtwork,
        setSeries,
        setTitle,
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
