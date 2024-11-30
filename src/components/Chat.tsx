import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Copy, Trash2, Loader2, User, Bot, Wallet } from 'lucide-react';
import { useStore } from '../lib/store';
import { useWeb3 } from '../lib/web3/hooks';
import { cn } from '../lib/utils';
import { subscribeToUpdates, cleanup, BlockchainData } from '../lib/blockchain';

export function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, removeMessage, isProcessing, selectedAgentId } = useStore();
  const { address, isConnected, connectWallet } = useWeb3();
  const [input, setInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);

  const filteredMessages = messages.filter(m => m.agentId === selectedAgentId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  useEffect(() => {
    if (address) {
      // Subscribe to real-time updates
      subscribeToUpdates(address, (data) => {
        setBlockchainData(prev => prev ? { ...prev, ...data } : null);
      });
    }

    return () => {
      cleanup(); // Cleanup WebSocket subscriptions
    };
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !isConnected) return;

    const content = input.trim();
    setInput('');
    await sendMessage(content, address);
  };

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

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 h-[600px] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-700/50 p-4 rounded-full mb-4">
          <Wallet className="w-12 h-12 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Connect your wallet to start chatting with the AI assistant and interact with the Base blockchain.
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            {blockchainData && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-400">Base Network</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">Block {blockchainData.blockNumber}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{blockchainData.gasPrice} Gwei</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
            )}
            <div className="group relative max-w-[80%]">
              <div
                className={cn(
                  "rounded-lg p-4",
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                )}
              >
                <div className="whitespace-pre-wrap font-bold">
                  {message.content}
                </div>
                {message.txHash && (
                  <div className="mt-2 text-xs border-t border-gray-600/50 pt-2">
                    <a
                      href={`https://basescan.org/tx/${message.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 flex items-center space-x-1"
                    >
                      <span>View transaction</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={() => handleCopy(message.content)}
                  className="p-1 rounded bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeMessage(message.id)}
                  className="p-1 rounded bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white"
                  title="Delete message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="bg-green-500/10 p-2 rounded-full">
                <User className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Base blockchain..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}