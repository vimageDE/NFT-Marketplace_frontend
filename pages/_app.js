import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from 'web3uikit';
import '../styles/globals.css';
import { Contract_NFT } from '../components/Contract_NFT';
import { GlobalVariables } from '../components/GlobalVariables';
import { Contract_Market } from '../components/Contract_Market';

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <GlobalVariables>
          <Contract_NFT>
            <Contract_Market>
              <Component {...pageProps} />
            </Contract_Market>
          </Contract_NFT>
        </GlobalVariables>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
