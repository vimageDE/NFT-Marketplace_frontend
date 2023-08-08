import { FirebaseBackend } from './Backend_Firebase';
import { Globals } from './GlobalVariables';
import { NftContract } from './Contract_NFT';
import { MarketContract } from './Contract_Market';

import React, { useState, useContext, useEffect } from 'react';

export default function Browse() {
  const { getBrowseData } = useContext(FirebaseBackend);
  const [browse, setBrowse] = useState(null);

  useEffect(() => {
    setBrowseData();
  }, []);

  const setBrowseData = async () => {
    const b = await getBrowseData();
    setBrowse(b);
  };

  return (
    <div className="bg-black">
      <div className="text-center mt-16">
        <h2 className="text-6xl">Browse</h2>
      </div>
    </div>
  );
}
