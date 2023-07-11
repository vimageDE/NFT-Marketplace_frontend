import React, { useState, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import Modal from 'react-modal';
import { NFTStorage, File } from 'nft.storage';
import { NftContract } from './Contract_NFT';
import { Button, Checkbox } from 'web3uikit';
import { Globals } from './GlobalVariables';

const client = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk0OERkOTIxMDBjNDk1YTI0NTkwNGE4N2JGMTU1MGI3NkFBRDZjYTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4ODY0MjQxNTk2NCwibmFtZSI6Ik5GVCBQb3J0Zm9saW8ifQ.GH6K7ALQoX9vCzEJDmaHBn2t61UjenCMiDzzApTRPcE',
});

export default function CreateProfile() {
  const { isWeb3Enabled } = useMoralis();
  const { signerAddress, createArtwork, setSeries, hasProfile, fetchMetadata, getImageUrl } = useContext(NftContract);
  const { isLoading, setIsLoading, setIsLoadingText, setCreateNftPopup, profileName, setProfileName } =
    useContext(Globals);
  // UI State Variables
  const [userNotification, setUserNotification] = useState('');
  // NFT Data
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [selectedDescr, setSelectedDescr] = useState('');
  const [nftUrl, setNftUrl] = useState('');
  const [nftImageUrl, setNftImageUrl] = useState('');
  // Profile constant Variables
  const img_profileHeader = '/createProfile-hero_PLACEHOLDER.jpg';
  const profileName_min = 3;
  const profileName_max = 15;
  const selectedName_min = 3;
  const selectedName_max = 30;
  const selectedDescr_min = 10;
  const selectedDescr_max = 55;

  const createProfileButton = async function () {
    const nameInput = document.querySelector('#publicName').value.toString();
    if (nameInput.length == 0) {
      setUserNotification('enter a public name for your portfolio');
      return;
    }
    if (nameInput.length < profileName_min) {
      setUserNotification(`minimum of ${profileName_min} letters`);
      return;
    }
    if (nameInput.length > profileName_max) {
      setUserNotification(`maximum of ${profileName_max} letters`);
      return;
    }

    setUserNotification('');
    setProfileName(nameInput);
    console.log(`name of portfolio: ${nameInput}`);

    // Reset Data
    setSelectedName('');
    setSelectedDescr('');
    // Open create profile popup
    setCreateNftPopup(true);
  };

  const handleImagePreview = (event) => {
    const file = event.target.files[0];
    if (file == null) {
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Invalid file type. Please select a JPEG or PNG image.');
      return;
    }
    console.log('Put image locally');

    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleImageName = (e) => {
    const nameInput = e.target.value;
    if (nameInput.length == 0) {
      setSelectedName('');
      return;
    }
    if (nameInput.length < selectedName_min) {
      setSelectedName('');
      return;
    }
    if (nameInput.length > selectedName_max) {
      setSelectedName('');
      return;
    }
    // console.log(`This is the input: ${nameInput}`);
    setSelectedName(nameInput);
  };

  const handleImageDescr = (e) => {
    const nameInput = e.target.value;
    if (nameInput.length == 0) {
      setSelectedDescr('');
      return;
    }
    if (nameInput.length < selectedDescr_min) {
      setSelectedDescr('');
      return;
    }
    if (nameInput.length > selectedDescr_max) {
      setSelectedDescr('');
      return;
    }
    // console.log(`This is the input: ${nameInput}`);
    setSelectedDescr(nameInput);
  };

  const handleImageUpload = async () => {
    // Check if File is available
    if (selectedFile == null) {
      alert('No file selected for upload.');
      return;
    }
    // Check file type
    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      alert('Invalid file type. Please select a JPEG or PNG image.');
      return;
    }

    setIsLoadingText('Uploading Data');
    setIsLoading(true);

    try {
      const url = await uploadToIPFS(selectedFile);
      setNftUrl(url);
      const metadata = await fetchMetadata(url);
      const imageUrl = getImageUrl(metadata);
      setNftImageUrl(imageUrl);

      setIsLoadingText('Waiting for Transaction');

      if (!hasProfile && profileName) {
        setIsLoadingText('Creating Portfolio Transaction');
        await setSeries(profileName);
      }
      setIsLoadingText('Creating NFT Transaction');
      await createArtwork(url);

      setIsLoading(false);
    } catch (e) {
      setIsLoading('Error creating NFT');
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const uploadToIPFS = async (file) => {
    const metadata = await client.store({
      name: file.name,
      description: 'NFT Image',
      image: new File([file], file.name, { type: file.type }),
    });
    return metadata.url;
  };

  return (
    <div>
      {
        // Hero Image
      }
      <div
        className="flex items-center justify-center bg-cover my-auto w-full h-96 bg-center"
        style={{ backgroundImage: `url(${nftImageUrl ? nftImageUrl : img_profileHeader})` }}
      >
        <h2 className="font-blog text-9xl font-black text-center">
          Create <br />
          Your <br /> Portfolio
        </h2>
      </div>
      {
        // Create Profile Area
      }
      <div className="flex flex-col items-center mt-8 text-center">
        <h2 className="text-3xl text-black">
          This will allow you to easily set up a portfolio for your work that is decentralized
        </h2>
        <div className="w-3/5 min-w-[600px]">
          Share your wallet address with everyone and easily show what NFT art you have created, sold or owned. Show
          potential clients your work for future project or let them easily purchase your art instantly!
        </div>
        <div className="flex flex-col my-16">
          {isWeb3Enabled ? (
            <div className="space-y-4">
              <h2 className="text-3xl text-black">Setup your Profile:</h2>
              <div className="flex space-x-4">
                <div className="my-auto ml-auto">Public Name:</div>
                <input
                  id="publicName"
                  placeholder="enter your public name..."
                  onChange={() => setUserNotification('')}
                ></input>
              </div>
              <div className="flex space-x-4">
                <div className="my-auto ml-auto">Wallet Address:</div>
                <input
                  placeholder="enter your wallet address..."
                  value={signerAddress.slice(0, 6) + '...' + signerAddress.slice(-6)}
                  readOnly={true}
                ></input>
              </div>
            </div>
          ) : (
            <div>Please Connect your wallet!</div>
          )}

          <button className="mt-8" onClick={createProfileButton}>
            Create Profile
          </button>
          <div className="text-red-600">{userNotification}</div>
        </div>
      </div>
      {
        // Create Profile Popup
      }
    </div>
  );
}
