import Head from 'next/head';
import Header from '../components/Component_Header';
import { NftContract } from '../components/Contract_NFT';
import CreateProfile from '../components/Component_CreateProfile';
import React, { useState, useContext, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { LoadingOverlay } from '../components/Component_Loading';
import { CreateNft } from '../components/Component_CreateNft';

const supportedChains = ['31337', '11155111'];

export default function Create() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const { hasProfile, userHasProfile, ownProfile, setCustomAddress } = useContext(NftContract);

  useEffect(() => {
    setCustomAddress('');
  });

  return (
    <div
      className="bg-cover min-h-screen bg-gray-200 bg-opacity-100 bg-fixed"
      // style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Head>
        <title>NFT Portfolio</title>
        <meta name="description" content="template by Mark Wierzimok" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {isWeb3Enabled ? (
        <div>
          {supportedChains.includes(parseInt(chainId).toString()) ? (
            <>
              <div className="">{!userHasProfile ? <CreateProfile /> : <div>Profile already created</div>}</div>
              <CreateNft className="" />
            </>
          ) : (
            <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
          )}
        </div>
      ) : (
        <div>Please connect to a Wallet</div>
      )}
      <LoadingOverlay />
    </div>
  );
}
