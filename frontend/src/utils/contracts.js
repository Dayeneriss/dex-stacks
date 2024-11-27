import { StacksMainnet, StacksTestnet } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
} from "@stacks/transactions";
import { userSession } from "../components/WalletConnect/ConnectWallet";

const network = new StacksTestnet(); // Change to StacksMainnet for production
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address

export const DEX_CONTRACT_NAME = "dex";
export const LP_TOKEN_CONTRACT_NAME = "liquidity-token";

// Helper to make contract calls
const makeContractCall = async ({
  contractName,
  functionName,
  functionArgs,
  postConditions = [],
}) => {
  const address = userSession.loadUserData().profile.stxAddress.testnet;

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderAddress: address,
    network,
    postConditions,
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
    onFinish: (data) => {
      console.log("Transaction finished:", data);
    },
  };

  return options;
};

// Contract Functions
export const createPool = async (tokenA, tokenB, amountA, amountB) => {
  const deadline = uintCV(Math.floor(Date.now() / 1000) + 3600); // 1 hour deadline
  const args = [
    principalCV(tokenA),
    principalCV(tokenB),
    uintCV(amountA),
    uintCV(amountB),
    deadline,
  ];

  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "create-pool",
    functionArgs: args,
  });
};

export const swap = async (tokenIn, amountIn, tokenOut, minAmountOut) => {
  const deadline = uintCV(Math.floor(Date.now() / 1000) + 3600);
  const args = [
    principalCV(tokenIn),
    uintCV(amountIn),
    principalCV(tokenOut),
    uintCV(minAmountOut),
    deadline,
  ];

  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "swap",
    functionArgs: args,
  });
};

export const addLiquidity = async (
  tokenA,
  tokenB,
  amountADesired,
  amountBDesired,
  amountAMin,
  amountBMin
) => {
  const deadline = uintCV(Math.floor(Date.now() / 1000) + 3600);
  const args = [
    principalCV(tokenA),
    principalCV(tokenB),
    uintCV(amountADesired),
    uintCV(amountBDesired),
    uintCV(amountAMin),
    uintCV(amountBMin),
    deadline,
  ];

  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "add-liquidity",
    functionArgs: args,
  });
};

export const removeLiquidity = async (
  tokenA,
  tokenB,
  liquidity,
  minAmountA,
  minAmountB
) => {
  const deadline = uintCV(Math.floor(Date.now() / 1000) + 3600);
  const args = [
    principalCV(tokenA),
    principalCV(tokenB),
    uintCV(liquidity),
    uintCV(minAmountA),
    uintCV(minAmountB),
    deadline,
  ];

  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "remove-liquidity",
    functionArgs: args,
  });
};

// Read-only Functions
export const getSpotPrice = async (tokenA, tokenB) => {
  const args = [principalCV(tokenA), principalCV(tokenB)];
  
  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "get-spot-price",
    functionArgs: args,
  });
};

export const getAmountOut = async (amountIn, tokenIn, tokenOut) => {
  const args = [
    uintCV(amountIn),
    principalCV(tokenIn),
    principalCV(tokenOut),
  ];
  
  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "get-amount-out",
    functionArgs: args,
  });
};

export const getTwapPrice = async (tokenA, tokenB, period) => {
  const args = [
    principalCV(tokenA),
    principalCV(tokenB),
    uintCV(period),
  ];
  
  return makeContractCall({
    contractName: DEX_CONTRACT_NAME,
    functionName: "get-twap-price",
    functionArgs: args,
  });
};
