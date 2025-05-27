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
      className={`${chat.bgColor} border border-[#333333] rounded-[4px] p-3 hover:border-[#555555] transition-colors cursor-pointer relative`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`${chat.color} flex-shrink-0`}>{chat.icon}</div>
          <h3 className="font-medium text-white text-sm truncate">{chat.title}</h3>
          {chat.isPinned && <Pin className="h-3 w-3 text-[#F9D71C] flex-shrink-0" />}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
      
      <p className="text-gray-400 text-xs mb-2 line-clamp-1">{chat.preview}</p>
      
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-500">{chat.timestamp}</span>
        <div className={`${chat.color} font-medium`}>
          {chat.lastValue}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
