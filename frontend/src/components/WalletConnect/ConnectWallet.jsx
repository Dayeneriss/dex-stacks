// src/components/ConnectWallet/ConnectWallet.jsx
import React from 'react';
import { useConnect } from '@stacks/connect-react';

const ConnectWallet = () => {
const { authenticate } = useConnect();

const connectWallet = () => {
  authenticate({
    appDetails: {
      name: 'STACKS DEX', // Changé de 'CORE DEX' à 'STACKS DEX'
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      console.log('Wallet connected successfully');
    },
    onCancel: () => {
      console.log('Wallet connection cancelled');
    },
  });
};

return (
  <button
    onClick={connectWallet}
    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full hover:opacity-90 flex items-center gap-2"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5" 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
    Connect Wallet
  </button>
);
};

export default ConnectWallet;