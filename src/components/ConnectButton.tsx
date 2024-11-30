import React, { useState } from 'react';
import { Wallet, Loader2, LogOut, ChevronDown } from 'lucide-react';
import { useWeb3 } from '../lib/web3/hooks';
import { WALLET_TYPES, type WalletType } from '../lib/web3/config';
import { cn } from '../lib/utils';

const WALLET_INFO = {
  [WALLET_TYPES.METAMASK]: {
    name: 'MetaMask',
    icon: '/metamask.svg',
    description: 'Connect using MetaMask browser extension'
  },
  [WALLET_TYPES.COINBASE]: {
    name: 'Coinbase Wallet',
    icon: '/coinbase.svg',
    description: 'Connect using Coinbase Wallet'
  },
  [WALLET_TYPES.WALLETCONNECT]: {
    name: 'WalletConnect',
    icon: '/walletconnect.svg',
    description: 'Connect using WalletConnect'
  },
  [WALLET_TYPES.TOKENPOCKET]: {
    name: 'TokenPocket',
    icon: '/tokenpocket.svg',
    description: 'Connect using TokenPocket'
  }
};

export function ConnectButton() {
  const { isConnected, connectWallet, disconnect, address, isInitialized } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const handleConnect = async (walletType: WalletType) => {
    if (isConnecting) return;
    
    try {
      setError(null);
      setIsConnecting(true);
      setShowWalletMenu(false);
      await connectWallet(walletType);
    } catch (error: any) {
      if (error?.code === -32002) {
        setError('Please check your wallet - a connection request is pending');
      } else {
        setError(error?.message || 'Failed to connect wallet');
        console.error('Connection failed:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      await disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
      setError('Failed to disconnect wallet');
    }
  };

  if (!isInitialized) {
    return (
      <button disabled className="bg-gray-700 text-gray-400 rounded-lg px-4 py-2 flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Initializing...</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-500/10 px-3 py-1 rounded-lg">
          <span className="text-green-400 text-sm">Connected to Base</span>
        </div>

        <button
          onClick={handleDisconnect}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors"
        >
          <span className="text-sm font-medium">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletMenu(!showWalletMenu)}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {error && (
        <span className="absolute top-full left-0 mt-1 text-red-400 text-sm">{error}</span>
      )}

      {showWalletMenu && !isConnecting && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
          {Object.entries(WALLET_TYPES).map(([key, value]) => {
            const wallet = WALLET_INFO[value as WalletType];
            return (
              <button
                key={key}
                onClick={() => handleConnect(value as WalletType)}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700/50 transition-colors"
              >
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="w-6 h-6"
                />
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{wallet.name}</div>
                  <div className="text-xs text-gray-400">{wallet.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}