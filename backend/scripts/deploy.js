import { StacksTestnet } from '@stacks/network';
import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const network = new StacksTestnet();

async function deployContract(contractName, filePath) {
  const privateKey = process.env.STACKS_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Missing STACKS_PRIVATE_KEY in environment variables');
  }

  const codeBody = fs.readFileSync(filePath, { encoding: 'utf8' });
  
  const txOptions = {
    contractName,
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 100000,
    postConditionMode: 1,
    nonce: 0, // Add this if you're deploying multiple contracts
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);
    console.log(`Deployed ${contractName}:`, result);
    return result;
  } catch (error) {
    console.error(`Error deploying ${contractName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Deploy liquidity token contract first
    const lpResult = await deployContract(
      'liquidity-token',
      './contracts/liquidity-token.clar'
    );
    console.log('Liquidity Token Contract deployed:', lpResult);

    // Deploy DEX contract
    const dexResult = await deployContract(
      'dex',
      './contracts/dex.clar'
    );
    console.log('DEX Contract deployed:', dexResult);

    console.log('Deployment completed successfully');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main();
