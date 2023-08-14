import React, { useState, useEffect, useContext } from 'react';
import { NftContract } from './Contract_NFT';
import { MarketContract } from './Contract_Market';
import { FirebaseBackend } from './Backend_Firebase';
import Modal from 'react-modal';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { LoadingSymbol } from './Component_LoadingSymbol';

export const NFT = ({ index, metadata, ownedSection }) => {
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
  const [loading, setLoading] = useState(false);
  const [inputSellPrice, setInputSellPrice] = useState('');
  const [hover, setHover] = useState(false);
  const router = useRouter();

  // Funcitons
  const changeLightbox = (open) => {
    if (open) {
      setLoading(true);
      router.push(`/nft/${metadata.tokenId}`);
      // setNftMetadata(metadata);
    }

    // setLightbox(open);
    setHover(false);
  };

  // HTML variables
  let buttonsBelow = <></>;
  let lightboxBelow = [];
  if (ownedSection && ownProfile) {
    buttonsBelow = (
      <div className="pb-2 flex flex-col space-y-2 px-2">
        {metadata.sale.price == 0 ? (
          <button className="" onClick={() => changeLightbox(true)}>
            Set Price
          </button>
        ) : (
          <button className="" onClick={() => changeLightbox(true)}>
            Your Price: {metadata.sale.price} eth
          </button>
        )}
        {metadata.offers ? (
          <button className="" onClick={() => changeLightbox(true)}>
            Max offer: {metadata.highestOffer ? metadata.highestOffer.price : '-'} eth
          </button>
        ) : (
          <button className="" onClick={() => changeLightbox(true)}>
            No offers
          </button>
        )}
      </div>
    );
  } else if (ownProfile) {
    buttonsBelow = (
      <button className="" onClick={() => setTitle(index)}>
        Set Title Image
      </button>
    );
  } else {
    buttonsBelow = <button onClick={() => changeLightbox(true)}>Buy</button>;
  }

  /* if (metadata.created) {
    lightboxBelow.push(
      <button className="bg-white text-slate-700" onClick={() => setTitle(index)}>
        Set Title Image
      </button>
    );
  } */
  if (metadata.owned) {
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
    <div>
      {ownedSection ? (
        <div
          className="overflow-hidden relative mb-8 rounded-lg w-72 flex flex-col justify-center bg-slate-100 shadow-lg cursor-pointer"
          onClick={() => changeLightbox(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div
            className="bg-cover h-72 w-72 bg-center rounded-t-lg transition-transform duration-500"
            style={{
              backgroundImage: `url(${getImageUrl(metadata)})`,
              transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {loading ? (
              <div className="h-full w-full bg-black bg-opacity-40 flex items-center justify-center">
                <LoadingSymbol color={'white'} className={''} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="bg-white space-y-1 px-4 text-sm relative py-4 border-[1px] border-slate-300 rounded-b-lg">
            <div>{metadata.name}</div>
            <div className="font-bold">{metadata.sale.price + ' ETH'}</div>
            <div>Best offer: {metadata.highestOffer ? metadata.highestOffer.price : '-'} ETH</div>
            <div className="absolute px-2 rounded text-center bottom-4 right-4 bg-slate-200 border-[1px] border-slate-400">
              {'#' + metadata.tokenId}
            </div>
          </div>
          <div
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
          </div>
        </div>
      ) : (
        <div
          className="overflow-hidden mb-8 relative rounded-lg w-72 flex flex-col justify-center bg-slate-100 shadow-lg cursor-pointer"
          onClick={() => changeLightbox(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div
            className="bg-cover h-72 w-72 bg-center rounded-t-lg transition-transform duration-500"
            style={{
              backgroundImage: `url(${getImageUrl(metadata)})`,
              transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <div
              className="absolute w-full bottom-0 transform translate-y-full transition-transform duration-150"
              style={{
                transform: hover ? 'translateY(0)' : 'translateY(100%)',
              }}
            >
              <button
                className="rounded-none w-full"
                onClick={(event) => {
                  event.stopPropagation(); // Prevent the event from bubbling up
                  setTitle(index);
                }}
              >
                Set profile image
              </button>
            </div>
          </div>
        </div>
      )}

      {/*buttonsBelow*/}
      <Modal
        isOpen={lightbox}
        onRequestClose={() => changeLightbox(false)}
        ariaHideApp={false}
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
