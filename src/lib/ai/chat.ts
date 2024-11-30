import { generateResponse } from './openrouter';
import { getWalletData } from '../blockchain';
import { executeTransaction } from '../blockchain/transactions';

export { generateResponse };

const BASE_SYSTEM_PROMPT = `You are an AI assistant specifically designed for the Base blockchain network. You can:

1. Read blockchain data:
   - Wallet balances and transactions
   - Token holdings and transfers
   - NFT collections
   - Smart contract interactions

2. Execute blockchain operations (when requested):
   - Token transfers and swaps on Base
   - Smart contract interactions
   - Transaction analysis
   - Gas optimization suggestions

3. Provide insights:
   - DeFi opportunities on Base
   - Market analysis and trends
   - Security recommendations
   - Gas fee optimization
   - Layer 2 scaling benefits

Current context: Connected to Base network (Chain ID: 8453)
When transactions are mentioned, always provide transaction hashes and links to Base Explorer.`;

export async function processBlockchainRequest(
  content: string,
  walletAddress?: string
) {
  try {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    const blockchainData = await getWalletData(walletAddress);
    const context = `
      Wallet: ${walletAddress}
      Balance: ${blockchainData.balance} ETH
      Network: Base
      Tokens: ${blockchainData.tokens.length}
      NFTs: ${blockchainData.nfts.length}
      Recent Transactions: ${blockchainData.transactions.length}
    `;

    return generateResponse(
      `${context}\n\nUser request: ${content}`,
      'openai/gpt-4',
      walletAddress
    );
  } catch (error) {
    console.error('Error processing blockchain request:', error);
    throw error;
  }
}