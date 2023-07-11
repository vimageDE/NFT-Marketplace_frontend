import Head from 'next/head';
import Header from '../components/Component_Header';
import UserProfile from '../components/Component_UserProfile';
import CreateProfile from '../components/Component_CreateProfile';
import { useMoralis } from 'react-moralis';
import { LoadingOverlay } from '../components/Component_Loading';
import { Globals } from '../components/GlobalVariables';
import { NftContract } from '../components/Contract_NFT';
import { useContext } from 'react';
import { CreateNft } from '../components/Component_CreateNft';

const supportedChains = ['31337', '11155111'];
const bgImage = '/background-image.jpg';

export default function Home() {
  const { isLoading, isLoadingText } = useContext(Globals);
  const { hasProfile, userHasProfile, ownProfile } = useContext(NftContract);
  const { isWeb3Enabled, chainId } = useMoralis();

  return (
    <div
      className="bg-cover min-h-screen bg-gray-200 bg-opacity-100 bg-fixed"
      // style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Head>
        <title>NFT Portfolio</title>
        <meta name="description" content="template by Mark Wierzimok" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {isWeb3Enabled ? (
        <div>
          {supportedChains.includes(parseInt(chainId).toString()) ? (
            <>
              <div className="">{ownProfile && !userHasProfile ? <CreateProfile /> : <UserProfile />}</div>
              <CreateNft className="" />
            </>
          ) : (
            <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
          )}
        </div>
      ) : (
        <div>Please connect to a Wallet</div>
      )}
      <LoadingOverlay />
    </div>
  );
}
