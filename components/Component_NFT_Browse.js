import React, { useState, useEffect, useContext } from 'react';
import { NftContract } from './Contract_NFT';
import { MarketContract } from './Contract_Market';
import { FirebaseBackend } from './Backend_Firebase';
import Modal from 'react-modal';
import { useRouter } from 'next/router';

export const NftBrowse = ({ index, metadata }) => {
  const {
    chainId,
    contract,
    signer,
    signerAddress,
    getImageUrl,
    ownProfile,
    setTitle,
    customAddress,
    getNonce,
    setNftMetadata,
  } = useContext(NftContract);
  const { setOffer, setSale } = useContext(MarketContract);
  const { getSaleData, getOfferData } = useContext(FirebaseBackend);

  const [lightbox, setLightbox] = useState(false);
  const [inputSellPrice, setInputSellPrice] = useState('');
  const [hover, setHover] = useState(false);
  // let owner = ownProfile && ownedSection ? signerAddress : customAddress;
  const router = useRouter();

  // Funcitons
  const changeLightbox = (open) => {
    if (open) {
      router.push(`/nft/${metadata.tokenId}`);
      // setNftMetadata(metadata);
    }

    // setLightbox(open);
    setHover(false);
  };

  // HTML variables
  let lightboxBelow = [];
  if (metadata.owner == signerAddress) {
    // User is Owner!
    lightboxBelow.push(
      <div className="flex items-center space-x-4">
        <button onClick={() => getSaleData(metadata)} className="bg-white text-slate-700">
          Get Data
        </button>
        <input
          type="text"
          pattern="^\d+(\.\d{0,4})?$"
          value={inputSellPrice}
          placeholder="Set Price in WETH"
          onChange={(e) => setInputSellPrice(e.target.value.toString())}
        ></input>
        <button onClick={() => setSale(metadata, inputSellPrice)} className="bg-white text-slate-700">
          Sell
        </button>
      </div>
    );
  } else {
    // User is NOT Owner!
    lightboxBelow.push(
      <div className="flex items-center space-x-4">
        <button onClick={() => getOfferData(metadata)} className="bg-white text-slate-700">
          Get Data
        </button>
        <input
          type="text"
          pattern="^\d+(\.\d{0,4})?$"
          value={inputSellPrice}
          placeholder="WETH"
          onChange={(e) => setInputSellPrice(e.target.value.toString())}
          className="w-32 text-center pl-0"
        ></input>
        <button onClick={() => setOffer(metadata, inputSellPrice)} className="bg-white text-slate-700">
          Make Offer
        </button>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden relative rounded-lg w-48 flex flex-col justify-center bg-slate-100 shadow-lg cursor-pointer"
      onClick={() => changeLightbox(true)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="bg-cover h-32 w-48 bg-center rounded-t-lg transition-transform duration-500"
        style={{
          backgroundImage: `url(${getImageUrl(metadata)})`,
          // transform: hover ? 'scale(1.1)' : 'scale(1.0)',
        }}
      ></div>
      <div className={`absolute h-full w-full bg-opacity-20 bg-white ${hover ? 'bg-white' : 'bg-slate-600'}`}></div>
      <div className="rounded-none w-full flex-row items-center space-x-2 absolute text-white bg-slate-700">
        <h2 className="">Sold for:</h2>
        <h2 className="-mt-2 text-3xl">
          {metadata.transactions.length > 0 ? metadata.transactions[0].price : '-'} ETH
        </h2>
      </div>

      {/*<div
        className="absolute w-full bottom-0 transform translate-y-full transition-transform duration-150"
        style={{
          transform: hover ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {metadata.owned ? (
          metadata.sale.price == 0 ? (
            <button className="rounded-none w-full" onClick={() => changeLightbox(true)}>
              Set Price
            </button>
          ) : (
            <button className="rounded-none w-full" onClick={() => changeLightbox(true)}>
              Update Price
            </button>
          )
        ) : metadata.sale.price == 0 ? (
          <button className="rounded-none w-full" onClick={() => changeLightbox(true)}>
            Make Offer
          </button>
        ) : (
          <button className="rounded-none w-full" onClick={() => changeLightbox(true)}>
            Buy: {metadata.sale.price} eth
          </button>
        )}
        </div> */}
    </div>
  );
};
