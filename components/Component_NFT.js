import React, { useState, useEffect, useContext } from 'react';
import { NftContract } from './Contract_NFT';

export const NFT = ({ metadata }) => {
  const { getImageUrl } = useContext(NftContract);

  return (
    <div className="w-48 flex flex-col justify-center space-y-2">
      {console.log('Test2')}
      <div
        className="bg-cover h-48 w-48 bg-center rounded"
        style={{
          backgroundImage: `url(${getImageUrl(metadata)})`,
        }}
      ></div>
      <button className="">Sell</button>
    </div>
  );
};
