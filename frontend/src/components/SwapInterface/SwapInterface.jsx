import React from 'react';
import { useConnect } from '@stacks/connect-react';
import ConnectWallet from '../WalletConnect/ConnectWallet';

function SwapInterface() {
const { isSignedIn } = useConnect();

return (
  <div className="flex flex-col gap-6 max-w-xl mx-auto p-6 bg-purple-900/40 rounded-2xl">
    {/* Header avec titre et bouton settings */}
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Swap</h2>
      <button className="p-2 hover:bg-purple-800/40 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      </button>
    </div>

    {/* From Token Input */}
    <div className="bg-purple-800/40 rounded-xl p-4">
      <div className="flex justify-between text-sm text-white/80 mb-2">
        <span>From</span>
        <span>Balance: 0.0</span>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="number"
          placeholder="0.0"
          className="bg-transparent text-2xl text-white outline-none w-2/3"
        />
        <button className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-xl">
          Select Token
        </button>
      </div>
    </div>

    {/* Swap Direction Button */}
    <div className="flex justify-center">
      <button className="bg-purple-700/50 p-2 rounded-full hover:bg-purple-600/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
    </div>

    {/* To Token Input */}
    <div className="bg-purple-800/40 rounded-xl p-4">
      <div className="flex justify-between text-sm text-white/80 mb-2">
        <span>To</span>
        <span>Balance: 0.0</span>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="number"
          placeholder="0.0"
          className="bg-transparent text-2xl text-white outline-none w-2/3"
        />
        <button className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-xl">
          Select Token
        </button>
      </div>
    </div>

    {/* Connect Wallet ou Swap Button */}
    {!isSignedIn ? (
      <ConnectWallet />
    ) : (
      <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl hover:opacity-90">
        Swap
      </button>
    )}
  </div>
);
}

export default SwapInterface;