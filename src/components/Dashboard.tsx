import React from 'react';
import { useStore } from '../lib/store';
import { Brain, MessageSquare, Clock, Activity, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from '../lib/utils';

export function Dashboard() {
  const { agents, messages, selectAgent, deleteAgent, setCurrentPage } = useStore();

  const getAgentStats = (agentId: string) => {
    const agentMessages = messages.filter(m => m.agentId === agentId);
    const totalWords = agentMessages.reduce((acc, m) => {
      if (!m.content) return acc;
      return acc + m.content.split(/\s+/).length;
    }, 0);
    
    return {
      messageCount: agentMessages.length,
      wordCount: totalWords,
      avgWordsPerMessage: agentMessages.length ? Math.round(totalWords / agentMessages.length) : 0
    };
  };

  const handleOpenChat = (agentId: string) => {
    selectAgent(agentId);
    setCurrentPage('chat');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Agent Dashboard</h2>
        <div className="flex items-center space-x-2 text-gray-400">
          <Activity className="w-4 h-4" />
          <span className="text-sm">{agents.length} Active Agents</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => {
          const stats = getAgentStats(agent.id);
          
          return (
            <div
              key={agent.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                  </div>
                </div>
                {agent.id !== 'default' && (
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Messages</span>
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {stats.messageCount}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Words</span>
                    <Activity className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {stats.wordCount.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Active</span>
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {formatDistanceToNow(agent.lastUsed)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => handleOpenChat(agent.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Chat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}