import { ConnectButton } from 'web3uikit';
import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
// Get Icons
import { ImCross } from 'react-icons/Im';
// Inherit from parent Component
import { Example } from './Example_Component_Parent';

const exampleImage = '/exampleImage.jpg';

export default function ExampleComponent() {
  // Example for a state variable
  const [exampleVariable, setExampleVariable] = useState('0');
  // Example to inherit a variable from a parent component
  const { exampleParentVariable } = useContext(Example);

  return (
    <div>
      {
        // Here can the html be put
      }
    </div>
  );
}
