import React from 'react';
import { Brain, Cpu, Settings, MessageSquare } from 'lucide-react';
import { useStore } from '../lib/store';
import type { Agent } from '../lib/store';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { toggleConfigModal, setSelectedAgent, toggleChat } = useStore();

  const handleConfigure = () => {
    setSelectedAgent(agent);
    toggleConfigModal();
  };

  const handleChat = () => {
    setSelectedAgent(agent);
    toggleChat();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-indigo-600" />
          <h3 className="text-xl font-semibold text-gray-800">{agent.name}</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            agent.status === 'training'
              ? 'bg-yellow-100 text-yellow-800'
              : agent.status === 'ready'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{agent.description}</p>

      {agent.status === 'training' && agent.progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={handleConfigure}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configure</span>
        </button>
        {agent.status === 'deployed' ? (
          <button
            onClick={handleChat}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        ) : (
          <button
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            onClick={() => {
              // Handle deployment
            }}
          >
            <Cpu className="w-4 h-4" />
            <span>Deploy</span>
          </button>
        )}
      </div>
    </div>
  );
}