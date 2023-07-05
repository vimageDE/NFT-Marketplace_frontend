import { ConnectButton } from 'web3uikit';

export default function Header() {
  return (
    <div className="grid grid-cols-3 items-center p-5 border-b-2 border-white border-opacity-0 bg-slate-700 bg-opacity-100">
      <div>
        <h1 className="font-blog text-4xl font-black">NFT Market</h1>
      </div>
      <div className="mx-auto w-3/4">
        <input className="w-full rounded-xl h-8 pl-8" placeholder="search wallet address..."></input>
      </div>
      <div className="ml-auto">
        <ConnectButton moralisAuth={false} />
      </div>
    </div>
  );
}
