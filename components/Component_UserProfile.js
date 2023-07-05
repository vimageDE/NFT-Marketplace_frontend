import { ConnectButton } from 'web3uikit';
import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
// Get Icons
import { ImCross } from 'react-icons/Im';
// Inherit from parent Component
import { NftContract } from './Contract_NFT';

const img_profileHeader = '/profile-hero_PLACEHOLDER.png';

export default function UserProfile() {
  const { signerAddress } = useContext(NftContract);

  return (
    <div>
      <div>
        <div
          className="flex items-center justify-center bg-cover my-auto w-full h-96 bg-center"
          style={{ backgroundImage: `url(${img_profileHeader})` }}
        >
          <h2 className="font-blog text-artistName font-black text-center">Mark Wierzimok</h2>
        </div>
        Hero
      </div>
      <div>{signerAddress}</div>
    </div>
  );
}
