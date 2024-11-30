import { EthereumProvider } from '@walletconnect/ethereum-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3Modal from 'web3modal';

const projectId = '09f4713e6fc4332ca539edac100c2609';

// Base Mainnet Configuration
const baseChain = {
  chainId: 8453,
  name: 'Base',
  network: 'base',
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org']
    },
    public: {
      http: ['https://mainnet.base.org']
    },
    alchemy: {
      http: ['https://base-mainnet.g.alchemy.com/v2/5HC5iHr_FVnyFWG304IWA0dZ5buUHlI8']
    }
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org'
    }
  },
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};

// Initialize Coinbase Wallet SDK
const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'AIX - Base Network AI Assistant',
  appLogoUrl: 'https://avatars.githubusercontent.com/u/112647953',
  darkMode: true,
  overrideIsMetaMask: false
});

// Web3Modal configuration
const web3ModalConfig = {
  network: 'base',
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: EthereumProvider,
      options: {
        projectId,
        chains: [baseChain.chainId],
        showQrModal: true,
        rpc: {
          [baseChain.chainId]: baseChain.rpcUrls.alchemy.http[0]
        },
        metadata: {
          name: 'AIX - Base Network AI Assistant',
          description: 'AI Agents for Base Network',
          url: window.location.origin,
          icons: ['https://avatars.githubusercontent.com/u/112647953']
        }
      }
    },
    coinbasewallet: {
      package: coinbaseWallet,
      options: {
        rpc: {
          [baseChain.chainId]: baseChain.rpcUrls.alchemy.http[0]
        },
        chainId: baseChain.chainId,
        darkMode: true
      }
    }
  }
};

let web3Modal: Web3Modal | null = null;

export function getWeb3Modal() {
  if (!web3Modal) {
    web3Modal = new Web3Modal(web3ModalConfig);
  }
  return web3Modal;
}

export const SUPPORTED_CHAINS = {
  [baseChain.chainId]: baseChain
};

export const WALLET_TYPES = {
  METAMASK: 'metamask',
  COINBASE: 'coinbasewallet',
  WALLETCONNECT: 'walletconnect',
  TOKENPOCKET: 'tokenpocket'
} as const;

export type WalletType = typeof WALLET_TYPES[keyof typeof WALLET_TYPES];