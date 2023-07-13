import React, { useState, useEffect, useContext } from 'react';
import { NftContract } from './Contract_NFT';
import { MarketContract } from './Contract_Market';
import Modal from 'react-modal';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export const NFT = ({ index, metadata, ownedSection }) => {
  const { chainId, contract, signer, signerAddress, getImageUrl, ownProfile, setTitle, getNonce } =
    useContext(NftContract);
  const { setOffer, setSale } = useContext(MarketContract);

  const [lightbox, setLightbox] = useState(false);
  const [inputSellPrice, setInputSellPrice] = useState('');

  // HTML variables
  let buttonsBelow = <></>;
  let lightboxBelow = [];
  if (ownedSection && ownProfile) {
    buttonsBelow = (
      <button className="" onClick={() => setLightbox(true)}>
        Sell
      </button>
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
  if (metadata.owned) {
    lightboxBelow.push(
      <div className="flex items-center space-x-4">
        <input
          value={inputSellPrice}
          placeholder="Set Price in WETH"
          onChange={(e) => setInputSellPrice(e.target.value.toString())}
        ></input>
        <button onClick={() => setSale(metadata, inputSellPrice)} className="bg-white text-slate-700">
          Sell
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
