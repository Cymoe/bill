import React from 'react';
import { MessageSquare, Search, Pin, Plus, DollarSign, TrendingUp, Users, AlertTriangle, Send } from 'lucide-react';
import ChatCard from './ChatCard';
import { ChatData, Category } from '../types';

interface ChatHistoryViewProps {
  chatHistory: ChatData[];
  searchQuery: string;
  selectedFilter: string;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: string) => void;
  createNewChat: (initialMessage?: string) => void;
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

  // Show clean welcome interface if no chats exist
  if (chatHistory.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Centered Welcome Interface */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
          {/* Logo/Icon */}
          <div className="mb-6">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L48 24L32 40L16 24L32 8Z" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M32 16L40 24L32 32L24 24L32 16Z" fill="white" fillOpacity="0.1"/>
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-xl font-medium text-white mb-8 text-center">
            What can I help with?
          </h1>

          {/* Suggestion Buttons */}
          <div className="w-full space-y-2 mb-8">
            <button
              onClick={() => createNewChat("Show me my overdue invoices")}
              className="w-full bg-[#333333] hover:bg-[#404040] text-white px-4 py-3 rounded-[4px] text-left transition-colors text-sm"
            >
              Show me my overdue invoices
            </button>
            <button
              onClick={() => createNewChat("Analyze my most profitable projects")}
              className="w-full bg-[#333333] hover:bg-[#404040] text-white px-4 py-3 rounded-[4px] text-left transition-colors text-sm"
            >
              Analyze my most profitable projects
            </button>
            <button
              onClick={() => createNewChat("Find leads that are going cold")}
              className="w-full bg-[#333333] hover:bg-[#404040] text-white px-4 py-3 rounded-[4px] text-left transition-colors text-sm"
            >
              Find leads that are going cold
            </button>
          </div>
        </div>

        {/* Bottom Input */}
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask about your business..."
              className="w-full bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-4 py-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/20 text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  createNewChat(e.currentTarget.value.trim());
                }
              }}
            />
            <button
              onClick={() => createNewChat()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#333333] backdrop-blur flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-[#336699]" />
                AI Assistant
              </h1>
            </div>
            <button
              onClick={() => createNewChat()}
              className="bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] p-2 rounded-[4px] transition-colors"
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#333333] rounded-[4px] pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/20 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedFilter(category.id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-[4px] text-xs transition-colors ${
                    selectedFilter === category.id
                      ? 'bg-[#336699] text-white'
                      : 'bg-[#1E1E1E] text-gray-400 hover:bg-[#333333]'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                  {category.count > 0 && (
                    <span className="bg-[#121212] px-1.5 py-0.5 rounded-[4px] text-[10px]">{category.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Pin className="h-3 w-3 text-[#F9D71C]" />
                <h2 className="text-xs font-bold text-[#F9D71C] uppercase tracking-wide">Pinned</h2>
              </div>
              <div className="space-y-2">
                {pinnedChats.map((chat) => (
                  <ChatCard key={chat.id} chat={chat} onOpen={() => openChat(chat.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Chats */}
          <div>
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-2">Recent</h2>
            <div className="space-y-2">
              {regularChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} onOpen={() => openChat(chat.id)} />
              ))}
            </div>
          </div>

          {filteredChats.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-400 mb-1">No chats found</h3>
              <p className="text-xs text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryView;
