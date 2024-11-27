import React, { useState, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { userSession } from '../WalletConnect/ConnectWallet';
import {
  createPool,
  swap,
  addLiquidity,
  removeLiquidity,
  getSpotPrice,
  getAmountOut,
  getTwapPrice,
} from '../../utils/contracts';

const DexInterface = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [slippage, setSlippage] = useState('0.5'); // 0.5% default slippage
  const [spotPrice, setSpotPrice] = useState(null);
  const [twapPrice, setTwapPrice] = useState(null);

  useEffect(() => {
    if (tokenA && tokenB) {
      fetchPrices();
    }
  }, [tokenA, tokenB]);

  const fetchPrices = async () => {
    try {
      const [spot, twap] = await Promise.all([
        getSpotPrice(tokenA, tokenB),
        getTwapPrice(tokenA, tokenB, 10) // 10 blocks period
      ]);
      setSpotPrice(spot);
      setTwapPrice(twap);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const calculateMinimumReceived = (amount) => {
    return amount * (1 - slippage / 100);
  };

  const handleCreatePool = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const options = await createPool(tokenA, tokenB, amountA, amountB);
      await openContractCall(options);
    } catch (error) {
      console.error('Error creating pool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const amountOut = await getAmountOut(amountA, tokenA, tokenB);
      const minAmountOut = calculateMinimumReceived(amountOut);
      const options = await swap(tokenA, amountA, tokenB, minAmountOut);
      await openContractCall(options);
    } catch (error) {
      console.error('Error swapping tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLiquidity = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const minA = calculateMinimumReceived(amountA);
      const minB = calculateMinimumReceived(amountB);
      const options = await addLiquidity(
        tokenA,
        tokenB,
        amountA,
        amountB,
        minA,
        minB
      );
      await openContractCall(options);
    } catch (error) {
      console.error('Error adding liquidity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const minA = calculateMinimumReceived(amountA);
      const minB = calculateMinimumReceived(amountB);
      const options = await removeLiquidity(
        tokenA,
        tokenB,
        amountA, // liquidity amount
        minA,
        minB
      );
      await openContractCall(options);
    } catch (error) {
      console.error('Error removing liquidity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userSession.isUserSignedIn()) {
    return <div>Please connect your wallet first</div>;
  }

  return (
    <div className="dex-interface">
      <div className="price-info">
        {spotPrice && (
          <div>
            <h3>Current Price</h3>
            <p>{spotPrice} {tokenB}/{tokenA}</p>
          </div>
        )}
        {twapPrice && (
          <div>
            <h3>TWAP Price (10 blocks)</h3>
            <p>{twapPrice} {tokenB}/{tokenA}</p>
          </div>
        )}
      </div>

      <div className="input-fields">
        <input
          type="text"
          placeholder="Token A Address"
          value={tokenA}
          onChange={(e) => setTokenA(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token B Address"
          value={tokenB}
          onChange={(e) => setTokenB(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount A"
          value={amountA}
          onChange={(e) => setAmountA(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount B"
          value={amountB}
          onChange={(e) => setAmountB(e.target.value)}
        />
        <input
          type="number"
          placeholder="Slippage %"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
        />
      </div>

      <div className="action-buttons">
        <button
          onClick={handleCreatePool}
          disabled={isLoading || !tokenA || !tokenB || !amountA || !amountB}
        >
          Create Pool
        </button>
        <button
          onClick={handleSwap}
          disabled={isLoading || !tokenA || !tokenB || !amountA}
        >
          Swap
        </button>
        <button
          onClick={handleAddLiquidity}
          disabled={isLoading || !tokenA || !tokenB || !amountA || !amountB}
        >
          Add Liquidity
        </button>
        <button
          onClick={handleRemoveLiquidity}
          disabled={isLoading || !tokenA || !tokenB || !amountA}
        >
          Remove Liquidity
        </button>
      </div>

      {isLoading && <div className="loading">Processing transaction...</div>}
    </div>
  );
};

export default DexInterface;
