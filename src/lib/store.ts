import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateResponse } from './ai/chat';

export interface Message {
  id: string;
  agentId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  txHash?: string;
}

export interface AIXSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  contextWindow: number;
  trainingFocus: 'balanced' | 'technical' | 'defi' | 'security';
  customPrompt?: string;
  customInstructions?: string;
  customConstraints?: string;
  baseSpecific: boolean;
  defiAnalysis: boolean;
  nftTracking: boolean;
  gasOptimization: boolean;
  l2Analysis: boolean;
  bridgeMonitoring: boolean;
  protocolSecurity: boolean;
  yieldFarming: boolean;
  liquidityAnalysis: boolean;
  crossChainBridging: boolean;
  smartContractAudit: boolean;
  tokenomicsAnalysis: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  createdAt: number;
  lastUsed: number;
  settings?: AIXSettings;
}

interface AIXState {
  agents: Agent[];
  messages: Message[];
  selectedAgentId: string | null;
  settings: AIXSettings;
  isProcessing: boolean;
  currentPage: string;
  createAgent: (agent: Partial<Agent>) => string;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  selectAgent: (id: string) => void;
  sendMessage: (content: string, walletAddress?: string) => Promise<void>;
  removeMessage: (id: string) => void;
  updateSettings: (settings: Partial<AIXSettings>) => void;
  setCurrentPage: (page: string) => void;
}

const DEFAULT_SETTINGS: AIXSettings = {
  model: 'openai/gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
  frequencyPenalty: 0.5,
  contextWindow: 10,
  trainingFocus: 'balanced',
  baseSpecific: true,
  defiAnalysis: true,
  nftTracking: true,
  gasOptimization: true,
  l2Analysis: true,
  bridgeMonitoring: true,
  protocolSecurity: true,
  yieldFarming: true,
  liquidityAnalysis: true,
  crossChainBridging: true,
  smartContractAudit: true,
  tokenomicsAnalysis: true
};

export const useStore = create<AIXState>()(
  persist(
    (set, get) => ({
      agents: [{
        id: 'default',
        name: 'Base Assistant',
        description: 'Default AI assistant for Base blockchain interactions',
        model: 'openai/gpt-4',
        createdAt: Date.now(),
        lastUsed: Date.now()
      }],
      messages: [],
      selectedAgentId: 'default',
      settings: DEFAULT_SETTINGS,
      isProcessing: false,
      currentPage: 'dashboard',

      createAgent: (agent) => {
        const id = Date.now().toString();
        const newAgent: Agent = {
          id,
          name: agent.name || 'New Agent',
          description: agent.description || '',
          model: agent.model || 'openai/gpt-4',
          createdAt: Date.now(),
          lastUsed: Date.now(),
          settings: agent.settings
        };

        set((state) => ({
          agents: [...state.agents, newAgent],
          selectedAgentId: id,
          currentPage: 'chat'
        }));

        return id;
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent
          )
        }));
      },

      deleteAgent: (id) => {
        if (id === 'default') return;
        
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
          selectedAgentId: state.selectedAgentId === id ? 'default' : state.selectedAgentId,
          messages: state.messages.filter((message) => message.agentId !== id)
        }));
      },

      selectAgent: (id) => {
        const agent = get().agents.find((a) => a.id === id);
        if (agent) {
          set({ selectedAgentId: id });
          get().updateAgent(id, { lastUsed: Date.now() });
        }
      },

      sendMessage: async (content: string, walletAddress?: string) => {
        const state = get();
        const { selectedAgentId, agents, messages } = state;
        if (!selectedAgentId) return;

        const agent = agents.find((a) => a.id === selectedAgentId);
        if (!agent) return;

        const userMessage: Message = {
          id: Date.now().toString(),
          agentId: selectedAgentId,
          content,
          role: 'user',
          timestamp: Date.now()
        };

        set({ 
          messages: [...messages, userMessage],
          isProcessing: true 
        });

        try {
          const response = await generateResponse(
            content,
            agent.model,
            walletAddress
          );

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            agentId: selectedAgentId,
            content: response,
            role: 'assistant',
            timestamp: Date.now()
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isProcessing: false
          }));

          get().updateAgent(selectedAgentId, { lastUsed: Date.now() });
        } catch (error) {
          console.error('Error generating AI response:', error);
          set({ isProcessing: false });
        }
      },

      removeMessage: (id: string) => {
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id)
        }));
      },

      updateSettings: (newSettings: Partial<AIXSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setCurrentPage: (page: string) => {
        set({ currentPage: page });
      }
    }),
    {
      name: 'aix-storage',
      partialize: (state) => ({
        agents: state.agents,
        messages: state.messages,
        settings: state.settings,
        currentPage: state.currentPage
      })
    }
  )
);