import React from 'react';
import { Wallet, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">STACKS DEX</span>
            <div className="hidden md:flex items-center ml-8 space-x-4">
              <a href="#" className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Swap</a>
              <a href="#" className="text-white/60 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Liquidity</a>
              <a href="#" className="text-white/60 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Farming</a>
              <a href="#" className="text-white/60 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Governance</a>
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
            <button className="md:hidden ml-4 text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;