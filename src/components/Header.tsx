import React, { useState } from 'react';
import { Brain, Plus, Loader2 } from 'lucide-react';
import { NewAgentModal } from './NewAgentModal';
import { useWeb3 } from '../lib/web3/hooks';

export function Header() {
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const { isConnected, connectWallet, disconnect, address, isInitialized } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-base-primary" />
              <h1 className="text-2xl font-bold text-gray-900">AI Agent Launchpad</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsNewAgentModalOpen(true)}
                className="btn-primary bg-base-primary hover:bg-opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </button>
              {isInitialized && (
                isConnected ? (
                  <button
                    onClick={disconnect}
                    className="btn-secondary"
                  >
                    {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="btn-secondary flex items-center"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
      />
    </>
  );
}