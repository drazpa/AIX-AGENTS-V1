import { useState, useEffect, useCallback } from 'react';
import { getWeb3Modal, WALLET_TYPES, type WalletType } from './config';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { SUPPORTED_CHAINS } from './config';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

export function useWeb3() {
  const [provider, setProvider] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      try {
        const web3Modal = getWeb3Modal();
        if (web3Modal.cachedProvider) {
          const provider = await web3Modal.connect();
          setProvider(provider);
          
          const accounts = await provider.request({ method: 'eth_accounts' });
          const chainId = await provider.request({ method: 'eth_chainId' });
          
          if (accounts?.[0]) {
            setAddress(accounts[0]);
            setChainId(parseInt(chainId as string));
            setIsConnected(true);
          }
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize web3:', error);
        setIsInitialized(true);
      }
    };

    initProvider();
  }, []);

  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAddress(accounts[0] || null);
        setIsConnected(!!accounts[0]);
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId));
      };

      const handleDisconnect = () => {
        setAddress(null);
        setChainId(null);
        setIsConnected(false);
        setWalletType(null);
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [provider]);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    try {
      if (!provider) throw new Error('Provider not initialized');
      
      const chainConfig = SUPPORTED_CHAINS[targetChainId];
      if (!chainConfig) throw new Error('Unsupported chain');

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: chainConfig.name,
              nativeCurrency: chainConfig.nativeCurrency,
              rpcUrls: chainConfig.rpcUrls.default.http,
              blockExplorerUrls: [chainConfig.blockExplorers.default.url]
            }]
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }, [provider]);

  const connectWallet = useCallback(async (type: WalletType) => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      const web3Modal = getWeb3Modal();
      
      let provider;
      switch (type) {
        case WALLET_TYPES.METAMASK:
          if (!window.ethereum?.isMetaMask) {
            throw new Error('MetaMask is not installed');
          }
          provider = await web3Modal.connectTo('injected');
          break;
          
        case WALLET_TYPES.COINBASE:
          provider = await web3Modal.connectTo('coinbasewallet');
          break;
          
        case WALLET_TYPES.WALLETCONNECT:
          provider = await web3Modal.connectTo('walletconnect');
          break;
          
        case WALLET_TYPES.TOKENPOCKET:
          if (!window.ethereum?.isTokenPocket) {
            throw new Error('TokenPocket is not installed');
          }
          provider = await web3Modal.connectTo('injected');
          break;
          
        default:
          throw new Error('Unsupported wallet type');
      }

      setProvider(provider);
      setWalletType(type);

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const chainId = await provider.request({ method: 'eth_chainId' });
      
      setAddress(accounts[0]);
      setChainId(parseInt(chainId as string));
      setIsConnected(true);

      // Switch to Base network if needed
      const currentChainId = parseInt(chainId as string);
      if (currentChainId !== 8453) {
        await switchNetwork(8453);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [switchNetwork, isConnecting]);

  const disconnect = useCallback(async () => {
    try {
      const web3Modal = getWeb3Modal();
      await web3Modal.clearCachedProvider();
      
      if (provider?.disconnect) {
        await provider.disconnect();
      }
      
      setProvider(null);
      setAddress(null);
      setChainId(null);
      setIsConnected(false);
      setWalletType(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }, [provider]);

  return {
    address,
    chainId,
    isConnected,
    connectWallet,
    disconnect,
    switchNetwork,
    provider,
    isInitialized,
    walletType
  };
}