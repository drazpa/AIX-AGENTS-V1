import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../lib/store';

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAgentModal({ isOpen, onClose }: NewAgentModalProps) {
  const { addAgent } = useStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newAgent = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: 'ready' as const,
      model: formData.get('model') as string,
    };
    
    addAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Agent</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-base-primary focus:ring-base-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-base-primary focus:ring-base-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <select
              name="model"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-base-primary focus:ring-base-primary"
            >
              <option value="openai/gpt-4">GPT-4</option>
              <option value="anthropic/claude-2">Claude 2</option>
              <option value="google/palm-2-chat-bison">PaLM 2</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}