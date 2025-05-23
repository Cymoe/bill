import React from 'react';
import { MessageSquare, Search, Pin, Plus, DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import ChatCard from './ChatCard';
import { ChatData, Category } from '../types';

interface ChatHistoryViewProps {
  chatHistory: ChatData[];
  searchQuery: string;
  selectedFilter: string;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: string) => void;
  createNewChat: () => void;
  openChat: (chatId: number) => void;
  categories: Category[];
}

const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  chatHistory,
  searchQuery,
  selectedFilter,
  setSearchQuery,
  setSelectedFilter,
  createNewChat,
  openChat,
  categories
}) => {
  const filteredChats = chatHistory.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || chat.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-[#333333] bg-[#121212]/95 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-[#336699]" />
                Chat History
              </h1>
              <p className="text-gray-400">Your business intelligence conversations</p>
            </div>
            <button
              onClick={createNewChat}
              className="bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] px-4 py-2 rounded-[4px] font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="uppercase font-bold text-sm">New Chat</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#333333] rounded-[4px] pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-[4px] text-sm transition-colors ${
                  selectedFilter === category.id
                    ? 'bg-[#336699] text-white'
                    : 'bg-[#1E1E1E] text-gray-400 hover:bg-[#333333]'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
                <span className="bg-[#121212] px-2 py-0.5 rounded-[4px] text-xs">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Chats */}
        {pinnedChats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Pin className="h-4 w-4 text-[#F9D71C]" />
              <h2 className="text-sm font-bold text-[#F9D71C] uppercase tracking-wide">Pinned Chats</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pinnedChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} onOpen={() => openChat(chat.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        <div>
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-4">Recent Conversations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {regularChats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} onOpen={() => openChat(chat.id)} />
            ))}
          </div>
        </div>

        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No chats found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryView;
