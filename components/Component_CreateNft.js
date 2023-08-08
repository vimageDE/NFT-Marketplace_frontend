import React, { useState, useContext } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import Modal from 'react-modal';
import { NFTStorage, File } from 'nft.storage';
import { NftContract } from './Contract_NFT';
import { Button, Checkbox } from 'web3uikit';
import { Globals } from './GlobalVariables';
import { FirebaseBackend } from './Backend_Firebase';

const client = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk0OERkOTIxMDBjNDk1YTI0NTkwNGE4N2JGMTU1MGI3NkFBRDZjYTgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4ODY0MjQxNTk2NCwibmFtZSI6Ik5GVCBQb3J0Zm9saW8ifQ.GH6K7ALQoX9vCzEJDmaHBn2t61UjenCMiDzzApTRPcE',
});

export const CreateNft = () => {
  const { setIsLoading, setIsLoadingText, createNftPopup, setCreateNftPopup, profileName, openAddress } =
    useContext(Globals);
  const {
    signerAddress,
    createArtwork,
    setSeries,
    hasProfile,
    userHasProfile,
    ownProfile,
    fetchMetadata,
    getImageUrl,
  } = useContext(NftContract);
  const { getImageByUrl } = useContext(FirebaseBackend);
  // NFT Data
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [selectedDescr, setSelectedDescr] = useState('');
  const [nftUrl, setNftUrl] = useState('');
  const [nftImageUrl, setNftImageUrl] = useState('');
  // NFT constant Variables
  const selectedName_min = 3;
  const selectedName_max = 30;
  const selectedDescr_min = 10;
  const selectedDescr_max = 55;

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
      const isExisiting = await getImageByUrl(metadata.image);
      if (isExisiting) {
        setNftUrl('');
        setIsLoadingText('Image was already uploaded as NFT!');
        console.log('Image was already uploaded as NFT!');
        setTimeout(() => setIsLoading(false), 2000);
      } else {
        setNftImageUrl(imageUrl);

        setIsLoadingText('Waiting for Transaction');

        if (!userHasProfile && ownProfile && profileName) {
          setIsLoadingText('Creating Portfolio Transaction');
          await setSeries(profileName);
        }
        setIsLoadingText('Creating NFT Transaction');
        await createArtwork(url);

        setCreateNftPopup(false);
        setIsLoading(false);
        openAddress(signerAddress);
      }
    } catch (e) {
      setIsLoadingText('Error creating NFT');
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const uploadToIPFS = async (file) => {
    const metadata = await client.store({
      name: selectedName,
      description: 'NFT Image',
      image: new File([file], file.name, { type: file.type }),
    });
    return metadata.url;
  };

  const skipNft = async () => {
    try {
      setIsLoadingText('Create Profile');
      setIsLoading(true);
      await setSeries(profileName);

      setCreateNftPopup(false);
      setIsLoading(false);
      openAddress(signerAddress);
    } catch (e) {
      setIsLoading('Error creating Profile');
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <>
      <Modal
        isOpen={createNftPopup}
        onRequestClose={() => {
          setCreateNftPopup(false);
        }}
        contentLabel="Create Profile"
        className="m-auto bg-slate-700 w-1/2 rounded-xl shadow max-h-[800px] max-w-[500px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex"
      >
        <div className="text-white text-center relative">
          <div className="bg-gold rounded h-28">
            <h2 className="text-6xl pt-8">Create an NFT</h2>
          </div>
          <div className="">
            <div className="my-12 flex flex-col items-center">
              <label htmlFor="file-upload">
                <img
                  src={selectedImage ? selectedImage : '/createNFT_PLACEHOLDER.jpg'}
                  alt="NFT"
                  className="max-h-48 rounded border-white border-2 cursor-pointer"
                ></img>
              </label>
              {!selectedImage ? (
                <>
                  <label
                    htmlFor="file-upload"
                    className="bg-white hover:bg-gold text-slate-700 cursor-pointer uppercase mt-2 font-black py-2 px-4 rounded-md"
                  >
                    Select NFT-image
                  </label>

                  <div>supported files: .png .jpg</div>
                  {hasProfile && !userHasProfile && ownProfile && profileName ? (
                    <div>
                      <button className="bg-slate-500 hover:bg-gold text-slate-700 mt-8" onClick={() => skipNft()}>
                        SKIP
                      </button>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <>
                  <div className="pt-4">
                    <div>Name of the NFT:</div>{' '}
                    <input
                      id="inputSelectedName"
                      className="pl-0 text-center text-black"
                      placeholder="Enter the name.."
                      onChange={(e) => {
                        handleImageName(e);
                      }}
                    ></input>
                  </div>
                  <div className="min-h-[60px]">
                    {selectedName ? (
                      <>
                        <div>Description of the NFT:</div>
                        <input
                          id="inputSelectedDescr"
                          className="pl-0 text-center text-black w-96"
                          placeholder="Enter the description.."
                          onChange={(e) => {
                            handleImageDescr(e);
                          }}
                        ></input>
                        <div className="min-h-[41px] mt-4">
                          {selectedDescr ? (
                            <>
                              <button className="bg-gold hover:bg-gray-300 uppercase" onClick={handleImageUpload}>
                                Create NFT
                              </button>
                              <div>{nftUrl}</div>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              )}
              <input
                id="file-upload"
                className="hidden"
                type="file"
                accept="image/jpeg, image/png"
                onChange={async (event) => {
                  handleImagePreview(event);
                }}
              />
            </div>
            <div className="border-white rounded bg-slate-800 py-4 flex flex-col items-center">
              <div className="font-black uppercase w-3/4">The NFT will be tied to your profile</div>
              <div className="px-6 text-sm mt-2">
                Uploaded images will be put on an IPFS network, where they will be perpetual and can not be deleted!
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
