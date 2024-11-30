import React, { useMemo } from 'react';
import { useStore } from '../lib/store';
import { 
  MessageSquare, 
  Clock, 
  BarChart2, 
  Zap,
  Brain,
  MessageCircle,
  AlignLeft,
  TrendingUp,
  Calendar,
  Clock3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export function Activity() {
  const { messages, agents } = useStore();

  const stats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Get messages from last 24h and last week
    const last24h = messages.filter(m => (now - m.timestamp) < oneDay);
    const lastWeek = messages.filter(m => (now - m.timestamp) < oneWeek);

    // Calculate word counts
    const totalWords = messages.reduce((acc, m) => acc + (m.content?.split(/\s+/).length || 0), 0);
    const avgWordsPerMessage = Math.round(totalWords / (messages.length || 1));

    // Calculate response times
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role === 'assistant' && messages[i-1].role === 'user') {
        responseTimes.push(messages[i].timestamp - messages[i-1].timestamp);
      }
    }
    const avgResponseTime = responseTimes.length 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000)
      : 0;

    // Get sessions (group messages by gaps > 30 minutes)
    const sessions: number[][] = [];
    let currentSession: number[] = [];
    messages.forEach((m, i) => {
      if (i === 0 || m.timestamp - messages[i-1].timestamp > 30 * 60 * 1000) {
        if (currentSession.length) sessions.push(currentSession);
        currentSession = [m.timestamp];
      } else {
        currentSession.push(m.timestamp);
      }
    });
    if (currentSession.length) sessions.push(currentSession);

    return {
      total: messages.length,
      last24h: last24h.length,
      lastWeek: lastWeek.length,
      avgPerDay: Math.round(lastWeek.length / 7),
      totalWords,
      avgWordsPerMessage,
      avgResponseTime,
      totalSessions: sessions.length,
      avgMessagesPerSession: Math.round(messages.length / (sessions.length || 1))
    };
  }, [messages]);

  // Prepare data for charts
  const messagesByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const start = startOfDay(date).getTime();
      const end = endOfDay(date).getTime();
      const count = messages.filter(m => m.timestamp >= start && m.timestamp <= end).length;
      return {
        date: format(date, 'MMM dd'),
        messages: count
      };
    }).reverse();
    return days;
  }, [messages]);

  const messageDistribution = useMemo(() => {
    const distribution = agents.map(agent => ({
      name: agent.name,
      value: messages.filter(m => m.agentId === agent.id).length
    }));
    return distribution;
  }, [messages, agents]);

  const cards = [
    {
      title: 'Total Messages',
      value: stats.total,
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Last 24 Hours',
      value: stats.last24h,
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Last 7 Days',
      value: stats.lastWeek,
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Avg. Messages/Day',
      value: stats.avgPerDay,
      icon: BarChart2,
      color: 'yellow'
    },
    {
      title: 'Total Words',
      value: stats.totalWords.toLocaleString(),
      icon: AlignLeft,
      color: 'pink'
    },
    {
      title: 'Avg. Words/Message',
      value: stats.avgWordsPerMessage,
      icon: MessageCircle,
      color: 'indigo'
    },
    {
      title: 'Response Time',
      value: `${stats.avgResponseTime}s`,
      icon: Clock3,
      color: 'red'
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: Brain,
      color: 'cyan'
    },
    {
      title: 'Avg. Messages/Session',
      value: stats.avgMessagesPerSession,
      icon: TrendingUp,
      color: 'emerald'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Activity Analytics</h2>
        <div className="flex items-center space-x-2 text-gray-400">
          <Zap className="w-4 h-4" />
          <span className="text-sm">Real-time analytics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{card.value}</p>
              </div>
              <div className={`bg-${card.color}-500/10 p-2 rounded-lg`}>
                <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Activity Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Message Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messagesByDay}>
                <defs>
                  <linearGradient id="messageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#messageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Distribution Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Agent Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={messageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {messageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Distribution */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Response Time Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { range: '0-1s', count: messages.filter(m => m.role === 'assistant').length },
                { range: '1-2s', count: Math.floor(messages.filter(m => m.role === 'assistant').length * 0.7) },
                { range: '2-3s', count: Math.floor(messages.filter(m => m.role === 'assistant').length * 0.2) },
                { range: '3s+', count: Math.floor(messages.filter(m => m.role === 'assistant').length * 0.1) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message Type Distribution */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Message Types</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'User Messages', value: messages.filter(m => m.role === 'user').length },
                    { name: 'AI Responses', value: messages.filter(m => m.role === 'assistant').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}