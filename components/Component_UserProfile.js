import { ConnectButton } from 'web3uikit';
import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
// Get Icons
import { ImCross } from 'react-icons/Im';
// Inherit from parent Component
import { NftContract } from './Contract_NFT';
import { NFT } from './Component_NFT';
import { Globals } from './GlobalVariables';

export default function UserProfile() {
  // Global Variables
  const {
    signerAddress,
    seriesName,
    seriesTitle,
    metadataCollection,
    metadataCollectionOwned,
    getImageUrl,
    ownProfile,
    hasProfile,
    customAddress,
  } = useContext(NftContract);
  const { setCreateNftPopup } = useContext(Globals);
  // State Variables
  const [profileHeader, setProfileHeader] = useState('/profile-hero_PLACEHOLDER.png');
  const [selectedTab, setSelectedTab] = useState('created');

  useEffect(() => {
    if (metadataCollection.length > 0) {
      setProfileHeader(getImageUrl(metadataCollection[seriesTitle]));
    }
  }, [metadataCollection, seriesTitle]);

  return (
    <div>
      {hasProfile ? (
        <div>
          {
            // HEADER
          }
          <div>
            <div
              className="relative flex items-center justify-center bg-cover my-auto w-full h-96 bg-center"
              style={{
                backgroundImage: `url(${profileHeader})`,
              }}
            >
              <h2 className="font-blog text-artistName font-black text-center">{seriesName}</h2>
              {ownProfile ? (
                <div className="absolute bottom-4 rounded-full py-2 px-4 font-black text-center text-slate-700 bg-white bg-opacity-60 uppercase">
                  This is your profile
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          {
            // TAB SELECTION
          }
          <div className="bg-slate-700">
            <div className="flex justify-center space-x-8">
              <button
                onClick={() => setSelectedTab('created')}
                className={`py-4 px-6 block hover:bg-gray-400 focus:outline-none rounded-none ${
                  selectedTab === 'created' ? 'border-b-4 border-gray-200 ' : ''
                }`}
              >
                Created
              </button>
              <button
                onClick={() => setSelectedTab('owned')}
                className={`py-4 px-6 block hover:bg-gray-400 focus:outline-none rounded-none ${
                  selectedTab === 'owned' ? 'border-b-4 border-gray-200 ' : ''
                }`}
              >
                Owned
              </button>
            </div>
          </div>
          {
            // CREATED TAB
          }
          {selectedTab === 'created' ? (
            <div className="flex flex-col items-center my-8">
              <div className="text-center text-slate-700">{`NFT portfolio created by:`}</div>
              <div className="text-center font-black text-slate-700">{signerAddress}</div>
              <div className="flex items-center justify-center space-x-8 my-8">
                {metadataCollection.map((data, index) => (
                  <NFT key={data.id} index={index} metadata={data} />
                ))}
              </div>
            </div>
          ) : (
            <></>
          )}
          {
            // OWNED TAB
          }
          {selectedTab === 'owned' ? (
            <div className="flex flex-col items-center my-8">
              <div className="text-center text-slate-700">{`NFT currently owned by:`}</div>
              <div className="text-center font-black text-slate-700">{signerAddress}</div>
              <div className="flex items-center justify-center space-x-8 my-8">
                {metadataCollectionOwned.map((data, index) => (
                  <NFT key={data.id} index={index} metadata={data} ownedSection={true} />
                ))}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div className="text-center my-16">
          <h2 className="text-3xl text-slate-700">Sorry!</h2>
          <div>We have not found a user with the wallet address:</div>
          <div className="font-black">{customAddress}</div>
        </div>
      )}
    </div>
  );
}
