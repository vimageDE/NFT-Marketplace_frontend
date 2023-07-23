import React, { useState, useEffect, useContext } from 'react';
import { NftContract } from './Contract_NFT';
import { MarketContract } from './Contract_Market';
import { FirebaseBackend } from './Backend_Firebase';
import Modal from 'react-modal';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export const NFT = ({ index, metadata, ownedSection }) => {
  const { chainId, contract, signer, signerAddress, getImageUrl, ownProfile, setTitle, customAddress, getNonce } =
    useContext(NftContract);
  const { setOffer, setSale } = useContext(MarketContract);
  const { getSaleData, getOfferData } = useContext(FirebaseBackend);

  const [lightbox, setLightbox] = useState(false);
  const [inputSellPrice, setInputSellPrice] = useState('');
  // let owner = ownProfile && ownedSection ? signerAddress : customAddress;

  // HTML variables
  let infoBelow = (
    <>
      <div className="text-center">Price: {metadata.sale.price}</div>
      <div className="text-center">Max offer: {metadata.highestOffer.price}</div>
    </>
  );

  let buttonsBelow = <></>;
  let lightboxBelow = [];
  if (ownedSection && ownProfile) {
    buttonsBelow = (
      <>
        <button className="" onClick={() => setLightbox(true)}>
          Sell
        </button>
      </>
    );
  } else if (ownProfile) {
    buttonsBelow = (
      <button className="" onClick={() => setTitle(index)}>
        Set Title Image
      </button>
    );
  } else {
    buttonsBelow = <button onClick={() => setLightbox(true)}>Buy</button>;
  }

  if (metadata.created) {
    lightboxBelow.push(
      <button className="bg-white text-slate-700" onClick={() => setTitle(index)}>
        Set Title Image
      </button>
    );
  }
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
    <div className="w-48 flex flex-col justify-center space-y-2">
      <div
        className="bg-cover h-48 w-48 bg-center rounded"
        style={{
          backgroundImage: `url(${getImageUrl(metadata)})`,
        }}
      ></div>
      {buttonsBelow}
      {infoBelow}
      <Modal
        isOpen={lightbox}
        onRequestClose={() => setLightbox(false)}
        contentLabel="NFT Lightbox"
        className="m-auto bg-slate-700 w-1/2 rounded-xl shadow max-h-[800px] max-w-[500px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex"
      >
        <div className="">
          <div
            className="bg-contain bg-no-repeat h-96 bg-center rounded"
            style={{
              backgroundImage: `url(${getImageUrl(metadata)})`,
            }}
          />
          <div className="flex justify-center mb-8">{lightboxBelow}</div>
        </div>
      </Modal>
    </div>
  );
};
