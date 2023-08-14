import React, { useRef, useState, useEffect, useContext } from 'react';
import { FirebaseBackend } from './Backend_Firebase';
import { Globals } from './GlobalVariables';
import { NftContract } from './Contract_NFT';
import { MarketContract } from './Contract_Market';
import { NFT } from './Component_NFT';
import { NftBrowse } from './Component_NFT_Browse';

export default function Browse() {
  const { getBrowseData } = useContext(FirebaseBackend);
  const { getNftMetadataGroup, contract } = useContext(NftContract);
  const [browse, setBrowse] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [profileHeader, setProfileHeader] = useState('/createProfile-hero_PLACEHOLDER.jpg');

  useEffect(() => {
    setBrowseData();
  }, [contract]);

  const setBrowseData = async () => {
    if (!contract) {
      return;
    }
    const b = await getBrowseData();
    if (b.all.length == 0) return;
    const allMetadata = await getNftMetadataGroup(b.all);
    const lastSaleMetadata = await getNftMetadataGroup(b.lastSales);
    const highestSaleMetadata = await getNftMetadataGroup(b.highestSales);
    const combined = { all: allMetadata, last: lastSaleMetadata, highest: highestSaleMetadata };
    setBrowse(combined);

    if (b.lastSales.length > 0) {
      const completeTransactions = [];
      while (completeTransactions.length < 20) {
        completeTransactions.push(...lastSaleMetadata);
      }
      setRecentTransactions(completeTransactions);
    }
  };

  // Seemless animation
  const containerRef = useRef(null);
  const [translateValue, setTranslateValue] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setTranslateValue(-width); // Set the translate value based on the width of the content
    }
  }, [containerRef]);

  return (
    <div className="">
      <div
        className="relative flex items-center justify-center bg-cover my-auto w-full h-64 bg-center"
        style={{
          backgroundImage: `url(${profileHeader})`,
        }}
      >
        <h2 className="font-blog text-9xl font-black text-center">Browse</h2>
      </div>
      {browse && browse.all.length > 0 && browse.last ? (
        <div className="">
          <div>
            <div className=" w-full text-center overflow-hidden py-4">
              <div
                className="flex flex-wrap items-center justify-center space-x-8 "
                style={{
                  animation: `scrollRightToLeft 70s infinite linear`,
                  transform: `translateX(${translateValue}px)`,
                }}
                ref={containerRef}
              >
                <div className="flex flex-nowrap space-x-12">
                  {recentTransactions.map((data, index) => (
                    <NftBrowse key={`${data.id}-${index}`} index={index} metadata={data} type={'l'} />
                  ))}
                  {/* Duplicate */}
                  {recentTransactions.map((data, index) => (
                    <NftBrowse key={`duplicate-${data.id}-${index}`} index={index} metadata={data} type={'l'} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-8"></div>
      )}
      {browse && browse.all.length > 0 ? (
        <div className="">
          <div>
            <div>
              {/*              <div>Highest Transactions:</div>
              <div className="flex flex-wrap items-center justify-center space-x-8 px-20 my-8">
                {browse.all.map((data, index) => (
                  <NftBrowse key={data.id} index={index} metadata={data} type={'h'} />
                ))}
              </div> */}
            </div>
            <div className="mt-2">
              <h2 className="text-xl text-black text-center">Latest Creations:</h2>
              <div className="flex flex-wrap items-center justify-center space-x-8 px-20 my-2">
                {browse.all.map((data, index) => (
                  <NFT key={data.id} index={index} metadata={data} ownedSection={true} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading Data</div>
      )}
    </div>
  );
}
