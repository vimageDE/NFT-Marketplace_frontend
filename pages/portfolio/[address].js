import { useContext, useEffect, useState } from 'react';
import UserProfile from '../../components/Component_UserProfile';
import Head from 'next/head';
import Header from '../../components/Component_Header';
import { useRouter } from 'next/router';
import { NftContract } from '../../components/Contract_NFT';
import { CreateNft } from '../../components/Component_CreateNft';
import { LoadingOverlay } from '../../components/Component_Loading';

export default function Portfolio() {
  const { hasProfile, userHasProfile, setCustomAddress, ownProfile } = useContext(NftContract);

  const router = useRouter();
  const { address } = router.query;

  useEffect(() => {
    setCustomAddress(address);
  });

  return (
    <div>
      <Head>
        <title>NFT Portfolio</title>
        <meta name="description" content="template by Mark Wierzimok" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <UserProfile />
      <CreateNft className="" />
      <LoadingOverlay />
    </div>
  );
}
