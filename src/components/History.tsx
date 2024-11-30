import React, { useMemo } from 'react';
import { useStore } from '../lib/store';
import { formatDistanceToNow } from '../lib/utils';
import { 
  Copy, 
  Trash2, 
  MessageSquare, 
  User, 
  Bot, 
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function History() {
  const { messages, removeMessage, agents, selectAgent, setCurrentPage } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedAgent, setSelectedAgent] = React.useState<string | 'all'>('all');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = React.useState(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleOpenChat = (agentId: string) => {
    selectAgent(agentId);
    setCurrentPage('chat');
  };

  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages;

    // Filter by agent
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(m => m.agentId === selectedAgent);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort messages
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.timestamp - a.timestamp;
      }
      return a.timestamp - b.timestamp;
    });

    return filtered;
  }, [messages, selectedAgent, searchTerm, sortOrder]);

  const groupedMessages = useMemo(() => {
    const groups = filteredAndSortedMessages.reduce((acc, message) => {
      const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {} as Record<string, typeof messages>);

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
      agent: agents.find(a => a.id === messages[0].agentId)
    }));
  }, [filteredAndSortedMessages, agents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Chat History</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sort Order</label>
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
            >
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {groupedMessages.map(({ date, messages, agent }) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 bg-gray-900/50 backdrop-blur-sm py-2 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-400">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {messages.length} messages
                </span>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{agent?.name || 'Unknown Agent'}</h4>
                    <p className="text-sm text-gray-400">{agent?.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => agent && handleOpenChat(agent.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Open Chat
                </button>
              </div>

              <div className="divide-y divide-gray-700/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover:bg-gray-700/20 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        message.role === 'user' 
                          ? "bg-green-500/10" 
                          : "bg-blue-500/10"
                      )}>
                        {message.role === 'user' 
                          ? <User className="w-4 h-4 text-green-400" />
                          : <Bot className="w-4 h-4 text-blue-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium",
                            message.role === 'user' ? "text-green-400" : "text-blue-400"
                          )}>
                            {message.role === 'user' ? 'User' : 'Assistant'}
                          </span>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDistanceToNow(message.timestamp)}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-white break-words">{message.content}</p>
                        {message.txHash && (
                          <a
                            href={`https://basescan.org/tx/${message.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                          >
                            <span>View transaction</span>
                            <ChevronDown className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(message.content)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeMessage(message.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {groupedMessages.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No messages found</p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}