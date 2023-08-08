// Example for a parent component
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import {
  contractAddresses,
  abi,
  contractAddresses_Market,
  abi_market,
  contractAddresses_Weth,
  abi_Weth,
} from '../constants';
import { Globals } from './GlobalVariables';
import { FirebaseBackend } from './Backend_Firebase';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export const NftContract = createContext();

export const Contract_NFT = ({ children }) => {
  // get Global Variables
  const { setIsLoading, setIsLoadingText } = useContext(Globals);
  // get Firebase Variables
  const { getSaleData, getOfferData, getTransactionData, getInfoData, subscribeToToken, creationEvent } =
    useContext(FirebaseBackend);
  // contract interaction Variables
  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const [provider, setProvider] = useState('');
  const [signer, setSigner] = useState('');
  const contractAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const contractAddress_Market = chainId in contractAddresses_Market ? contractAddresses_Market[chainId][0] : null;
  const contractAddress_Weth = chainId in contractAddresses_Weth ? contractAddresses_Weth[chainId][0] : null;
  const contractAbi_Weth = chainId in abi_Weth ? abi_Weth[chainId][0] : null;
  const [contract, setContract] = useState('');
  const [contract_Market, setContract_Market] = useState('');
  const [contract_Weth, setContract_Weth] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [nftMetadata, setNftMetadata] = useState(null);
  const [nftMetadataAll, setNftMetadataAll] = useState([]);
  const [nftTokenPrevious, setNftTokenPrevious] = useState(null);
  // contract state variables
  const [hasProfile, setHasProfile] = useState(false);
  const [userHasProfile, setUserHasProfile] = useState(false);
  const [ownProfile, setOwnProfile] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [seriesTitle, setSeriesTitle] = useState(0);
  const [metadataCollection, setMetadataCollection] = useState([]);
  const [metadataCollectionOwned, setMetadataCollectionOwned] = useState([]);

  const router = useRouter();
  const { pathname } = router;

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
  // Subscribe to a token ID
  useEffect(() => {
    if (nftMetadata) {
      if (nftMetadata.tokenId !== nftTokenPrevious) {
        setNftTokenPrevious(nftMetadata.tokenId);

        // Subscribe
        subscribeToToken(nftMetadata, setNftMetadata);
        console.log('EVENT - Subscribed to Token: ', nftMetadata.tokenId);
      }
    } else {
      setNftTokenPrevious(null);
      // Unsubscribe
    }
  }, [nftMetadata]);
  // Check if it is the own profile
  useEffect(() => {
    const isOwnProfile = customAddress == signerAddress && window.location.pathname.includes('portfolio/'); // || !customAddress;
    setOwnProfile(isOwnProfile);
  }, [pathname]);
  // Set Contract
  async function updateContract() {
    const p = new ethers.providers.Web3Provider(window.ethereum);
    const s = p.getSigner();
    const sa = await s.getAddress();
    console.log(`chainId: ${chainId} - contract address: ${contractAddress}`);
    const c = new ethers.Contract(contractAddress, abi, s);
    const c_market = new ethers.Contract(contractAddress_Market, abi_market, s);
    const c_weth = new ethers.Contract(contractAddress_Weth, contractAbi_Weth, s);
    setProvider(p);
    setSigner(s);
    setSignerAddress(sa);
    setContract(c);
    setContract_Market(c_market);
    setContract_Weth(c_weth);
  }

  // Update UI
  async function updateContractValues() {
    if (!contract || !signerAddress) return;

    // const isOwnProfile = customAddress == signerAddress && window.location.pathname.includes('portfolio/'); // || !customAddress;
    // console.log('Is own profile? ', isOwnProfile);
    // setOwnProfile(isOwnProfile);
    const address = customAddress ? customAddress : signerAddress;

    if (!ethers.utils.isAddress(address)) {
      setHasProfile(false);
      return;
    }

    const getOwnedArtworks_Callback = await contract.getArtworksOfOwner(address);
    const getCreatedArtworks_Callback = await contract.getCreatedArtworks(address);
    if (!userHasProfile) {
      const getOwnSeriesName_Callback = await getSeries(signerAddress);
      setUserHasProfile(getOwnSeriesName_Callback.length > 0);
      // console.log('test', getOwnSeriesName_Callback.toString());
    }
    const getSeriesName_Callback = await getSeries(address);
    const getTitleIndex_Callback = await contract.getSeriesTitleToken(address);
    const mCreated = [];
    const mOwned = [];

    for (let i = 0; i < getCreatedArtworks_Callback.length; i++) {
      const tokenId = getCreatedArtworks_Callback[i];
      const uri = await contract.tokenURI(tokenId);
      let metadata = await fetchMetadata(uri);
      // Add custom Metadata
      metadata = {
        ...metadata,
        tokenId: tokenId,
        created: true,
        owned: false,
        owner: '',
        sale: { price: 0 },
        offers: null,
        highestOffer: { price: 0 },
      };

      if (getOwnedArtworks_Callback.includes(tokenId)) {
        // Change custom Metadata
        metadata.owned = true;
        metadata.owner = address;
        // Get Firebase data
        console.log('Should search for: ', tokenId, '-', address);
        const sale = await getSaleData(metadata);
        const offers = await getOfferData(metadata);
        if (sale) metadata.sale = sale;
        if (offers.length > 0) {
          metadata.offers = offers;
          metadata.highestOffer = offers[0];
        }
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
      // Set custom data
      metadata = {
        ...metadata,
        tokenId: tokenId,
        created: false,
        owned: true,
        owner: address,
      };
      // Get Firebase data
      const sale = await getSaleData(metadata);
      const offers = await getOfferData(metadata);
      // Add custom Metadata
      metadata = {
        ...metadata,
        sale: sale ? sale : { price: 0 },
        offers: offers ? offers : null,
        highestOffer: offers ? offers[0] : { price: 0 },
      };
      mOwned.push(metadata);
    }

    setHasProfile(
      getCreatedArtworks_Callback.length > 0 || getOwnedArtworks_Callback.length > 0 || getSeriesName_Callback
    );
    setSeriesName(getSeriesName_Callback.toString());
    setSeriesTitle(getTitleIndex_Callback);

    setMetadataCollection(mCreated);
    setMetadataCollectionOwned(mOwned);
  }

  async function getNftMetadata(tokenId) {
    if (!contract) {
      return;
    }
    const uri = await contract.tokenURI(tokenId);
    if (!uri) {
      return { owner: 0 };
    }
    const creator = await contract.getCreator(tokenId);
    const owner = await contract.getOwner(tokenId);
    const seriesName = (await getSeries(creator)).toString();
    let metadata = await fetchMetadata(uri);
    // Set custom data
    metadata = {
      ...metadata,
      tokenId: tokenId,
      owner: owner,
      owned: owner == signerAddress,
      creator: creator,
      created: creator == signerAddress,
      series: seriesName,
    };
    // Get Firebase data
    const sale = await getSaleData(metadata);
    const offers = await getOfferData(metadata);
    const transactions = await getTransactionData(metadata);
    const info = await getInfoData(metadata);
    // Add custom Metadata
    metadata = {
      ...metadata,
      sale: sale ? sale : { price: 0 },
      offers: offers ? offers : null,
      highestOffer: offers ? offers[0] : { price: 0 },
      transactions: transactions ? transactions : null,
      info: info,
    };
    return metadata;
  }

  async function getNftMetadataGroup(tokenIds) {
    const dataPromises = tokenIds.map(async (tokenId) => {
      if (nftMetadataAll[tokenId]) {
        return nftMetadataAll[tokenId];
      } else {
        const metadata = await getNftMetadata(tokenId);
        let allData = nftMetadataAll;
        allData[tokenId] = metadata;
        setNftMetadataAll(allData);
        return metadata;
      }
    });

    const data = await Promise.all(dataPromises);
    return data;
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
    try {
      const contractConnected = contract.connect(signer);
      const tx = await contractConnected.setSeriesName(name);
      const response = await tx.wait();

      updateContractValues();
    } catch (e) {
      throw new Error('Setting series name failed');
    }
  };

  const getSeries = async (address) => {
    if (!contract) return;
    const name = await contract.getSeriesName(address);
    return name;
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
      await creationEvent(tokenId, tokenURI, chainId);
      console.log(`Artwork with ID ${tokenId} was created by ${address}.`);
    } else {
      console.error('ArtworkCreated event not found in the transaction receipt.');
    }
    updateContractValues();
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
        contract_Weth,
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
        nftMetadata,
        setNftMetadata,
        // Functions
        updateContractValues,
        getNftMetadata,
        // Contract Functions,
        createArtwork,
        setSeries,
        getSeries,
        setTitle,
        contractFunction,
        contractIsLoading,
        contractIsFetching,
        // IPFS
        fetchMetadata,
        getImageUrl,
        getNftMetadataGroup,
      }}
    >
      {children}
    </NftContract.Provider>
  );
};
