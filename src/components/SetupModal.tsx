import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Zap, Brain, Shield, Code, Sparkles, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';
import type { AIXSettings } from '../lib/store';
import { cn } from '../lib/utils';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupModal({ isOpen, onClose }: SetupModalProps) {
  const { agents, settings: globalSettings, updateSettings, updateAgent } = useStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('global');
  const [settings, setSettings] = useState<AIXSettings>(globalSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [showAgentSelect, setShowAgentSelect] = useState(false);

  useEffect(() => {
    // Reset settings when modal opens or agent selection changes
    if (selectedAgentId === 'global') {
      setSettings(globalSettings);
    } else {
      const agent = agents.find(a => a.id === selectedAgentId);
      if (agent) {
        setSettings(agent.settings || globalSettings);
      }
    }
  }, [isOpen, selectedAgentId, globalSettings, agents]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgentId === 'global') {
      updateSettings(settings);
    } else {
      updateAgent(selectedAgentId, { settings });
    }
    onClose();
  };

  const selectedAgent = selectedAgentId === 'global' 
    ? { name: 'Global Settings', description: 'Default settings for all agents' }
    : agents.find(a => a.id === selectedAgentId);

  const tabs = [
    { id: 'general', label: 'General', icon: Zap },
    { id: 'training', label: 'Training', icon: Brain },
    { id: 'advanced', label: 'Advanced', icon: Shield },
    { id: 'custom', label: 'Custom Prompts', icon: Code }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                AI Assistant Setup
              </h2>
              <div className="relative mt-2">
                <button
                  onClick={() => setShowAgentSelect(!showAgentSelect)}
                  className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>{selectedAgent?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showAgentSelect && (
                  <div className="absolute left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                    <button
                      onClick={() => {
                        setSelectedAgentId('global');
                        setShowAgentSelect(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors",
                        selectedAgentId === 'global' ? 'text-blue-400' : 'text-gray-300'
                      )}
                    >
                      Global Settings
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setShowAgentSelect(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors",
                          selectedAgentId === agent.id ? 'text-blue-400' : 'text-gray-300'
                        )}
                      >
                        {agent.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rest of the modal content remains the same */}
        {/* ... (keep all the existing tab content and form elements) ... */}

        <div className="p-6 border-t border-gray-700/50 flex justify-between items-center bg-gray-900/50">
          <button
            type="button"
            onClick={() => setSettings(selectedAgentId === 'global' ? globalSettings : (agents.find(a => a.id === selectedAgentId)?.settings || globalSettings))}
            className="px-4 py-2 text-gray-400 hover:text-white flex items-center space-x-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}