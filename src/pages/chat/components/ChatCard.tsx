import React, { useState } from 'react';
import { Pin, MoreVertical, Download, Trash2, ChevronRight } from 'lucide-react';
import { ChatData } from '../types';

interface ChatCardProps {
  chat: ChatData;
  onOpen: () => void;
}

const ChatCard: React.FC<ChatCardProps> = ({ chat, onOpen }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className={`${chat.bgColor} border border-[#333333] rounded-[4px] p-4 hover:border-[#555555] transition-colors cursor-pointer relative`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={chat.color}>{chat.icon}</div>
          <h3 className="font-medium text-white truncate">{chat.title}</h3>
          {chat.isPinned && <Pin className="h-3 w-3 text-[#F9D71C]" />}
        </div>
        <div className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-[#1E1E1E] rounded-[4px] transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-10 w-40">
                <button className="w-full text-left px-3 py-2 hover:bg-[#333333] text-sm flex items-center space-x-2">
                  <Pin className="h-3 w-3" />
                  <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-[#333333] text-sm flex items-center space-x-2">
                  <Download className="h-3 w-3" />
                  <span>Export</span>
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-[#333333] text-sm flex items-center space-x-2 text-red-400">
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{chat.preview}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-gray-500">{chat.timestamp}</span>
          <span className="text-gray-500">{chat.messageCount} messages</span>
        </div>
        <div className={`${chat.color} font-medium font-mono`}>
          {chat.lastValue}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
