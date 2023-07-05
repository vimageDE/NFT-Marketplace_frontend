import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import ExampleComponent from '../components/Example_Component_Basic';
import { useMoralis } from 'react-moralis';

const supportedChains = ['31337', '11155111'];
const bgImage = '/bg-hero1.jpg';

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();

  return (
    <div
      className="bg-cover min-h-screen bg-black bg-opacity-10 bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Head>
        <title>Example project</title>
        <meta name="description" content="template by Mark Wierzimok" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {isWeb3Enabled ? (
        <div>
          {supportedChains.includes(parseInt(chainId).toString()) ? (
            <div className="">
              <ExampleComponent className="" />
            </div>
          ) : (
            <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
          )}
        </div>
      ) : (
        <div>Please connect to a Wallet</div>
      )}
    </div>
  );
}
