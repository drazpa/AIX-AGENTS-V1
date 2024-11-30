import React, { useState } from 'react';
import { Brain, Sparkles, Code, Shield, Zap, Settings } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import type { AIXSettings } from '../lib/store';

interface FormData extends AIXSettings {
  name: string;
  description: string;
}

export function NewAgent() {
  const { createAgent, settings: defaultSettings } = useStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    ...defaultSettings
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;
    
    const newAgentId = createAgent({
      name: formData.name,
      description: formData.description,
      model: formData.model,
    });
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      ...defaultSettings
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Zap },
    { id: 'training', label: 'Training', icon: Brain },
    { id: 'advanced', label: 'Advanced', icon: Shield },
    { id: 'custom', label: 'Custom Prompts', icon: Code }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Create New Agent</h2>
        <div className="flex items-center space-x-2 text-gray-400">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Agent Configuration</span>
        </div>
      </div>

      <div className="flex border-b border-gray-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "text-blue-400 border-blue-400"
                : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., DeFi Analyst, Security Auditor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the agent's primary functions and capabilities..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Model Selection</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="openai/gpt-4">GPT-4 (Recommended)</option>
                    <option value="anthropic/claude-2">Claude 2</option>
                    <option value="google/palm-2-chat-bison">PaLM 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-4">Response Style</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-400">Focused</span>
                    <span className={cn(
                      "font-medium",
                      formData.temperature < 0.3 ? "text-green-400" :
                      formData.temperature > 0.7 ? "text-purple-400" :
                      "text-blue-400"
                    )}>
                      {formData.temperature < 0.3 ? "Precise" :
                       formData.temperature > 0.7 ? "Creative" :
                       "Balanced"}
                    </span>
                    <span className="text-gray-400">Creative</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <label className="block text-sm font-medium text-gray-200 mb-2">Training Focus</label>
              <select
                value={formData.trainingFocus}
                onChange={(e) => setFormData({ ...formData, trainingFocus: e.target.value as AIXSettings['trainingFocus'] })}
                className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="balanced">Balanced</option>
                <option value="technical">Technical Analysis</option>
                <option value="defi">DeFi Optimization</option>
                <option value="security">Security Focus</option>
              </select>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <label className="block text-sm font-medium text-gray-200 mb-4">Capabilities</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'baseSpecific', label: 'Base Network Specific', color: 'blue' },
                  { id: 'defiAnalysis', label: 'DeFi Analysis', color: 'green' },
                  { id: 'nftTracking', label: 'NFT Tracking', color: 'purple' },
                  { id: 'gasOptimization', label: 'Gas Optimization', color: 'yellow' },
                  { id: 'l2Analysis', label: 'L2 Analysis', color: 'indigo' },
                  { id: 'bridgeMonitoring', label: 'Bridge Monitoring', color: 'pink' },
                  { id: 'protocolSecurity', label: 'Protocol Security', color: 'red' },
                  { id: 'yieldFarming', label: 'Yield Farming', color: 'emerald' },
                  { id: 'liquidityAnalysis', label: 'Liquidity Analysis', color: 'cyan' },
                  { id: 'crossChainBridging', label: 'Cross-chain Bridging', color: 'violet' },
                  { id: 'smartContractAudit', label: 'Smart Contract Audit', color: 'orange' },
                  { id: 'tokenomicsAnalysis', label: 'Tokenomics Analysis', color: 'teal' }
                ].map((capability) => (
                  <label
                    key={capability.id}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg transition-colors",
                      formData[capability.id as keyof AIXSettings] as boolean
                        ? `bg-${capability.color}-500/10 border-${capability.color}-500/30`
                        : "bg-gray-900/50 border-gray-700/30",
                      "border hover:border-gray-600/50 cursor-pointer"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData[capability.id as keyof AIXSettings] as boolean}
                      onChange={(e) => setFormData({ ...formData, [capability.id]: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-200">{capability.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-200 mb-2">Context Window</label>
                <input
                  type="number"
                  value={formData.contextWindow}
                  onChange={(e) => setFormData({ ...formData, contextWindow: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                  className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-2">Previous messages for context</p>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-200 mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  min="100"
                  max="4000"
                  step="100"
                  className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-2">Maximum response length</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <label className="block text-sm font-medium text-gray-200 mb-2">Response Parameters</label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Top P</span>
                    <span>{formData.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.topP}
                    onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Frequency Penalty</span>
                    <span>{formData.frequencyPenalty}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.frequencyPenalty}
                    onChange={(e) => setFormData({ ...formData, frequencyPenalty: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <label className="block text-sm font-medium text-gray-200 mb-2">Custom System Prompt</label>
              <textarea
                value={formData.customPrompt}
                onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                rows={4}
                className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Define custom behavior and capabilities..."
              />
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <label className="block text-sm font-medium text-gray-200 mb-2">Custom Instructions</label>
              <textarea
                value={formData.customInstructions}
                onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                rows={4}
                className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Specific instructions for the AI..."
              />
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <label className="block text-sm font-medium text-gray-200 mb-2">Custom Constraints</label>
              <textarea
                value={formData.customConstraints}
                onChange={(e) => setFormData({ ...formData, customConstraints: e.target.value })}
                rows={4}
                className="w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                placeholder="Define limitations and boundaries..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!formData.name || !formData.description}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-4 h-4" />
            <span>Create Agent</span>
          </button>
        </div>
      </form>
    </div>
  );
}