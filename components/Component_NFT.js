import React, { useState, useEffect, useContext } from 'react';
import { NftContract } from './Contract_NFT';

export const NFT = ({ metadata, ownedSection }) => {
  const { getImageUrl, ownProfile } = useContext(NftContract);

  return (
    <div className="w-48 flex flex-col justify-center space-y-2">
      <div
        className="bg-cover h-48 w-48 bg-center rounded"
        style={{
          backgroundImage: `url(${getImageUrl(metadata)})`,
        }}
      ></div>
      {ownedSection && ownProfile ? <button className="">Sell</button> : <></>}
    </div>
  );
};
