import { useContext, useState } from 'react';
import { ConnectButton } from 'web3uikit';
import { NftContract } from './Contract_NFT';
import { Globals } from './GlobalVariables';

export default function Header() {
  const { hasProfile, userHasProfile, setCustomAddress, ownProfile } = useContext(NftContract);
  const { setCreateNftPopup } = useContext(Globals);
  const [searchInput, setSearchInput] = useState('');

  let profileButton = <div></div>;
  if (userHasProfile && !ownProfile) {
    profileButton = (
      <button className="text-slate-700 rounded-3xl bg-white" onClick={() => setCustomAddress('')}>
        Your Profile
      </button>
    );
  } else if (!userHasProfile && !ownProfile) {
    profileButton = (
      <button className="text-slate-700 rounded-3xl bg-white" onClick={() => setCustomAddress('')}>
        Create Profile
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 items-center p-5 border-b-2 border-white border-opacity-0 bg-slate-700 bg-opacity-100">
      <div className="flex">
        <h1 className="font-blog text-4xl font-black pr-8">NFT Portfolio</h1>
        {profileButton}
      </div>
      <div className="relative mx-auto w-3/4">
        <input
          className="w-full"
          placeholder="search wallet address..."
          onChange={(e) => {
            setSearchInput(e.target.value.toString());
          }}
          value={searchInput}
        ></input>
        <button
          className="absolute rounded-xl h-full right-0 text-slate-700 bg-white py-0"
          onClick={() => {
            setCustomAddress(searchInput);
            setSearchInput('');
          }}
        >
          Search
        </button>
      </div>
      <div className="ml-auto flex flex-row">
        {userHasProfile ? (
          <button className="text-slate-700 rounded-3xl bg-white" onClick={() => setCreateNftPopup(true)}>
            Create NFT
          </button>
        ) : (
          <></>
        )}
        <ConnectButton moralisAuth={false} />
      </div>
    </div>
  );
}
