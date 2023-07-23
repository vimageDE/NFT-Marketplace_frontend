import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from 'web3uikit';
import '../styles/globals.css';
import { Contract_NFT } from '../components/Contract_NFT';
import { GlobalVariables } from '../components/GlobalVariables';
import { Contract_Market } from '../components/Contract_Market';
import { Backend_Firebase } from '../components/Backend_Firebase';

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <GlobalVariables>
          <Backend_Firebase>
            <Contract_NFT>
              <Contract_Market>
                <Component {...pageProps} />
              </Contract_Market>
            </Contract_NFT>
          </Backend_Firebase>
        </GlobalVariables>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
