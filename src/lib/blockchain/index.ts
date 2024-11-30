import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { ethers } from 'ethers';
import Web3 from 'web3';

// Initialize Alchemy SDK for Base Mainnet with WebSocket support
const baseConfig = {
  apiKey: import.meta.env.VITE_ALCHEMY_BASE_API_KEY,
  network: Network.BASE_MAINNET,
  maxRetries: 10,
  withWebSocket: true
};

const baseAlchemy = new Alchemy(baseConfig);

// Initialize Web3 with Base RPC
const web3 = new Web3('https://mainnet.base.org');

export interface BlockchainData {
  balance: string;
  nfts: any[];
  tokens: any[];
  transactions: any[];
  network: string;
  blockNumber: number;
  gasPrice: string;
}

let pendingTransactionSubscription: any = null;
let blockSubscription: any = null;

export function subscribeToUpdates(address: string, callback: (data: Partial<BlockchainData>) => void) {
  // Unsubscribe from existing subscriptions
  if (pendingTransactionSubscription) {
    baseAlchemy.ws.removeAllListeners(pendingTransactionSubscription);
  }
  if (blockSubscription) {
    baseAlchemy.ws.removeAllListeners(blockSubscription);
  }

  // Subscribe to pending transactions
  pendingTransactionSubscription = baseAlchemy.ws.on(
    {
      method: AlchemySubscription.PENDING_TRANSACTIONS,
      addresses: [address],
      includeRemoved: true,
      hashesOnly: false
    },
    (tx) => {
      getWalletData(address).then(callback);
    }
  );

  // Subscribe to new blocks
  blockSubscription = baseAlchemy.ws.on(
    AlchemySubscription.BLOCK,
    async () => {
      const [blockNumber, gasPrice] = await Promise.all([
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice()
      ]);
      
      callback({
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei')
      });
    }
  );
}

export async function getWalletData(address: string): Promise<BlockchainData> {
  try {
    const [
      balance,
      nfts,
      tokens,
      transactions,
      blockNumber,
      gasPrice
    ] = await Promise.all([
      baseAlchemy.core.getBalance(address),
      baseAlchemy.nft.getNftsForOwner(address),
      baseAlchemy.core.getTokenBalances(address),
      baseAlchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        category: ["external", "erc20", "erc721", "erc1155"],
        maxCount: 100,
        excludeZeroValue: true,
        order: "desc"
      }),
      web3.eth.getBlockNumber(),
      web3.eth.getGasPrice()
    ]);

    // Process token balances
    const tokenDetails = await Promise.all(
      tokens.tokenBalances.map(async (token) => {
        try {
          const metadata = await baseAlchemy.core.getTokenMetadata(token.contractAddress);
          return {
            ...token,
            metadata,
            formattedBalance: ethers.formatUnits(
              token.tokenBalance || '0',
              metadata.decimals || 18
            )
          };
        } catch (error) {
          console.error(`Error fetching token metadata for ${token.contractAddress}:`, error);
          return token;
        }
      })
    );

    return {
      balance: ethers.formatEther(balance),
      nfts: nfts.ownedNfts,
      tokens: tokenDetails,
      transactions: transactions.transfers,
      network: 'Base Mainnet',
      blockNumber,
      gasPrice: ethers.formatUnits(gasPrice, 'gwei')
    };
  } catch (error) {
    console.error('Error fetching blockchain data:', error);
    throw error;
  }
}

export async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    // Use Base network price oracle or DEX for price data
    // This is a placeholder - implement actual price fetching logic
    return 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
}

// Cleanup function to remove WebSocket listeners
export function cleanup() {
  if (pendingTransactionSubscription) {
    baseAlchemy.ws.removeAllListeners(pendingTransactionSubscription);
  }
  if (blockSubscription) {
    baseAlchemy.ws.removeAllListeners(blockSubscription);
  }
}