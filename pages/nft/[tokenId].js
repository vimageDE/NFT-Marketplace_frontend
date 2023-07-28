import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Component_Header';
import { LoadingOverlay } from '../../components/Component_Loading';
import { NftContract } from '../../components/Contract_NFT';
import { Globals } from '../../components/GlobalVariables';
import Link from 'next/link';
import { FaRegClock, FaCoins } from 'react-icons/fa';
import { BiPurchaseTag, BiCart, BiSolidCoinStack } from 'react-icons/bi';
import { RiContractRightLine } from 'react-icons/ri';
import Modal from 'react-modal';

function TokenPage() {
  // Imported Variables
  const { setIsLoading, setIsLoadingText, getAddressShortened, getAddressLink } = useContext(Globals);
  const { nftMetadata, getNftMetadata, setNftMetadata, getImageUrl, getSeries, signerAddress } =
    useContext(NftContract);
  // state variables
  const [ownerName, setOwnerName] = useState('');
  const [makeOffer, setMakeOffer] = useState(false);
  const [inputSell, setInputSell] = useState(0.1);
  // Constants
  const router = useRouter();
  const { tokenId } = router.query;

  // Functions
  const loadToken = async () => {
    setIsLoadingText('Loading NFT');
    // setIsLoading(true);
    if (!nftMetadata || nftMetadata.tokenId !== tokenId) {
      const metadata = await getNftMetadata(tokenId);
      setNftMetadata(metadata);
      if (metadata) {
        const name = await getSeries(metadata.owner);
        setOwnerName(name);
      }
    }
    if (!ownerName && nftMetadata) {
      const name = await getSeries(nftMetadata.owner);
      setOwnerName(name);
    }
    // setIsLoading(false);
  };
  const handleInputChange = (e) => {
    // ensure only numbers and decimal points are inputted
    const re = /^[0-9]*\.?[0-9]*$/;

    if (e.target.value === '' || re.test(e.target.value)) {
      let value = e.target.value;
      // limit decimal to 3 places
      if (value.includes('.')) {
        value = value.slice(0, value.indexOf('.') + 4);
      }
      setInputSell(value);
    }
  };

  loadToken();

  // Now you can use tokenId to fetch data for the specific token

  return (
    <div className="bg-slate-100 h-screen">
      <Head>
        <title>NFT Portfolio</title>
        <meta name="description" content="template by Mark Wierzimok" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {nftMetadata ? (
        nftMetadata.owner != 0 ? (
          <div>
            <div className="flex h-full py-12 px-12 space-x-12 mx-auto max-w-[1500px] flex-col items-center md:flex-row">
              <div className="relative py-auto w-3/6 border-2 rounded-lg">
                <img
                  src={getImageUrl(nftMetadata)}
                  className="object-contain h-full w-full min-h-[100px] min-w-[100px] rounded-lg"
                />
              </div>

              <div className="w-4/6">
                <div className="flex space-x-2 mb-16">
                  <div>CREATED BY</div>
                  <Link href={`/portfolio/${nftMetadata.creator}`}>
                    <a className="text-gold">{nftMetadata.series}</a>
                  </Link>
                </div>
                <h2 className="text-slate-700 text-4xl mb-2">
                  {nftMetadata.name} #{nftMetadata.tokenId}
                </h2>
                <div className="flex space-x-2">
                  <div>OWNED BY</div>
                  <Link href={`/portfolio/${nftMetadata.owner}`}>
                    <a className="text-gold">{ownerName}</a>
                  </Link>
                </div>

                <div className="  min-w-[250px] mt-8 border-2 rounded-xl bg-slate-50">
                  <div className="flex border-b-2 pl-8 py-2 space-x-2">
                    <FaRegClock className="my-auto" />
                    <div>SALE IS ACTIVE</div>
                  </div>
                  <div className="px-8 py-3">
                    <div className="grid grid-cols-2 text-center">
                      <div>
                        <div className="text-xs">Current Price</div>
                        <div className="text-xl font-bold text-slate-600">
                          {nftMetadata.sale.price !== 0 ? nftMetadata.sale.price : '-'} ETH
                        </div>
                      </div>
                      <div>
                        <div className="text-xs">Highest Offer</div>
                        <div className="text-xl font-bold text-slate-400">
                          {nftMetadata.highestOffer.price != 0 ? nftMetadata.highestOffer.price : '-'} ETH
                        </div>
                      </div>
                    </div>
                    {nftMetadata.owner != signerAddress ? (
                      <div className="flex space-x-4 pt-4">
                        <button className="w-full flex justify-center">
                          <BiCart className="my-auto mr-1" />
                          Buy Now
                        </button>
                        <button className="w-full bg-slate-400 flex justify-center" onClick={() => setMakeOffer(true)}>
                          <BiPurchaseTag className="my-auto mr-1" />
                          Make Offer
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-4 pt-4">
                        <button className="w-full flex justify-center hover:bg-slate-400">
                          <BiCart className="my-auto mr-1" />
                          Update Price
                        </button>
                        {nftMetadata.highestOffer.price === 0 ? (
                          <button className="w-full bg-slate-300 hover:bg-slate-300 flex justify-center">
                            <BiPurchaseTag className="my-auto mr-1" />
                            No Offer
                          </button>
                        ) : (
                          <button className="w-full bg-gold hover:bg-slate-400 flex justify-center">
                            <BiPurchaseTag className="my-auto mr-1" />
                            Accept Offer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Modal
                isOpen={makeOffer}
                onRequestClose={() => {
                  setMakeOffer(false);
                }}
                contentLabel="Create Profile"
                className="m-auto bg-slate-700 w-1/2 rounded-xl shadow max-h-[800px] max-w-[600px]"
                overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex"
              >
                <div className="flex space-x-4">
                  <div className="relative py-auto w-3/6 border-2 rounded-lg">
                    <img src={getImageUrl(nftMetadata)} className="object-cover h-full" />
                  </div>
                  <div className="text-center text-white p-4 py-16 flex flex-col space-y-2">
                    <div className="uppercase text-xs">Create offer for:</div>
                    <h2 className="text-6xl">
                      {nftMetadata.name} #{nftMetadata.tokenId}
                    </h2>
                    <div className="border-2 w-fit mx-auto p-4 rounded-xl">
                      <div className="text-xs">current max offer:</div>
                      <div className="text-xl font-bold">
                        {nftMetadata.highestOffer.price !== 0 ? nftMetadata.highestOffer.price + ' ETH' : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs">your offer</div>
                      <button
                        className="font-black bg-opacity-0 hover:bg-opacity-0 hover:text-gold"
                        onClick={() => setInputSell((prev) => (prev > 0 ? parseFloat((prev - 0.1).toFixed(3)) : 0))}
                      >
                        -
                      </button>
                      <input
                        id="inputSell"
                        className="rounded-full w-32 h-8 text-black px-4 text-center"
                        type="text"
                        value={inputSell}
                        onChange={handleInputChange}
                      ></input>
                      <button
                        className="font-black bg-opacity-0 hover:bg-opacity-0 hover:text-gold"
                        onClick={() => setInputSell((prev) => parseFloat((prev + 0.1).toFixed(3)))}
                      >
                        +
                      </button>
                    </div>
                    <div>
                      <button className="bg-gold hover:bg-slate-400">Make Offer</button>
                    </div>
                  </div>
                </div>
              </Modal>
            </div>
            <div className="px-12 mx-auto max-w-[1500px] grid grid-cols-1 md:grid-cols-2 space-x-4 justify-items-center">
              <div className="border-2 rounded-lg p-4 w-full bg-slate-50">
                <div className="font-bold flex items-center mb-1">
                  <FaCoins className="my-auto mr-2" />
                  Sales History
                </div>
                <div className="grid grid-cols-3 uppercase text-xs">
                  <div>Amount</div>
                  <div>From</div>
                  <div>Timestamp</div>
                </div>
                <div className="space-y-2">
                  {nftMetadata.offers.map((offer, index) => (
                    <div key={index} className="grid grid-cols-3">
                      <div className="flex items-center">
                        <BiSolidCoinStack className="my-auto mr-2" /> {offer.price} ETH
                      </div>
                      <div>{getAddressLink(offer.address, getAddressShortened(offer.address))}</div>
                      <div>Zeitpunkt</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-3">
                    <div className="flex items-center">
                      <BiPurchaseTag className="my-auto mr-2" />
                      CREATED
                    </div>
                    <div>{getAddressLink(nftMetadata.creator, getAddressShortened(nftMetadata.creator))}</div>
                    <div>Zeitpunkt</div>
                  </div>
                </div>
              </div>
              <div className="border-2 rounded-lg p-4 w-full bg-slate-50">
                <div className="font-bold flex items-center mb-1">
                  <BiPurchaseTag className="my-auto mr-2" />
                  All Offers
                </div>
                <div className="grid grid-cols-3 uppercase text-xs">
                  <div>Amount</div>
                  <div>From</div>
                  <div>Expiration</div>
                </div>
                <div className="space-y-2">
                  {nftMetadata.offers.length > 0 ? (
                    <div>
                      {nftMetadata.offers.map((offer, index) => (
                        <div key={index} className="grid grid-cols-3">
                          <div className="flex items-center">
                            <RiContractRightLine className="my-auto mr-2" /> {offer.price} ETH
                          </div>
                          <div>{getAddressLink(offer.address, getAddressShortened(offer.address))}</div>
                          <div>Ablaufdatum</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3">
                      <div>-</div>
                      <div>-</div>
                      <div>-</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <h2 className="text-center mt-32 text-slate-700 text-4xl">No Token with ID '{tokenId}' available</h2>
        )
      ) : (
        <></> //<h2 className="text-center mt-32 text-slate-700 text-4xl"> Loading NFT with ID: '{tokenId}'</h2>
      )}
      <LoadingOverlay />
    </div>
  );
}

export default TokenPage;
