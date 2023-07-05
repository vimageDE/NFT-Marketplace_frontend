import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from 'web3uikit';
import '../styles/globals.css';
import { Contract_NFT } from '../components/Contract_NFT';

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Contract_NFT>
          <Component {...pageProps} />
        </Contract_NFT>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
