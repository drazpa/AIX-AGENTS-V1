import React, { useState } from 'react';
import { Chat } from './components/Chat';
import { ConnectButton } from './components/ConnectButton';
import { SetupModal } from './components/SetupModal';
import { History } from './components/History';
import { Activity } from './components/Activity';
import { Dashboard } from './components/Dashboard';
import { NewAgent } from './components/NewAgent';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { 
  Settings, 
  Menu, 
  X, 
  Home, 
  History as HistoryIcon, 
  Activity as ActivityIcon, 
  Layout, 
  Plus, 
  ChevronDown, 
  Trash2, 
  Eye,
  MessageSquare,
  Brain 
} from 'lucide-react';
import { cn } from './lib/utils';
import { useStore } from './lib/store';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { agents, selectedAgentId, selectAgent, currentPage, setCurrentPage } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 z-20",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={cn(
            "flex items-center space-x-2 transition-opacity duration-300",
            !isSidebarOpen && "opacity-0"
          )}>
            <Eye className="w-6 h-6 text-blue-400" />
            <div className="flex items-baseline">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                AIX
              </span>
              <span className="ml-1 text-xl font-bold text-white">
                Agents
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              currentPage === 'dashboard' ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
            )}
          >
            <Home className="w-5 h-5" />
            {isSidebarOpen && <span>Dashboard</span>}
          </button>

          <div className="relative">
            <button
              onClick={() => setCurrentPage('chat')}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                currentPage === 'chat' ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              {isSidebarOpen && (
                <>
                  <span>Chat</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </>
              )}
            </button>
            {currentPage === 'chat' && isSidebarOpen && (
              <div className="mt-2 ml-8 space-y-1">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent.id)}
                    className={cn(
                      "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedAgentId === agent.id ? "bg-gray-700/50 text-white" : "text-gray-400 hover:bg-gray-700/30"
                    )}
                  >
                    <Brain className="w-4 h-4" />
                    <span>{agent.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentPage('new-agent')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              currentPage === 'new-agent' ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
            )}
          >
            <Plus className="w-5 h-5" />
            {isSidebarOpen && <span>New Agent</span>}
          </button>

          <button
            onClick={() => setCurrentPage('activity')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              currentPage === 'activity' ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
            )}
          >
            <ActivityIcon className="w-5 h-5" />
            {isSidebarOpen && <span>Activity</span>}
          </button>

          <button
            onClick={() => setCurrentPage('history')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              currentPage === 'history' ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700/50"
            )}
          >
            <HistoryIcon className="w-5 h-5" />
            {isSidebarOpen && <span>History</span>}
          </button>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => setIsSetupOpen(true)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700/50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </div>

      <div className={cn(
        "transition-all duration-300 min-h-screen",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        <header className="bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-white">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
            </h1>
            <ConnectButton />
          </div>
        </header>

        <main className="p-6">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'chat' && <Chat />}
          {currentPage === 'new-agent' && <NewAgent />}
          {currentPage === 'activity' && <Activity />}
          {currentPage === 'history' && <History />}
        </main>
      </div>

      <SetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </div>
  );
}