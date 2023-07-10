import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from 'web3uikit';
import '../styles/globals.css';
import { Contract_NFT } from '../components/Contract_NFT';
import { GlobalVariables } from '../components/GlobalVariables';

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <GlobalVariables>
          <Contract_NFT>
            <Component {...pageProps} />
          </Contract_NFT>
        </GlobalVariables>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
