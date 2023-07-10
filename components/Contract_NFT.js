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
  // contract state variables
  const [hasProfile, setHasProfile] = useState(false);

  // Example Variables that would be filled by a contract
  const [exampleParentVariable, setExampleParentVariable] = useState('');

  // Update UI When isWeb3 is Enabled or changes
  useEffect(() => {
    if (isWeb3Enabled) {
      updateContract();
      updateContractValues();
    }
  }, [isWeb3Enabled]);

  // Update UI
  async function updateContractValues() {
    const getArtworks_Callback = await contract.getArtworksOfOwner(signerAddress);

    setHasProfile(getArtworks_Callback.length > 0);

    return;
    // Update to variables with view functions
    const contractFunctionCallback = await contractFunction();
    const contractFunctionCallback_Alternative = await contract.contractFunction();

    setExampleParentVariable(contractFunctionCallback.toString());
  }

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

  const createArtwork = async (tokenURI) => {
    contractConnected = contract.connect(signer);
    const tx = contractConnected.createArtwork(tokenUri);
    const response = tx.wait();

    updateContractValues();
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
        exampleParentVariable,
        // Functions
        updateContractValues,
        // Contract Functions,
        contractFunction,
        contractIsLoading,
        contractIsFetching,
      }}
    >
      {children}
    </NftContract.Provider>
  );
};
