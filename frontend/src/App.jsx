import React from 'react';
import { Connect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import SwapInterface from './components/SwapInterface/SwapInterface';
import ConnectWallet from './components/WalletConnect/ConnectWallet';

function App() {
const network = new StacksTestnet();
const appConfig = {
  appName: 'STACKS DEX',
  icon: 'icon.png',
  network,
};

return (
  <Connect authOptions={{ appDetails: { name: 'STACKS DEX', icon: 'icon.png' }, network }}>
    <div className="min-h-screen bg-gradient-to-br from-[#4A1D96] via-[#6B21A8] to-[#86198F]">
      <header className="p-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-white text-2xl font-bold">STACKS DEX</h1>
            <div className="space-x-6">
              <button className="text-white hover:text-white/80">Swap</button>
              <button className="text-white/60 hover:text-white/80">Liquidity</button>
              <button className="text-white/60 hover:text-white/80">Farming</button>
              <button className="text-white/60 hover:text-white/80">Governance</button>
            </div>
          </div>
          <ConnectWallet />
        </nav>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4 p-4 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
          <div className="text-white/60 text-sm">24h Volume</div>
          <div className="text-white text-2xl font-bold">\$1.2M</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
          <div className="text-white/60 text-sm">TVL</div>
          <div className="text-white text-2xl font-bold">\$4.5M</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
          <div className="text-white/60 text-sm">Total Pairs</div>
          <div className="text-white text-2xl font-bold">24</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white">
          <div className="text-white/60 text-sm">STACKS Price</div>
          <div className="text-white text-2xl font-bold">\$0.82</div>
        </div>
      </div>

      <main className="">
      <div className="flex items-center gap-2"></div>
        <SwapInterface />
      </main>
    </div>
  </Connect>
);
}

export default App;