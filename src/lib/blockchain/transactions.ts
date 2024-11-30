import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Common DEX ABIs
const UNISWAP_V2_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
];

// Common token ABI
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)'
];

// Base Network Contract Addresses
const CONTRACTS = {
  UNISWAP_ROUTER: '0x2626664c2603336E57B271c5C0b26F421741e481', // Uniswap v2 on Base
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
};

interface TransactionRequest {
  type: 'transfer' | 'swap' | 'approve';
  tokenAddress?: string;
  toAddress: string;
  amount: string;
  data?: any;
}

export async function executeTransaction(
  provider: EthereumProvider,
  request: TransactionRequest
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    let transaction;
    switch (request.type) {
      case 'transfer':
        if (request.tokenAddress) {
          // ERC20 Transfer
          const tokenContract = new ethers.Contract(
            request.tokenAddress,
            ERC20_ABI,
            signer
          );
          transaction = await tokenContract.transfer(
            request.toAddress,
            ethers.parseEther(request.amount)
          );
        } else {
          // ETH Transfer
          transaction = await signer.sendTransaction({
            to: request.toAddress,
            value: ethers.parseEther(request.amount)
          });
        }
        break;

      case 'swap':
        const router = new ethers.Contract(
          CONTRACTS.UNISWAP_ROUTER,
          UNISWAP_V2_ROUTER_ABI,
          signer
        );
        
        if (!request.tokenAddress) {
          // ETH to Token swap
          transaction = await router.swapExactETHForTokens(
            0, // amountOutMin - to be calculated based on price impact
            [CONTRACTS.WETH, request.toAddress],
            await signer.getAddress(),
            Math.floor(Date.now() / 1000) + 60 * 20, // 20 minute deadline
            { value: ethers.parseEther(request.amount) }
          );
        } else {
          // Token to Token or Token to ETH swap
          const tokenContract = new ethers.Contract(
            request.tokenAddress,
            ERC20_ABI,
            signer
          );
          
          // Approve router if needed
          const allowance = await tokenContract.allowance(
            await signer.getAddress(),
            CONTRACTS.UNISWAP_ROUTER
          );
          
          if (allowance < ethers.parseEther(request.amount)) {
            const approveTx = await tokenContract.approve(
              CONTRACTS.UNISWAP_ROUTER,
              ethers.MaxUint256
            );
            await approveTx.wait();
          }
          
          transaction = await router.swapExactTokensForTokens(
            ethers.parseEther(request.amount),
            0, // amountOutMin - to be calculated based on price impact
            [request.tokenAddress, request.toAddress],
            await signer.getAddress(),
            Math.floor(Date.now() / 1000) + 60 * 20 // 20 minute deadline
          );
        }
        break;

      case 'approve':
        const tokenContract = new ethers.Contract(
          request.tokenAddress!,
          ERC20_ABI,
          signer
        );
        transaction = await tokenContract.approve(
          request.toAddress,
          ethers.MaxUint256
        );
        break;
    }

    const receipt = await transaction.wait();
    return {
      success: true,
      hash: receipt.hash
    };
  } catch (error: any) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
}