import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from 'web3uikit';
import '../styles/globals.css';
import { ExampleForContract } from '../components/Contracts';

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <ExampleForContract>
          <Component {...pageProps} />
        </ExampleForContract>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
