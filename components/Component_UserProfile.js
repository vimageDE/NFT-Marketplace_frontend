import { ConnectButton } from 'web3uikit';
import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
// Get Icons
import { ImCross } from 'react-icons/Im';
// Inherit from parent Component
import { NftContract } from './Contract_NFT';
import { NFT } from './Component_NFT';

export default function UserProfile() {
  const { signerAddress, seriesName, metadataCollection, getImageUrl } = useContext(NftContract);
  const [profileHeader, setProfileHeader] = useState('/profile-hero_PLACEHOLDER.png');

  useEffect(() => {
    if (metadataCollection.length > 0) {
      setProfileHeader(getImageUrl(metadataCollection[0]));
    }
  }, [metadataCollection]);
  return (
    <div>
      <div>
        <div
          className="flex items-center justify-center bg-cover my-auto w-full h-96 bg-center"
          style={{
            backgroundImage: `url(${profileHeader})`,
          }}
        >
          <h2 className="font-blog text-artistName font-black text-center">{seriesName}</h2>
        </div>
      </div>
      <div className="text-center pt-8">{`NFT's of:`}</div>
      <div className="text-center pb-8 font-black">{signerAddress}</div>
      <div className="flex items-center justify-center">
        {metadataCollection.map((data) => (
          <NFT key={data.id} metadata={data} />
        ))}
      </div>
    </div>
  );
}
