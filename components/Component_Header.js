import { useContext, useState } from 'react';
import { ConnectButton } from 'web3uikit';
import { NftContract } from './Contract_NFT';
import { Globals } from './GlobalVariables';
import { useRouter } from 'next/router';

export default function Header() {
  const { hasProfile, userHasProfile, setCustomAddress, ownProfile } = useContext(NftContract);
  const { setCreateNftPopup, openAddress } = useContext(Globals);
  const [searchInput, setSearchInput] = useState('');

  const router = useRouter();

  let profileButton = <div></div>;
  if (userHasProfile && !ownProfile) {
    profileButton = (
      <button className="text-slate-700 rounded-3xl bg-white" onClick={() => setCustomAddress('')}>
        Your Profile
      </button>
    );
  } else if (!userHasProfile) {
    profileButton = (
      <button className="text-slate-700 rounded-3xl bg-white" onClick={() => router.push(`/create-profile`)}>
        Create Profile
      </button>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 justify-items-center space-y-4 items-center p-5 border-b-2 border-white border-opacity-0 bg-slate-700 bg-opacity-100">
      <div className="flex mt-auto">
        <h1 className="font-blog text-4xl font-black pr-8">NFT Portfolio</h1>
        {profileButton}
      </div>
      <div className="relative w-full max-w-[300px]">
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
            const search = searchInput;
            setSearchInput('');
            openAddress(search);
            // router.push(`/portfolio/${search}`);
          }}
        >
          Search
        </button>
      </div>
      <div className="flex">
        {userHasProfile ? (
          <button className="text-slate-700 rounded-3xl bg-white" onClick={() => setCreateNftPopup(true)}>
            Create NFT
          </button>
        ) : (
          <></>
        )}
        <ConnectButton moralisAuth={false} className="" />
      </div>
    </div>
  );
}
